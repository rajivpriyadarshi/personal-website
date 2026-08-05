"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ChevronDown } from "lucide-react";
import type { Role } from "./role-data";
import styles from "./portfolio-august.module.css";

/* Native <dialog>, not a hand-rolled overlay. It renders in the browser's top
 * layer, which is the only way this can sit above the Summary section's sticky
 * viewport and its stacking contexts without a z-index arms race. Esc-to-close,
 * focus trapping, and inert-ing the page behind it come for free. */

type Props = {
  /** The card that was clicked, or null when nothing is open. */
  role: Role | null;
  onClose: () => void;
};

export function RoleModal({ role, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const surface = useRef<HTMLDivElement>(null);

  /* The dialog stays mounted with no content between opens, so `role` going
   * non-null is what drives showModal(). */
  useEffect(() => {
    const el = dialog.current;
    if (!el) return;

    if (role) {
      if (!el.open) el.showModal();
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.fromTo(
        surface.current,
        { y: 26, scale: 0.96, autoAlpha: 0 },
        { y: 0, scale: 1, autoAlpha: 1, duration: 0.42, ease: "power3.out" },
      );
    } else if (el.open) {
      el.close();
    }
  }, [role]);

  /* Esc fires the dialog's own cancel/close, which bypasses React state — so
   * the close has to be reported back up or the parent would still think the
   * modal is open and never reopen it. */
  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    el.addEventListener("close", onClose);
    return () => el.removeEventListener("close", onClose);
  }, [onClose]);

  return (
    <dialog
      ref={dialog}
      className={styles.roleModal}
      aria-labelledby="role-modal-title"
      /* Clicking the backdrop closes. The backdrop is part of the dialog
         element itself, so a click on it lands on <dialog> rather than on any
         child — comparing the target is what distinguishes the two. */
      onClick={(event) => {
        if (event.target === dialog.current) onClose();
      }}
    >
      {/* Content is only rendered while something is open, so the collapsed
          panels of a closed modal aren't in the accessibility tree — and the
          accordion's own state is created fresh on each open, which is what
          makes every panel start collapsed as the design specifies. */}
      {role ? (
        <div ref={surface} className={styles.roleModalSurface}>
          <h2 id="role-modal-title" className={styles.roleModalTitle}>
            {role.title}
          </h2>

          <Accordion role={role} />
        </div>
      ) : null}
    </dialog>
  );
}

function Accordion({ role }: { role: Role }) {
  /* Index of the expanded panel, or null for all-collapsed. Single-open:
   * expanding one collapses the others, so the modal never grows past a height
   * that has to be scrolled past to reach the next header. */
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className={styles.roleAccordion}>
      {role.panels.map((panel, i) => {
        const expanded = open === i;
        const panelId = `role-panel-${role.key}-${i}`;

        return (
          <div key={panel.title} className={styles.roleAccordionItem}>
            <button
              type="button"
              className={styles.roleAccordionHeader}
              aria-expanded={expanded}
              aria-controls={panelId}
              onClick={() => setOpen(expanded ? null : i)}
            >
              <span className={styles.roleAccordionTitle}>{panel.title}</span>
              <span aria-hidden className={styles.roleAccordionChevron}>
                <ChevronDown size={20} strokeWidth={2} />
              </span>
            </button>

            {/* Height is animated by CSS grid-template-rows rather than
                max-height, so the panel opens to exactly its content height
                without a magic number that clips long lists. */}
            <div
              id={panelId}
              className={styles.roleAccordionPanel}
              data-expanded={expanded}
              role="region"
            >
              <div className={styles.roleAccordionBody}>
                {panel.intro.map((para) => (
                  <p key={para} className={styles.roleAccordionPara}>
                    {para}
                  </p>
                ))}

                <h3 className={styles.roleAccordionSubhead}>What I did</h3>
                <ul className={styles.roleAccordionList}>
                  {panel.did.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
