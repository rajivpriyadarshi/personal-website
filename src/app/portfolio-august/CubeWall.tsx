"use client";

import { useEffect, useImperativeHandle, useRef, type Ref } from "react";
import gsap from "gsap";
import styles from "./portfolio-august.module.css";

const FACES = ["front", "back", "right", "left", "top", "bottom"] as const;

/* Ported from the cube-reveal experiment. Unlike that version this exposes a
 * setProgress handle instead of owning a ScrollTrigger, so the Words section's
 * scrubbed timeline drives it — 0 is a closed wall, 1 is fully cleared. */
export type CubeWallHandle = {
  setProgress: (progress: number) => void;
};

// Deterministic PRNG so each cube's flight path is identical across reloads,
// which keeps a scrubbed timeline from re-randomising as the user scrolls back.
function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
}

export function CubeWall({ handleRef }: { handleRef: Ref<CubeWallHandle> }) {
  const layer = useRef<HTMLDivElement>(null);
  const apply = useRef<(progress: number) => void>(() => {});

  useImperativeHandle(handleRef, () => ({
    setProgress: (progress: number) => apply.current(progress),
  }));

  useEffect(() => {
    const container = layer.current;
    if (!container) return;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const cols = isMobile ? 5 : 8;
    const rows = isMobile ? 7 : 5;
    const total = cols * rows;

    const tiles: HTMLDivElement[] = [];
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < total; i += 1) {
      const tile = document.createElement("div");
      tile.className = styles.cubeTile;
      const inner = document.createElement("div");
      inner.className = styles.cubeTileInner;
      FACES.forEach((side) => {
        const face = document.createElement("div");
        face.className = `${styles.cubeFace} ${styles[`cube${side[0].toUpperCase()}${side.slice(1)}`]}`;
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
    const observer = new ResizeObserver(layout);
    observer.observe(container);

    const random = seededRandom(1337);
    const flights = tiles.map(() => ({
      z: 400 + random() * 900,
      rx: (random() - 0.5) * 60,
      ry: (random() - 0.5) * 60,
      x: (random() - 0.5) * 200,
      y: (random() - 0.5) * 200,
      offset: random() * 0.5,
    }));

    apply.current = (progress: number) => {
      tiles.forEach((tile, i) => {
        const flight = flights[i];
        // Staggered micro-timeline: each cube occupies a 0.5-wide window
        // starting at its own offset, so the wall clears in waves.
        const local = gsap.utils.clamp(0, 1, (progress - flight.offset) / 0.5);
        // Ease-in so cubes accelerate toward the camera.
        const eased = local * local;

        tile.style.transform = `translate3d(${flight.x * eased}px, ${flight.y * eased}px, ${flight.z * eased}px) rotateX(${flight.rx * eased}deg) rotateY(${flight.ry * eased}deg)`;
        tile.style.opacity = String(1 - eased);
        tile.style.visibility = local >= 1 ? "hidden" : "visible";
      });
    };

    // Start closed.
    apply.current(0);

    return () => {
      observer.disconnect();
      apply.current = () => {};
      tiles.forEach((tile) => tile.remove());
    };
  }, []);

  return <div ref={layer} aria-hidden className={styles.cubeWall} />;
}
