"use client";

import { Fragment, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AgentEntryCard } from "@/components/agent/AgentEntryCard";
import { AgentPanel } from "@/components/agent/AgentPanel";
import { AgentProvider } from "@/components/agent/AgentContext";
import { FractalGlass } from "./FractalGlass";
import { JourneySection } from "./JourneySection";
import { MobileNotice } from "./MobileNotice";
import { PhotoStack } from "./PhotoStack";
import { SummarySection } from "./SummarySection";
import { TagPhysics } from "./TagPhysics";
import { WordsSection } from "./WordsSection";
import styles from "./portfolio-august.module.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const HEADLINE =
  "I’m a dreamer, big-picture thinker, I tell stories, and I love solving complex problems.";

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
        .from(`.${styles.blurb}`, { y: 16, autoAlpha: 0, duration: 0.6 }, 0.75)
        /* Last in, and a touch later than the gap between the other pairs: the
           card is an invitation, and it should arrive after the introduction has
           landed rather than alongside it. */
        .from(`.${styles.agentCta}`, { y: 14, autoAlpha: 0, duration: 0.6 }, 1);
    },
    { scope: hero },
  );

  return (
    <AgentProvider>
      <main className={styles.page}>
      <section ref={hero} id="hero" className={`${styles.hero} ${styles.snap}`}>
        {/* Fluted-glass gradient. The wrapper keeps the full-bleed positioning
            and the canvas fills it. */}
        <div aria-hidden className={styles.heroGradient}>
          <FractalGlass />
        </div>

        {/* Darkens the gradient's bright core so the white copy over it holds
            contrast. Separate from .heroGradient so the canvas stays untinted
            and the scrim can be tuned in CSS alone. */}
        <div aria-hidden className={styles.heroScrim} />

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
          {/* wa.me opens the app on mobile and WhatsApp Web on desktop. */}
          <a
            className={`${styles.travelLink} ${styles.iconOnlyLink}`}
            href="https://wa.me/918852078989"
            target="_blank"
            rel="noreferrer"
            aria-label="Chat on WhatsApp"
          >
            <Image
              src="/portfolio-august/whatsapp-icon.svg"
              alt=""
              width={24}
              height={24}
              className={styles.travelThumb}
            />
          </a>

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

          {/* Icon only now, so the wrapper still hosts the hover grid preview
              while the pill itself carries no label. */}
          <div className={styles.travelPeekHost}>
            <a
              className={`${styles.travelLink} ${styles.iconOnlyLink}`}
              href="https://www.instagram.com/rajivpriyadarshi"
              target="_blank"
              rel="noreferrer"
              aria-label="Travel stories on Instagram"
            >
              <Image
                src="/portfolio-august/travel-thumb.png"
                alt=""
                width={24}
                height={24}
                className={styles.travelThumb}
              />
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

          {/* Launcher for the assistant. Sits under the intro copy because that's
              the moment a visitor has just met him and starts having questions. */}
          <div className={styles.agentCta}>
            <AgentEntryCard />
          </div>
        </div>

        <TagPhysics />
      </section>

      <SummarySection />

      <JourneySection />

      <WordsSection />
      </main>

      {/* Both outside <main> because that's the scroll container — a fixed
          element inside it would still be clipped by its overflow. */}
      <MobileNotice />
      <AgentPanel />
    </AgentProvider>
  );
}
