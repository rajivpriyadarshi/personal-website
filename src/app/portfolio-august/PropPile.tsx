"use client";

import Image from "next/image";
import { useEffect, useImperativeHandle, useRef, type Ref } from "react";
import gsap from "gsap";
import Matter from "matter-js";
import styles from "./portfolio-august.module.css";

/* Props rain into the Selected Work section and heap up along the bottom, then
 * stay shovable with the cursor. Driven by the Words section's scrubbed exit
 * rather than its own trigger, so the pile builds exactly as the cube wall
 * clears to uncover this section.
 *
 * Each work card owns a set of props. Hovering a card swaps the heap: the old
 * set drops out through the floor while the new one rains in. */
export type PropSetName = "coins" | "trucks" | "shopping";

export type PropPileHandle = {
  setActive: (active: boolean) => void;
  setSet: (set: PropSetName) => void;
};

/* Deterministic PRNG, so every prop's size, release time and spawn jitter are
 * identical across reloads and between server and client markup. Math.random
 * would desync the two and re-scatter the pile on every scrub. */
function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
}

// Mixed denominations, cycled by index so server and client agree.
const CURRENCIES = ["$", "₹", "€", "£", "¥", "$", "₹", "€"];
// Assorted milled sizes, so the heap doesn't read as one stamped-out shape.
const COIN_SIZES = [78, 66, 88, 70, 82, 62];

const TRUCKS = [
  { src: "/portfolio-august/work/trucks/t1.svg", w: 127.2, h: 68.4 },
  { src: "/portfolio-august/work/trucks/t2.svg", w: 134.3, h: 79.8 },
  { src: "/portfolio-august/work/trucks/t3.svg", w: 130.3, h: 79.3 },
  { src: "/portfolio-august/work/trucks/t4.svg", w: 131.8, h: 76.8 },
  { src: "/portfolio-august/work/trucks/t5.svg", w: 136.8, h: 72.7 },
  { src: "/portfolio-august/work/trucks/t6.svg", w: 128.2, h: 80.1 },
];
// Trucks are much wider than coins, so fewer fill the same band.
const TRUCK_SCALES = [1, 0.86, 1.12, 0.92, 1.04, 0.8];

/* Shopping and payment icons for LazyPay. Intrinsic sizes vary a lot (a tall
 * bag next to a squat card), so each carries its own normalising scale that
 * brings them to a comparable footprint in the heap. */
const SHOPPING = [
  { src: "s01.svg", w: 270.1, h: 302.3, scale: 0.34 },
  { src: "s02.svg", w: 208.8, h: 120.7, scale: 0.46 },
  { src: "s03.svg", w: 214.1, h: 118.4, scale: 0.46 },
  { src: "s04.svg", w: 106.6, h: 196.4, scale: 0.44 },
  { src: "s05.svg", w: 186.8, h: 110.6, scale: 0.46 },
  { src: "s06.svg", w: 154.1, h: 144, scale: 0.44 },
  { src: "s07.svg", w: 143.3, h: 92.2, scale: 0.5 },
  { src: "s08.svg", w: 222.2, h: 201.9, scale: 0.36 },
  { src: "s09.svg", w: 188.2, h: 189.2, scale: 0.38 },
  { src: "s10.svg", w: 208.2, h: 168.1, scale: 0.4 },
  { src: "s11.svg", w: 175.8, h: 197.5, scale: 0.38 },
];
// Per-item jitter on top of the normalising scale, so the heap isn't uniform.
const SHOPPING_JITTER = [1, 0.88, 1.14, 0.94, 1.06, 0.82, 1.1];

const SET_SEEDS: Record<PropSetName, number> = {
  coins: 20260729,
  trucks: 8675309,
  shopping: 4815162,
};

type PropItem = {
  id: string;
  kind: "coin" | "image";
  glyph?: string;
  src?: string;
  w: number;
  h: number;
  delay: number;
  drift: number;
  lift: number;
  spin: number;
};

function buildSet(
  name: PropSetName,
  count: number,
  make: (i: number, rand: () => number) => Omit<PropItem, "id" | "delay" | "drift" | "lift" | "spin">,
): PropItem[] {
  // Per-set seed, so adding or reordering a set never reshuffles the others.
  const rand = seededRandom(SET_SEEDS[name]);
  return Array.from({ length: count }, (_, i) => ({
    id: `${name}-${i}`,
    ...make(i, rand),
    // Staggered release, so props arrive as a continuous scatter rather than
    // whole rows landing in lockstep. Seconds from when the shower is armed.
    delay: rand() * 2.6,
    // Sideways drift off the column centre, so the rain isn't visibly gridded.
    drift: (rand() - 0.5) * 0.9,
    // Slight variation in start height, breaking up shared fall times.
    lift: rand() * 260,
    // Entry tumble, so props don't all arrive perfectly level.
    spin: (rand() - 0.5) * 1.2,
  }));
}

const PROP_SETS: Record<PropSetName, { items: PropItem[]; mobileCount: number }> = {
  coins: {
    items: buildSet("coins", 92, (i) => {
      const size = COIN_SIZES[i % COIN_SIZES.length];
      return {
        kind: "coin",
        glyph: CURRENCIES[i % CURRENCIES.length],
        w: size,
        h: size,
      };
    }),
    mobileCount: 44,
  },
  trucks: {
    items: buildSet("trucks", 52, (i) => {
      const truck = TRUCKS[i % TRUCKS.length];
      const scale = TRUCK_SCALES[i % TRUCK_SCALES.length] * 0.78;
      return {
        kind: "image",
        src: truck.src,
        w: truck.w * scale,
        h: truck.h * scale,
      };
    }),
    mobileCount: 24,
  },
  shopping: {
    items: buildSet("shopping", 56, (i) => {
      const icon = SHOPPING[i % SHOPPING.length];
      const scale = icon.scale * SHOPPING_JITTER[i % SHOPPING_JITTER.length];
      return {
        kind: "image",
        src: `/portfolio-august/work/shopping/${icon.src}`,
        w: icon.w * scale,
        h: icon.h * scale,
      };
    }),
    mobileCount: 26,
  },
};

const SET_NAMES = Object.keys(PROP_SETS) as PropSetName[];

const WALL = 220;
// Props are hard and heavy: they clack and settle rather than bouncing away.
const RESTITUTION = 0.24;
/* Tuned against the full 92-coin heap: at ~46 props a lighter touch was enough,
 * but a deeper pile interlocks and carries more load, so the cursor needs real
 * reach and force to plough a visible trench through it rather than just
 * jostling the top layer. */
const POINTER_RADIUS = 230;
const POINTER_STRENGTH = 3.6;
/* Caps how fast a shoved prop can travel. Force alone isn't enough: the falloff
 * peaks right at the cursor, and without a ceiling a prop caught dead-centre
 * gets flung to the top of the viewport instead of ploughing through the heap. */
const MAX_SHOVE_SPEED = 9;

// Columns the shower drops through. Props are assigned round-robin, then
// jittered, so they spread across the width without visible banding.
const PER_ROW = 10;
/* Floor sits inside the container so the bottom row of props rests fully
 * on-screen rather than being sliced by the viewport edge. */
const FLOOR_INSET = 24;

/* Collision categories. The floor collides with the settled heap but not with
 * an outgoing set, which is what lets a swapped-out set fall straight through
 * the bottom of the scene instead of piling up on it. */
const CAT_WALL = 0x0001;
const CAT_ACTIVE = 0x0002;
const CAT_EXITING = 0x0004;

export function PropPile({ handleRef }: { handleRef: Ref<PropPileHandle> }) {
  const scene = useRef<HTMLDivElement>(null);
  const elRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const api = useRef<{
    setActive: (active: boolean) => void;
    setSet: (set: PropSetName) => void;
  }>({ setActive: () => {}, setSet: () => {} });

  useImperativeHandle(handleRef, () => ({
    setActive: (active) => api.current.setActive(active),
    setSet: (set) => api.current.setSet(set),
  }));

  useEffect(() => {
    const container = scene.current;
    if (!container) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    let width = container.clientWidth;
    let height = container.clientHeight;

    /* One simulated group per set. All sets exist in the DOM; only the live one
     * is in the world, so an inactive set costs nothing to keep around. */
    type Group = {
      items: PropItem[];
      els: HTMLDivElement[];
      bodies: Matter.Body[];
      released: Set<number>;
      elapsed: number;
      exiting: boolean;
    };

    const groups = {} as Record<PropSetName, Group>;

    for (const name of SET_NAMES) {
      const set = PROP_SETS[name];
      const count = isMobile ? set.mobileCount : set.items.length;
      const items = set.items.slice(0, count);

      // Surplus props are never simulated, so keep them out of the layout too.
      set.items.slice(count).forEach((item) => {
        const el = elRefs.current[item.id];
        if (el) el.style.display = "none";
      });

      const els = items.map((item) => elRefs.current[item.id]);
      if (els.some((el) => !el)) return;

      groups[name] = {
        items,
        els: els as HTMLDivElement[],
        bodies: items.map((item) =>
          item.kind === "coin"
            ? Matter.Bodies.circle(0, 0, item.w / 2, {
                restitution: RESTITUTION,
                friction: 0.42,
                frictionStatic: 0.7,
                frictionAir: 0.006,
                density: 0.0022,
              })
            : Matter.Bodies.rectangle(0, 0, item.w, item.h, {
                // Rounded corners so trucks tumble and nest rather than
                // locking into a rigid brick wall.
                chamfer: { radius: Math.min(item.w, item.h) * 0.16 },
                restitution: RESTITUTION,
                friction: 0.5,
                frictionStatic: 0.8,
                frictionAir: 0.008,
                density: 0.0018,
              }),
        ),
        released: new Set<number>(),
        elapsed: 0,
        exiting: false,
      };
    }

    const spawnOf = (group: Group, i: number) => {
      const item = group.items[i];
      const col = i % PER_ROW;
      // Round-robin across columns plus per-prop drift, so props spread over
      // the full width without landing in visible rows.
      const x = ((col + 0.5 + item.drift) / PER_ROW) * width;
      // All well above the top edge. Each prop's own lift varies the fall
      // distance so even same-instant releases don't land together.
      return { x, y: -item.h - 80 - item.lift };
    };

    const renderGroup = (group: Group) => {
      group.bodies.forEach((body, i) => {
        const item = group.items[i];
        const el = group.els[i];
        // Unreleased props stay hidden rather than parked at their spawn point,
        // where a tall stack of them would show above the top edge.
        el.style.opacity = group.released.has(i) ? "1" : "0";
        el.style.transform = `translate3d(${body.position.x - item.w / 2}px, ${body.position.y - item.h / 2}px, 0) rotate(${body.angle}rad)`;
      });
    };

    if (reduceMotion) {
      /* Lay each set out as a static heap along the bottom. Same read as the
       * settled simulation, with nothing in motion. Only the live set is shown;
       * hovering still swaps which one that is. */
      const layoutStatic = (group: Group) => {
        const cols = PER_ROW + 2;
        group.items.forEach((item, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const x = ((col + 0.5 + item.drift) / cols) * width - item.w / 2;
          const y = height - FLOOR_INSET - item.h * (1 + row * 0.58);
          group.els[i].style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${(i % 5) * 14 - 28}deg)`;
        });
      };

      let shown: PropSetName = "coins";
      const applyStatic = () => {
        for (const name of SET_NAMES) {
          layoutStatic(groups[name]);
          groups[name].els.forEach((el) => {
            el.style.opacity = name === shown ? "1" : "0";
          });
        }
      };
      applyStatic();

      api.current = {
        setActive: () => {},
        setSet: (next) => {
          if (next === shown) return;
          shown = next;
          applyStatic();
        },
      };
      return;
    }

    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 1, scale: 0.0013 },
      // A settled heap of ~92 bodies is a lot of contacts to keep solving.
      enableSleeping: true,
    });
    const world = engine.world;

    const makeWalls = () => {
      const collisionFilter = { category: CAT_WALL, mask: CAT_ACTIVE };
      return [
        Matter.Bodies.rectangle(
          width / 2,
          height + WALL / 2 - FLOOR_INSET,
          width * 3,
          WALL,
          { isStatic: true, collisionFilter },
        ),
        Matter.Bodies.rectangle(-WALL / 2, height / 2, WALL, height * 4, {
          isStatic: true,
          collisionFilter,
        }),
        Matter.Bodies.rectangle(width + WALL / 2, height / 2, WALL, height * 4, {
          isStatic: true,
          collisionFilter,
        }),
      ];
    };

    let walls = makeWalls();
    Matter.Composite.add(world, walls);

    const rebuildWalls = () => {
      Matter.Composite.remove(world, walls);
      walls = makeWalls();
      Matter.Composite.add(world, walls);
    };

    const asActive = (group: Group) => {
      group.exiting = false;
      group.bodies.forEach((body) => {
        body.collisionFilter.category = CAT_ACTIVE;
        body.collisionFilter.mask = CAT_WALL | CAT_ACTIVE;
      });
    };

    /* Swapped-out props collide with nothing, so they sink through the floor
     * and the incoming set rather than shouldering it aside on the way out. */
    const asExiting = (group: Group) => {
      group.exiting = true;
      group.bodies.forEach((body, i) => {
        if (!group.released.has(i)) return;
        body.collisionFilter.category = CAT_EXITING;
        body.collisionFilter.mask = 0;
        Matter.Sleeping.set(body, false);
        // A downward kick, so the set visibly drops away instead of easing off.
        Matter.Body.setVelocity(body, {
          x: body.velocity.x * 0.4,
          y: Math.max(body.velocity.y, 4),
        });
      });
    };

    const resetGroup = (group: Group) => {
      Matter.Composite.remove(world, group.bodies);
      group.released.clear();
      group.elapsed = 0;
      group.exiting = false;
      group.bodies.forEach((body, i) => {
        const spawn = spawnOf(group, i);
        Matter.Body.setPosition(body, spawn);
        Matter.Body.setVelocity(body, { x: 0, y: 0 });
        Matter.Body.setAngle(body, group.items[i].spin);
        Matter.Body.setAngularVelocity(body, 0);
        Matter.Sleeping.set(body, false);
      });
      asActive(group);
      renderGroup(group);
    };

    for (const name of SET_NAMES) resetGroup(groups[name]);

    let live: PropSetName = "coins";

    /* ---------------------------------------------------------------
     * Pointer shove. A force with linear falloff, like the Tag scene — the
     * props get pushed aside and tumble back rather than sticking to the
     * cursor.
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

    // The scene is pointer-events: none so the cards stay clickable through it.
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);

    const applyPointerForce = (group: Group) => {
      if (!pointer.active) return;
      group.bodies.forEach((body, i) => {
        if (!group.released.has(i)) return;
        const dx = body.position.x - pointer.x;
        const dy = body.position.y - pointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance > POINTER_RADIUS || distance < 0.001) return;
        // Sleeping bodies ignore forces, so a settled heap needs waking first.
        Matter.Sleeping.set(body, false);
        const falloff = 1 - distance / POINTER_RADIUS;
        const magnitude = POINTER_STRENGTH * falloff * body.mass * 0.006;
        Matter.Body.applyForce(body, body.position, {
          x: (dx / distance) * magnitude,
          y: (dy / distance) * magnitude,
        });

        const speed = Math.hypot(body.velocity.x, body.velocity.y);
        if (speed > MAX_SHOVE_SPEED) {
          const scale = MAX_SHOVE_SPEED / speed;
          Matter.Body.setVelocity(body, {
            x: body.velocity.x * scale,
            y: body.velocity.y * scale,
          });
        }
      });
    };

    const releaseDue = (group: Group) => {
      group.bodies.forEach((body, i) => {
        if (group.released.has(i) || group.elapsed < group.items[i].delay) return;
        group.released.add(i);
        Matter.Composite.add(world, body);
      });
    };

    const update = (_time: number, deltaMs: number) => {
      // Clamp delta so a backgrounded tab doesn't explode the solver.
      const step = Math.min(deltaMs, 32);

      for (const name of SET_NAMES) {
        const group = groups[name];
        if (name === live) {
          group.elapsed += step / 1000;
          releaseDue(group);
          applyPointerForce(group);
        } else if (group.exiting) {
          // Once an outgoing set has sunk clear of the scene, park it back at
          // its spawn so hovering the card again replays the full shower.
          const clear = group.bodies.every(
            (body, i) =>
              !group.released.has(i) || body.position.y > height + 400,
          );
          if (clear) resetGroup(group);
        }
      }

      Matter.Engine.update(engine, step);

      for (const name of SET_NAMES) {
        const group = groups[name];
        if (name === live || group.exiting) renderGroup(group);
      }
    };

    let running = false;
    api.current = {
      setActive: (active: boolean) => {
        if (active === running) return;
        running = active;
        if (active) {
          gsap.ticker.add(update);
        } else {
          gsap.ticker.remove(update);
          for (const name of SET_NAMES) resetGroup(groups[name]);
          live = "coins";
        }
      },
      setSet: (next: PropSetName) => {
        if (next === live || !groups[next]) return;
        asExiting(groups[live]);
        live = next;
        // Incoming set starts its shower from the top, whatever state it was in.
        resetGroup(groups[next]);
      },
    };

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
      api.current = { setActive: () => {}, setSet: () => {} };
      observer.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
      Matter.Composite.clear(world, false);
      Matter.Engine.clear(engine);
    };
  }, []);

  return (
    <div ref={scene} aria-hidden className={styles.propScene}>
      {SET_NAMES.flatMap((name) =>
        PROP_SETS[name].items.map((item) => (
          <div
            key={item.id}
            ref={(el) => {
              elRefs.current[item.id] = el;
            }}
            className={item.kind === "coin" ? styles.coin : styles.propImage}
            // Sized from the item, so markup is identical on server and client.
            style={{
              width: item.w,
              height: item.h,
              fontSize: item.kind === "coin" ? item.w * 0.46 : undefined,
            }}
          >
            {item.kind === "coin" ? (
              <span className={styles.coinGlyph}>{item.glyph}</span>
            ) : (
              /* unoptimized: these are SVG line art, which the image optimizer
                 refuses to process without dangerouslyAllowSVG. */
              <Image
                src={item.src as string}
                alt=""
                width={item.w}
                height={item.h}
                unoptimized
                className={styles.propImageArt}
              />
            )}
          </div>
        )),
      )}
    </div>
  );
}
