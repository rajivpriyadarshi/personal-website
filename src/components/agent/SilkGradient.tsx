"use client";

import { useEffect, useRef } from "react";

/* The assistant's face: a flowing silk gradient instead of a headshot.
 *
 * A port of the "Silk" gradient from gradflow.meera.dev — its `silkGradient`
 * fragment function, moved from OGL to plain WebGL2 so this doesn't pull a
 * renderer in for a 45px circle. The maths is unchanged, including the fact that
 * the original applies `u_speed` twice (once folding it into `time` in main, once
 * inside the loop); reproducing that is the only way to match the look at a
 * given speed value.
 *
 * The pattern comes from an 8-step feedback loop where `a` and `d` each perturb
 * the other's next term — that mutual coupling is what makes the bands fold over
 * themselves rather than sliding past like a plain sine field. `dampening`
 * divides the per-step contribution as scale rises, which keeps the loop from
 * diverging into noise when the field is zoomed out.
 *
 * Sized off its container rather than the viewport, so the same component works
 * at 45px in the entry card and 36px in the panel header. */

export type SilkConfig = {
  /** Three palette hexes, mixed by the pattern's three channels. */
  colors: [string, string, string];
  speed: number;
  scale: number;
  /** Grain, 0–1. */
  noise: number;
};

/* The gradflow panel's values, as picked. */
export const AGENT_SILK: SilkConfig = {
  colors: ["#d21570", "#8c3ff8", "#56ffc3"],
  speed: 1.6,
  scale: 1.2,
  noise: 0.32,
};

const VERT = `#version 300 es
layout(location = 0) in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;

uniform float u_time, u_speed, u_scale, u_noise;
uniform vec3 u_color1, u_color2, u_color3;
uniform vec2 u_resolution;

out vec4 fragColor;

float grainNoise(vec2 st) {
  return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453);
}

vec3 silkGradient(float time) {
  vec2 centeredUv = (gl_FragCoord.xy * 2.0 - u_resolution) / u_resolution;
  centeredUv *= u_scale;

  /* Keeps the feedback loop below stable as the field zooms out. */
  float dampening = 1.0 / (1.0 + u_scale * 0.1);

  float d = -time * u_speed * 0.5;
  float a = 0.0;

  for (float i = 0.0; i < 8.0; ++i) {
    a += cos(i - d - a * centeredUv.x) * dampening;
    d += sin(centeredUv.y * i + a) * dampening;
  }

  d += time * u_speed * 0.5;

  vec3 patterns = vec3(
    cos(centeredUv.x * d + a) * 0.5 + 0.5,
    cos(centeredUv.y * a + d) * 0.5 + 0.5,
    cos((centeredUv.x + centeredUv.y) * (d + a) * 0.5) * 0.5 + 0.5
  );

  vec3 color1Mix = mix(u_color1, u_color2, patterns.x);
  vec3 color2Mix = mix(u_color2, u_color3, patterns.y);
  vec3 color3Mix = mix(u_color3, u_color1, patterns.z);

  vec3 finalColor = mix(color1Mix, color2Mix, patterns.z);
  finalColor = mix(finalColor, color3Mix, patterns.x * 0.5);

  /* The pre-palette version of the pattern, folded back in at 30% — it's what
     puts the darker creases between the bands. */
  vec3 originalPattern = vec3(cos(centeredUv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);
  originalPattern = cos(originalPattern * cos(vec3(d, a, 2.5)) * 0.5 + 0.5);

  return mix(finalColor, originalPattern * finalColor, 0.3);
}

void main() {
  float time = u_time * u_speed;
  vec3 color = silkGradient(time);

  if (u_noise > 0.001) {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    float grain = grainNoise(uv * 200.0 + time * 0.1);
    color *= (1.0 - u_noise * 0.4 + u_noise * grain * 0.4);
  }

  fragColor = vec4(color, 1.0);
}`;

/** `#rrggbb` to 0–1 rgb. Straight sRGB, no gamma step — matches the source. */
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  if (h.length !== 6) return [1, 1, 1];
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Silk shader compile error:", gl.getShaderInfoLog(shader));
  }
  return shader;
}

type Props = {
  config?: SilkConfig;
  className?: string;
};

export function SilkGradient({ config = AGENT_SILK, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  /* The loop reads the config through a ref so retuning it updates the uniforms
     without tearing down the GL context. Synced in its own effect rather than
     during render, which React forbids. */
  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", { alpha: false, antialias: false });
    if (!gl) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    // One oversized triangle rather than two: no index buffer, no shared edge.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.bindAttribLocation(program, 0, "position");
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Silk program link error:", gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const u = (name: string) => gl.getUniformLocation(program, name);
    const loc = {
      time: u("u_time"),
      speed: u("u_speed"),
      scale: u("u_scale"),
      noise: u("u_noise"),
      resolution: u("u_resolution"),
      colors: [u("u_color1"), u("u_color2"), u("u_color3")],
    };

    let time = 0;
    let raf = 0;

    function drawFrame(delta: number) {
      const c = configRef.current;
      time += delta;

      gl!.viewport(0, 0, canvas!.width, canvas!.height);
      gl!.uniform1f(loc.time, time);
      gl!.uniform1f(loc.speed, c.speed);
      gl!.uniform1f(loc.scale, c.scale);
      gl!.uniform1f(loc.noise, c.noise);
      gl!.uniform2f(loc.resolution, canvas!.width, canvas!.height);
      c.colors.forEach((hex, i) => {
        const [r, g, b] = hexToRgb(hex);
        gl!.uniform3f(loc.colors[i], r, g, b);
      });
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    }

    /* The element is tiny and its size is fixed by CSS, so a ResizeObserver
       covers both the initial measure and the phone breakpoint's smaller
       avatar without a window resize listener. */
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(canvas!.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas!.clientHeight * dpr));
      if (w === canvas!.width && h === canvas!.height) return;
      canvas!.width = w;
      canvas!.height = h;
      drawFrame(0);
    }

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    /* Off-screen the loop stops: the panel's copy of this sits behind the
       closed drawer, where animating it is pure waste. */
    let onScreen = true;
    let looping = false;
    let last = 0;

    function loop(now: number) {
      if (!onScreen) {
        looping = false;
        return;
      }
      // Clamped so a backgrounded tab doesn't jump the pattern forward.
      const delta = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      drawFrame(delta);
      raf = requestAnimationFrame(loop);
    }

    function startLoop() {
      if (looping || !onScreen || reduceMotion) return;
      looping = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }

    const visibility = new IntersectionObserver((entries) => {
      onScreen = entries[entries.length - 1]?.isIntersecting ?? true;
      if (onScreen) startLoop();
    });
    visibility.observe(canvas);

    startLoop();

    return () => {
      onScreen = false;
      observer.disconnect();
      visibility.disconnect();
      cancelAnimationFrame(raf);
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(vao);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
