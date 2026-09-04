"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { useAgentPanel } from "./AgentContext";
import { AgentThread } from "./AgentThread";
import { SilkGradient } from "./SilkGradient";
import styles from "./agent.module.css";

/* The chat itself, as a right-hand sidebar.
 *
 * It stays mounted when closed and slides off the right edge instead of
 * unmounting, so the conversation is still there on reopen. `inert` takes it out
 * of the tab order and the accessibility tree while it's off-screen, which a
 * bare translate wouldn't. */
export function AgentPanel() {
  const { isOpen, close } = useAgentPanel();

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, close]);

  return (
    <>
      {/* Click-away target. Only paints on narrow screens, where the panel covers
          most of the page; on desktop the page stays readable beside it, so a
          dimming layer would be noise. */}
      <div
        className={`${styles.scrim} ${isOpen ? styles.scrimVisible : ""}`}
        onClick={close}
        aria-hidden
      />

      <aside
        className={`${styles.panel} ${isOpen ? styles.panelOpen : ""}`}
        role="dialog"
        aria-label="Ask me anything — I represent Rajiv"
        inert={!isOpen}
      >
        <header className={styles.panelHeader}>
          <span className={styles.panelAvatar}>
            <SilkGradient className={styles.avatarCanvas} />
          </span>

          <div className={styles.panelHeading}>
            <p className={styles.panelTitle}>Ask me anything</p>
            <p className={styles.panelSubtitle}>
              I represent Rajiv, in his own words
            </p>
          </div>

          <button
            type="button"
            className={styles.panelClose}
            onClick={close}
            aria-label="Close chat"
          >
            <X width={18} height={18} strokeWidth={2} aria-hidden />
          </button>
        </header>

        <AgentThread />
      </aside>
    </>
  );
}
