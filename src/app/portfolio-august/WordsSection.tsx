"use client";

import Image from "next/image";
import { Fragment, useCallback, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PropPile, type PropPileHandle, type PropSetName } from "./PropPile";
import { CubeWall, type CubeWallHandle } from "./CubeWall";
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

/* Fraction of the exit given to the notes leaving; the next slice is the cube
 * reveal, and the tail is held clear so the uncovered work section can be read
 * before the section releases. */
const NOTES_SHARE = 0.5;
const CUBES_END = 0.88;
/* Coins start raining while the cubes are still clearing, so the heap is
 * already building as the work section is uncovered rather than starting from
 * empty once everything has settled. */
const COINS_START = 0.62;
/* Progress at which the rail's clip is released so notes can fall out of it.
 * Held off until the first note is genuinely on its way down: while clipped the
 * rail is a real scroll container and its arrows work, and releasing early
 * killed them for the whole readable stretch of the board. */
const RAIL_RELEASE = 0.06;

// Each card owns the prop set that heaps up while it's hovered.
const WORK: { name: string; blurb: string; props: PropSetName }[] = [
  { name: "Zinc Money", blurb: "Money beyond borders", props: "coins" },
  {
    name: "LazyPay",
    blurb: "India’s new age digital credit provider",
    props: "shopping",
  },
  {
    name: "Porter",
    blurb: "India’s leading player in intra-city logistics market",
    props: "trucks",
  },
];

export function WordsSection() {
  const root = useRef<HTMLElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const cubes = useRef<CubeWallHandle>(null);
  const props = useRef<PropPileHandle>(null);
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
        // Notes and figurines are hidden in CSS until the entrance runs.
        gsap.set([`.${styles.note}`, `.${styles.figurines}`], { autoAlpha: 1 });
        return;
      }

      const cleanups: (() => void)[] = [];

      /* Unclipping the rail so notes can fall out of it resets scrollLeft to 0,
       * which would snap the carousel back to the first note. Translating the
       * rail by the old offset reproduces the scroll visually, so the release is
       * invisible. Reversible, since scrolling back up restores both. */
      let parkedScroll = 0;
      const releaseRailClip = () => {
        const el = rail.current;
        if (!el || el.classList.contains(styles.noteRailReleased)) return;
        parkedScroll = el.scrollLeft;
        el.classList.add(styles.noteRailReleased);
        gsap.set(el, { x: -parkedScroll });
      };
      const restoreRailClip = () => {
        const el = rail.current;
        if (!el || !el.classList.contains(styles.noteRailReleased)) return;
        el.classList.remove(styles.noteRailReleased);
        gsap.set(el, { x: 0 });
        el.scrollLeft = parkedScroll;
      };
      cleanups.push(restoreRailClip);

      /* Notes and arrows stop catching the pointer once they've left, handing
       * hover to the work cards behind them. */
      const stage = section.querySelector<HTMLElement>(`.${styles.wordsStage}`);
      const setStageInert = (inert: boolean) => {
        stage?.classList.toggle(styles.wordsStageInert, inert);
      };
      cleanups.push(() => setStageInert(false));

      const notes = gsap.utils.toArray<HTMLElement>(`.${styles.note}`, section);
      const papers = gsap.utils.toArray<HTMLElement>(
        `.${styles.notePaper}`,
        section,
      );
      const pins = gsap.utils.toArray<HTMLElement>(
        `.${styles.notePin}`,
        section,
      );

      /* The entrance writes the same properties the exit scrubs (note x/y,
       * autoAlpha, pin transforms). Scrolling in fast used to leave both
       * running at once, each stamping those values every frame — most of what
       * read as shake. This trigger's own onLeave settles the entrance as the
       * board reaches the top, which is where the exit takes over, so only one
       * timeline ever owns those properties.
       *
       * It has to happen here rather than in the exit's onEnter: callbacks run
       * after that tick's tweens have rendered, so finishing the entrance there
       * would stamp the resting pose back over the exit's first frame — and a
       * completed tween won't re-render to correct it. */
      const intro = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          scroller,
          start: "top 70%",
          end: "top top",
          onLeave: () => intro.progress(1).kill(),
        },
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

      // Figurines rise from below the fold as the section arrives.
      intro.fromTo(
        `.${styles.figurines}`,
        { yPercent: 42, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 1.4, ease: "power3.out" },
        0.3,
      );

      /* Parallax on pointer, not scroll. The page snap-scrolls a whole
       * viewport at a time, so a scrubbed ScrollTrigger has no intermediate
       * positions to interpolate — it just jumps between two values. Tracking
       * the cursor gives the depth cue somewhere continuous to come from.
       * Lives on the wrapper because the entrance owns the image's yPercent. */
      const layer = section.querySelector<HTMLElement>(
        `.${styles.figurineLayer}`,
      );
      if (layer) {
        const driftX = gsap.quickTo(layer, "x", {
          duration: 1.1,
          ease: "power2.out",
        });
        const driftY = gsap.quickTo(layer, "y", {
          duration: 1.1,
          ease: "power2.out",
        });

        const onDrift = (event: PointerEvent) => {
          const rect = section.getBoundingClientRect();
          const px = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          const py = ((event.clientY - rect.top) / rect.height) * 2 - 1;
          driftX(-px * 26);
          driftY(-py * 10);
        };

        window.addEventListener("pointermove", onDrift, { passive: true });
        cleanups.push(() => window.removeEventListener("pointermove", onDrift));
      }

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

        const swing = gsap.quickTo(paper, "rotation", {
          duration: 0.5,
          ease: "power2.out",
        });
        const lift = gsap.quickTo(paper, "y", {
          duration: 0.5,
          ease: "power2.out",
        });

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

      /* ---------------------------------------------------------------
       * Exit sequence. The viewport is held by CSS `position: sticky` and this
       * timeline is driven by scroll position rather than time, so scrolling
       * back up plays it in reverse. Notes leave one at a time — pin first,
       * then the note — and once they're clear the cube wall flies apart to
       * uncover the work section sitting behind it.
       * --------------------------------------------------------------- */
      const exit = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          scroller,
          /* Maps the timeline over the section's own scroll track (see the
           * 440svh height in CSS). No `pin` — sticky already holds the
           * viewport, and ScrollTrigger's pin would fall back to transform
           * positioning on this non-window scroller, which trails scroll by a
           * frame. */
          start: "top top",
          end: "bottom bottom",
          /* No numeric scrub: smoothing adds catch-up lag on every scroll stop,
           * which on a snap-scrolling page reads as the whole board wobbling. */
          scrub: true,
          /* Clip release is deferred until notes actually start leaving, not
           * fired on entry. Releasing it makes the rail overflow:visible, which
           * stops it being a scroll container — so releasing at the first pixel
           * of scroll left the carousel arrows dead for the entire time the
           * board was readable. */
          onLeaveBack: restoreRailClip,
          /* Coin shower is gated on progress rather than a call() on the
           * timeline: a pile settling under gravity runs on its own clock, and a
           * zero-duration callback can be skipped entirely when a scrub jumps
           * the playhead past it. setActive already ignores redundant calls. */
          onUpdate: (self) => {
            props.current?.setActive(self.progress >= COINS_START);
            const leaving = self.progress >= RAIL_RELEASE;
            if (leaving) releaseRailClip();
            else restoreRailClip();
            setStageInert(leaving);
          },
        },
      });

      /* Only the notes actually on screen get a stagger slot. The rail is a
       * carousel showing ~3.5 of 6 at a time, so staggering all six spent half
       * the notes phase animating notes parked off the right edge — the board
       * sat empty while the scroll kept consuming. Off-screen notes leave at the
       * very start, where their departure costs no scroll.
       *
       * Uses offsetLeft, not getBoundingClientRect: the entrance's fromTo has
       * already translated every note off-screen by the time this runs, so
       * measured positions would report all six as hidden. Layout offsets ignore
       * transforms and give the resting position we actually want. */
      const railEl = rail.current;
      const visibleFrom = railEl ? railEl.scrollLeft : 0;
      const visibleTo = visibleFrom + (railEl?.clientWidth ?? 0);
      const onScreen = notes.filter(
        (note) =>
          note.offsetLeft + note.offsetWidth > visibleFrom &&
          note.offsetLeft < visibleTo,
      );
      const slotOf = (note: HTMLElement) => onScreen.indexOf(note);
      const slice = NOTES_SHARE / Math.max(onScreen.length, 1);

      /* fromTo with explicit resting values, not to(). A plain `to` records its
       * start value on first render — which for a scrubbed trigger happens at
       * refresh, while the entrance may still have notes at autoAlpha 0. That
       * recorded 0 became both ends of the fade, so the first note fell without
       * ever disappearing. Stating the resting pose makes the exit independent
       * of when it's built. immediateRender: false keeps these from painting
       * over the entrance before the exit begins. */
      notes.forEach((note, i) => {
        const slot = slotOf(note);
        const at = slot < 0 ? 0 : slot * slice;

        exit
          // Pin pops out first, as though pulled from the wall.
          .fromTo(
            pins[i],
            { y: 0, scale: 1, autoAlpha: 1 },
            {
              y: -40,
              scale: 1.4,
              autoAlpha: 0,
              duration: slice * 0.4,
              ease: "power2.in",
              immediateRender: false,
            },
            at,
          )
          // Then the note falls away, released from its tack.
          .fromTo(
            note,
            { x: 0, y: 0, rotate: 0, autoAlpha: 1 },
            {
              y: 160,
              rotate: i % 2 === 0 ? -14 : 12,
              autoAlpha: 0,
              duration: slice * 0.75,
              ease: "power2.in",
              immediateRender: false,
            },
            at + slice * 0.32,
          );
      });

      // Carousel arrows go with the first note; they'd be stranded controls.
      exit.to(
        `.${styles.arrow}`,
        { autoAlpha: 0, duration: slice * 0.6, ease: "none" },
        0,
      );

      // Title and figurines drift off alongside the notes.
      exit.to(
        `.${styles.wordsTitle}`,
        { y: -70, autoAlpha: 0, duration: NOTES_SHARE * 0.7, ease: "none" },
        0.06,
      );
      exit.to(
        `.${styles.figurineLayer}`,
        { yPercent: 45, autoAlpha: 0, duration: NOTES_SHARE * 0.8, ease: "none" },
        0.1,
      );

      /* Paper wall lifts once the board is empty, handing the backdrop to the
       * cubes so their edges read as a grid of blocks rather than texture. */
      exit.to(
        `.${styles.wordsGrid}`,
        { autoAlpha: 0, duration: 0.12, ease: "none" },
        NOTES_SHARE * 0.86,
      );

      /* Cube reveal drives the ported wall through a proxy, so its per-cube
       * stagger stays a pure function of progress and reverses cleanly. Ends
       * before the timeline does, so the last stretch of the sticky range holds
       * the uncovered work section still and readable. */
      const wall = { progress: 0 };
      exit.to(
        wall,
        {
          progress: 1,
          duration: CUBES_END - NOTES_SHARE,
          ease: "none",
          onUpdate: () => cubes.current?.setProgress(wall.progress),
        },
        NOTES_SHARE,
      );

      /* Pads the timeline to a full duration of 1. Without this its length would
       * be whatever the last tween ends at (CUBES_END), and scrub stretches the
       * timeline across the whole range — so the cubes would finish exactly as
       * the section releases and the reveal would never be seen at rest. */
      exit.to({}, { duration: 1 - CUBES_END }, CUBES_END);

      return () => cleanups.forEach((fn) => fn());
    },
    { scope: root },
  );

  return (
    <section ref={root} id="contact" className={`${styles.words} ${styles.snap}`}>
      <div className={styles.wordsViewport}>
        {/* Revealed as the cube wall clears. Behind everything, so uncovering it
            needs no layout change — only the cubes moving. */}
        <div className={styles.selectedWork}>
          <h2 className={styles.selectedWorkTitle}>Some of my selected work</h2>

          <div className={styles.workRow}>
            {WORK.map((project) => (
              <article
                key={project.name}
                className={styles.workCard}
                /* The heap holds whatever was last hovered — no pointerleave
                   handler, so it doesn't snap back when the cursor moves off. */
                onPointerEnter={() => props.current?.setSet(project.props)}
                onFocus={() => props.current?.setSet(project.props)}
                tabIndex={0}
              >
                <h3 className={styles.workCardTitle}>{project.name}</h3>
                <p className={styles.workCardSub}>{project.blurb}</p>
                <div aria-hidden className={styles.workCardDisc} />
              </article>
            ))}
          </div>

          <PropPile handleRef={props} />
        </div>

        {/* Paper wall the notes hang on. Above the cubes so it hides them until
            the board empties; inside the stage it would travel with the notes. */}
        <div aria-hidden className={styles.wordsGrid} />

        <div className={styles.wordsStage}>
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

          {/* Figurine group along the bottom. Exported as a rendered PNG rather
            than the raw image fill, so Figma's dither effect is baked in. */}
          <div aria-hidden className={styles.figurineLayer}>
            {/* unoptimized: the optimizer re-encodes this as JPEG, which has no
              alpha channel, turning the cutout into an opaque white box. The
              source WebP is already sized and compressed. */}
            <Image
              src="/portfolio-august/words/figurines.webp"
              alt=""
              width={1900}
              height={784}
              unoptimized
              className={styles.figurines}
            />
          </div>
        </div>

        <CubeWall handleRef={cubes} />
      </div>
    </section>
  );
}
