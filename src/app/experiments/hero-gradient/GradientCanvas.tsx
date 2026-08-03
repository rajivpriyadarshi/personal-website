"use client";

import { useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

export type GradientParams = {
  scale: number;
  spacing: number;
  spread: number;
  rotation: number;
  displacement: number;
  noiseScale: number;
  grain: number;
  speed: number;
  offsetX: number;
  offsetY: number;
};

export const DEFAULT_PARAMS: GradientParams = {
  scale: 0.75,
  spacing: 0.52,
  spread: 1.5,
  rotation: -0.38,
  displacement: 1.2,
  noiseScale: 0.45,
  grain: 0.01,
  speed: 0.0008,
  offsetX: 0,
  offsetY: 0,
};

const rgb = (r: number, g: number, b: number): [number, number, number] => [
  r / 255,
  g / 255,
  b / 255,
];

export type Theme = "dark" | "light";

type Rgb = [number, number, number];

export const PALETTES: { name: string; dark: Rgb[]; light: Rgb[] }[] = [
  {
    name: "Ocean",
    dark: [rgb(22, 37, 75), rgb(35, 65, 138), rgb(170, 223, 217), rgb(223, 78, 16)],
    light: [rgb(214, 231, 241), rgb(120, 170, 214), rgb(246, 241, 228), rgb(240, 138, 92)],
  },
  {
    name: "Ember",
    dark: [rgb(255, 236, 210), rgb(255, 60, 0), rgb(13, 2, 0), rgb(55, 12, 0)],
    light: [rgb(255, 246, 232), rgb(255, 150, 92), rgb(250, 224, 208), rgb(232, 120, 110)],
  },
  {
    name: "Lime",
    dark: [rgb(211, 218, 52), rgb(203, 178, 173), rgb(1, 29, 141), rgb(1, 3, 18)],
    light: [rgb(226, 232, 150), rgb(206, 214, 190), rgb(160, 186, 226), rgb(244, 242, 230)],
  },
  {
    name: "Frost",
    dark: [rgb(0, 8, 22), rgb(0, 22, 65), rgb(220, 238, 255), rgb(0, 100, 255)],
    light: [rgb(226, 238, 248), rgb(176, 206, 236), rgb(252, 253, 255), rgb(96, 160, 240)],
  },
];

// The base is what the colour bands fall off into, and the glow is signed so the
// cursor lifts a dark field but deepens a light one.
const THEMES: Record<Theme, { base: Rgb; glow: number }> = {
  dark: { base: [0, 0, 0], glow: 0.12 },
  light: { base: rgb(250, 248, 242), glow: -0.1 },
};

const VERT = `#version 300 es
layout(location = 0) in vec3 position;
out vec2 vPosition;
void main() {
  gl_Position = vec4(position, 1.0);
  vPosition = position.xy;
}`;

const FRAG = `#version 300 es
precision highp float;

uniform vec3  u_color1, u_color2, u_color3, u_color4, u_base;
uniform float u_colorSize, u_colorSpacing, u_colorSpread, u_colorRotation;
uniform float u_displacement, u_noiseSize, u_noiseIntensity, u_seed, u_glow;
uniform vec2  u_colorOffset, u_resolution, u_mouse;

in  vec2 vPosition;
out vec4 fragColor;

float hash(vec2 p) {
  p = 50.0 * fract(p * 0.3183099 + vec2(0.71, 0.113));
  return -1.0 + 2.0 * fract(p.x * p.y * (p.x + p.y));
}

float noise2D(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0,0)), hash(i + vec2(1,0)), u.x),
    mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x),
    u.y
  );
}

vec4 gradientNoise3D(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  vec3 u  = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  vec3 du = 30.0 * f * f * (f * (f - 2.0) + 1.0);
  float a  = hash(i.xy + vec2(0,0) + i.z);
  float b  = hash(i.xy + vec2(1,0) + i.z);
  float c  = hash(i.xy + vec2(0,1) + i.z);
  float d  = hash(i.xy + vec2(1,1) + i.z);
  float e  = hash(i.xy + vec2(0,0) + i.z + 1.0);
  float f2 = hash(i.xy + vec2(1,0) + i.z + 1.0);
  float g  = hash(i.xy + vec2(0,1) + i.z + 1.0);
  float h  = hash(i.xy + vec2(1,1) + i.z + 1.0);
  float k0 =  a;
  float k1 =  b - a;
  float k2 =  c - a;
  float k3 =  e - a;
  float k4 =  a - b - c + d;
  float k5 =  a - b - e + f2;
  float k6 =  a - c - e + g;
  float k7 = -a + b + c - d + e - f2 - g + h;
  return vec4(
    k0 + k1*u.x + k2*u.y + k3*u.z + k4*u.x*u.y + k5*u.x*u.z + k6*u.y*u.z + k7*u.x*u.y*u.z,
    du * vec3(
      k1 + k4*u.y + k5*u.z + k7*u.y*u.z,
      k2 + k4*u.x + k6*u.z + k7*u.x*u.z,
      k3 + k5*u.x + k6*u.y + k7*u.x*u.y
    )
  );
}

vec2 rotate(vec2 v, float a) {
  float s = sin(a), c = cos(a);
  return mat2(c, -s, s, c) * v;
}

void main() {
  vec2 uv = vPosition;
  uv.x *= min(1.0, u_resolution.x / u_resolution.y);
  uv /= max(u_colorSize, 0.001);

  vec2 mouseUV = u_mouse;
  mouseUV.x *= min(1.0, u_resolution.x / u_resolution.y);
  mouseUV /= max(u_colorSize, 0.001);

  vec2 toMouse = mouseUV - uv;
  float dist = length(toMouse);
  float pull = smoothstep(2.5, 0.0, dist) * 0.35;
  vec2 warped = uv + toMouse * pull;

  vec3 noiseInput = vec3(warped * u_noiseSize, u_seed);
  vec3 dispNoise  = gradientNoise3D(noiseInput).yzw;
  vec2 position   = warped + dispNoise.xz * u_displacement + u_colorOffset;

  vec2 pos = rotate(position, -u_colorRotation);

  vec3 color = u_base;
  color = mix(u_color1, color, smoothstep(0.0, u_colorSpread, distance(pos, vec2(0.0,  u_colorSpacing * 1.5))));
  color = mix(u_color2, color, smoothstep(0.0, u_colorSpread, distance(pos, vec2(0.0,  u_colorSpacing * 0.5))));
  color = mix(u_color3, color, smoothstep(0.0, u_colorSpread, distance(pos, vec2(0.0, -u_colorSpacing * 0.5))));
  color = mix(u_color4, color, smoothstep(0.0, u_colorSpread, distance(pos, vec2(0.0, -u_colorSpacing * 1.5))));

  color += smoothstep(1.8, 0.0, dist) * u_glow;

  float grain = noise2D(vPosition.xy * 600.0 + u_seed);
  color += grain * u_noiseIntensity;

  fragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}`;

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
  }
  return shader;
}

type Props = {
  params?: GradientParams;
  className?: string;
  theme?: Theme;
  onPaletteChange?: (name: string) => void;
  /** Palette to start on. */
  initialPalette?: number;
  /** Drift through palettes on a timer, and advance on background clicks. */
  cycle?: boolean;
};

function tintFor(paletteIndex: number, theme: Theme) {
  const c = PALETTES[paletteIndex][theme];
  const { base, glow } = THEMES[theme];
  return {
    r1: c[0][0], g1: c[0][1], b1: c[0][2],
    r2: c[1][0], g2: c[1][1], b2: c[1][2],
    r3: c[2][0], g3: c[2][1], b3: c[2][2],
    r4: c[3][0], g4: c[3][1], b4: c[3][2],
    br: base[0], bg: base[1], bb: base[2],
    glow,
  };
}

export function GradientCanvas({
  params = DEFAULT_PARAMS,
  className,
  theme = "dark",
  onPaletteChange,
  initialPalette = 0,
  cycle = true,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const paramsRef = useRef(params);
  paramsRef.current = params;
  const paletteRef = useRef(initialPalette);
  const themeRef = useRef(theme);
  themeRef.current = theme;
  const cycleRef = useRef(cycle);
  cycleRef.current = cycle;
  const tintRef = useRef(tintFor(initialPalette, theme));
  const paletteCbRef = useRef(onPaletteChange);
  paletteCbRef.current = onPaletteChange;
  const redrawRef = useRef<(() => void) | null>(null);

  const setup = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: false,
    });
    if (!gl) {
      console.error("WebGL2 not supported");
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Single oversized triangle covers the clip volume — no index buffer needed.
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.bindAttribLocation(program, 0, "position");
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
    }
    gl.useProgram(program);

    const u = (name: string) => gl.getUniformLocation(program, name);
    const loc = {
      seed: u("u_seed"),
      resolution: u("u_resolution"),
      size: u("u_colorSize"),
      spacing: u("u_colorSpacing"),
      spread: u("u_colorSpread"),
      rotation: u("u_colorRotation"),
      displacement: u("u_displacement"),
      noiseSize: u("u_noiseSize"),
      noiseIntensity: u("u_noiseIntensity"),
      offset: u("u_colorOffset"),
      mouse: u("u_mouse"),
      c1: u("u_color1"),
      c2: u("u_color2"),
      c3: u("u_color3"),
      c4: u("u_color4"),
      base: u("u_base"),
      glow: u("u_glow"),
    };

    const tint = tintRef.current;
    paletteCbRef.current?.(PALETTES[paletteRef.current].name);

    const pointer = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    let seed = 0.18;
    let raf = 0;
    let pointerRaf = 0;
    let resizeTimer = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.round(canvas!.clientWidth * dpr);
      canvas!.height = Math.round(canvas!.clientHeight * dpr);
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
      draw(false);
    }
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 100);
    }

    function onPointerMove(event: MouseEvent) {
      if (pointerRaf) return;
      const { clientX, clientY } = event;
      pointerRaf = requestAnimationFrame(() => {
        pointerRaf = 0;
        const rect = canvas!.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        target.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        target.y = -(((clientY - rect.top) / rect.height) * 2 - 1);
      });
    }

    function cyclePalette() {
      paletteRef.current = (paletteRef.current + 1) % PALETTES.length;
      paletteCbRef.current?.(PALETTES[paletteRef.current].name);
      gsap.to(tint, {
        duration: 1.4,
        ease: "power2.inOut",
        ...tintFor(paletteRef.current, themeRef.current),
      });
    }

    function onBackgroundClick(event: MouseEvent) {
      const el = event.target;
      if (el instanceof Element && el.closest("a, button, input, [role='button']")) {
        return;
      }
      cyclePalette();
    }

    // Colour drifts on its own; click only fast-forwards to the next palette.
    const autoCycle =
      reduceMotion || !cycleRef.current
        ? null
        : window.setInterval(cyclePalette, 9000);

    function draw(advance: boolean) {
      const p = paramsRef.current;
      if (advance) seed += p.speed;
      if (!reduceMotion) {
        pointer.x += (target.x - pointer.x) * 0.12;
        pointer.y += (target.y - pointer.y) * 0.12;
      }
      gl!.uniform1f(loc.seed, seed);
      gl!.uniform2f(loc.resolution, canvas!.width, canvas!.height);
      gl!.uniform1f(loc.size, p.scale);
      gl!.uniform1f(loc.spacing, p.spacing);
      gl!.uniform1f(loc.spread, p.spread);
      gl!.uniform1f(loc.rotation, p.rotation);
      gl!.uniform1f(loc.displacement, p.displacement);
      gl!.uniform1f(loc.noiseSize, p.noiseScale);
      gl!.uniform1f(loc.noiseIntensity, p.grain);
      gl!.uniform2f(loc.offset, p.offsetX, p.offsetY);
      gl!.uniform2f(loc.mouse, pointer.x, pointer.y);
      gl!.uniform3f(loc.c1, tint.r1, tint.g1, tint.b1);
      gl!.uniform3f(loc.c2, tint.r2, tint.g2, tint.b2);
      gl!.uniform3f(loc.c3, tint.r3, tint.g3, tint.b3);
      gl!.uniform3f(loc.c4, tint.r4, tint.g4, tint.b4);
      gl!.uniform3f(loc.base, tint.br, tint.bg, tint.bb);
      gl!.uniform1f(loc.glow, tint.glow);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    }

    /* Only animate while the canvas is on screen. This is a full-viewport
     * fragment shader redrawing every frame; off-screen it was burning GPU and
     * CPU for something nobody could see. */
    let onScreen = true;
    let looping = false;

    function loop() {
      if (!onScreen) {
        looping = false;
        return;
      }
      draw(true);
      raf = requestAnimationFrame(loop);
    }

    function startLoop() {
      if (looping || !onScreen) return;
      looping = true;
      raf = requestAnimationFrame(loop);
    }

    window.addEventListener("resize", onResize);
    resize();
    redrawRef.current = () => draw(false);

    const visibility = new IntersectionObserver(
      (entries) => {
        onScreen = entries[entries.length - 1]?.isIntersecting ?? true;
        if (onScreen && !reduceMotion) startLoop();
      },
      { rootMargin: "10% 0px" },
    );
    visibility.observe(canvas);

    if (reduceMotion) {
      draw(false);
    } else {
      window.addEventListener("mousemove", onPointerMove, { passive: true });
      if (cycleRef.current) window.addEventListener("click", onBackgroundClick);
      startLoop();
    }

    return () => {
      redrawRef.current = null;
      onScreen = false;
      visibility.disconnect();
      cancelAnimationFrame(raf);
      cancelAnimationFrame(pointerRaf);
      clearTimeout(resizeTimer);
      if (autoCycle) clearInterval(autoCycle);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("click", onBackgroundClick);
      gsap.killTweensOf(tint);
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(vao);
    };
  }, []);

  useEffect(setup, [setup]);

  useEffect(() => {
    const tween = gsap.to(tintRef.current, {
      duration: 0.9,
      ease: "power2.inOut",
      ...tintFor(paletteRef.current, theme),
      // Under reduced motion the render loop is idle, so push each frame manually.
      onUpdate: () => redrawRef.current?.(),
    });
    return () => {
      tween.kill();
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 z-0 block h-full w-full",
        className,
      )}
    />
  );
}
