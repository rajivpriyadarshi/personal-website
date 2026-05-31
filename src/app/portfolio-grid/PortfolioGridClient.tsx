"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./portfolio-grid.module.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const cards = Array.from({ length: 24 }, (_, index) => index);
const nextSectionCopy =
  "A versatile product design generalist based in Singapore, with 10 years of building digital products across fintech, logistics, edtech, hospitality, and SaaS.";
const nextSectionWords = nextSectionCopy.split(" ");
const deepSectionCopy =
  "I thrive in complex, ambiguous spaces where the problem isn't clearly defined and the stakes are high.";
const deepSectionWords = deepSectionCopy.split(" ");
const STAR_PATH =
  "M54 2L59.4 48.6L106 54L59.4 59.4L54 106L48.6 59.4L2 54L48.6 48.6L54 2Z";
const DEEP_STAR_PATH =
  "M54 0L68 40L108 54L68 68L54 108L40 68L0 54L40 40L54 0Z";

function getHighlightKey(word: string, index: number) {
  const normalized = word.replace(/[^a-z0-9]/gi, "").toLowerCase();

  if (normalized === "singapore") {
    return "singapore";
  }

  if (
    normalized === "10" ||
    (normalized === "years" &&
      nextSectionWords[index - 1]?.replace(/[^a-z0-9]/gi, "").toLowerCase() ===
        "10")
  ) {
    return "ten-years";
  }

  return null;
}

function getCardOffset(element: Element, index: number, scene: HTMLElement) {
  const cardBounds = element.getBoundingClientRect();
  const sceneBounds = scene.getBoundingClientRect();
  const centerX = sceneBounds.left + sceneBounds.width / 2;
  const centerY = sceneBounds.top + sceneBounds.height / 2;
  const cardCenterX = cardBounds.left + cardBounds.width / 2;
  const cardCenterY = cardBounds.top + cardBounds.height / 2;
  const horizontal = (cardCenterX - centerX) * 1.35;
  const vertical = (cardCenterY - centerY) * 1.7;
  const direction = index % 2 === 0 ? 1 : -1;

  return {
    x: horizontal,
    y: vertical,
    scale: 0.28,
    rotate: direction * (8 + (index % 6) * 2),
    opacity: 0.3,
  };
}

function getCardExplosion(element: Element, index: number, scene: HTMLElement) {
  const { x, y } = getCardOffset(element, index, scene);
  const strength = 1.65 + (index % 5) * 0.14;
  const direction = index % 2 === 0 ? 1 : -1;

  return {
    x: x * strength,
    y: y * (strength * 1.08),
    scale: 0.78,
    rotate: direction * (18 + (index % 4) * 5),
    opacity: 0.08,
  };
}

function PortfolioStar() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 108 108"
      className={styles.nextStar}
      data-portfolio-next-star-shape
      shapeRendering="geometricPrecision"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        data-portfolio-next-star-path
        d={STAR_PATH}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill="transparent"
      />
    </svg>
  );
}

function PortfolioStarOutline() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 108 108"
      className={`${styles.deepStar} ${styles.deepStarOutline}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={DEEP_STAR_PATH}
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function PortfolioGridClient() {
  const scope = useRef<HTMLElement>(null);
  const scene = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = scope.current;
      const sceneElement = scene.current;

      if (!root || !sceneElement) {
        return;
      }

      const cardNodes = gsap.utils.toArray<HTMLElement>(
        "[data-portfolio-card]",
        root
      );
      const label = root.querySelector<HTMLElement>("[data-portfolio-label]");
      const title = root.querySelector<HTMLElement>("[data-portfolio-title]");
      const glow = root.querySelector<HTMLElement>("[data-portfolio-glow]");
      const nextSection = root.querySelector<HTMLElement>("[data-portfolio-next]");
      const nextCopy = root.querySelector<HTMLElement>("[data-portfolio-next-copy]");
      const nextStar = root.querySelector<HTMLElement>("[data-portfolio-next-star]");
      const nextStarShape = root.querySelector<SVGSVGElement>(
        "[data-portfolio-next-star-shape]"
      );
      const nextStarPath = root.querySelector<SVGPathElement>(
        "[data-portfolio-next-star-path]"
      );
      const nextWords = gsap.utils.toArray<HTMLElement>(
        "[data-portfolio-next-word]",
        root
      );
      const nextHighlights = gsap.utils.toArray<HTMLElement>(
        "[data-portfolio-next-highlight]",
        root
      );
      const deepSection = root.querySelector<HTMLElement>("[data-portfolio-deep]");
      const deepOutlineStar = root.querySelector<HTMLElement>(
        "[data-portfolio-deep-outline]"
      );
      const deepWords = gsap.utils.toArray<HTMLElement>(
        "[data-portfolio-deep-word]",
        root
      );

      if (
        !label ||
        !title ||
        !glow ||
        !nextSection ||
        !nextCopy ||
        !nextStar ||
        !nextStarShape ||
        !nextStarPath ||
        !deepSection ||
        !deepOutlineStar
      ) {
        return;
      }

      const timeline = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "+=4300",
          scrub: 1.1,
          pin: sceneElement,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });

      gsap.set(nextWords, {
        opacity: 0.12,
        filter: "blur(7px)",
        yPercent: 10,
      });

      gsap.set(nextHighlights, {
        backgroundSize: "0% 100%",
      });

      gsap.set(deepWords, {
        opacity: 0.12,
        filter: "blur(7px)",
        yPercent: 10,
      });

      gsap.set(nextStarPath, {
        fill: "transparent",
        stroke: "#111111",
        strokeWidth: 1.8,
      });

      gsap.set(nextStar, {
        y: 0,
        rotate: 0,
      });

      timeline.fromTo(
        cardNodes,
        {
          x: (index, element) => getCardOffset(element, index, sceneElement).x,
          y: (index, element) => getCardOffset(element, index, sceneElement).y,
          scale: (index, element) =>
            getCardOffset(element, index, sceneElement).scale,
          rotate: (index, element) =>
            getCardOffset(element, index, sceneElement).rotate,
          opacity: (index, element) =>
            getCardOffset(element, index, sceneElement).opacity,
          filter: "blur(14px)",
        },
        {
          x: 0,
          y: 0,
          scale: 1,
          rotate: 0,
          opacity: 1,
          filter: "blur(0px)",
          stagger: {
            each: 0.035,
            from: "center",
            grid: "auto",
          },
          duration: 1,
        },
        0
      );

      timeline.fromTo(
        label,
        {
          yPercent: 80,
          opacity: 0,
          scale: 0.92,
          filter: "blur(10px)",
        },
        {
          yPercent: 0,
          opacity: 1,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.65,
        },
        0.18
      );

      timeline.fromTo(
        title,
        {
          yPercent: 45,
          opacity: 0,
          scale: 0.8,
          filter: "blur(16px)",
        },
        {
          yPercent: 0,
          opacity: 1,
          scale: 1,
          filter: "blur(0px)",
          duration: 1,
        },
        0.12
      );

      timeline.fromTo(
        glow,
        { scale: 0.7, opacity: 0.15 },
        { scale: 1.1, opacity: 0.4, duration: 1 },
        0
      );

      timeline.to(
        [label, title],
        {
          yPercent: -35,
          opacity: 0,
          scale: 0.92,
          filter: "blur(18px)",
          stagger: 0.06,
          duration: 0.75,
        },
        1.15
      );

      timeline.to(
        glow,
        {
          scale: 1.35,
          opacity: 0.12,
          filter: "blur(72px)",
          duration: 0.9,
        },
        1.1
      );

      timeline.fromTo(
        cardNodes,
        {
          x: 0,
          y: 0,
          scale: 1,
          rotate: 0,
          opacity: 1,
          filter: "blur(0px)",
        },
        {
          x: (index, element) =>
            getCardExplosion(element, index, sceneElement).x,
          y: (index, element) =>
            getCardExplosion(element, index, sceneElement).y,
          scale: (index, element) =>
            getCardExplosion(element, index, sceneElement).scale,
          rotate: (index, element) =>
            getCardExplosion(element, index, sceneElement).rotate,
          opacity: (index, element) =>
            getCardExplosion(element, index, sceneElement).opacity,
          filter: "blur(14px)",
          stagger: {
            each: 0.03,
            from: "center",
            grid: "auto",
          },
          duration: 1.15,
        },
        1.46
      );

      timeline.fromTo(
        nextSection,
        {
          opacity: 0,
          scale: 0.985,
        },
        {
          opacity: 1,
          scale: 1,
          duration: 0.3,
        },
        1.52
      );

      timeline.fromTo(
        nextStar,
        {
          rotate: -24,
          scale: 0.72,
          opacity: 0,
          yPercent: 20,
        },
        {
          rotate: 140,
          scale: 1,
          opacity: 1,
          yPercent: 0,
          duration: 2.25,
          ease: "none",
        },
        1.55
      );

      timeline.to(
        nextWords,
        {
          opacity: 1,
          filter: "blur(0px)",
          yPercent: 0,
          stagger: {
            each: 0.07,
            from: "start",
          },
          duration: 0.28,
        },
        1.62
      );

      timeline.to(
        nextHighlights,
        {
          backgroundSize: "100% 100%",
          stagger: 0.14,
          duration: 0.34,
          ease: "power2.out",
        },
        3.95
      );

      timeline.to(
        nextCopy,
        {
          opacity: 0,
          yPercent: -8,
          filter: "blur(10px)",
          duration: 0.55,
        },
        4.45
      );

      timeline.to(
        nextStar,
        {
          y: () => sceneElement.clientHeight * 0.18,
          rotate: 180,
          opacity: 1,
          duration: 1.2,
          ease: "power2.inOut",
        },
        4.5
      );

      timeline.to(
        nextStarShape,
        {
          width: () =>
            `${Math.max(sceneElement.clientWidth, sceneElement.clientHeight) * 1.42}px`,
          height: () =>
            `${Math.max(sceneElement.clientWidth, sceneElement.clientHeight) * 1.42}px`,
          duration: 1.2,
          ease: "power2.inOut",
        },
        4.5
      );

      timeline.to(
        nextStarPath,
        {
          attr: { d: DEEP_STAR_PATH },
          fill: "#050505",
          stroke: "#050505",
          strokeWidth: 0.2,
          duration: 0.62,
          ease: "power2.out",
        },
        5.02
      );

      timeline.to(
        nextStar,
        {
          rotate: 194,
          duration: 2.2,
          ease: "none",
        },
        5.7
      );

      timeline.fromTo(
        deepSection,
        {
          opacity: 0,
        },
        {
          opacity: 1,
          duration: 0.35,
        },
        5.88
      );

      timeline.fromTo(
        deepOutlineStar,
        {
          scale: 0.2,
          rotate: -28,
          opacity: 0,
        },
        {
          scale: 1,
          rotate: -188,
          opacity: 1,
          duration: 1.55,
          ease: "none",
        },
        5.96
      );

      timeline.to(
        deepOutlineStar,
        {
          rotate: -320,
          duration: 1.75,
          ease: "none",
        },
        6.7
      );

      timeline.to(
        deepWords,
        {
          opacity: 1,
          filter: "blur(0px)",
          yPercent: 0,
          stagger: {
            each: 0.07,
            from: "start",
          },
          duration: 0.28,
        },
        6.34
      );
    },
    { scope }
  );

  return (
    <section
      ref={scope}
      className="relative min-h-[500vh] overflow-x-clip bg-[#f5f7fb] text-black"
    >
      <div ref={scene} className="relative h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.92),_rgba(245,247,251,0.7)_38%,_rgba(227,237,249,0.92)_100%)]" />

        <div
          data-portfolio-glow
          className="absolute left-1/2 top-1/2 h-[42vmin] w-[42vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#dcecff] blur-3xl"
        />

        <Link
          href="/"
          className="absolute left-5 top-5 z-30 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm font-medium text-black backdrop-blur"
        >
          Back
        </Link>

        <div className="relative z-10 flex h-full items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <div className="relative mx-auto grid w-full max-w-[1180px] grid-cols-2 gap-4 md:grid-cols-4 md:gap-5 lg:gap-6">
            {cards.map((card) => (
              <div
                key={card}
                data-portfolio-card
                className="aspect-[236/129] rounded-[22px] border border-[#d3e5f8] bg-[#dff0ff] shadow-[0_20px_50px_rgba(148,178,209,0.16)] md:rounded-[30px]"
              />
            ))}

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="flex max-w-[min(90vw,900px)] flex-col items-center text-center">
                <p
                  data-portfolio-label
                  className={styles.label}
                >
                  hey there
                </p>
                <h1
                  data-portfolio-title
                  className={styles.title}
                >
                  this is rajiv
                </h1>
              </div>

              <div
                data-portfolio-next
                className="absolute inset-0 flex items-center justify-center px-5 opacity-0 sm:px-8"
              >
                <div className={styles.nextStack}>
                  <div data-portfolio-next-star className={styles.nextStarWrap}>
                    <PortfolioStar />
                  </div>
                  <p data-portfolio-next-copy className={styles.nextCopy}>
                    {nextSectionWords.map((word, index) => {
                      const highlightKey = getHighlightKey(word, index);

                      return (
                        <span
                          key={`${word}-${index}`}
                          data-portfolio-next-word
                          data-portfolio-next-highlight={
                            highlightKey ? highlightKey : undefined
                          }
                          className={`${styles.nextWord} ${
                            highlightKey ? styles.nextWordHighlight : ""
                          }`}
                        >
                          {word}&nbsp;
                        </span>
                      );
                    })}
                  </p>
                </div>
              </div>

              <div
                data-portfolio-deep
                className="absolute inset-0 flex items-center justify-center opacity-0"
              >
                <div className={styles.deepStage}>
                  <div
                    data-portfolio-deep-outline
                    className={styles.deepOutlineWrap}
                  >
                    <PortfolioStarOutline />
                  </div>
                  <p className={styles.deepCopy}>
                    {deepSectionWords.map((word, index) => (
                      <span
                        key={`${word}-${index}`}
                        data-portfolio-deep-word
                        className={styles.deepWord}
                      >
                        {word}&nbsp;
                      </span>
                    ))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
