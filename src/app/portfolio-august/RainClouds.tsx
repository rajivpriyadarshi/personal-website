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

/* Only the clouds above the copy — they all rain. Drift durations are spread so
 * they cross at different speeds and the whole width gets rained on over time
 * rather than one band of the skyline taking every drop. */
const CLOUDS = [
  { top: "5%", width: 340, variant: 0, drift: 68 },
  { top: "15%", width: 240, variant: 1, drift: 52 },
  { top: "26%", width: 300, variant: 2, drift: 86 },
  { top: "9%", width: 280, variant: 1, drift: 61 },
  { top: "21%", width: 320, variant: 2, drift: 76 },
] as const;

const DROP_RADIUS = 2.6;
const MAX_DROPS = 460;
/* Fractions of each cloud's loop to start at. Deliberately irregular: spacing
 * them evenly by index left the clouds travelling as a clump, so only a narrow
 * band of the skyline was ever under rain. */
const CLOUD_PHASE = [0.05, 0.42, 0.68, 0.24, 0.85];
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

/* Rooftops die faster than ground water: a roof holds a thin film, and letting
 * it linger as long as the puddle built visible mounds on every ledge. Long
 * enough, though, that a landing visibly sits before it drains. */
const ROOF_LIFE = 2600;

const SKYLINE_SRC = "/portfolio-august/summary/marina-bay-sands.webp";
/* Columns in the skyline's collision profile. Each becomes one static box, so
 * this trades silhouette fidelity against body count — 96 resolves the three
 * tower gaps and the ArtScience lobe without flooding the solver. */
const SKYLINE_COLUMNS = 96;
// Alpha above this counts as solid roof.
const ALPHA_SOLID = 128;
/* Roofs are thin ledges, not columns. Thick enough that a fast drop can't
 * tunnel through between solver steps. */
const ROOF_THICKNESS = 14;

/* Reads the skyline's own alpha channel into a per-column height profile, in
 * 0..1 units of the image box. Using the photo rather than a separate outline
 * asset means the collision shape can never drift out of register with what's
 * drawn — and the fully transparent columns at the left and right edges are
 * reported as null so no invisible wall stands there. */
async function traceSkyline(src: string): Promise<(number | null)[]> {
  const img = new Image();
  img.src = src;
  await img.decode();

  const w = SKYLINE_COLUMNS;
  const h = Math.max(
    1,
    Math.round(w * (img.naturalHeight / img.naturalWidth)),
  );
  const probe = document.createElement("canvas");
  probe.width = w;
  probe.height = h;
  const pctx = probe.getContext("2d", { willReadFrequently: true });
  if (!pctx) return Array.from({ length: w }, () => null);
  pctx.drawImage(img, 0, 0, w, h);

  const { data } = pctx.getImageData(0, 0, w, h);
  return Array.from({ length: w }, (_, x) => {
    for (let y = 0; y < h; y += 1) {
      if (data[(y * w + x) * 4 + 3] > ALPHA_SOLID) return y / h;
    }
    return null;
  });
}

/* Drives the taper. The scroll timeline in SummarySection tweens `.current`
 * from 1 to 0 as the role screen arrives, and the simulation reads it each frame
 * — a mutable box rather than state, because it changes on every frame of the
 * scrub and nothing here should re-render for it. Structural rather than
 * RefObject so this file doesn't need to care where the value comes from. */
export type RainDial = { current: number };

type Props = {
  /** Rainfall multiplier, 1 = full, 0 = dry. Omitted means always raining. */
  dial?: RainDial;
};

export function RainClouds({ dial }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const cloudRefs = useRef<(HTMLDivElement | null)[]>([]);
  /* Mirrored so the effect can stay on an empty dep list — it reads the box
   * every frame and must not tear down and rebuild the world if the parent
   * happens to hand over a new one. */
  const dialRef = useRef(dial);
  useEffect(() => {
    dialRef.current = dial;
  }, [dial]);

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
            delay: -drift * CLOUD_PHASE[i],
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

    /* ---------------------------------------------------------------
     * Skyline roofs. One static box per profile column, so drops land on the
     * towers and rooftops instead of falling through to the ground. Positions
     * are rebuilt from the live element rect, which means they follow the
     * entrance slide and the looping push-in scale for free.
     * --------------------------------------------------------------- */
    const skylineEl = layer
      .closest("section")
      ?.querySelector<HTMLImageElement>(`img.${styles.skyline}`);
    let profile: (number | null)[] = [];
    let roofs: Matter.Body[] = [];
    // Marks bodies as roof so landed water can be expired sooner than puddles.
    const roofIds = new Set<number>();

    const buildRoofs = () => {
      Matter.Composite.remove(world, roofs);
      roofs = [];
      roofIds.clear();
      if (!skylineEl || !profile.length) return;

      const box = skylineEl.getBoundingClientRect();
      const layerRect = layer.getBoundingClientRect();

      /* `object-fit: contain` letterboxes: the element box is wider than the
       * drawn image, so the picture occupies only a centred band of it. Tracing
       * the box instead of that band put roof ledges out in the empty margins,
       * which showed up as rain resting in mid-air beside the building. */
      const natRatio = skylineEl.naturalWidth / skylineEl.naturalHeight;
      if (!natRatio) return;
      const boxRatio = box.width / box.height;
      const drawnWidth = boxRatio > natRatio ? box.height * natRatio : box.width;
      const drawnHeight = boxRatio > natRatio ? box.height : box.width / natRatio;
      // object-position is `center bottom`: centred on x, flush to the box floor.
      const rect = {
        left: box.left + (box.width - drawnWidth) / 2,
        top: box.bottom - drawnHeight,
        width: drawnWidth,
        height: drawnHeight,
      };

      const left = rect.left - layerRect.left;
      const top = rect.top - layerRect.top;
      const colWidth = rect.width / profile.length;

      /* Each roof is a thin slab at the silhouette's surface, NOT a solid column
       * down to the floor. A full-depth column reaches below the ground plane at
       * height * FLOOR_AT, and since the floor is added first the drops settle
       * on the floor and never touch the roof at all. */
      const floorY = layerRect.height * FLOOR_AT;

      profile.forEach((rowFraction, i) => {
        if (rowFraction === null) return;
        const surfaceY = top + rowFraction * rect.height;
        // Skip surfaces that have slid out of view, or that sit below the ground
        // plane where the floor already catches everything.
        if (surfaceY > floorY - ROOF_THICKNESS || surfaceY < -40) return;
        roofs.push(
          Matter.Bodies.rectangle(
            left + (i + 0.5) * colWidth,
            surfaceY + ROOF_THICKNESS / 2,
            // Slight overlap between neighbours, so drops can't slip through
            // the hairline seam where two columns meet.
            colWidth + 1,
            ROOF_THICKNESS,
            { isStatic: true, friction: 0.06, restitution: 0.2 },
          ),
        );
      });

      roofs.forEach((body) => roofIds.add(body.id));
      Matter.Composite.add(world, roofs);
    };

    void traceSkyline(SKYLINE_SRC).then((traced) => {
      profile = traced;
      buildRoofs();
    });

    const retire = (i: number) => {
      onRoof.delete(drops[i].id);
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
    let lastRoofBuild = 0;

    /* Wet and dry cloud colours, interpolated by the dial so a cloud visibly
     * empties as it stops raining. Read off the stylesheet rather than repeated
     * here, so the two palettes stay in one place. `.cloud` is the dry base and
     * `.cloudWet` overrides it, which is why the dry value has to be sampled
     * from a throwaway element carrying only the base class. */
    const dryProbe = document.createElement("div");
    dryProbe.className = styles.cloud;
    dryProbe.style.position = "absolute";
    dryProbe.style.visibility = "hidden";
    layer.append(dryProbe);
    const dryColor = getComputedStyle(dryProbe).color;
    const wetColor = clouds.length ? getComputedStyle(clouds[0]).color : dryColor;
    dryProbe.remove();
    const mixColor = gsap.utils.interpolate(dryColor, wetColor);
    // Last value written, so an unchanged frame doesn't touch five style objects.
    let paintedWetness = -1;

    /* Drops currently resting on the skyline. Tracked so roof water can expire
     * on a shorter clock than ground puddles, and so a hit can throw a splash. */
    const onRoof = new Set<number>();

    /* Splash particles. Plain points rather than physics bodies — they're purely
     * decorative, live under a third of a second, and adding 6 rigid bodies per
     * impact would multiply the solver's work for no visual gain. */
    type Splash = { x: number; y: number; vx: number; vy: number; life: number };
    const splashes: Splash[] = [];

    const onImpact = (event: Matter.IEventCollision<Matter.Engine>) => {
      event.pairs.forEach(({ bodyA, bodyB }) => {
        const roof = roofIds.has(bodyA.id)
          ? bodyA
          : roofIds.has(bodyB.id)
            ? bodyB
            : null;
        if (!roof) return;
        const drop = roof === bodyA ? bodyB : bodyA;
        if (drop.isStatic) return;
        onRoof.add(drop.id);

        // Only a real fall splashes; water settling in a film shouldn't.
        const speed = Math.hypot(drop.velocity.x, drop.velocity.y);
        if (speed < 1.4 || splashes.length > 140) return;
        const count = speed > 3.2 ? 3 : 2;
        for (let i = 0; i < count; i += 1) {
          splashes.push({
            x: drop.position.x,
            y: drop.position.y,
            // Kicks outward and up, like water breaking on a hard surface.
            vx: gsap.utils.random(-1.5, 1.5),
            vy: gsap.utils.random(-2.2, -0.6),
            life: 1,
          });
        }
      });
    };

    Matter.Events.on(engine, "collisionStart", onImpact);

    const update = (time: number, deltaMs: number) => {
      const dt = Math.min(deltaMs, 32);
      const now = time * 1000;
      const layerRect = layer.getBoundingClientRect();

      /* How hard it's raining right now. Scaling the emission rate rather than
       * stopping the ticker is what makes the stop gradual: the last drops keep
       * falling and the puddle recedes on its own life clock, so the sky drains
       * instead of the rain vanishing between two frames. */
      const wetness = gsap.utils.clamp(0, 1, dialRef.current?.current ?? 1);

      // Drain the colour out of the clouds on the same dial.
      if (Math.abs(wetness - paintedWetness) > 0.004) {
        paintedWetness = wetness;
        const colour = mixColor(wetness);
        clouds.forEach((el) => {
          el.style.color = colour;
        });
      }

      // Emit from the underside of each cloud.
      clouds.forEach((el, i) => {
        spawnDebt[i] += (RAIN_RATE * wetness * dt) / 1000;
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

      /* The skyline slides in and then loops a slow scale, so its roofs move.
       * Rebuilding on a fixed interval rather than every frame: 90-odd static
       * bodies is cheap to recreate but not free, and the motion is slow enough
       * that ~6 times a second is imperceptible. */
      if (now - lastRoofBuild > 160) {
        lastRoofBuild = now;
        buildRoofs();
      }

      Matter.Engine.update(engine, dt);

      // Expire pooled water, and sweep up anything that escaped the bounds.
      for (let i = drops.length - 1; i >= 0; i -= 1) {
        const p = drops[i].position;
        const life = onRoof.has(drops[i].id) ? ROOF_LIFE : PUDDLE_LIFE;
        if (p.y > height + 60 || now - born[i] > life) retire(i);
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

      /* Splash particles: ballistic, gravity-affected, fading over their life.
       * Iterated backwards so removals don't skip the next entry. */
      for (let i = splashes.length - 1; i >= 0; i -= 1) {
        const s = splashes[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.16;
        s.life -= dt / 300;
        if (s.life <= 0) {
          splashes.splice(i, 1);
          continue;
        }
        ctx.fillStyle = `rgba(120, 160, 195, ${0.5 * s.life})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, DROP_RADIUS * 0.55, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    /* Only simulate while the section is on screen. Rain is a few hundred rigid
     * bodies plus a canvas redraw every frame, and it used to keep solving the
     * whole time you were reading other sections — the single largest slice of
     * the page's idle CPU. */
    let running = false;
    const setRunning = (active: boolean) => {
      if (active === running) return;
      running = active;
      if (active) gsap.ticker.add(update);
      else gsap.ticker.remove(update);
    };

    const visibility = new IntersectionObserver(
      /* Gate on ratio, not isIntersecting. Sections are exactly one viewport
         tall and sit flush, so the neighbouring section is always "intersecting"
         by a zero-height edge — isIntersecting stayed true at every scroll
         position and the solver never paused. */
      (entries) => {
        const entry = entries[entries.length - 1];
        setRunning((entry?.intersectionRatio ?? 0) > 0.05);
      },
      // Several steps, so crossing the 5% line always fires a callback.
      { threshold: [0, 0.05, 0.2] },
    );
    visibility.observe(layer);

    const observer = new ResizeObserver(() => {
      sizeCanvas();
      Matter.Composite.remove(world, bounds);
      bounds = makeBounds();
      Matter.Composite.add(world, bounds);
      buildRoofs();
    });
    observer.observe(layer);

    return () => {
      setRunning(false);
      visibility.disconnect();
      observer.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
      Matter.Events.off(engine, "collisionStart", onImpact);
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
