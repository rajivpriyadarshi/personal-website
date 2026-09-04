"use client";

/* The "not optimised for mobile yet" bar.
 *
 * The hero has its own notice, which is enough while a visitor is still at the
 * top — the hero is laid out for phones. Everything below it isn't yet, so this
 * appears once the hero has scrolled away and says so plainly rather than
 * letting someone conclude the layout is simply broken.
 *
 * Rendered outside <main>, like the agent panel, because <main> is the scroll
 * container: `position: fixed` inside an element with `overflow-y: auto` is
 * still clipped by it.
 *
 * Phone-only, and that's enforced in CSS rather than by measuring the viewport
 * here — a JS width check has to wait for hydration and would flash the bar onto
 * a desktop for a frame. */

import { useEffect, useRef, useState } from "react";
import styles from "./portfolio-august.module.css";

/* Dismissal lasts the tab, not forever. localStorage would mean someone who
 * dismissed it months ago never learns the site is still mid-build, and it's a
 * courtesy notice rather than a preference worth persisting. */
const DISMISSED = "mobile-notice-dismissed";

export function MobileNotice() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  /* Kept in a ref as well: the observer callback closes over its own render's
     state, and re-showing after a dismissal is the bug that follows from that. */
  const gone = useRef(false);

  useEffect(() => {
    /* Already dismissed this session: don't observe anything. There's no state
       to set — `visible` is false, so the bar stays parked and inert, which is
       indistinguishable from absent and avoids a render-time state write. */
    if (sessionStorage.getItem(DISMISSED)) {
      gone.current = true;
      return;
    }

    const hero = document.getElementById("hero");
    const scroller = hero?.closest("main");
    if (!hero || !scroller) return;

    /* Watches the hero rather than the second section, because "past the hero"
       is the condition, and there are three sections below it that would each
       need their own observer otherwise. The root is the scroll container, not
       the viewport — against the viewport the hero never appears to move. */
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (gone.current) return;
        setVisible(!entry.isIntersecting);
      },
      { root: scroller, threshold: 0 },
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  const dismiss = () => {
    setDismissed(true);
    gone.current = true;
    sessionStorage.setItem(DISMISSED, "1");
  };

  if (dismissed) return null;

  return (
    <div
      className={`${styles.mobileNotice} ${visible ? styles.mobileNoticeVisible : ""}`}
      /* Not aria-hidden when parked: it's announced when it arrives, and a
         status role keeps it from interrupting whatever is being read. */
      role="status"
      aria-live="polite"
    >
      <span>This site isn&rsquo;t optimised for mobile yet.</span>

      <button type="button" onClick={dismiss} aria-label="Dismiss">
        {/* Inline rather than an icon file — two lines of path data doesn't
            warrant a network request. */}
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden focusable="false">
          <path
            d="M3 3l8 8M11 3l-8 8"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
