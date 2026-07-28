"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Matter from "matter-js";
import styles from "./portfolio-august.module.css";

/* Closed arc-only paths — a flat baseline would give away that it's a drawing,
 * so the underside bulges between the lobes. */
const CLOUD_PATHS = [
  "M30 78 A22 22 0 0 1 30 34 A26 26 0 0 1 78 20 A24 24 0 0 1 116 32 A24 24 0 0 1 128 76 A20 20 0 0 1 104 78 A22 22 0 0 1 68 84 A22 22 0 0 1 30 78 Z",
  "M34 76 A20 20 0 0 1 36 38 A28 28 0 0 1 84 26 A22 22 0 0 1 118 44 A20 20 0 0 1 110 78 A20 20 0 0 1 74 82 A20 20 0 0 1 34 76 Z",
  "M28 80 A24 24 0 0 1 34 36 A24 24 0 0 1 70 18 A26 26 0 0 1 110 34 A22 22 0 0 1 124 74 A20 20 0 0 1 98 82 A24 24 0 0 1 60 86 A20 20 0 0 1 28 80 Z",
];

/* Only the clouds above the copy — they all rain. */
const CLOUDS = [
  { top: "5%", width: 340, variant: 0, drift: 68 },
  { top: "15%", width: 240, variant: 1, drift: 52 },
  { top: "26%", width: 300, variant: 2, drift: 86 },
] as const;

const DROP_RADIUS = 2.6;
const MAX_DROPS = 320;
// Drops per second, per cloud.
const RAIN_RATE = 11;
// Cursor pushes drops inside this radius, scattering the fall.
const POINTER_RADIUS = 130;
const POINTER_PUSH = 0.00035;
// Puddle floor, as a fraction of section height. Sits low enough to read as
// the ground without colliding with the lower props.
const FLOOR_AT = 0.965;
// Drops live this long after landing, so the puddle grows and then recedes
// instead of accumulating forever and pinning the solver.
const PUDDLE_LIFE = 5200;

export function RainClouds() {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const cloudRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const layer = host.current;
    const surface = canvas.current;
    if (!layer || !surface) return;

    const ctx = surface.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const clouds = cloudRefs.current.filter((el): el is HTMLDivElement => Boolean(el));

    /* Drift. Each cloud crosses on its own loop, offset so the sky is already
     * populated on load rather than queued at the left edge. */
    if (!reduceMotion) {
      clouds.forEach((el, i) => {
        const { drift } = CLOUDS[i];
        gsap.fromTo(
          el,
          { xPercent: -120 },
          {
            xPercent: (layer.clientWidth / el.offsetWidth) * 100 + 20,
            duration: drift,
            ease: "none",
            repeat: -1,
            delay: -drift * (i / CLOUDS.length + 0.1),
          },
        );
      });
    }

    if (reduceMotion) return;

    /* ---------------------------------------------------------------
     * Rain. Real rigid bodies under gravity, drawn to a canvas so a few
     * hundred drops cost one element instead of hundreds.
     * --------------------------------------------------------------- */
    let width = layer.clientWidth;
    let height = layer.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const sizeCanvas = () => {
      width = layer.clientWidth;
      height = layer.clientHeight;
      surface.width = Math.round(width * dpr);
      surface.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    sizeCanvas();

    const engine = Matter.Engine.create({ gravity: { x: 0, y: 1, scale: 0.0011 } });
    const world = engine.world;
    // Born timestamps run parallel to `drops`, so landed water can expire.
    const drops: Matter.Body[] = [];
    const born: number[] = [];

    /* Floor and side walls, so drops collect into a puddle rather than falling
     * out of the world. Rebuilt on resize. */
    const makeBounds = () => [
      Matter.Bodies.rectangle(width / 2, height * FLOOR_AT + 40, width * 2, 80, {
        isStatic: true,
        friction: 0.02,
      }),
      Matter.Bodies.rectangle(-40, height / 2, 80, height * 2, { isStatic: true }),
      Matter.Bodies.rectangle(width + 40, height / 2, 80, height * 2, { isStatic: true }),
    ];
    let bounds = makeBounds();
    Matter.Composite.add(world, bounds);

    const retire = (i: number) => {
      Matter.Composite.remove(world, drops[i]);
      drops.splice(i, 1);
      born.splice(i, 1);
    };

    const spawn = (x: number, y: number, now: number) => {
      if (drops.length >= MAX_DROPS) retire(0);
      const drop = Matter.Bodies.circle(x, y, DROP_RADIUS, {
        // Low friction and a little bounce so the puddle spreads and jostles
        // instead of stacking into a rigid column.
        friction: 0.02,
        frictionAir: 0.015,
        restitution: 0.28,
        density: 0.0015,
      });
      Matter.Body.setVelocity(drop, {
        x: gsap.utils.random(-0.25, 0.25),
        y: gsap.utils.random(0.3, 1.1),
      });
      drops.push(drop);
      born.push(now);
      Matter.Composite.add(world, drop);
    };

    /* Pointer repulsion. Tracked on the window because the cloud layer is
     * pointer-events: none — the drops are canvas pixels, not hit targets. */
    const pointer = { x: -9999, y: -9999, inside: false };
    const onPointerMove = (event: PointerEvent) => {
      const rect = layer.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.inside =
        pointer.x >= 0 && pointer.x <= rect.width && pointer.y >= 0 && pointer.y <= rect.height;
    };
    const onPointerLeave = () => {
      pointer.inside = false;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);

    const spawnDebt = CLOUDS.map(() => 0);

    const update = (time: number, deltaMs: number) => {
      const dt = Math.min(deltaMs, 32);
      const now = time * 1000;
      const layerRect = layer.getBoundingClientRect();

      // Emit from the underside of each cloud.
      clouds.forEach((el, i) => {
        spawnDebt[i] += (RAIN_RATE * dt) / 1000;
        while (spawnDebt[i] >= 1) {
          spawnDebt[i] -= 1;
          const rect = el.getBoundingClientRect();
          // Skip while the cloud is off-screen mid-drift.
          if (rect.right < layerRect.left || rect.left > layerRect.right) continue;
          const x = rect.left - layerRect.left + rect.width * gsap.utils.random(0.24, 0.76);
          const y = rect.top - layerRect.top + rect.height * 0.82;
          spawn(x, y, now);
        }
      });

      // Scatter drops away from the cursor, breaking the vertical fall.
      if (pointer.inside) {
        drops.forEach((drop) => {
          const dx = drop.position.x - pointer.x;
          const dy = drop.position.y - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist > POINTER_RADIUS || dist < 0.001) return;
          const falloff = 1 - dist / POINTER_RADIUS;
          const push = POINTER_PUSH * falloff * falloff;
          Matter.Body.applyForce(drop, drop.position, {
            x: (dx / dist) * push,
            y: (dy / dist) * push,
          });
        });
      }

      Matter.Engine.update(engine, dt);

      // Expire pooled water, and sweep up anything that escaped the bounds.
      for (let i = drops.length - 1; i >= 0; i -= 1) {
        const p = drops[i].position;
        if (p.y > height + 60 || now - born[i] > PUDDLE_LIFE) retire(i);
      }

      ctx.clearRect(0, 0, width, height);
      drops.forEach((drop, i) => {
        const { x, y } = drop.position;
        const speed = Math.min(Math.hypot(drop.velocity.x, drop.velocity.y), 8);
        // Fade out over the last second of life so the puddle recedes rather
        // than popping out of existence.
        const age = now - born[i];
        const fade = gsap.utils.clamp(0, 1, (PUDDLE_LIFE - age) / 1000);
        ctx.fillStyle = `rgba(120, 160, 195, ${0.6 * fade})`;
        ctx.beginPath();
        // Stretched along the fall so quick drops read as streaks; pooled water
        // is nearly still, so it renders round.
        ctx.ellipse(x, y, DROP_RADIUS, DROP_RADIUS + speed * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    gsap.ticker.add(update);

    const observer = new ResizeObserver(() => {
      sizeCanvas();
      Matter.Composite.remove(world, bounds);
      bounds = makeBounds();
      Matter.Composite.add(world, bounds);
    });
    observer.observe(layer);

    return () => {
      gsap.ticker.remove(update);
      observer.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
      Matter.Composite.clear(world, false);
      Matter.Engine.clear(engine);
    };
  }, []);

  return (
    <div ref={host} aria-hidden className={styles.summaryClouds}>
      <canvas ref={canvas} className={styles.rainCanvas} />
      {CLOUDS.map((cloud, i) => (
        <div
          key={i}
          ref={(el) => {
            cloudRefs.current[i] = el;
          }}
          className={`${styles.cloud} ${styles.cloudWet}`}
          style={{ top: cloud.top, width: cloud.width }}
        >
          <svg viewBox="0 0 150 100" fill="none">
            <path
              d={CLOUD_PATHS[cloud.variant]}
              fill="currentColor"
              fillOpacity={0.26}
              stroke="currentColor"
              strokeWidth="1"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
        </div>
      ))}
    </div>
  );
}
