"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Matter from "matter-js";
import styles from "./portfolio-august.module.css";

const TAGS = [
  "Product strategy",
  "System thinking",
  "Clarity from ambiguity",
  "System architecture",
  "Storytelling",
  "Customer obsession",
  "Design systems",
  "Rapid prototyping",
  "Delightful interaction design",
  "First principles",
  "Lighting fast shipping",
];

const WALL = 200;
const POINTER_RADIUS = 130;
const POINTER_STRENGTH = 0.9;
// ~23°. Past this the label starts reading as upside-down rather than jaunty.
const MAX_TILT = 0.4;
// ~40°, once the user is playing with them and legibility matters less.
const FREE_TILT = 0.7;
// The scene spans the full hero, so the floor is inset well up from the bottom
// to leave the pile sitting in the lower band rather than at the very edge.
const FLOOR_INSET = 30;
const SIDE_INSET = 16;
// Fraction of the pen the tags drop into. Narrow on purpose: a tight band
// makes them collide mid-air and pile up rather than landing in one flat row.
const DROP_BAND = 0.5;
const DROP_STAGGER = 150;
// The widest tag is ~230px. A pen of ~2.7x that guarantees the 11 pills can't
// all fit side by side, so they're forced to stack.
const PEN_MAX = 620;

/* Synthesised click, so there's no audio asset to ship. A short noise burst
   through a bandpass reads as two plastic pills knocking together. */
function createClicker() {
  let ctx: AudioContext | null = null;
  let noise: AudioBuffer | null = null;
  let lastPlay = 0;
  let voices = 0;

  const ensure = () => {
    if (!ctx) {
      ctx = new AudioContext();
      // Pre-render a short burst of white noise once and reuse it.
      const frames = Math.floor(ctx.sampleRate * 0.05);
      noise = ctx.createBuffer(1, frames, ctx.sampleRate);
      const data = noise.getChannelData(0);
      for (let i = 0; i < frames; i += 1) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / frames) ** 2;
      }
    }
    // Browsers start the context suspended until a user gesture.
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  };

  return {
    unlock: () => ensure(),
    play(strength: number, now: number) {
      // Rate-limit so a multi-body pileup doesn't machine-gun.
      if (now - lastPlay < 28 || voices > 5) return;
      const audio = ensure();
      if (!noise || audio.state !== "running") return;
      lastPlay = now;

      const src = audio.createBufferSource();
      src.buffer = noise;
      // Harder hits ring brighter and louder.
      src.playbackRate.value = 0.85 + strength * 0.5;

      const band = audio.createBiquadFilter();
      band.type = "bandpass";
      band.frequency.value = 1500 + strength * 2200;
      band.Q.value = 1.4;

      const gain = audio.createGain();
      const peak = Math.min(0.05 + strength * 0.13, 0.16);
      gain.gain.setValueAtTime(peak, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.05);

      src.connect(band).connect(gain).connect(audio.destination);
      voices += 1;
      src.onended = () => {
        voices -= 1;
      };
      src.start();
    },
    dispose: () => {
      void ctx?.close();
      ctx = null;
    },
  };
}

export function TagPhysics() {
  const scene = useRef<HTMLDivElement>(null);
  const tagRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const container = scene.current;
    if (!container) return;

    const els = tagRefs.current.filter((el): el is HTMLDivElement => Boolean(el));
    if (els.length !== TAGS.length) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = container.clientWidth;
    let height = container.clientHeight;

    // Measured from the laid-out pills, so bodies match what's on screen.
    const sizes = els.map((el) => ({
      w: el.offsetWidth,
      h: el.offsetHeight,
    }));

    if (reduceMotion) {
      // Settle them in a static, legible row layout instead of dropping.
      els.forEach((el) => {
        el.style.position = "static";
        el.style.transform = "none";
      });
      container.classList.add(styles.tagSceneStatic);
      return;
    }

    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 1, scale: 0.0011 },
    });
    const world = engine.world;

    // Deterministic jitter so the pile looks hand-scattered but is identical
    // across reloads (and matches between server and client).
    const random = gsap.utils.random;

    // Pen is centred and capped, so the pile stays a cluster on wide screens.
    const penWidth = () => Math.min(width - SIDE_INSET * 2, PEN_MAX);
    const penLeft = () => (width - penWidth()) / 2;
    const penRight = () => penLeft() + penWidth();

    const bodies = els.map((el, i) => {
      const { w, h } = sizes[i];
      // Drop into a narrow central band, not the full width — the tags then
      // collide on the way down and pile several rows deep instead of
      // spreading into one flat line.
      const bandHalf = (penWidth() * DROP_BAND) / 2;
      const spread = ((i % 5) / 4 - 0.5) * 2 * bandHalf;

      return Matter.Bodies.rectangle(
        width / 2 + spread + random(-24, 24, 1),
        // Above the container's top edge — which is the top of the hero — so
        // they enter from off-screen. Staggered to make the arrival a cascade.
        -h - 40 - i * DROP_STAGGER,
        w,
        h,
        {
          chamfer: { radius: h / 2 },
          restitution: 0.35,
          friction: 0.36,
          frictionStatic: 0.6,
          frictionAir: 0.008,
          density: 0.0014,
          angle: random(-0.3, 0.3, 0.001),
        },
      );
    });

    // While penned, the walls squeeze the pile into a cluster. Once the user
    // interacts, they widen to the viewport so tags can roam the whole hero.
    let penned = true;

    const makeWalls = () => {
      const left = penned ? penLeft() : SIDE_INSET;
      const right = penned ? penRight() : width - SIDE_INSET;
      return [
        // Floor is pulled inside the container so resting pills stay fully visible.
        Matter.Bodies.rectangle(width / 2, height + WALL / 2 - FLOOR_INSET, width * 3, WALL, {
          isStatic: true,
        }),
        Matter.Bodies.rectangle(left - WALL / 2, height / 2, WALL, height * 4, {
          isStatic: true,
        }),
        Matter.Bodies.rectangle(right + WALL / 2, height / 2, WALL, height * 4, {
          isStatic: true,
        }),
      ];
    };

    let walls = makeWalls();
    Matter.Composite.add(world, [...bodies, ...walls]);

    const rebuildWalls = () => {
      Matter.Composite.remove(world, walls);
      walls = makeWalls();
      Matter.Composite.add(world, walls);
    };

    const releasePen = () => {
      if (!penned) return;
      penned = false;
      rebuildWalls();
      // Nudge each body awake so a settled pile actually starts spreading
      // rather than sitting in place until something touches it.
      bodies.forEach((body) => {
        Matter.Body.setStatic(body, false);
        Matter.Sleeping.set(body, false);
      });
    };

    /* ---------------------------------------------------------------
     * Pointer repulsion. A force falling off with distance, rather than
     * a constraint, so tags get shoved aside and then tumble back.
     * --------------------------------------------------------------- */
    const pointer = { x: -9999, y: -9999, active: false };

    const onPointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    };
    const onPointerLeave = () => {
      pointer.active = false;
    };

    // The scene is pointer-events: none, so track on the document instead.
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);

    /* ---------------------------------------------------------------
     * Collision clicks. Autoplay policy blocks audio until the user has
     * interacted, so the falling pile is silent on a cold load and starts
     * clicking from the first gesture onward.
     * --------------------------------------------------------------- */
    const clicker = createClicker();
    const unlock = () => clicker.unlock();
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    window.addEventListener("pointermove", unlock, { once: true });

    const onCollision = (event: Matter.IEventCollision<Matter.Engine>) => {
      let loudest = 0;
      event.pairs.forEach(({ bodyA, bodyB }) => {
        // Relative closing speed approximates impact force well enough here,
        // and a static wall contributes only the moving body's velocity.
        const va = bodyA.isStatic ? { x: 0, y: 0 } : bodyA.velocity;
        const vb = bodyB.isStatic ? { x: 0, y: 0 } : bodyB.velocity;
        const speed = Math.hypot(va.x - vb.x, va.y - vb.y);
        if (speed > loudest) loudest = speed;
      });
      // Ignore the micro-jitter of a settled pile grinding against itself.
      if (loudest < 1.6) return;
      clicker.play(Math.min(loudest / 9, 1), performance.now());
    };

    Matter.Events.on(engine, "collisionStart", onCollision);

    const applyPointerForce = () => {
      if (!pointer.active) return;
      bodies.forEach((body) => {
        const dx = body.position.x - pointer.x;
        const dy = body.position.y - pointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance > POINTER_RADIUS || distance < 0.001) return;
        // First real contact with the pile frees them from the pen.
        releasePen();
        // Linear falloff: strongest at the cursor, zero at the radius edge.
        const falloff = 1 - distance / POINTER_RADIUS;
        const magnitude = POINTER_STRENGTH * falloff * body.mass * 0.006;
        Matter.Body.applyForce(body, body.position, {
          x: (dx / distance) * magnitude,
          y: (dy / distance) * magnitude,
        });
      });
    };

    /* ---------------------------------------------------------------
     * Render. GSAP's ticker drives both the solver and the DOM writes so
     * the simulation shares one clock with the rest of the page's motion.
     * --------------------------------------------------------------- */
    const update = (_time: number, deltaMs: number) => {
      applyPointerForce();
      // Clamp delta so a backgrounded tab doesn't explode the solver.
      Matter.Engine.update(engine, Math.min(deltaMs, 32));
      bodies.forEach((body, i) => {
        // Keep text upright in the initial pile. Once freed, allow a wider
        // tumble so shoving them around feels unconstrained.
        const limit = penned ? MAX_TILT : FREE_TILT;
        if (Math.abs(body.angle) > limit) {
          Matter.Body.setAngle(body, Math.sign(body.angle) * limit);
          Matter.Body.setAngularVelocity(body, body.angularVelocity * -0.2);
        }

        const el = els[i];
        const { w, h } = sizes[i];
        el.style.transform = `translate3d(${body.position.x - w / 2}px, ${body.position.y - h / 2}px, 0) rotate(${body.angle}rad)`;
      });
    };

    gsap.ticker.add(update);

    const onResize = () => {
      const nextWidth = container.clientWidth;
      const nextHeight = container.clientHeight;
      if (nextWidth === width && nextHeight === height) return;
      width = nextWidth;
      height = nextHeight;
      rebuildWalls();
    };

    const observer = new ResizeObserver(onResize);
    observer.observe(container);

    return () => {
      gsap.ticker.remove(update);
      observer.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointermove", unlock);
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      document.removeEventListener("pointerleave", onPointerLeave);
      Matter.Events.off(engine, "collisionStart", onCollision);
      clicker.dispose();
      Matter.Composite.clear(world, false);
      Matter.Engine.clear(engine);
    };
  }, []);

  return (
    <div ref={scene} className={styles.tagScene} aria-label="What I bring to the work">
      {TAGS.map((tag, i) => (
        <div
          key={tag}
          ref={(el) => {
            tagRefs.current[i] = el;
          }}
          className={styles.tag}
        >
          {tag}
        </div>
      ))}
    </div>
  );
}
