"use client";

import { ChevronRight } from "lucide-react";
import { useAgentPanel } from "./AgentContext";
import { SilkGradient } from "./SilkGradient";
import styles from "./agent.module.css";

/* The launcher for the assistant, straight from the design: a white pill on the
 * hero's dark gradient. A <button> rather than a link because it opens a panel
 * in place instead of navigating. */
export function AgentEntryCard() {
  const { open, isOpen } = useAgentPanel();

  return (
    <button
      type="button"
      className={styles.entryCard}
      onClick={open}
      aria-label="Ask me anything — I represent Rajiv"
      aria-haspopup="dialog"
      aria-expanded={isOpen}
    >
      {/* A shader rather than Rajiv's headshot: what answers is an assistant, and
          a photo of him promises a person. The gradient reads as software. */}
      <span className={styles.entryAvatar}>
        <SilkGradient className={styles.avatarCanvas} />
      </span>

      <span className={styles.entryCopy}>
        <span className={styles.entryTitle}>Ask me anything</span>
        <span className={styles.entrySubtitle}>
          I represent Rajiv — his work, how he thinks, whether he&rsquo;d fit your role
        </span>
      </span>

      <ChevronRight
        className={styles.entryChevron}
        width={24}
        height={24}
        strokeWidth={2}
        aria-hidden
      />
    </button>
  );
}
