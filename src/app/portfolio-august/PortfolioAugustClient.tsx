"use client";

import { Fragment, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GradFlow } from "gradflow";
import { JourneySection } from "./JourneySection";
import { PhotoStack } from "./PhotoStack";
import { SummarySection } from "./SummarySection";
import { TagPhysics } from "./TagPhysics";
import { WordsSection } from "./WordsSection";
import styles from "./portfolio-august.module.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const HEADLINE =
  "I’m a dreamer, big-picture thinker, I tell stories, and I love solving complex problems.";

const HERO_GRADIENT = {
  color1: { r: 211, g: 113, b: 249 },
  color2: { r: 246, g: 255, b: 245 },
  color3: { r: 251, g: 138, b: 101 },
  speed: 0.6,
  scale: 1.2,
  type: "smoke" as const,
  noise: 0.18,
};

const NAV = [
  { label: "About me", icon: "/portfolio-august/nav-user.svg", href: "#hero" },
  { label: "Work", icon: "/portfolio-august/nav-briefcase.svg", href: "#contact" },
];

/* The Selected Work panel isn't a section of its own — it's uncovered partway
 * through the Words section's scrubbed exit, once the notes have left and the
 * cube wall has cleared. So "Work" can't just jump to a section top; it has to
 * land at the scroll offset where that reveal has finished. Matches CUBES_END
 * in WordsSection, with a little past it so the panel is fully clear. */
const WORK_REVEAL_PROGRESS = 0.92;

export function PortfolioAugustClient() {
  const hero = useRef<HTMLElement>(null);

  /* Scrolls to the point in the Words section's scrub where Selected Work has
   * been uncovered. The page scrolls inside <main>, not the window, so this
   * drives that element rather than using an anchor jump. */
  const scrollToWork = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const scroller = hero.current?.closest("main");
    const words = document.getElementById("contact");
    if (!scroller || !words) return;
    const range = words.offsetHeight - scroller.clientHeight;
    scroller.scrollTo({
      top: words.offsetTop + range * WORK_REVEAL_PROGRESS,
      behavior: "smooth",
    });
  };

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const words = gsap.utils.toArray<HTMLElement>(`.${styles.word}`, hero.current);

      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

      intro
        .from(`.${styles.nav}, .${styles.socialLinks}`, {
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
        .from(`.${styles.blurb}`, { y: 16, autoAlpha: 0, duration: 0.6 }, 0.75);
    },
    { scope: hero },
  );

  return (
    <>
      {/* Holding screen until the small-screen layout is built. CSS-only so it
          shows on the first paint — a JS width check would flash the unstyled
          desktop layout first. */}
      <div className={styles.mobileGate}>
        <p className={styles.mobileGateTitle}>Mobile version coming soon</p>
        <p className={styles.mobileGateBody}>
          This site is built for a bigger screen. Please open it on your laptop or desktop.
        </p>
      </div>

      <main className={styles.page}>
      <section ref={hero} id="hero" className={`${styles.hero} ${styles.snap}`}>
        {/* Wrapper carries the positioning the old canvas had inline, since
            GradFlow renders its own canvas and only fills its parent. */}
        <div aria-hidden className={styles.heroGradient}>
          <GradFlow config={HERO_GRADIENT} />
        </div>

        <p className={styles.wipNotice}>
          This website is a work in progress. Please ignore the issues :)
        </p>

        <nav className={styles.nav}>
          {NAV.map((item, i) => (
            <a
              key={item.label}
              href={item.href}
              className={`${styles.navItem} ${i === 0 ? styles.navItemActive : ""}`}
              onClick={item.href === "#contact" ? scrollToWork : undefined}
            >
              <Image src={item.icon} alt="" width={16} height={16} className={styles.navIcon} />
              <span className={styles.navLabel}>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className={styles.socialLinks}>
          {/* Wrapper so the peek panel can hang off the link without joining the
              row's flex layout. */}
          <div className={styles.travelPeekHost}>
            <a
              className={styles.travelLink}
              href="https://www.instagram.com/rajivpriyadarshi"
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

            {/* Grid preview on hover. Hosted on the wrapper rather than the
                anchor so it stays open while the cursor travels down onto it,
                and it's a link itself so the grid is clickable too. */}
            <a
              className={styles.travelPeek}
              href="https://www.instagram.com/rajivpriyadarshi"
              target="_blank"
              rel="noreferrer"
              tabIndex={-1}
              aria-hidden
            >
              <Image
                src="/portfolio-august/travel-grid.webp"
                alt=""
                width={700}
                height={1254}
                sizes="320px"
                className={styles.travelPeekImage}
              />
            </a>
          </div>

          {/* Icon only: the label would crowd the hero at this width, and the
              accessible name carries the meaning instead. */}
          <a
            className={`${styles.travelLink} ${styles.iconOnlyLink}`}
            href="https://www.linkedin.com/in/rajivpriyadarshi/"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn profile"
          >
            <Image
              src="/portfolio-august/linkedin-icon.svg"
              alt=""
              width={24}
              height={24}
              className={styles.travelThumb}
            />
          </a>
        </div>

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

      <SummarySection />

      <JourneySection />

      <WordsSection />
      </main>
    </>
  );
}
