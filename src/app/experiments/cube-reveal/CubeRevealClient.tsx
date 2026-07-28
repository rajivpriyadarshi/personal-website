"use client";

import { Fragment, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./cube-reveal.module.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const LINES = [
  ["There’s", "a", "different"],
  ["way", "to", "think"],
  ["about", "wealth"],
];

const FACES = ["front", "back", "right", "left", "top", "bottom"] as const;

const FRAME_COUNT = 124;
const frameSrc = (index: number) =>
  `/experiments/cube-reveal/frames/frame_${String(index + 1).padStart(3, "0")}.webp`;

// Deterministic PRNG so every cube's flight path is identical across reloads,
// which keeps a scrubbed timeline from re-randomising as the user scrolls back.
function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
}

export function CubeRevealClient() {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const tileLayer = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const container = tileLayer.current;
      const surface = canvas.current;
      if (!container || !surface) return;

      /* ---------------------------------------------------------------
       * Frame sequence. Decoding 124 WebPs to a canvas rather than
       * scrubbing a <video>, because seeking a video by currentTime is
       * unreliable on iOS Safari.
       * --------------------------------------------------------------- */
      const ctx = surface.getContext("2d");
      const frames: HTMLImageElement[] = [];
      let targetFrame = 0;
      let drawnFrame = -1;

      const draw = (index: number) => {
        const image = frames[index];
        if (!ctx || !image?.complete || !image.naturalWidth) return;
        if (surface.width !== image.naturalWidth) surface.width = image.naturalWidth;
        if (surface.height !== image.naturalHeight) surface.height = image.naturalHeight;
        ctx.drawImage(image, 0, 0);
        drawnFrame = index;
      };

      for (let i = 0; i < FRAME_COUNT; i += 1) {
        const image = new Image();
        image.decoding = "async";
        image.src = frameSrc(i);
        if (i === 0) {
          // First frame paints as soon as it lands so the canvas is never blank.
          image.onload = () => draw(0);
          // The frames are gitignored (~15MB of generated WebPs), so a fresh
          // clone has none. Fall back to the static still rather than a blank
          // canvas; see the experiment's README note in .gitignore.
          image.onerror = () => surface.classList.add(styles.canvasMissing);
        }
        frames[i] = image;
      }

      let rafId = requestAnimationFrame(function render() {
        if (targetFrame !== drawnFrame) draw(targetFrame);
        rafId = requestAnimationFrame(render);
      });

      /* ---------------------------------------------------------------
       * Cube grid.
       * --------------------------------------------------------------- */
      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      const cols = isMobile ? 5 : 8;
      const rows = isMobile ? 7 : 5;
      const total = cols * rows;

      const tiles: HTMLDivElement[] = [];
      const fragment = document.createDocumentFragment();

      for (let i = 0; i < total; i += 1) {
        const tile = document.createElement("div");
        tile.className = styles.tile;
        const inner = document.createElement("div");
        inner.className = styles.tileInner;
        FACES.forEach((side) => {
          const face = document.createElement("div");
          face.className = `${styles.face} ${styles[side]}`;
          inner.appendChild(face);
        });
        tile.appendChild(inner);
        fragment.appendChild(tile);
        tiles.push(tile);
      }
      container.appendChild(fragment);

      const layout = () => {
        const rect = container.getBoundingClientRect();
        const tileW = rect.width / cols;
        const tileH = rect.height / rows;
        const depth = Math.min(tileW, tileH) * 0.8;

        tiles.forEach((tile, i) => {
          tile.style.width = `${tileW}px`;
          tile.style.height = `${tileH}px`;
          tile.style.left = `${(i % cols) * tileW}px`;
          tile.style.top = `${Math.floor(i / cols) * tileH}px`;
          tile.style.setProperty("--d", `${depth / 2}px`);
          tile.style.setProperty("--half-w", `${tileW / 2}px`);
          tile.style.setProperty("--half-h", `${tileH / 2}px`);
        });
      };

      layout();
      window.addEventListener("resize", layout);

      const random = seededRandom(1337);
      const flights = tiles.map(() => ({
        z: 400 + random() * 900,
        rx: (random() - 0.5) * 60,
        ry: (random() - 0.5) * 60,
        x: (random() - 0.5) * 200,
        y: (random() - 0.5) * 200,
        offset: random() * 0.5,
      }));

      const words = gsap.utils.toArray<HTMLElement>(`.${styles.word}`, root.current);

      const cleanup = () => {
        window.removeEventListener("resize", layout);
        cancelAnimationFrame(rafId);
      };

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(tiles, { autoAlpha: 0 });
        gsap.set(words, { opacity: 1, y: 0 });
        return cleanup;
      }

      gsap.set(tiles, {
        transformOrigin: "50% 50%",
        x: 0,
        y: 0,
        z: 0,
        rotationX: 0,
        rotationY: 0,
        opacity: 1,
      });
      gsap.set(heading.current, { transformOrigin: "50% 50%" });
      gsap.set(words, { opacity: 0, y: 40 });

      const revealText = () => {
        gsap.to(words, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.08,
          ease: "power3.out",
          overwrite: true,
        });
      };

      const cubes = { progress: 0 };
      const clip = { progress: 0 };

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: stage.current,
          start: "top top",
          end: () => `+=${window.innerHeight * 3}`,
          pin: true,
          scrub: 1,
          onEnter: revealText,
          onEnterBack: revealText,
        },
      });

      timeline
        .to(clip, {
          progress: 1,
          duration: 1,
          ease: "none",
          onUpdate: () => {
            targetFrame = Math.round(clip.progress * (FRAME_COUNT - 1));
          },
        })
        .to(
          cubes,
          {
            progress: 1,
            // Cubes finish clearing before the scrub ends, so the scene plays
            // out uncovered for the last stretch.
            duration: 0.85,
            ease: "none",
            onUpdate: () => {
              tiles.forEach((tile, i) => {
                const flight = flights[i];
                // Staggered micro-timeline: each cube occupies a 0.5-wide
                // window starting at its own offset, so the grid clears in waves.
                const local = gsap.utils.clamp(
                  0,
                  1,
                  (cubes.progress - flight.offset) / 0.5,
                );
                const eased = local * local;

                tile.style.transform = `translate3d(${flight.x * eased}px, ${flight.y * eased}px, ${flight.z * eased}px) rotateX(${flight.rx * eased}deg) rotateY(${flight.ry * eased}deg)`;
                tile.style.opacity = String(1 - eased);
                tile.style.visibility = local >= 1 ? "hidden" : "visible";
              });
            },
          },
          0,
        )
        .fromTo(
          heading.current,
          { scale: 1 },
          { scale: 1.18, duration: 1, ease: "none" },
          0,
        );

      return cleanup;
    },
    { scope: root },
  );

  return (
    <main ref={root} className={styles.scroller}>
      <section ref={stage} className={styles.stage}>
        {/* Scene and cube grid share a stacking context below the heading,
            so the cubes fly past behind the type instead of covering it. */}
        <div className={styles.scene}>
          <canvas ref={canvas} className={styles.canvas} aria-hidden />
          <div aria-hidden className={styles.sceneTint} />
          <div ref={tileLayer} aria-hidden className={styles.tiles} />
          <div aria-hidden className={styles.topSeparator} />

          <picture className={styles.bottomSeparator}>
            <source
              media="(max-width: 768px)"
              srcSet="/experiments/cube-reveal/scene1-bottom-separator-mobile.webp"
            />
            <img
              src="/experiments/cube-reveal/scene1-bottom-separator.webp"
              alt=""
              loading="lazy"
            />
          </picture>
        </div>

        <h1 ref={heading} className={styles.heading}>
          {LINES.map((line) => (
            <span key={line.join("-")} className={styles.line}>
              {line.map((word, i) => (
                <Fragment key={word}>
                  {i > 0 ? " " : null}
                  <span className={styles.word}>{word}</span>
                </Fragment>
              ))}
            </span>
          ))}
        </h1>
      </section>

      <section className={styles.outro}>Scroll back up to replay</section>
    </main>
  );
}
