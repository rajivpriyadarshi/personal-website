"use client";

import { useEffect, useRef } from "react";

/* Fractal glass gradient. A port of franky-adl/fractal-glass-gradients from
 * three.js/R3F to plain WebGL2, so the hero doesn't pull in three.
 * The simplex noise is Ashima Arts' snoise2d (MIT).
 *
 * Two passes per frame, which is the part that matters:
 *
 *   1. A 256×256 offscreen target is filled with two independent simplex-noise
 *      channels (r drives x warp, g drives y). It's rendered as a texture, not
 *      evaluated inline, so the main pass gets bilinear filtering across it for
 *      free — that smooth interpolation is why the colour field reads as flowing
 *      liquid rather than as noise.
 *
 *   2. The main pass builds the colour from five rotated Gaussian ellipses that
 *      orbit on sin/cos paths, each adding its palette colour with exp() falloff.
 *      Five overlapping exponentials on a near-black base, run through Reinhard
 *      tone mapping, is what gives the deep saturated core and soft shoulders.
 *      The UV it samples is displaced by an atanh() flute lens first.
 *
 * The flute is the ribbing: the screen is cut into `fluteWidth` CSS-px strips,
 * and within each strip the UV is pushed sideways by (fract - 0.5) and *up* by
 * -atanh(fract^6). The atanh term is the important one — it blows up toward the
 * strip's right seam, which bends the gradient hard at each edge and produces
 * the crisp vertical creases. A plain linear offset (what a naive port does)
 * gives flat bands instead.
 */

type Vec3 = [number, number, number];

export type FractalGlassConfig = {
  /** Five palette colours, 0–1 linear rgb, added as Gaussian lobes. */
  palette: [Vec3, Vec3, Vec3, Vec3, Vec3];
  /** Simplex frequency for the warp texture. */
  noiseScaleX: number;
  noiseScaleY: number;
  /** How far the warp texture displaces the colour field's UV. */
  warpStrength: number;
  /** Warp drift rate. */
  warpSpeed: number;
  /** Film grain opacity, 0–1. Scales with local brightness. */
  grainStrength: number;
  /** Strip width in CSS px. */
  fluteWidth: number;
  /** Refraction across a strip, in CSS px. The lens strength. */
  fluteStrength: number;
  /** Reinhard exposure. The reference's "Brightness". */
  toneMapExposure: number;
  /** 0 = GaussianBlobs (Algo1), 1 = GaussianEllipses (Algo2). */
  algo: 0 | 1;
};

/* The reference's Sunset palette on its Flow-like preset — the exact slider
 * values from its Leva panel. */
export const HERO_FRACTAL_GLASS: FractalGlassConfig = {
  palette: [
    [0.95, 0.25, 0.05], // deep orange
    [0.85, 0.08, 0.35], // crimson
    [1.0, 0.6, 0.0], // amber
    [0.55, 0.05, 0.5], // purple
    [1.0, 0.85, 0.2], // gold
  ],
  noiseScaleX: 0.35,
  noiseScaleY: 0.55,
  warpStrength: 0.4,
  warpSpeed: 0.12,
  grainStrength: 0.5,
  fluteWidth: 70,
  fluteStrength: 140,
  toneMapExposure: 0.98,
  algo: 1,
};

/* Both passes draw a full-screen triangle. uv is derived from the clip position
   rather than an attribute, so there's one buffer for the whole thing. */
const VERT = `#version 300 es
layout(location = 0) in vec2 position;
out vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

/* Ashima Arts / stegu 2D simplex noise, MIT. Verbatim from the reference's
   snoise2d.glsl, updated to GLSL ES 3.0 syntax. */
const SNOISE = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 10.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}`;

/* Pass 1 — the warp field, packed into rg. */
const NOISE_FRAG = `#version 300 es
precision highp float;

uniform float uTime, uNoiseScaleX, uNoiseScaleY, uWarpSpeed;
in vec2 vUv;
out vec4 fragColor;
${SNOISE}

void main() {
  float t = uTime * uWarpSpeed;
  // Two independent samples for the x and y warp directions.
  float nx = snoise(vUv * vec2(uNoiseScaleX, uNoiseScaleY) + t * 0.5);
  float ny = snoise(vUv * vec2(uNoiseScaleX, uNoiseScaleY) * 0.93 - t * 0.3);
  // Pack [-1, 1] into [0, 1] for storage.
  fragColor = vec4(nx * 0.5 + 0.5, ny * 0.5 + 0.5, 0.0, 1.0);
}`;

/* Pass 2 — the gradient, the glass and the grain. */
const FRAG = `#version 300 es
precision highp float;

uniform float uPixelRatio, uTime, uWarpStrength;
uniform vec2  uResolution, uGrainTextureSize;
uniform sampler2D uNoiseMap, uGrainTexture;
uniform float uGrainStrength, uFluteWidth, uFluteStrength, uToneMapExposure;
uniform vec3  uC1, uC2, uC3, uC4, uC5;
uniform int   uAlgo;

in vec2 vUv;
out vec4 fragColor;

/* WebGL2 has atanh natively, but Safari's older ANGLE builds mis-lower it, and
   the argument here is always in [0, 1) so the series form is safe. */
float atanhSafe(float x) {
  x = clamp(x, -0.999999, 0.999999);
  return 0.5 * log((1.0 + x) / (1.0 - x));
}

/* Algo1: circular Gaussian lobes. */
vec3 gaussianBlobs(vec2 uv) {
  float t = uTime * 0.6 + 3.5;

  vec2 p1 = vec2(-0.28 + sin(t * 0.7 + 0.5) * 0.15,  0.06 + cos(t * 0.5) * 0.12);
  vec2 p2 = vec2(-0.06 + sin(t * 0.4 + 1.2) * 0.18,  0.16 + cos(t * 0.6) * 0.15);
  vec2 p3 = vec2( 0.07 + sin(t * 0.5 + 3.4) * 0.20,  0.00 + cos(t * 0.4) * 0.14);
  vec2 p4 = vec2( 0.22 + sin(t * 0.3 + 2.3) * 0.24, -0.10 + cos(t * 0.7) * 0.14);
  vec2 p5 = vec2( 0.30 + sin(t * 0.6 + 1.1) * 0.18,  0.06 + cos(t * 0.4) * 0.13);

  vec2 warpNoise = texture(uNoiseMap, vUv).rg * 2.0 - 1.0;
  vec2 w = uv + warpNoise * uWarpStrength;

  float d1 = dot(w - p1, w - p1);
  float d2 = dot(w - p2, w - p2);
  float d3 = dot(w - p3, w - p3);
  float d4 = dot(w - p4, w - p4);
  float d5 = dot(w - p5, w - p5);

  vec3 color = vec3(0.005, 0.010, 0.055);
  color += uC1 * exp(-d1 * 12.0) * 1.4;
  color += uC2 * exp(-d2 * 20.0) * 2.0;
  color += uC3 * exp(-d3 *  9.0) * 1.6;
  color += uC4 * exp(-d4 * 15.0) * 1.3;
  color += uC5 * exp(-d5 * 25.0) * 0.8;
  return color;
}

vec2 rotate2d(vec2 v, float angle) {
  float s = sin(angle), c = cos(angle);
  return mat2(c, -s, s, c) * v;
}

/* Algo2 — the reference's default. Same five lobes, but each is an ellipse with
   its own aspect and rotation, so the field streaks instead of pooling. */
vec3 gaussianEllipses(vec2 uv) {
  float t = uTime * 0.6 + 3.5;

  vec2 p1 = vec2(-0.32 + sin(t * 0.5 + 1.8) * 0.20, -0.12 + cos(t * 0.8 + 0.3) * 0.16);
  vec2 p2 = vec2( 0.10 + sin(t * 0.6 + 2.5) * 0.14,  0.24 + cos(t * 0.3 + 1.7) * 0.18);
  vec2 p3 = vec2(-0.15 + sin(t * 0.9 + 0.7) * 0.22, -0.08 + cos(t * 0.5 + 2.9) * 0.11);
  vec2 p4 = vec2( 0.28 + sin(t * 0.4 + 3.1) * 0.17,  0.18 + cos(t * 0.6 + 0.9) * 0.20);
  vec2 p5 = vec2(-0.05 + sin(t * 0.7 + 4.2) * 0.13, -0.20 + cos(t * 0.9 + 1.5) * 0.15);

  vec2 warpNoise = texture(uNoiseMap, vUv).rg * 2.0 - 1.0;
  /* y is warped a fifth as hard as x: the lobes smear horizontally, which is
     what keeps the vertical flutes crossing a coherent field. */
  vec2 w = uv + vec2(warpNoise.r * uWarpStrength, warpNoise.g * uWarpStrength * 0.2);

  vec2 r1 = rotate2d(w - p1,  0.3);
  vec2 r2 = rotate2d(w - p2, -1.1);
  vec2 r3 = rotate2d(w - p3,  0.8);
  vec2 r4 = rotate2d(w - p4, -0.5);
  vec2 r5 = rotate2d(w - p5,  1.4);

  float e1 = r1.x * r1.x *  8.0 + r1.y * r1.y *  1.0;
  float e2 = r2.x * r2.x * 25.0 + r2.y * r2.y * 12.0;
  float e3 = r3.x * r3.x *  6.0 + r3.y * r3.y * 14.0;
  float e4 = r4.x * r4.x * 20.0 + r4.y * r4.y *  8.0;
  float e5 = r5.x * r5.x * 30.0 + r5.y * r5.y * 15.0;

  vec3 color = vec3(0.005, 0.010, 0.055);
  color += uC1 * exp(-e1) * 1.4;
  color += uC2 * exp(-e2) * 2.0;
  color += uC3 * exp(-e3) * 1.6;
  color += uC4 * exp(-e4) * 1.3;
  color += uC5 * exp(-e5) * 0.8;
  return color;
}

void main() {
  // Centre-origin CSS px, so the flute width is a real px measure.
  vec2 mappedCoords = gl_FragCoord.xy / uPixelRatio - uResolution * 0.5;

  /* --- Fluted glass ---
     x is cut into strips; y is left whole so the lens is a vertical cylinder. */
  vec2 scaledUv = mappedCoords / vec2(uFluteWidth);
  vec2 fractUv = vec2(fract(scaledUv.x), scaledUv.y);
  float flutedX = uFluteStrength * (fractUv.x - 0.5);
  /* atanh(fract^6) is flat across most of the strip and then diverges near its
     right seam — that asymmetric blow-up is the crease. */
  float flutedY = -uFluteStrength * atanhSafe(pow(fractUv.x, 6.0));
  vec2 flutedCoords = vec2(mappedCoords.x + flutedX, mappedCoords.y + flutedY);

  // The field lives in ~unit space; 1000 is the reference's fixed divisor.
  vec2 flutedUv = flutedCoords / 1000.0;

  vec3 color = (uAlgo == 0) ? gaussianBlobs(flutedUv) : gaussianEllipses(flutedUv);

  // Reinhard: five stacked exponentials overshoot 1.0 badly without it.
  color = 1.0 - exp(-color * uToneMapExposure);

  /* Grain at 1:1 device px so it stays a constant visual size, and scaled by
     the local maximum channel so the dark corners don't turn to static. */
  vec2 grainUv = gl_FragCoord.xy / uGrainTextureSize;
  float grain = texture(uGrainTexture, grainUv).r * 2.0 - 1.0;
  color += grain * uGrainStrength * max(color.r, max(color.g, color.b));

  fragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}`;

const GRAIN_SRC = "/portfolio-august/film-grain.webp";
const NOISE_SIZE = 256;

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
  }
  return shader;
}

function link(gl: WebGL2RenderingContext, frag: string) {
  const program = gl.createProgram()!;
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, frag));
  gl.bindAttribLocation(program, 0, "position");
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(program));
  }
  return program;
}

type Props = {
  config?: FractalGlassConfig;
  className?: string;
};

export function FractalGlass({ config = HERO_FRACTAL_GLASS, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  /* Read through a ref in the loop so config edits retune the uniforms without
     tearing down the GL context. */
  const configRef = useRef(config);
  configRef.current = config;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", { alpha: false, antialias: false });
    if (!gl) {
      console.error("WebGL2 not supported");
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // One full-screen triangle, shared by both passes.
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    /* --- Pass 1 target: the warp field ---
       LINEAR filtering is load-bearing. The field is only 256², so the main
       pass magnifies it heavily; NEAREST here would show the texel grid as
       blocky steps in the colour. MIRRORED_REPEAT matches the reference and
       keeps the seam invisible where the UV runs past 1. */
    const noiseTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, noiseTex);
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA, NOISE_SIZE, NOISE_SIZE, 0,
      gl.RGBA, gl.UNSIGNED_BYTE, null,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);

    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, noiseTex, 0,
    );
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    /* Grain tile. Starts as one grey texel and is swapped for the real image on
       load, so the first frames render the gradient grain-free rather than
       waiting on the fetch. */
    const grainTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, grainTex);
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
      new Uint8Array([128, 128, 128, 255]),
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    const grainSize = { w: 1, h: 1 };

    const grainImage = new Image();
    grainImage.src = GRAIN_SRC;
    let grainLoaded = false;
    grainImage.onload = () => {
      grainLoaded = true;
      grainSize.w = grainImage.naturalWidth;
      grainSize.h = grainImage.naturalHeight;
      gl.bindTexture(gl.TEXTURE_2D, grainTex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, grainImage,
      );
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
      // Under reduced motion nothing is looping, so push one frame by hand.
      if (reduceMotion) drawFrame(0);
    };

    const noiseProgram = link(gl, NOISE_FRAG);
    const mainProgram = link(gl, FRAG);

    const nu = (name: string) => gl.getUniformLocation(noiseProgram, name);
    const noiseLoc = {
      time: nu("uTime"),
      scaleX: nu("uNoiseScaleX"),
      scaleY: nu("uNoiseScaleY"),
      warpSpeed: nu("uWarpSpeed"),
    };

    const mu = (name: string) => gl.getUniformLocation(mainProgram, name);
    const loc = {
      pixelRatio: mu("uPixelRatio"),
      time: mu("uTime"),
      resolution: mu("uResolution"),
      warpStrength: mu("uWarpStrength"),
      noiseMap: mu("uNoiseMap"),
      grainTexture: mu("uGrainTexture"),
      grainTextureSize: mu("uGrainTextureSize"),
      grainStrength: mu("uGrainStrength"),
      fluteWidth: mu("uFluteWidth"),
      fluteStrength: mu("uFluteStrength"),
      exposure: mu("uToneMapExposure"),
      c: [mu("uC1"), mu("uC2"), mu("uC3"), mu("uC4"), mu("uC5")],
      algo: mu("uAlgo"),
    };

    // Sampler bindings never change, so set them once.
    gl.useProgram(mainProgram);
    gl.uniform1i(loc.noiseMap, 0);
    gl.uniform1i(loc.grainTexture, 1);

    let dpr = 1;
    let cssW = 0;
    let cssH = 0;
    let time = 0;
    let raf = 0;
    let resizeTimer = 0;

    function drawFrame(delta: number) {
      const c = configRef.current;
      time += delta;

      // Pass 1 — regenerate the warp field into the FBO.
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo);
      gl!.viewport(0, 0, NOISE_SIZE, NOISE_SIZE);
      gl!.useProgram(noiseProgram);
      gl!.uniform1f(noiseLoc.time, time);
      gl!.uniform1f(noiseLoc.scaleX, c.noiseScaleX);
      gl!.uniform1f(noiseLoc.scaleY, c.noiseScaleY);
      gl!.uniform1f(noiseLoc.warpSpeed, c.warpSpeed);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);

      // Pass 2 — the visible frame.
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
      gl!.useProgram(mainProgram);
      gl!.activeTexture(gl!.TEXTURE0);
      gl!.bindTexture(gl!.TEXTURE_2D, noiseTex);
      gl!.activeTexture(gl!.TEXTURE1);
      gl!.bindTexture(gl!.TEXTURE_2D, grainTex);
      gl!.uniform1f(loc.pixelRatio, dpr);
      gl!.uniform1f(loc.time, time);
      gl!.uniform2f(loc.resolution, cssW, cssH);
      gl!.uniform1f(loc.warpStrength, c.warpStrength);
      gl!.uniform2f(loc.grainTextureSize, grainSize.w, grainSize.h);
      gl!.uniform1f(loc.grainStrength, grainLoaded ? c.grainStrength : 0);
      gl!.uniform1f(loc.fluteWidth, c.fluteWidth);
      gl!.uniform1f(loc.fluteStrength, c.fluteStrength);
      gl!.uniform1f(loc.exposure, c.toneMapExposure);
      c.palette.forEach((rgb, i) => gl!.uniform3f(loc.c[i], rgb[0], rgb[1], rgb[2]));
      gl!.uniform1i(loc.algo, c.algo);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    }

    function resize() {
      /* Capped at 2: beyond that it's a lot of fragments for no visible gain,
         and the flute maths is in CSS px so the look is unchanged. */
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cssW = canvas!.clientWidth;
      cssH = canvas!.clientHeight;
      canvas!.width = Math.round(cssW * dpr);
      canvas!.height = Math.round(cssH * dpr);
      drawFrame(0);
    }
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 100);
    }

    /* Only animate while on screen: this is a full-viewport fragment shader
       plus an offscreen pass, so running it behind the rest of the page is
       pure waste. */
    let onScreen = true;
    let looping = false;
    let last = 0;

    function loop(now: number) {
      if (!onScreen) {
        looping = false;
        return;
      }
      /* Clamped so a backgrounded tab doesn't jump the animation forward by
         however long it was hidden when it regains focus. */
      const delta = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      drawFrame(delta);
      raf = requestAnimationFrame(loop);
    }

    function startLoop() {
      if (looping || !onScreen) return;
      looping = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }

    window.addEventListener("resize", onResize);
    resize();

    const visibility = new IntersectionObserver(
      (entries) => {
        onScreen = entries[entries.length - 1]?.isIntersecting ?? true;
        if (onScreen && !reduceMotion) startLoop();
      },
      { rootMargin: "10% 0px" },
    );
    visibility.observe(canvas);

    if (!reduceMotion) startLoop();

    return () => {
      onScreen = false;
      grainImage.onload = null;
      visibility.disconnect();
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      gl.deleteProgram(noiseProgram);
      gl.deleteProgram(mainProgram);
      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(vao);
      gl.deleteTexture(noiseTex);
      gl.deleteTexture(grainTex);
      gl.deleteFramebuffer(fbo);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
