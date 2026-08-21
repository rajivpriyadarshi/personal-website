"use client";

import Image from "next/image";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PropPile, type PropPileHandle, type PropSetName } from "./PropPile";
import { CubeWall, type CubeWallHandle } from "./CubeWall";
import styles from "./portfolio-august.module.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const TITLE = "Some good words from the folks I’ve worked with";

/* Tint and the resting angle come from the design's alternating rhythm. */
const NOTES = [
  {
    tint: "#e2c7ff",
    angle: -1.5,
    quote:
      "You are by far the #1 designer I have ever worked with. All the PMs I know always want to work only with you. Also you are the most fun friend to hang out with. All the dance parties all the outings have been lovely because your were there.",
    name: "Bhavik Kaul",
    role: "CPO, SuperMoney by Flipkart",
    linkedin: "https://www.linkedin.com/in/kaulbhavik/",
    avatar: "/portfolio-august/words/bhavik-kaul.jpeg",
  },
  {
    tint: "#b0e0e5",
    angle: 1.6,
    quote:
      "You are one of the biggest contributor to our progress so far. I will miss working with you. :)",
    name: "Ankush Singla",
    role: "Co-founder, Coding Ninjas",
    linkedin: "https://www.linkedin.com/in/ankushsingla/",
    avatar: "/portfolio-august/words/ankush-singla.jpeg",
  },
  {
    tint: "#c4edba",
    angle: 3.9,
    quote:
      "You have been very instrumental in what company is today. I wish I could hug you and say good bye and good luck. I am confident you would do great in your next challenge. Keep rocking ;)",
    name: "Uttam Digga",
    role: "Co-founder and CEO, Porter",
    linkedin: "https://www.linkedin.com/in/uttamdigga/",
    avatar: "/portfolio-august/words/uttam-digga.jpeg",
  },
  {
    tint: "#ffd1db",
    angle: -1.2,
    quote:
      "Your contribution has been phenomenal. Thanks for being always available and always solving more than asked.",
    name: "Shruti Anand",
    role: "Director of Technical Program Management, PayU",
    linkedin: "https://www.linkedin.com/in/anandshruti/",
    avatar: "/portfolio-august/words/shruti-anand.jpeg",
  },
  {
    tint: "#ffe9b8",
    angle: 2.4,
    quote:
      "Whenever Porter goes from here, it will always be indebted to the pivotal role you played in helping it grow.",
    name: "Ambuj Singh",
    role: "VP Engineering, Porter",
    linkedin: "https://www.linkedin.com/in/ambuj-singh-100b1663/",
    avatar: "/portfolio-august/words/ambuj-singh.jpeg",
  },
  {
    tint: "#cfe0ff",
    angle: -2.8,
    quote:
      "Rajiv has an eye for great design, and is one of the best designers I’ve worked with.",
    name: "Rahul Sharma",
    role: "Senior Director of Product, Smallcase",
    linkedin: "https://www.linkedin.com/in/rahulsharma1729/",
    avatar: "/portfolio-august/words/rahul-sharma.jpeg",
  },
].map((note, i) => ({ ...note, id: i }));

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
/* `disc` is the circle behind the logo, sampled from the design so each brand
 * sits on its own tint rather than a shared grey. `logoScale` trims wordmarks
 * that would otherwise crowd the circle compared with the square marks. */
const WORK: {
  name: string;
  blurb: string;
  props: PropSetName;
  logo: string;
  disc: string;
  logoScale?: number;
  /** Case study link. Cards without one are not clickable. */
  href?: string;
  /** Flags the card as pending, so it reads as deliberate rather than broken. */
  comingSoon?: boolean;
}[] = [
  {
    name: "LazyPay",
    blurb: "India’s credit superapp",
    props: "shopping",
    logo: "/portfolio-august/work/logos/lazypay.webp",
    disc: "#fbdae2",
    logoScale: 0.56,
    href: "https://www.figma.com/proto/i0tcuT99LJyD9I1wIIdd6q/Personal-portfolio-website?node-id=648-60461&viewport=-1777%2C606%2C0.27&t=fDNF48kuHvAN6s56-1&scaling=scale-down-width&content-scaling=fixed&starting-point-node-id=648%3A60461&page-id=625%3A51083",
  },
  {
    name: "Zinc Money",
    blurb: "Money beyond borders",
    props: "coins",
    href: "https://www.figma.com/proto/i0tcuT99LJyD9I1wIIdd6q/Personal-portfolio-website?node-id=649-6298&viewport=541%2C215%2C0.17&t=gpOIj2U94a3rl8va-1&scaling=scale-down-width&content-scaling=fixed&starting-point-node-id=649%3A6298&page-id=625%3A51083",
    // White variant: the stock mark is black and would vanish on the dark disc.
    logo: "/portfolio-august/journey/logos/zinc-mark-white.svg",
    disc: "#121412",
    logoScale: 0.34,
  },
  {
    name: "Porter",
    blurb: "India’s leading player in intra-city logistics market",
    props: "trucks",
    logo: "/portfolio-august/work/logos/porter.webp",
    disc: "#e5edff",
    // Wordmark, so it needs more width than the square marks to read.
    logoScale: 0.66,
    comingSoon: true,
  },
  {
    name: "Coding Ninjas",
    blurb: "One of India’s largest edu-tech platform",
    props: "study",
    logo: "/portfolio-august/journey/logos/codingninjas.webp",
    /* Its source art is a solid dark tile with no alpha, so instead of floating
     * it on a tint it fills the disc — the circular mask turns it into a dark
     * disc like Zinc's. Tint matches the art so any AA seam is invisible. */
    disc: "#414141",
    logoScale: 1,
    comingSoon: true,
  },
];

const WORK_STEP = 402 + 32;

export function WordsSection() {
  const root = useRef<HTMLElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const cubes = useRef<CubeWallHandle>(null);
  const props = useRef<PropPileHandle>(null);
  const workRail = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [workAtStart, setWorkAtStart] = useState(true);
  const [workAtEnd, setWorkAtEnd] = useState(false);

  const syncArrows = useCallback(() => {
    const el = rail.current;
    if (!el) return;
    setAtStart(el.scrollLeft < 8);
    setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 8);
  }, []);

  const syncWorkArrows = useCallback(() => {
    const el = workRail.current;
    if (!el) return;
    setWorkAtStart(el.scrollLeft < 8);
    // Also covers the case where all cards fit and there's nothing to scroll.
    setWorkAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(syncWorkArrows, [syncWorkArrows]);

  /* Touch equivalent of the desktop hover: the card snapped to the middle of
   * the rail owns the prop heap. Hover can't do this job here — there's no
   * cursor, and `pointerenter` fires on whichever card happens to be under the
   * finger mid-swipe rather than on the one that ends up centred. */
  const focusedProps = useRef<PropSetName | null>(null);
  const syncWorkFocus = useCallback(() => {
    const el = workRail.current;
    if (!el || window.matchMedia("(hover: hover)").matches) return;

    const middle = el.scrollLeft + el.clientWidth / 2;
    let nearest: PropSetName | null = null;
    let best = Infinity;
    for (const card of el.children) {
      if (!(card instanceof HTMLElement) || !card.dataset.props) continue;
      const distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - middle);
      if (distance < best) {
        best = distance;
        nearest = card.dataset.props as PropSetName;
      }
    }

    // Guarded: onScroll fires per frame and setSet restages the whole pile.
    if (!nearest || nearest === focusedProps.current) return;
    focusedProps.current = nearest;
    props.current?.setSet(nearest);
  }, []);

  // Seeds the heap for the first card, which is centred before any scroll.
  useEffect(syncWorkFocus, [syncWorkFocus]);

  const nudge = (direction: 1 | -1) => {
    rail.current?.scrollBy({ left: direction * NOTE_STEP, behavior: "smooth" });
  };

  const nudgeWork = (direction: 1 | -1) => {
    workRail.current?.scrollBy({
      left: direction * WORK_STEP,
      behavior: "smooth",
    });
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

      /* Fires as soon as the section's top edge enters the viewport, which for a
       * snap arrival is the instant the snap begins. Anchoring it later (70% of
       * the viewport) left the entrance only the snap's ~300ms of travel to play
       * a 3.2s sequence, so all six notes appeared at once.
       *
       * No `end`/`onLeave`: the board parks at exit progress 0 after snapping,
       * so the entrance gets its full duration in real time. It's settled by the
       * exit instead, once scrolling actually starts moving things. */
      const intro = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          scroller,
          start: "top bottom",
          once: true,
          /* Refresh order isn't guaranteed, so on a load or jump that lands
           * mid-exit this trigger can fire *after* the exit has already run.
           * Left alone the entrance would animate the notes back to full opacity
           * on top of the revealed work section, so if the exit is already
           * underway the entrance is skipped outright. */
          onEnter: () => {
            if (exit.progress() > 0) settleIntro();
          },
        },
      });

      /* Jumps the entrance to its finished state exactly once. Idempotent, since
       * it's called from the exit's onUpdate on every scroll frame.
       *
       * progress(1) leaves the notes in their resting pose — visible and
       * untransformed — which is only correct at the very start of the exit. Any
       * further along, the exit has to re-render to reassert where the notes
       * actually belong, and a scrubbed timeline won't do that on its own
       * without a scroll event. */
      let introSettled = false;
      const settleIntro = () => {
        if (introSettled) return;
        introSettled = true;
        intro.progress(1).kill();
        const at = exit.progress();
        if (at > 0) exit.progress(0).progress(at);
      };

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

        // Pointer parallax is a hover affordance; on touch there's no cursor to
        // follow and a drag would just shove the figurines sideways.
        if (window.matchMedia("(hover: hover)").matches) {
          window.addEventListener("pointermove", onDrift, { passive: true });
          cleanups.push(() => window.removeEventListener("pointermove", onDrift));
        }
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
       * from where it's tacked rather than spinning about its middle.
       * Hover-only: on touch, dragging the rail fires pointermove on whichever
       * note is under the finger, and pointerleave never comes to unswing it. */
      const swingNotes = window.matchMedia("(hover: hover)").matches ? notes : [];
      swingNotes.forEach((note, i) => {
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
            /* Settles the entrance the moment the exit starts doing anything.
             * Both write note x/y, autoAlpha and pin transforms, and two
             * timelines stamping the same properties every frame was most of
             * what read as shake. Guarded on progress so simply arriving at the
             * board (progress 0) leaves the entrance free to play out. */
            if (self.progress > 0) settleIntro();
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

      /* Note arrows go with the first note; they'd be stranded controls. Scoped
       * to the rail wrap — a bare `.arrow` selector also caught the work
       * carousel's arrows, which live in the section being revealed and were
       * left hidden by this tween's autoAlpha. */
      exit.to(
        `.${styles.noteRailWrap} .${styles.arrow}`,
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

          <div className={styles.workRailWrap}>
            <div
              ref={workRail}
              className={styles.workRow}
              onScroll={() => {
                syncWorkArrows();
                syncWorkFocus();
              }}
            >
              {WORK.map((project) => {
                const body = (
                  <>
                    <div
                      aria-hidden
                      className={styles.workCardDisc}
                      style={{ background: project.disc }}
                    >
                      <Image
                        src={project.logo}
                        alt=""
                        width={232}
                        height={232}
                        sizes="240px"
                        className={styles.workCardLogo}
                        style={
                          project.logoScale
                            ? { width: `${project.logoScale * 100}%` }
                            : undefined
                        }
                      />
                    </div>
                    <h3 className={styles.workCardTitle}>{project.name}</h3>
                    <p className={styles.workCardSub}>{project.blurb}</p>
                    {project.comingSoon ? (
                      <span className={styles.workCardBadge}>Coming soon</span>
                    ) : null}
                  </>
                );

                /* The heap holds whatever was last hovered — no pointerleave
                   handler, so it doesn't snap back when the cursor moves off. */
                const swapProps = () => props.current?.setSet(project.props);

                /* Cards with a case study are the anchor itself, so the whole
                   pill is the hit target. An <a href> is natively focusable, so
                   it doesn't need the tabIndex the plain card carries. */
                return project.href ? (
                  <a
                    key={project.name}
                    className={`${styles.workCard} ${styles.workCardLink}`}
                    data-props={project.props}
                    href={project.href}
                    target="_blank"
                    rel="noreferrer"
                    onPointerEnter={swapProps}
                    onFocus={swapProps}
                  >
                    {body}
                  </a>
                ) : (
                  <article
                    key={project.name}
                    className={styles.workCard}
                    data-props={project.props}
                    onPointerEnter={swapProps}
                    onFocus={swapProps}
                    tabIndex={0}
                  >
                    {body}
                  </article>
                );
              })}
            </div>

            <button
              type="button"
              className={`${styles.arrow} ${styles.workArrow} ${styles.arrowLeft}`}
              onClick={() => nudgeWork(-1)}
              disabled={workAtStart}
              aria-label="Previous project"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              className={`${styles.arrow} ${styles.workArrow} ${styles.arrowRight}`}
              onClick={() => nudgeWork(1)}
              disabled={workAtEnd}
              aria-label="Next project"
            >
              <ChevronRight size={20} />
            </button>
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
                      <Image
                        src={note.avatar}
                        alt=""
                        width={124}
                        height={124}
                        sizes="62px"
                        className={styles.noteAvatar}
                      />
                      <span className={styles.noteWho}>
                        {note.linkedin ? (
                          <a
                            className={`${styles.noteName} ${styles.noteNameLink}`}
                            href={note.linkedin}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {note.name}
                            <Image
                              src="/portfolio-august/linkedin-icon.svg"
                              alt=""
                              width={16}
                              height={16}
                              className={styles.noteLinkedin}
                            />
                          </a>
                        ) : (
                          <span className={styles.noteName}>{note.name}</span>
                        )}
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
          {/* Figurines hidden for now. The layer stays mounted because the
              entrance and exit timelines both target .figurines; removing it
              would leave those tweens with an empty target.
            unoptimized: the optimizer re-encodes this as JPEG, which has no
            alpha channel, turning the cutout into an opaque white box. The
            source WebP is already sized and compressed. */}
          <div aria-hidden className={styles.figurineLayer} style={{ display: "none" }}>
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
