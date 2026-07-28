"use client";

import { Fragment, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GradientCanvas, DEFAULT_PARAMS } from "../experiments/hero-gradient/GradientCanvas";
import { PhotoStack } from "./PhotoStack";
import { TagPhysics } from "./TagPhysics";
import styles from "./portfolio-august.module.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const HEADLINE =
  "I’m a dreamer, big-picture thinker, I tell stories, and I love solving complex problems.";

// Palette 0 ("Ocean") light gives the sky-blue → terracotta wash the hero is built around.
const HERO_PALETTE = 0;
const HERO_GRADIENT = { ...DEFAULT_PARAMS, rotation: -0.55, spread: 1.7, scale: 0.9 };

const BIRD_FLOCKS = [
  "birdOne",
  "birdTwo",
  "birdThree",
  "birdFour",
  "birdFive",
  "birdSix",
] as const;

const NAV = [
  { label: "About me", icon: "/portfolio-august/nav-user.svg", href: "#hero" },
  { label: "Work", icon: "/portfolio-august/nav-briefcase.svg", href: "#work" },
  { label: "Contact", icon: "/portfolio-august/nav-contact.svg", href: "#contact" },
];

export function PortfolioAugustClient() {
  const hero = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const words = gsap.utils.toArray<HTMLElement>(`.${styles.word}`, hero.current);

      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

      intro
        .from(`.${styles.nav}, .${styles.travelLink}`, {
          y: -24,
          autoAlpha: 0,
          duration: 0.7,
          stagger: 0.08,
        })
        .from(
          `.${styles.stack}`,
          { y: 28, autoAlpha: 0, scale: 0.92, duration: 0.8 },
          0.15,
        )
        .from(`.${styles.greeting}`, { y: 16, autoAlpha: 0, duration: 0.6 }, 0.3)
        .from(words, { y: 30, autoAlpha: 0, duration: 0.75, stagger: 0.035 }, 0.4)
        .from(`.${styles.blurb}`, { y: 16, autoAlpha: 0, duration: 0.6 }, 0.75)
        // Birds fly on their own CSS loops; just fade the layer up.
        .from(`.${styles.birdsLayer}`, { autoAlpha: 0, duration: 1.4 }, 0.5);
    },
    { scope: hero },
  );

  return (
    <main className={styles.page}>
      <section ref={hero} id="hero" className={`${styles.hero} ${styles.snap}`}>
        <GradientCanvas
          theme="light"
          params={HERO_GRADIENT}
          initialPalette={HERO_PALETTE}
          cycle={false}
        />

        <div aria-hidden className={styles.birdsLayer}>
          {BIRD_FLOCKS.map((flock) => (
            <div key={flock} className={`${styles.birdContainer} ${styles[flock]}`}>
              {/* Several birds per flock, each offset so they read as a group. */}
              <div className={`${styles.bird} ${styles.birdA}`} />
              <div className={`${styles.bird} ${styles.birdB}`} />
              <div className={`${styles.bird} ${styles.birdC}`} />
            </div>
          ))}
        </div>

        <nav className={styles.nav}>
          {NAV.map((item, i) => (
            <a
              key={item.label}
              href={item.href}
              className={`${styles.navItem} ${i === 0 ? styles.navItemActive : ""}`}
            >
              <Image src={item.icon} alt="" width={16} height={16} className={styles.navIcon} />
              <span className={styles.navLabel}>{item.label}</span>
            </a>
          ))}
        </nav>

        <a
          className={styles.travelLink}
          href="https://www.instagram.com/"
          target="_blank"
          rel="noreferrer"
        >
          <Image
            src="/portfolio-august/travel-thumb.png"
            alt=""
            width={24}
            height={24}
            className={styles.travelThumb}
          />
          Check my travel stories
        </a>

        <div className={styles.heroInner}>
          <PhotoStack />

          <p className={styles.greeting}>Hello, I&rsquo;m Rajiv Priyadarshi</p>

          <h1 className={styles.headline}>
            {HEADLINE.split(" ").map((word, i) => (
              <Fragment key={`${word}-${i}`}>
                {i > 0 ? " " : null}
                <span className={styles.word}>{word}</span>
              </Fragment>
            ))}
          </h1>

          <p className={styles.blurb}>
            I started out chasing space science, earned a degree in Computer Science, and
            unexpectedly discovered product design. Every step since has been about learning
            relentlessly and pushing myself to build products that make a real difference.
          </p>
        </div>

        <TagPhysics />
      </section>

      <section id="summary" className={`${styles.placeholder} ${styles.summary} ${styles.snap}`}>
        Summary — next up
      </section>

      <section id="work" className={`${styles.placeholder} ${styles.journey} ${styles.snap}`}>
        Journey so far
      </section>

      <section id="contact" className={`${styles.placeholder} ${styles.words} ${styles.snap}`}>
        Good words
      </section>
    </main>
  );
}
