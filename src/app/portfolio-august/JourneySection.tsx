"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ROLES } from "./journey-data";
import styles from "./portfolio-august.module.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// One card plus the flex gap, so an arrow click advances exactly one card.
const CARD_STEP = 473 + 31;
// Max degrees a card turns toward the cursor on hover.
const CARD_TILT = 7;
// Auto-drift speed in px/sec — slow enough to read as ambient, not as scrolling.
const DRIFT_SPEED = 16;
// How far off its own edge each car starts, in px.
const CAR_ENTRY = 620;
/* Resting angles from the design. Both source images point nose-right, so an
 * absolute aim angle is just atan2 of the vector to the cursor. */
const CAR_REST_ANGLE = [40.67, 147.15];
// Most a car may swing off its resting angle while tracking the pointer.
const CAR_AIM_LIMIT = 26;
// Magnetic creep toward the cursor, in px at full deflection.
const CAR_PULL = 22;

export function JourneySection() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const syncArrows = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setAtStart(el.scrollLeft < 8);
    setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 8);
  }, []);

  const nudge = (direction: 1 | -1) => {
    track.current?.scrollBy({ left: direction * CARD_STEP, behavior: "smooth" });
  };

  useGSAP(
    () => {
      const section = root.current;
      if (!section) return;
      const scroller = section.closest("main");

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        // Cars and track art are hidden in CSS until the entrance runs.
        gsap.set([`.${styles.car}`, `.${styles.trackArt}`], { autoAlpha: 1 });
        return;
      }

      const cleanups: (() => void)[] = [];

      /* Cars drive in from off-screen when the section arrives — the left car
       * from the left edge, the right car from the right, each with a slight
       * settle so they look like they braked rather than stopped dead. */
      const cars = gsap.utils.toArray<HTMLElement>(`.${styles.car}`, section);
      const intro = gsap.timeline({
        scrollTrigger: { trigger: section, scroller, start: "top 70%", once: true },
      });

      /* Each car drives in from its own side of the screen — left car off the
       * left edge, right car off the right. `x` in px (not xPercent) because
       * GSAP applies the translate in page space before the element's CSS
       * rotate, so a percentage of the car's own width wouldn't map to a
       * predictable screen direction. */
      cars.forEach((car, i) => {
        const fromLeft = i === 0;
        intro.fromTo(
          car,
          {
            x: fromLeft ? -CAR_ENTRY : CAR_ENTRY,
            y: -60,
            rotation: CAR_REST_ANGLE[i],
            autoAlpha: 0,
          },
          {
            x: 0,
            y: 0,
            rotation: CAR_REST_ANGLE[i],
            autoAlpha: 1,
            duration: 1.6,
            ease: "power3.out",
            // Aiming starts once the last car has parked, so the pointer
            // doesn't fight the entrance.
            onComplete:
              i === cars.length - 1
                ? () => {
                    measureCars();
                    window.addEventListener("pointermove", onCarAim, { passive: true });
                    cleanups.push(() =>
                      window.removeEventListener("pointermove", onCarAim),
                    );
                  }
                : undefined,
          },
          i * 0.2,
        );
      });

      intro.from(
        `.${styles.journeyHeading} > *`,
        { y: 26, autoAlpha: 0, duration: 0.9, stagger: 0.12, ease: "power3.out" },
        0.25,
      );

      /* Magnetic cars. Each one steers its nose toward the cursor and creeps a
       * little way after it, then eases back to its resting pose. The aim is
       * clamped so they stay recognisably parked in the design's composition
       * rather than spinning to follow the pointer all the way round. */
      const aim = cars.map((car) => ({
        rot: gsap.quickTo(car, "rotation", { duration: 0.7, ease: "power2.out" }),
        x: gsap.quickTo(car, "x", { duration: 0.9, ease: "power2.out" }),
        y: gsap.quickTo(car, "y", { duration: 0.9, ease: "power2.out" }),
      }));

      // Rest centres cached once — reading layout per frame would thrash.
      let carHomes = cars.map(() => ({ x: 0, y: 0 }));
      const measureCars = () => {
        const rect = section.getBoundingClientRect();
        carHomes = cars.map((car) => {
          const r = car.getBoundingClientRect();
          return {
            x: r.left - rect.left + r.width / 2,
            y: r.top - rect.top + r.height / 2,
          };
        });
      };

      const onCarAim = (event: PointerEvent) => {
        const rect = section.getBoundingClientRect();
        const px = event.clientX - rect.left;
        const py = event.clientY - rect.top;

        cars.forEach((_, i) => {
          const home = carHomes[i];
          const dx = px - home.x;
          const dy = py - home.y;
          const dist = Math.hypot(dx, dy) || 1;

          // Absolute heading to the cursor, then clamped to a small deviation
          // from the car's parked angle.
          const target = (Math.atan2(dy, dx) * 180) / Math.PI;
          const rest = CAR_REST_ANGLE[i];
          // Wrap into -180..180 so the shorter way round always wins.
          const delta = gsap.utils.clamp(
            -CAR_AIM_LIMIT,
            CAR_AIM_LIMIT,
            ((target - rest + 540) % 360) - 180,
          );
          aim[i].rot(rest + delta);

          // Creep toward the cursor, easing off with distance.
          const pull = Math.min(CAR_PULL, dist * 0.06);
          aim[i].x((dx / dist) * pull);
          aim[i].y((dy / dist) * pull);
        });
      };

      /* Track art slides up from below the bottom edge. fromTo, not from — the
       * CSS keeps these hidden until entry, so `from` would read opacity 0 as
       * the *end* state and leave them invisible. */
      intro.fromTo(
        `.${styles.trackArt}`,
        { yPercent: 70, autoAlpha: 0 },
        {
          yPercent: 0,
          autoAlpha: 1,
          duration: 1.3,
          stagger: 0.14,
          ease: "power3.out",
        },
        0.3,
      );

      // Cards rise in as the section lands, so the track isn't static on arrival.
      intro.from(
        `.${styles.journeyCard}`,
        { y: 48, autoAlpha: 0, duration: 0.8, stagger: 0.07, ease: "power2.out" },
        0.4,
      );

      /* Hover tilt. Each card turns toward the cursor in 3D, on top of its
       * static ±3° layout rotation — which lives on an inner element so the
       * two transforms don't overwrite each other. */
      const cards = gsap.utils.toArray<HTMLElement>(`.${styles.card}`, section);

      cards.forEach((card) => {
        const inner = card.querySelector<HTMLElement>(`.${styles.cardInner}`);
        if (!inner) return;

        const rx = gsap.quickTo(inner, "rotationX", { duration: 0.4, ease: "power2.out" });
        const ry = gsap.quickTo(inner, "rotationY", { duration: 0.4, ease: "power2.out" });

        const onMove = (event: PointerEvent) => {
          const rect = card.getBoundingClientRect();
          // -1..1 across the card, so the tilt follows which edge you're near.
          const px = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          const py = ((event.clientY - rect.top) / rect.height) * 2 - 1;
          ry(px * CARD_TILT);
          rx(-py * CARD_TILT);
        };

        const onLeave = () => {
          ry(0);
          rx(0);
        };

        card.addEventListener("pointermove", onMove);
        card.addEventListener("pointerleave", onLeave);
        cleanups.push(() => {
          card.removeEventListener("pointermove", onMove);
          card.removeEventListener("pointerleave", onLeave);
        });
      });

      /* ---------------------------------------------------------------
       * Slow auto-drift. The track creeps sideways once the section lands,
       * and each card's tilt eases as it crosses the viewport so the row
       * feels alive rather than rigid. Any user interaction stops it for
       * good — fighting the reader's own scrolling would be hostile.
       * --------------------------------------------------------------- */
      const el = track.current;
      if (!el) return () => cleanups.forEach((fn) => fn());

      let drifting = false;
      let carry = 0;

      /* Only real gestures stop the drift. `scroll` is deliberately not in this
       * list — the drift sets scrollLeft itself, so listening for it would make
       * the drift cancel itself on its first frame. */
      const stopDrift = () => {
        drifting = false;
      };
      ["pointerdown", "wheel", "touchstart", "keydown"].forEach((evt) => {
        el.addEventListener(evt, stopDrift, { passive: true });
        cleanups.push(() => el.removeEventListener(evt, stopDrift));
      });

      const drift = (_t: number, deltaMs: number) => {
        if (!drifting) return;
        const dt = Math.min(deltaMs, 32);
        // Sub-pixel movement per frame has to accumulate; scrollLeft is integral.
        carry += (DRIFT_SPEED * dt) / 1000;
        const step = Math.floor(carry);
        if (step >= 1) {
          carry -= step;
          el.scrollLeft += step;
          // Reaching the end just ends the drift; looping would jerk.
          if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 1) drifting = false;
        }

        /* No position-driven tilt here. It used to scale by each card's distance
         * from centre, but that ratio is unbounded once a card is off-screen —
         * cards deep in the row reached wild angles, and because gsap.set writes
         * an inline transform, the last drift frame's value stayed baked in after
         * the drift stopped. Cards now hold the static ±3° from their markup. */
      };

      gsap.ticker.add(drift);
      cleanups.push(() => gsap.ticker.remove(drift));

      ScrollTrigger.create({
        trigger: section,
        scroller,
        start: "top 60%",
        once: true,
        // Held until the intro has played out, so the drift doesn't fight it.
        onEnter: () => gsap.delayedCall(1.8, () => {
          drifting = true;
        }),
      });

      return () => cleanups.forEach((fn) => fn());
    },
    { scope: root },
  );

  return (
    <section ref={root} id="work" className={`${styles.journey} ${styles.snap}`}>
      <div aria-hidden className={styles.journeyGrid} />

      <Image
        src="/portfolio-august/journey/track-bottom.webp"
        alt=""
        width={1299}
        height={374}
        className={`${styles.trackArt} ${styles.trackArtBottom}`}
      />
      <Image
        src="/portfolio-august/journey/track-right.webp"
        alt=""
        width={517}
        height={680}
        className={`${styles.trackArt} ${styles.trackArtRight}`}
      />

      <Image
        src="/portfolio-august/journey/car-left.webp"
        alt=""
        width={350}
        height={139}
        className={`${styles.car} ${styles.carLeft}`}
      />
      <Image
        src="/portfolio-august/journey/car-right.webp"
        alt=""
        width={345}
        height={140}
        className={`${styles.car} ${styles.carRight}`}
      />

      <div className={styles.journeyHeading}>
        <h2 className={styles.journeyTitle}>10 years of journey so far</h2>
        <p className={styles.journeySub}>
          I&rsquo;ve worn many hats across fintech, logistics, ed-tech, hospitality, and
          SaaS &mdash; from 0&rarr;1 products to systems at scale
        </p>
      </div>

      <div className={styles.trackWrap}>
        <div ref={track} className={styles.track} onScroll={syncArrows}>
          {ROLES.map((role, i) => {
            // Odd cards hang below with the stem above; even cards sit above it.
            const below = i % 2 === 1;
            return (
              <div
                key={`${role.company}-${role.dates}`}
                className={`${styles.journeyCard} ${below ? styles.cardBelow : ""}`}
              >
                {!below && <DateStem dates={role.dates} />}

                <article
                  className={styles.card}
                  style={{ rotate: `${below ? -3 : 3}deg` }}
                >
                  <div className={styles.cardInner}>
                    <header className={styles.cardHead}>
                      <div className={styles.cardIdentity}>
                        <span
                          className={styles.cardLogo}
                          style={role.logoBg ? { background: role.logoBg } : undefined}
                        >
                          <Image src={role.logo} alt="" width={42} height={42} />
                        </span>
                        <span className={styles.cardTitles}>
                          <span className={styles.cardRole}>{role.title}</span>
                          <span className={styles.cardCompany}>{role.company}</span>
                        </span>
                      </div>
                      {role.badge && (
                        <span
                          className={`${styles.badge} ${
                            role.badge.tone === "freelance" ? styles.badgeFreelance : ""
                          }`}
                        >
                          {role.badge.label}
                        </span>
                      )}
                    </header>

                    <ul className={styles.cardBullets}>
                      {role.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                </article>

                {below && <DateStem dates={role.dates} flipped />}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          className={`${styles.arrow} ${styles.arrowLeft}`}
          onClick={() => nudge(-1)}
          disabled={atStart}
          aria-label="Previous role"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          type="button"
          className={`${styles.arrow} ${styles.arrowRight}`}
          onClick={() => nudge(1)}
          disabled={atEnd}
          aria-label="Next role"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
}

function DateStem({ dates, flipped }: { dates: string; flipped?: boolean }) {
  const [start, end] = dates.split("→");
  return (
    <div className={`${styles.stem} ${flipped ? styles.stemFlipped : ""}`}>
      <span className={styles.datePill}>
        <strong>{start.trim()}</strong> → {end.trim()}
      </span>
      <span aria-hidden className={styles.stemLine} />
    </div>
  );
}
