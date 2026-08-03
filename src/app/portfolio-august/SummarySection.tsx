"use client";

import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import { RainClouds } from "./RainClouds";
// import { Droplets } from "@/components/canvasui/Droplets";
import styles from "./portfolio-august.module.css";

gsap.registerPlugin(ScrollTrigger, TextPlugin, useGSAP);

const HEADLINE =
  "I’m a versatile product design generalist based in Singapore, with 10 years of building digital products across fintech, logistics, edtech, hospitality, and SaaS";
const SUBHEAD =
  "I thrive in complex, ambiguous spaces where the problem isn’t clearly defined, and the stakes are high";

/* Positions mirror the Figma layout as viewport-relative percentages so the
 * arrangement holds at any width. `from` is the off-screen offset each object
 * springs in from; `mass` scales both its spring response and its pointer
 * sensitivity, so heavy objects lumber and light ones dart. */
const OBJECTS = [
  {
    key: "paper",
    tip: "right",
    src: "/portfolio-august/summary/paper.webp",
    alt: "Crumpled paper ball",
    size: 372,
    left: "-9%",
    top: "13%",
    rotate: 0,
    from: { x: -520, y: -120 },
    mass: 0.8,
    spin: -40,
  },
  {
    key: "knife",
    tip: "low",
    src: "/portfolio-august/summary/knife.webp",
    alt: "Craft knife",
    size: 420,
    left: "26%",
    top: "-26%",
    rotate: -97.64,
    from: { x: -120, y: -520 },
    mass: 0.65,
    spin: 55,
  },
  {
    key: "room",
    tip: "left",
    src: "/portfolio-august/summary/room.webp",
    alt: "Miniature living room",
    size: 356,
    left: "82%",
    top: "15%",
    rotate: 0,
    from: { x: 560, y: -140 },
    mass: 1.35,
    spin: 28,
  },
  {
    key: "truck",
    tip: "right",
    src: "/portfolio-august/summary/truck.webp",
    alt: "Toy pickup truck",
    size: 383,
    left: "-4%",
    top: "64%",
    rotate: 0,
    from: { x: -500, y: 260 },
    mass: 1.1,
    spin: -32,
  },
  {
    key: "pos",
    tip: "low",
    src: "/portfolio-august/summary/pos.webp",
    alt: "Card payment terminal",
    size: 401,
    left: "45%",
    // Raised to the top edge, matching the design and clearing the skyline
    // that now occupies the bottom of the section.
    top: "-13%",
    rotate: 0,
    from: { x: 80, y: -520 },
    mass: 0.9,
    spin: 44,
  },
  {
    key: "computer",
    tip: "left",
    src: "/portfolio-august/summary/computer.webp",
    alt: "Retro desktop computer",
    size: 443,
    left: "75%",
    top: "60%",
    rotate: 0,
    from: { x: 540, y: 240 },
    mass: 1.45,
    spin: -24,
  },
] as const;

/* Spring constants. STIFFNESS/DAMPING are tuned so an object overshoots its
 * home once or twice and settles in under a second — springy enough to read as
 * physical, not so loose that the composition wobbles while you're reading. */
const STIFFNESS = 105;
const DAMPING = 11.5;
const POINTER_RADIUS = 420;
// Furthest an object drifts toward the cursor, before the per-object mass
// divisor. Capped so they lean in rather than piling onto the pointer.
const REACH = 78;
// Max degrees the face turns toward the cursor.
const TILT = 13;
// Seconds between each object's arrival.
const ARRIVAL_GAP = 0.34;

/* Where each prop's bubble hangs. Props that overhang a section edge would push
 * a centred bubble off-screen, so they anchor inward instead. */
const TIP_CLASS = {
  left: styles.propTipLeft,
  right: styles.propTipRight,
  low: styles.propTipLow,
} as const;

const BIRD_FLOCKS = [
  "birdOne",
  "birdTwo",
  "birdThree",
  "birdFour",
  "birdFive",
  "birdSix",
] as const;

type Spring = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Parked off-screen until its staggered turn to fly in. */
  held: boolean;
};

export function SummarySection() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = root.current;
      if (!section) return;

      const items = gsap.utils.toArray<HTMLElement>(`.${styles.summaryObject}`, section);
      const tilts = gsap.utils.toArray<HTMLElement>(`.${styles.summaryTilt}`, section);
      // The page scrolls inside <main>, not the window, so ScrollTrigger has to
      // be pointed at that element or it never sees the section enter.
      const scroller = section.closest("main");
      const headline = section.querySelector<HTMLElement>(`.${styles.summaryHeadline}`);
      const sub = section.querySelector<HTMLElement>(`.${styles.summarySub}`);

      const skyline = section.querySelector<HTMLElement>(
        `.${styles.skylineLayer}`,
      );

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(items, { autoAlpha: 1 });
        return;
      }

      /* Skyline rises into place from below the fold. Set on the wrapper, not the
       * image — the image owns the looping push-in scale, and animating both on
       * one element would have the entrance and the loop fight over transform. */
      if (skyline) gsap.set(skyline, { yPercent: 100 });

      /* ---------------------------------------------------------------
       * Springs. Each object is a point mass tethered to its layout
       * position. The entrance is just the spring released from a long way
       * off; the pointer adds a repulsion force to the same system, so
       * shoving an object and watching it wobble home uses one code path.
       * --------------------------------------------------------------- */
      const springs: Spring[] = OBJECTS.map(() => ({
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        held: false,
      }));
      let live = false;

      /* Rest centres, section-relative. Cached because reading layout for six
       * elements every frame forces a reflow, and the attraction needs a fixed
       * anchor — measuring live would let each object chase its own offset. */
      let homes = OBJECTS.map(() => ({ x: 0, y: 0 }));

      const measure = () => {
        const sectionRect = section.getBoundingClientRect();
        homes = items.map((el, i) => {
          const rect = el.getBoundingClientRect();
          return {
            x: rect.left - sectionRect.left + rect.width / 2 - springs[i].x,
            y: rect.top - sectionRect.top + rect.height / 2 - springs[i].y,
          };
        });
      };
      measure();

      const observer = new ResizeObserver(measure);
      observer.observe(section);

      const pointer = { x: 0, y: 0, inside: false };

      const onPointerMove = (event: PointerEvent) => {
        const rect = section.getBoundingClientRect();
        pointer.x = event.clientX - rect.left;
        pointer.y = event.clientY - rect.top;
        pointer.inside =
          pointer.x >= 0 && pointer.x <= rect.width && pointer.y >= 0 && pointer.y <= rect.height;
      };
      window.addEventListener("pointermove", onPointerMove, { passive: true });

      const update = (_t: number, deltaMs: number) => {
        if (!live) return;
        // Clamp and convert to seconds; a backgrounded tab would otherwise
        // hand us a huge delta and fling everything off screen.
        const dt = Math.min(deltaMs, 32) / 1000;

        items.forEach((el, i) => {
          const spring = springs[i];
          const { mass } = OBJECTS[i];
          // Held springs stay parked off-screen until their turn.
          if (spring.held) return;

          /* Attraction is modelled as the spring's target moving, not as a
           * force toward the cursor. A force would compound as the gap closes
           * — the object would collapse onto the pointer and stick. Retargeting
           * gives a capped lean toward the cursor that eases off with distance
           * and releases home when the pointer leaves. */
          let targetX = 0;
          let targetY = 0;

          if (pointer.inside) {
            const home = homes[i];
            const dx = pointer.x - home.x;
            const dy = pointer.y - home.y;
            const dist = Math.hypot(dx, dy);
            if (dist < POINTER_RADIUS && dist > 0.001) {
              // Eased falloff: strongest right at the cursor, nothing at the rim.
              const pull = (1 - dist / POINTER_RADIUS) ** 1.4;
              // Never travel more than REACH toward the pointer, and lighter
              // objects are drawn further than heavy ones.
              const travel = Math.min(REACH / mass, dist) * pull;
              targetX = (dx / dist) * travel;
              targetY = (dy / dist) * travel;
            }
          }

          // Spring chases the target with velocity damping.
          const fx = -STIFFNESS * (spring.x - targetX) - DAMPING * spring.vx;
          const fy = -STIFFNESS * (spring.y - targetY) - DAMPING * spring.vy;

          spring.vx += (fx / mass) * dt;
          spring.vy += (fy / mass) * dt;
          spring.x += spring.vx * dt;
          spring.y += spring.vy * dt;

          // Displacement drives a slight counter-rotation, so objects lean into
          // the direction they're travelling like real thrown things.
          const lean = gsap.utils.clamp(-9, 9, spring.x * 0.03);
          el.style.transform = `translate3d(${spring.x}px, ${spring.y}px, 0) rotate(${lean}deg)`;
        });
      };

      gsap.ticker.add(update);

      /* ---------------------------------------------------------------
       * 3D tilt at rest. Lives on an inner element so it never fights the
       * spring's translate on the outer one. Each object's face turns toward
       * the cursor, and the sign flips either side of it.
       * --------------------------------------------------------------- */
      const tiltTo = tilts.map((el) => ({
        rx: gsap.quickTo(el, "rotationX", { duration: 0.7, ease: "power2.out" }),
        ry: gsap.quickTo(el, "rotationY", { duration: 0.7, ease: "power2.out" }),
      }));

      const onTilt = (event: PointerEvent) => {
        const rect = section.getBoundingClientRect();
        const px = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const py = ((event.clientY - rect.top) / rect.height) * 2 - 1;
        tilts.forEach((_, i) => {
          const { mass } = OBJECTS[i];
          // Lighter objects swing further, which reads as them being closer.
          const amount = TILT / mass;
          tiltTo[i].ry(px * amount);
          tiltTo[i].rx(-py * amount);
        });
      };
      window.addEventListener("pointermove", onTilt, { passive: true });

      // Idle float so nothing is ever perfectly static. Lighter objects bob
      // further, and a paired rotation keeps it from reading as a flat slide.
      // Started after the entrance spin, since both animate `rotation`.
      const startFloat = () => {
        tilts.forEach((el, i) => {
          const { mass } = OBJECTS[i];
          gsap.to(el, {
            y: (i % 2 === 0 ? -22 : -17) / mass,
            rotation: i % 2 === 0 ? 1.8 : -1.4,
            duration: 2.3 + (i % 3) * 0.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: i * 0.28,
          });
        });
      };

      /* ---------------------------------------------------------------
       * Entry: release the springs from off-screen, and type the copy.
       * --------------------------------------------------------------- */
      if (headline && sub) {
        // Pin the rendered height before emptying, so clearing the text doesn't
        // collapse the block and shift the section's layout.
        [headline, sub].forEach((el) => {
          el.style.minHeight = `${el.offsetHeight}px`;
        });
        gsap.set([headline, sub], { autoAlpha: 0, text: "" });
      }

      ScrollTrigger.create({
        trigger: section,
        scroller,
        // Fires before the section fills the viewport so the objects are
        // already arriving as it settles into place.
        start: "top 75%",
        once: true,
        onEnter: () => {
          live = true;

          // Skyline slides up first, so the setting is established before the
          // props start arriving in front of it.
          if (skyline) {
            gsap.to(skyline, {
              yPercent: 0,
              duration: 1.7,
              ease: "power3.out",
            });
          }

          /* Objects arrive one at a time. Each spring is parked off-screen and
           * only released — and only made visible — when its turn comes, so the
           * eye follows a single object in instead of six at once. */
          OBJECTS.forEach((object, i) => {
            springs[i].x = object.from.x;
            springs[i].y = object.from.y;
            springs[i].vx = 0;
            springs[i].vy = 0;
            // Held off-target so nothing drifts home before it's released.
            springs[i].held = true;
          });

          OBJECTS.forEach((object, i) => {
            gsap.delayedCall(i * ARRIVAL_GAP, () => {
              springs[i].held = false;
              gsap.set(items[i], { autoAlpha: 1 });
              gsap.fromTo(
                tilts[i],
                { rotation: object.spin },
                {
                  rotation: 0,
                  duration: 1.9,
                  ease: "elastic.out(1, 0.55)",
                  // Float starts once the last object has finished settling.
                  onComplete: i === OBJECTS.length - 1 ? startFloat : undefined,
                },
              );
            });
          });

          if (!headline || !sub) return;
          gsap
            .timeline()
            .set([headline, sub], { autoAlpha: 1 })
            .set(headline, { className: `${styles.summaryHeadline} ${styles.typing}` })
            .to(headline, { text: { value: HEADLINE, delimiter: " " }, duration: 1.9, ease: "none" })
            .set(headline, { className: styles.summaryHeadline })
            .set(sub, { className: `${styles.summarySub} ${styles.typing}` })
            .to(
              sub,
              { text: { value: SUBHEAD, delimiter: " " }, duration: 1.2, ease: "none" },
              "+=0.15",
            )
            .set(sub, { className: styles.summarySub });
        },
      });

      return () => {
        gsap.ticker.remove(update);
        observer.disconnect();
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointermove", onTilt);
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} id="summary" className={`${styles.summary} ${styles.snap}`}>
      <div aria-hidden className={styles.summaryGrid} />

      <RainClouds />

      {/* Sprite-sheet birds. Each flock drifts on its own CSS loop, so they run
          independently of this section's scroll-triggered entrance. */}
      <div aria-hidden className={styles.birdsLayer}>
        {BIRD_FLOCKS.map((flock) => (
          <div key={flock} className={`${styles.birdContainer} ${styles[flock]}`}>
            <div className={`${styles.bird} ${styles.birdA}`} />
            <div className={`${styles.bird} ${styles.birdB}`} />
            <div className={`${styles.bird} ${styles.birdC}`} />
          </div>
        ))}
      </div>

      {/* Skyline anchors the bottom of the section. Deliberately outside
          OBJECTS: it's the setting rather than another prop, so it gets a slow
          cinematic push-in instead of the pointer-reactive spring and tilt. */}
      <div aria-hidden className={styles.skylineLayer}>
        <Image
          src="/portfolio-august/summary/marina-bay-sands.webp"
          alt=""
          width={1874}
          height={1049}
          className={styles.skyline}
          sizes="100vw"
          priority={false}
        />
      </div>

      {/* Disabled: the grey unrefracted droplets read as smudges over this
          section's light background. Kept for reference in case we revisit it.
          Rain on the glass, over the backdrop but under the props so the water
          runs behind the objects. captureContent is off: refracting the scene
          means re-parenting it into the capture canvas, which knocks the
          absolutely-positioned props out of the composition.
          Density is below the 0.5 default — at that level the second drop layer
          runs at full strength and reads as a downpour against the Matter.js
          rain already falling in this section.
      <Droplets
        className={styles.dropletsGlass}
        style={{ position: "absolute", inset: 0 }}
        captureContent={false}
        intensity={0.3}
        staticDrops={0.1}
      />
      */}

      {OBJECTS.map((object) => (
        <div
          key={object.key}
          className={styles.summaryObject}
          style={{
            left: object.left,
            top: object.top,
            width: object.size,
            height: object.size,
          }}
        >
          <div className={styles.summaryTilt}>
            <Image
              src={object.src}
              alt={object.alt}
              width={object.size}
              height={object.size}
              className={styles.summaryImage}
              style={object.rotate ? { rotate: `${object.rotate}deg` } : undefined}
              sizes="(max-width: 768px) 45vw, 30vw"
            />
          </div>

          {/* Outside .summaryTilt on purpose: that element carries the 3D hover
              rotation, and a child of it inherits the tilt — the bubble came out
              visibly skewed. Sitting here it stays upright. The tip variant pulls
              it inward for props that hang off an edge. */}
          <span className={`${styles.propTip} ${TIP_CLASS[object.tip]}`} aria-hidden>
            What do you think this means?
          </span>
        </div>
      ))}

      {/* Copy is server-rendered in full so it's present for crawlers and with
          JS off; the typewriter clears and retypes it on entry. */}
      <div className={styles.summaryCopy}>
        <p className={styles.summaryHeadline}>{HEADLINE}</p>
        <p className={styles.summarySub}>{SUBHEAD}</p>
      </div>
    </section>
  );
}
