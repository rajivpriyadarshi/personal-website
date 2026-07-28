"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./portfolio-august.module.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const QUOTE =
  "You are by far the #1 designer I have ever worked with. All the PMs I know always want to work only with you. Also you are the most fun friend to hang out with. All the dance parties all the outings have been lovely because your were there.";

/* Placeholder content — the real testimonials land later. Tint and the note's
 * resting angle come from the design's alternating rhythm. */
const NOTES = [
  { tint: "#e2c7ff", angle: -1.5 },
  { tint: "#b0e0e5", angle: 1.6 },
  { tint: "#c4edba", angle: 3.9 },
  { tint: "#ffd1db", angle: -1.2 },
  { tint: "#ffe9b8", angle: 2.4 },
  { tint: "#cfe0ff", angle: -2.8 },
].map((note, i) => ({
  ...note,
  id: i,
  quote: QUOTE,
  name: "Bhavik Kaul",
  role: "CPO, SuperMoney by Flipkart",
}));

/* The stationery spread. Each piece flies out from a tight cluster at the
 * bottom centre to its resting spot, so the group appears to bloom outward. */
const PROPS = [
  { src: "/portfolio-august/words/stationery.webp", w: 460, left: "26%", bottom: "-16%", rotate: 4, delay: 0 },
  { src: "/portfolio-august/words/paperball.webp", w: 190, left: "14%", bottom: "-4%", rotate: -12, delay: 0.08 },
  { src: "/portfolio-august/words/knife.webp", w: 170, left: "52%", bottom: "2%", rotate: 28, delay: 0.16 },
  { src: "/portfolio-august/words/paperball.webp", w: 150, left: "70%", bottom: "-8%", rotate: 18, delay: 0.24 },
  { src: "/portfolio-august/words/knife.webp", w: 140, left: "4%", bottom: "-12%", rotate: -34, delay: 0.32 },
];

const NOTE_STEP = 372 + 24;
// Max degrees a note swings about its pin on hover.
const SWING = 4.5;

export function WordsSection() {
  const root = useRef<HTMLElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const syncArrows = useCallback(() => {
    const el = rail.current;
    if (!el) return;
    setAtStart(el.scrollLeft < 8);
    setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 8);
  }, []);

  const nudge = (direction: 1 | -1) => {
    rail.current?.scrollBy({ left: direction * NOTE_STEP, behavior: "smooth" });
  };

  useGSAP(
    () => {
      const section = root.current;
      if (!section) return;
      const scroller = section.closest("main");

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const cleanups: (() => void)[] = [];

      const intro = gsap.timeline({
        scrollTrigger: { trigger: section, scroller, start: "top 70%", once: true },
      });

      intro
        .from(`.${styles.wordsTitle}`, {
          y: 30,
          autoAlpha: 0,
          duration: 0.9,
          ease: "power3.out",
        })
        .from(
          `.${styles.note}`,
          { y: 40, autoAlpha: 0, duration: 0.8, stagger: 0.09, ease: "power2.out" },
          0.2,
        );

      /* Props bloom outward: they start tiny and stacked at the bottom centre,
       * then scale up and spread to their laid-out positions. */
      const props = gsap.utils.toArray<HTMLElement>(`.${styles.prop}`, section);
      props.forEach((prop, i) => {
        const rect = prop.getBoundingClientRect();
        const sectionRect = section.getBoundingClientRect();
        // Vector from the prop's resting centre back to the bottom-centre origin.
        const dx = sectionRect.width / 2 - (rect.left - sectionRect.left + rect.width / 2);
        const dy = sectionRect.height - (rect.top - sectionRect.top + rect.height / 2);

        intro.fromTo(
          prop,
          { x: dx, y: dy, scale: 0.08, autoAlpha: 0, rotate: 0 },
          {
            x: 0,
            y: 0,
            scale: 1,
            autoAlpha: 1,
            rotate: PROPS[i].rotate,
            duration: 1.5,
            ease: "power2.out",
          },
          0.45 + PROPS[i].delay,
        );
      });

      /* Pin-anchored swing. Rotation origin sits on the pin, so a note pivots
       * from where it's tacked rather than spinning about its middle. */
      const notes = gsap.utils.toArray<HTMLElement>(`.${styles.note}`, section);
      notes.forEach((note, i) => {
        const paper = note.querySelector<HTMLElement>(`.${styles.notePaper}`);
        if (!paper) return;

        const swing = gsap.quickTo(paper, "rotation", { duration: 0.5, ease: "power2.out" });
        const lift = gsap.quickTo(paper, "y", { duration: 0.5, ease: "power2.out" });

        const onMove = (event: PointerEvent) => {
          const rect = note.getBoundingClientRect();
          // Horizontal offset from the pin drives the swing direction, like a
          // real note nudged sideways on its tack.
          const px = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          swing(NOTES[i].angle + px * SWING);
          lift(-6);
        };
        const onLeave = () => {
          swing(NOTES[i].angle);
          lift(0);
        };

        note.addEventListener("pointermove", onMove);
        note.addEventListener("pointerleave", onLeave);
        cleanups.push(() => {
          note.removeEventListener("pointermove", onMove);
          note.removeEventListener("pointerleave", onLeave);
        });
      });

      return () => cleanups.forEach((fn) => fn());
    },
    { scope: root },
  );

  return (
    <section ref={root} id="contact" className={`${styles.words} ${styles.snap}`}>
      <div aria-hidden className={styles.wordsGrid} />

      <h2 className={styles.wordsTitle}>
        Some good words from the folks I&rsquo;ve worked with
      </h2>

      <div className={styles.noteRailWrap}>
        <div ref={rail} className={styles.noteRail} onScroll={syncArrows}>
          {NOTES.map((note) => (
            <div key={note.id} className={styles.note}>
              <div
                className={styles.notePaper}
                style={{ background: note.tint, rotate: `${note.angle}deg` }}
              >
                <span aria-hidden className={styles.noteQuoteMark}>
                  &rdquo;
                </span>
                <p className={styles.noteQuote}>{note.quote}</p>
                <footer className={styles.noteFooter}>
                  <span aria-hidden className={styles.noteAvatar} />
                  <span className={styles.noteWho}>
                    <span className={styles.noteName}>{note.name}</span>
                    <span className={styles.noteRole}>{note.role}</span>
                  </span>
                </footer>
              </div>

              {/* Pin sits above the paper and is the pivot the note swings on. */}
              <Image
                src="/portfolio-august/words/pin.webp"
                alt=""
                width={56}
                height={56}
                className={styles.notePin}
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          className={`${styles.arrow} ${styles.arrowLeft}`}
          onClick={() => nudge(-1)}
          disabled={atStart}
          aria-label="Previous testimonial"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          type="button"
          className={`${styles.arrow} ${styles.arrowRight}`}
          onClick={() => nudge(1)}
          disabled={atEnd}
          aria-label="Next testimonial"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div aria-hidden className={styles.propLayer}>
        {PROPS.map((prop, i) => (
          <Image
            key={i}
            src={prop.src}
            alt=""
            width={prop.w}
            height={prop.w}
            className={styles.prop}
            style={{ width: prop.w, left: prop.left, bottom: prop.bottom }}
          />
        ))}
      </div>
    </section>
  );
}
