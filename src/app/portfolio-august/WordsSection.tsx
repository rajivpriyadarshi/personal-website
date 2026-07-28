"use client";

import Image from "next/image";
import { Fragment, useCallback, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./portfolio-august.module.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const TITLE = "Some good words from the folks I’ve worked with";

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

const NOTE_STEP = 372 + 24;
// Max degrees a note swings about its pin on hover.
const SWING = 4.5;
// Seconds between each note arriving. Wide enough that the eye follows one
// note in at a time rather than seeing the first few land together.
const ARRIVAL_GAP = 0.42;

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

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        // The notes are hidden in CSS until the entrance runs, so reveal them.
        gsap.set(`.${styles.note}`, { autoAlpha: 1 });
        return;
      }

      const cleanups: (() => void)[] = [];

      const notes = gsap.utils.toArray<HTMLElement>(`.${styles.note}`, section);
      const papers = gsap.utils.toArray<HTMLElement>(`.${styles.notePaper}`, section);
      const pins = gsap.utils.toArray<HTMLElement>(`.${styles.notePin}`, section);

      const intro = gsap.timeline({
        scrollTrigger: { trigger: section, scroller, start: "top 70%", once: true },
      });

      // Title rises word by word, with a slight blur so it resolves into place.
      intro.from(`.${styles.titleWord}`, {
        y: 34,
        autoAlpha: 0,
        filter: "blur(8px)",
        duration: 0.85,
        stagger: 0.055,
        ease: "power3.out",
      });

      /* Cloud band parallax: the two layers shift at different rates as the
       * section scrolls through, so the band has depth. */
      gsap.to(`.${styles.cloudBandBack}`, {
        yPercent: -14,
        xPercent: 3,
        ease: "none",
        scrollTrigger: { trigger: section, scroller, start: "top bottom", end: "bottom top", scrub: true },
      });
      gsap.to(`.${styles.cloudBandFront}`, {
        yPercent: -26,
        xPercent: -4,
        ease: "none",
        scrollTrigger: { trigger: section, scroller, start: "top bottom", end: "bottom top", scrub: true },
      });

      /* Notes slide in from off the right edge, one at a time. Each one's pin
       * only drops once that note has reached its spot — so the sequence reads
       * as "place the note, then tack it down". */
      notes.forEach((note, i) => {
        const at = 0.25 + i * ARRIVAL_GAP;
        const slideIn = section.getBoundingClientRect().width;

        intro
          .fromTo(
            note,
            { x: slideIn, autoAlpha: 0 },
            { x: 0, autoAlpha: 1, duration: 0.85, ease: "power3.out" },
            at,
          )
          // Paper lands flat, then settles into its resting tilt.
          .fromTo(
            papers[i],
            { rotate: 0 },
            { rotate: NOTES[i].angle, duration: 0.5, ease: "power2.out" },
            at + 0.5,
          )
          // Pin punches down from above and overshoots slightly on impact.
          .fromTo(
            pins[i],
            { y: -46, scale: 1.5, autoAlpha: 0 },
            {
              y: 0,
              scale: 1,
              autoAlpha: 1,
              duration: 0.42,
              ease: "back.out(2.4)",
            },
            at + 0.62,
          );
      });

      /* Pin-anchored swing. Rotation origin sits on the pin, so a note pivots
       * from where it's tacked rather than spinning about its middle. */
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
        {TITLE.split(" ").map((word, i) => (
          <Fragment key={`${word}-${i}`}>
            {i > 0 ? " " : null}
            <span className={styles.titleWord}>{word}</span>
          </Fragment>
        ))}
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

      {/* Two copies at different scales and parallax rates, so the band reads
          as layered depth rather than one flat cutout. */}
      <Image
        src="/portfolio-august/words/cloud-band.svg"
        alt=""
        width={1685}
        height={540}
        aria-hidden
        className={`${styles.cloudBand} ${styles.cloudBandBack}`}
      />
      <Image
        src="/portfolio-august/words/cloud-band.svg"
        alt=""
        width={1685}
        height={540}
        aria-hidden
        className={`${styles.cloudBand} ${styles.cloudBandFront}`}
      />
    </section>
  );
}
