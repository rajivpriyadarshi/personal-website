"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  /** The clicked card's element, so the sheet can grow out of it. Set by the
   *  click handler before `role`, so it's already current when we open. */
  origin: React.RefObject<HTMLElement | null>;
  onClose: () => void;
};

const MORPH_IN = 0.54;
const MORPH_OUT = 0.36;

const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Maps the surface onto the card: the transform that would make the surface,
 * at its natural size and position, exactly cover the card. */
function toOrigin(surface: HTMLElement, card: HTMLElement) {
  const to = surface.getBoundingClientRect();
  const from = card.getBoundingClientRect();
  return {
    /* Top-left origin keeps this to a plain offset — with the default centre
     * origin the scale would also shift the box and both terms would have to
     * be solved together. */
    transformOrigin: "top left",
    x: from.left - to.left,
    y: from.top - to.top,
    scaleX: from.width / to.width,
    scaleY: from.height / to.height,
  };
}

export function RoleModal({ role, origin, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const surface = useRef<HTMLDivElement>(null);
  /* The card the current sheet grew out of. Held separately from the ref above
   * because that one moves on to the next card as soon as another is clicked,
   * and the exit needs to shrink back into the one we actually came from. */
  const grewFrom = useRef<HTMLElement | null>(null);
  const exiting = useRef(false);

  /* The dialog stays mounted with no content between opens, so `role` going
   * non-null is what drives showModal(). */
  useEffect(() => {
    const el = dialog.current;
    const panel = surface.current;
    if (!el || !role || !panel) return;

    if (!el.open) el.showModal();

    const card = origin.current;
    grewFrom.current = card;

    if (reducedMotion()) {
      gsap.set(panel, { clearProps: "all" });
      return;
    }

    /* Nothing to grow out of — a keyboard activation with no measurable card,
     * or an open triggered from elsewhere. Fall back to a plain rise. */
    if (!card) {
      gsap.fromTo(
        panel,
        { y: 26, scale: 0.96, autoAlpha: 0 },
        { y: 0, scale: 1, autoAlpha: 1, duration: 0.42, ease: "power3.out" },
      );
      return;
    }

    const inner = panel.children;

    /* The card is what's growing, so the original has to stop being drawn for
     * the duration or you see both at once. */
    gsap.set(card, { autoAlpha: 0 });

    gsap
      .timeline()
      /* Only the empty shell is visible while the box is mid-stretch. The
       * non-uniform scale distorts anything inside it, so the content is held
       * back until the shell has settled at 1:1 — which is also the beat the
       * design asks for: the card grows, then the content appears. */
      .set(inner, { autoAlpha: 0 })
      .fromTo(panel, { ...toOrigin(panel, card), autoAlpha: 1 }, {
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        duration: MORPH_IN,
        ease: "power3.out",
      })
      .to(
        inner,
        { autoAlpha: 1, y: 0, duration: 0.34, ease: "power2.out" },
        MORPH_IN * 0.62,
      )
      .from(
        inner,
        { y: 10, duration: 0.34, ease: "power2.out" },
        MORPH_IN * 0.62,
      );
  }, [role, origin]);

  /* Shrinks back into the card before letting the dialog go, so the close
   * mirrors the open instead of snapping shut. */
  const requestClose = useCallback(() => {
    const el = dialog.current;
    const panel = surface.current;
    const card = grewFrom.current;
    if (!el || exiting.current) return;

    const finish = () => {
      exiting.current = false;
      el.close();
    };

    if (!panel || !card || reducedMotion()) {
      finish();
      return;
    }

    exiting.current = true;
    gsap
      .timeline({ onComplete: finish })
      .to(panel.children, { autoAlpha: 0, duration: 0.14, ease: "power1.in" })
      .to(panel, {
        ...toOrigin(panel, card),
        duration: MORPH_OUT,
        ease: "power2.inOut",
      });
  }, []);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;

    /* Esc and the close event bypass React state, so the close has to be
     * reported back up or the parent would still think the modal is open and
     * never reopen it. Esc is intercepted first — cancel is preventable, which
     * is what buys the exit animation its time to run. */
    const onCancel = (event: Event) => {
      event.preventDefault();
      requestClose();
    };

    /* Restoring the hidden card is bound to `close` rather than to the exit
     * animation, because close can also be reached without one — a direct
     * .close(), or the browser removing the dialog from the top layer. Anything
     * that skips this leaves the card permanently invisible. */
    const onCloseEvent = () => {
      const card = grewFrom.current;
      if (card) gsap.set(card, { autoAlpha: 1 });
      grewFrom.current = null;
      onClose();
    };

    el.addEventListener("cancel", onCancel);
    el.addEventListener("close", onCloseEvent);
    return () => {
      el.removeEventListener("cancel", onCancel);
      el.removeEventListener("close", onCloseEvent);
    };
  }, [onClose, requestClose]);

  return (
    <dialog
      ref={dialog}
      className={styles.roleModal}
      aria-labelledby="role-modal-title"
      /* Clicking the backdrop closes. The backdrop is part of the dialog
         element itself, so a click on it lands on <dialog> rather than on any
         child — comparing the target is what distinguishes the two. */
      onClick={(event) => {
        if (event.target === dialog.current) requestClose();
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
