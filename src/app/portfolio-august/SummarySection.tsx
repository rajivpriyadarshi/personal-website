"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import { ArrowRight } from "lucide-react";
import { RainClouds } from "./RainClouds";
import { ROLES, type Role } from "./role-data";
import { RoleModal } from "./RoleModal";
// import { Droplets } from "@/components/canvasui/Droplets";
import styles from "./portfolio-august.module.css";

gsap.registerPlugin(ScrollTrigger, TextPlugin, useGSAP);

const HEADLINE =
  "I’m a versatile product design generalist based in Singapore, with 10 years of building digital products across fintech, logistics, edtech, hospitality, and SaaS";
const SUBHEAD =
  "I thrive in complex, ambiguous spaces where the problem isn’t clearly defined, and the stakes are high";

/* Second screen of this section: the props clear out and this takes their
 * place. Copy and cards come from the design. */
const ROLE_HEADLINE =
  "My role also has varied a lot — sometimes being heavily product-focused to sometimes when being visual-and-interaction-design-focused and at other times, development-focused.";
const ROLE_SUBHEAD =
  "With this diversity of work and teams, I’ve grown a lot both horizontally and vertically. I thrive in complex, ambiguous spaces where the problem isn’t clearly defined, and the stakes are high";

/* Card titles, blurbs, and the modal content behind each one all live in
 * role-data, so the copy is edited in one place. */

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

/* --- Handover to the role screen ---------------------------------
 * Fractions of the scrubbed track. The props and the first screen's copy leave
 * over the first slice, the role screen arrives over the second, and the tail
 * is padding so the cards sit still and readable before the section releases.
 * ----------------------------------------------------------------- */
const PROPS_EXIT_END = 0.42;
const ROLE_ARRIVAL_END = 0.82;
/* Progress past which the role screen owns the pointer. Just before its copy
 * has finished arriving, so the cards are clickable as soon as they look
 * settled rather than a scroll later. */
const ROLE_LIVE_AT = 0.6;

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
  /* The open card, or null. Holding the whole role rather than an index keeps
   * the modal a pure function of this one value. */
  const [openRole, setOpenRole] = useState<Role | null>(null);
  /* The card element the modal should grow out of. A ref rather than state
   * because the modal only reads it in its open effect — putting it in state
   * would render twice for one click and change nothing on screen. */
  const originCard = useRef<HTMLElement | null>(null);
  /* How hard it's raining, 1 to 0. The handover timeline tweens this and the
   * rain simulation reads it every frame — a plain box rather than state or a
   * class toggle, because the value has to be interpolable by the scrub. A ref
   * is already exactly the `{ current }` box the tween and the simulation want. */
  const rainDial = useRef(1);
  // Stable, so the modal's `close` listener effect doesn't re-subscribe.
  const closeRole = useCallback(() => setOpenRole(null), []);

  const openCard = useCallback(
    (event: React.MouseEvent<HTMLElement>, card: Role) => {
      originCard.current = event.currentTarget;
      setOpenRole(card);
    },
    [],
  );

  useGSAP(
    () => {
      const section = root.current;
      if (!section) return;

      /* Everything positional measures against the sticky viewport, not the
       * section. The section is now a 260svh scroll track whose top scrolls
       * away, so section-relative coordinates drift as you scroll — the cached
       * spring homes and the live pointer position would stop agreeing. The
       * viewport is the box the props actually live in and it stays put. */
      const stage = section.querySelector<HTMLElement>(`.${styles.summaryViewport}`);
      if (!stage) return;

      const items = gsap.utils.toArray<HTMLElement>(`.${styles.summaryObject}`, section);
      const tilts = gsap.utils.toArray<HTMLElement>(`.${styles.summaryTilt}`, section);
      /* The exit animates these rather than .summaryObject or .summaryTilt: the
       * spring ticker rewrites the outer element's whole transform string every
       * frame, and the float/tilt tweens own the middle one — a tween on either
       * would be overwritten within a frame. The image is the one free layer. */
      const artwork = gsap.utils.toArray<HTMLElement>(`.${styles.summaryImage}`, section);
      // The page scrolls inside <main>, not the window, so ScrollTrigger has to
      // be pointed at that element or it never sees the section enter.
      const scroller = section.closest("main");
      const headline = section.querySelector<HTMLElement>(`.${styles.summaryHeadline}`);
      const sub = section.querySelector<HTMLElement>(`.${styles.summarySub}`);

      const skyline = section.querySelector<HTMLElement>(
        `.${styles.skylineLayer}`,
      );

      const role = section.querySelector<HTMLElement>(`.${styles.role}`);
      const roleCopy = section.querySelector<HTMLElement>(`.${styles.roleCopy}`);
      const roleCards = gsap.utils.toArray<HTMLElement>(`.${styles.roleCard}`, section);
      const sceneFar = section.querySelector<HTMLElement>(`.${styles.roleSceneFar}`);
      const sceneNear = section.querySelector<HTMLElement>(`.${styles.roleSceneNear}`);
      const birds = section.querySelector<HTMLElement>(`.${styles.birdsLayer}`);

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
        const stageRect = stage.getBoundingClientRect();
        homes = items.map((el, i) => {
          const rect = el.getBoundingClientRect();
          return {
            x: rect.left - stageRect.left + rect.width / 2 - springs[i].x,
            y: rect.top - stageRect.top + rect.height / 2 - springs[i].y,
          };
        });
      };
      measure();

      const observer = new ResizeObserver(measure);
      observer.observe(stage);

      const pointer = { x: 0, y: 0, inside: false };

      const onPointerMove = (event: PointerEvent) => {
        const rect = stage.getBoundingClientRect();
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
        const rect = stage.getBoundingClientRect();
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

      /* ---------------------------------------------------------------
       * Handover. The section's sticky viewport is held by CSS while this
       * timeline is driven by scroll position, so scrolling back up plays it in
       * reverse: props fly back in, role cards drop away. Two phases share one
       * scrub — the props leaving, then the role screen arriving.
       * --------------------------------------------------------------- */
      const handover = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          scroller,
          /* Maps the timeline over this section's own scroll track (the 260svh
           * height in CSS). No `pin` — sticky already holds the viewport, and
           * ScrollTrigger's pin would fall back to transform positioning on
           * this non-window scroller and trail scroll by a frame. */
          start: "top top",
          end: "bottom bottom",
          // No numeric scrub: smoothing adds catch-up lag on every scroll stop,
          // which on a snap-scrolling page reads as the whole screen wobbling.
          scrub: true,
          onUpdate: (self) => {
            /* Freezing the ticker once the props are gone stops the springs and
             * the pointer maths running behind the role screen for the rest of
             * the section. Re-armed on the way back up. */
            live = self.progress < PROPS_EXIT_END;
            role?.classList.toggle(styles.roleLive, self.progress >= ROLE_LIVE_AT);
          },
        },
      });

      /* Props leave outward — each along the vector it flew in on, so the exit
       * reads as the entrance reversed rather than a generic sweep. Staggered in
       * the same order they arrived. */
      const exitSlice = PROPS_EXIT_END / OBJECTS.length;
      OBJECTS.forEach((object, i) => {
        /* fromTo with an explicit resting pose, not to(). A plain `to` records
         * its start value when the scrubbed timeline first renders — which is at
         * refresh, while the entrance may still have the prop at autoAlpha 0.
         * That recorded 0 would become both ends of the fade. */
        handover.fromTo(
          artwork[i],
          { x: 0, y: 0, scale: 1, rotate: 0, autoAlpha: 1 },
          {
            // Pushed a good way past where it came from, so nothing lingers at
            // the edge of frame while the cards are arriving.
            x: object.from.x * 1.5,
            y: object.from.y * 1.5,
            scale: 0.7,
            rotate: object.spin * 0.6,
            autoAlpha: 0,
            duration: exitSlice * 1.6,
            ease: "power2.in",
            immediateRender: false,
          },
          i * exitSlice * 0.7,
        );
      });

      // First screen's copy and setting go with the props.
      if (headline && sub) {
        handover.to(
          [headline, sub],
          {
            y: -60,
            autoAlpha: 0,
            duration: PROPS_EXIT_END * 0.7,
            ease: "none",
          },
          0.04,
        );
      }

      if (skyline) {
        handover.fromTo(
          skyline,
          { yPercent: 0, autoAlpha: 1 },
          {
            yPercent: 60,
            autoAlpha: 0,
            duration: PROPS_EXIT_END * 0.8,
            ease: "none",
            immediateRender: false,
          },
          PROPS_EXIT_END * 0.3,
        );
      }

      /* Role screen arrives once the stage is clear. The layer fades up first so
       * the copy isn't drawn over departing props, then the copy rises, then the
       * cards deal in one at a time. */
      if (role) {
        handover.fromTo(
          role,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: (ROLE_ARRIVAL_END - PROPS_EXIT_END) * 0.25,
            ease: "none",
            immediateRender: false,
          },
          PROPS_EXIT_END * 0.88,
        );
      }

      if (roleCopy) {
        /* Same reason as the scene layers below: .role fades up just before this
         * tween's slot, so without an up-front hide the copy is briefly drawn in
         * place and then jumps back down to start over. The cards get theirs from
         * CSS instead, since they're hidden on load anyway. */
        gsap.set(roleCopy, { y: 46, autoAlpha: 0, filter: "blur(10px)" });
        handover.fromTo(
          roleCopy,
          { y: 46, autoAlpha: 0, filter: "blur(10px)" },
          {
            y: 0,
            autoAlpha: 1,
            filter: "blur(0px)",
            duration: (ROLE_ARRIVAL_END - PROPS_EXIT_END) * 0.45,
            ease: "power2.out",
            immediateRender: false,
          },
          PROPS_EXIT_END * 0.92,
        );
      }

      /* The landscape rises from below the fold as the screen arrives. Both
       * layers cover the same time, but the far one travels a third of the
       * distance — same scrub, different displacement, which is the parallax.
       * It also starts a touch earlier, so the depth is established before the
       * foreground closes over it.
       *
       * yPercent rather than y: each layer is a different height, so a shared
       * pixel offset would sink the short one further out of frame than the
       * tall one. */
      const sceneFrom = PROPS_EXIT_END * 0.9;
      const sceneSpan = (ROLE_ARRIVAL_END - PROPS_EXIT_END) * 0.85;

      /* Parked below the fold up front, not just by the tweens' from-states.
       * With immediateRender off those write nothing until the scrub reaches
       * them, so the layers would sit at their natural CSS position — fully in
       * place — through the beat where .role fades up, then snap back down and
       * rise a second time. */
      if (sceneFar) gsap.set(sceneFar, { yPercent: 34, autoAlpha: 0 });
      if (sceneNear) gsap.set(sceneNear, { yPercent: 100, autoAlpha: 0 });

      if (sceneFar) {
        handover.fromTo(
          sceneFar,
          { yPercent: 34, autoAlpha: 0 },
          {
            yPercent: 0,
            autoAlpha: 0.85,
            duration: sceneSpan,
            ease: "power2.out",
            immediateRender: false,
          },
          sceneFrom,
        );
      }

      if (sceneNear) {
        handover.fromTo(
          sceneNear,
          { yPercent: 100, autoAlpha: 0 },
          {
            yPercent: 0,
            autoAlpha: 1,
            duration: sceneSpan,
            ease: "power2.out",
            immediateRender: false,
          },
          sceneFrom + sceneSpan * 0.14,
        );
      }

      /* The weather clears as the role screen arrives: the rain tapers off and
       * the clouds drain their water, then the birds come out over the cleared
       * sky. The dial is the rain simulation's own emission multiplier, so this
       * eases the rate to zero rather than cutting it — the drops already in the
       * air finish falling and the puddle recedes on its own clock.
       *
       * Ends before the cards land: the sky should already be clearing while
       * they deal in, not still raining behind them. */
      handover.fromTo(
        rainDial,
        { current: 1 },
        {
          current: 0,
          duration: (ROLE_ARRIVAL_END - PROPS_EXIT_END) * 0.85,
          ease: "power1.inOut",
          immediateRender: false,
        },
        PROPS_EXIT_END * 0.8,
      );

      if (birds) {
        /* Hidden up front, not just by the tween's from-state: with
         * immediateRender off the tween writes nothing until the scrub reaches
         * it, and by then .role has already faded up — so the flock would be
         * drawn at full opacity for the beat before its own fade starts. */
        gsap.set(birds, { autoAlpha: 0 });
        handover.fromTo(
          birds,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: (ROLE_ARRIVAL_END - PROPS_EXIT_END) * 0.5,
            ease: "power1.out",
            immediateRender: false,
          },
          // Once the rain is most of the way out, so the two don't overlap.
          PROPS_EXIT_END + (ROLE_ARRIVAL_END - PROPS_EXIT_END) * 0.3,
        );
      }

      /* Cards deal in from below with a little rotation, so the four read as
       * being laid down in sequence rather than a row fading up together. The
       * slice is sized so the last one lands exactly at ROLE_ARRIVAL_END. */
      const cardsFrom = PROPS_EXIT_END + (ROLE_ARRIVAL_END - PROPS_EXIT_END) * 0.32;
      const cardSpan = ROLE_ARRIVAL_END - cardsFrom;
      const cardStep = cardSpan / (roleCards.length + 1);

      roleCards.forEach((card, i) => {
        handover.fromTo(
          card,
          { y: 72, autoAlpha: 0, scale: 0.94, rotate: i % 2 === 0 ? -2.5 : 2.5 },
          {
            y: 0,
            autoAlpha: 1,
            scale: 1,
            rotate: 0,
            duration: cardStep * 2,
            ease: "power3.out",
            immediateRender: false,
          },
          cardsFrom + i * cardStep,
        );
      });

      /* Pads the timeline out to a full duration of 1. Without this its length
       * would be whatever the last tween ends at, and scrub stretches the
       * timeline across the whole track — so the cards would finish arriving
       * exactly as the section releases and never be seen at rest. */
      handover.to({}, { duration: 1 - ROLE_ARRIVAL_END }, ROLE_ARRIVAL_END);

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
      <div className={styles.summaryViewport}>
        <div aria-hidden className={styles.summaryGrid} />

        <RainClouds dial={rainDial} />

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
              Guess what this means?
            </span>
          </div>
        ))}

        {/* Copy is server-rendered in full so it's present for crawlers and with
            JS off; the typewriter clears and retypes it on entry. */}
        <div className={styles.summaryCopy}>
          <p className={styles.summaryHeadline}>{HEADLINE}</p>
          <p className={styles.summarySub}>{SUBHEAD}</p>
        </div>
      </div>

      {/* Second screen. A sticky sibling rather than a child of the viewport
          above, so it composites as its own layer and the reduced-motion
          fallback can drop it back into normal flow. */}
      <div className={styles.role}>
        {/* Two-layer landscape behind the cards. Both are anchored to the bottom
            and rise in on the scrub, the far one travelling less than the near
            one — that difference is the parallax. The far layer carries the
            design's 22px blur, which is what reads as depth. */}
        <div aria-hidden className={styles.roleScene}>
          <Image
            src="/portfolio-august/summary/summary-far.webp"
            alt=""
            width={1600}
            height={682}
            className={`${styles.roleSceneLayer} ${styles.roleSceneFar}`}
            sizes="100vw"
          />
          <Image
            src="/portfolio-august/summary/summary-near.webp"
            alt=""
            width={1024}
            height={296}
            className={`${styles.roleSceneLayer} ${styles.roleSceneNear}`}
            sizes="100vw"
          />
        </div>

        {/* Sprite-sheet birds, on the role screen rather than the props screen:
            the rain stops as this arrives, and the birds coming out are what
            reads as the weather clearing. Each flock drifts on its own CSS loop,
            so they're independent of the scrub — only the layer's fade is
            scrubbed. */}
        <div aria-hidden className={styles.birdsLayer}>
          {BIRD_FLOCKS.map((flock) => (
            <div key={flock} className={`${styles.birdContainer} ${styles[flock]}`}>
              <div className={`${styles.bird} ${styles.birdA}`} />
              <div className={`${styles.bird} ${styles.birdB}`} />
              <div className={`${styles.bird} ${styles.birdC}`} />
            </div>
          ))}
        </div>

        <div className={styles.roleCopy}>
          <p className={styles.roleHeadline}>{ROLE_HEADLINE}</p>
          <p className={styles.roleSub}>{ROLE_SUBHEAD}</p>
        </div>

        <div className={styles.roleCards}>
          {ROLES.map((card) => (
            /* The card is not the accessible control; the button inside it is,
               and it stays keyboard-reachable. This handler only widens the
               pointer target, and it has to live here rather than on the
               button: the card's hover lift moves the surface mid-click, and
               Chrome retargets a click whose press and release land on
               different elements to their common ancestor — this article. */
            <article
              key={card.key}
              className={styles.roleCard}
              onClick={(event) => openCard(event, card)}
            >
              <div className={styles.roleCardHead}>
                <h3 className={styles.roleCardTitle}>{card.title}</h3>
                <p className={styles.roleCardBody}>{card.blurb}</p>
              </div>

              {/* Still a real button so the card is reachable and activatable by
                  keyboard, and announced as one control rather than a block of
                  text next to it. Icon-only per the design, so the aria-label is
                  now the only accessible name — it isn't optional here. */}
              <button
                type="button"
                className={styles.roleCardCta}
                aria-label={`See examples of ${card.title}`}
              >
                <ArrowRight size={20} strokeWidth={1.5} aria-hidden />
              </button>
            </article>
          ))}
        </div>
      </div>

      <RoleModal role={openRole} origin={originCard} onClose={closeRole} />
    </section>
  );
}
