"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import styles from "./portfolio-august.module.css";

const PHOTOS = [
  { src: "/rajiv.jpg", caption: "Me at Mount Titlis, Switzerland" },
  { src: "/photos/1-spiderman.jpeg", caption: "My wanna be spiderman look" },
  { src: "/photos/2-friends.png", caption: "Me with friends" },
  { src: "/photos/3-amsterdam.png", caption: "Me in Amsterdam" },
  { src: "/photos/4-pushups-everest.png", caption: "Pushups around Everest base camp" },
  { src: "/photos/5-everest.jpg", caption: "Near Everest Base Camp" },
];

const SWIPE_THRESHOLD = 30;
const CLICK_SLOP = 5;
// Seconds each photo holds before the stack advances on its own.
const AUTO_ADVANCE = 3.2;

function positionFor(posIdx: number) {
  if (posIdx === 0) return { rotate: -16, x: -46, scale: 0.9, opacity: 0.85, zIndex: 10 };
  if (posIdx === 1) return { rotate: 0, x: 0, scale: 1, opacity: 1, zIndex: 30 };
  return { rotate: 10, x: 46, scale: 0.9, opacity: 0.85, zIndex: 10 };
}

export function PhotoStack() {
  const total = PHOTOS.length;
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const visibleRef = useRef([0, 1, 2]);
  const animating = useRef(false);
  const dragStart = useRef<{ x: number; cardIdx: number } | null>(null);
  const [visible, setVisible] = useState([0, 1, 2]);
  const [hovered, setHovered] = useState<number | null>(null);

  const animateTo = useCallback((next: number[]) => {
    next.forEach((photoIdx, posIdx) => {
      const card = cards.current[photoIdx];
      if (!card) return;
      const props = positionFor(posIdx);
      gsap.to(card, {
        rotation: props.rotate,
        x: props.x,
        scale: props.scale,
        opacity: props.opacity,
        zIndex: props.zIndex,
        duration: 0.5,
        ease: "back.out(1.2)",
      });
    });
  }, []);

  const cycle = useCallback(
    (direction: 1 | -1) => {
      if (animating.current) return;
      animating.current = true;
      const curr = visibleRef.current;
      const next =
        direction === 1
          ? [curr[1], curr[2], (curr[2] + 1) % total]
          : [(curr[0] - 1 + total) % total, curr[0], curr[1]];
      visibleRef.current = next;
      setVisible([...next]);
      animateTo(next);
      gsap.delayedCall(0.5, () => {
        animating.current = false;
      });
    },
    [animateTo, total],
  );

  const tapCard = useCallback(
    (photoIdx: number) => {
      const posIdx = visibleRef.current.indexOf(photoIdx);
      if (posIdx === 0) cycle(-1);
      else if (posIdx === 2) cycle(1);
    },
    [cycle],
  );

  /* Auto-advance. Pauses while the pointer is over the stack so the caption
   * stays readable and a photo doesn't slide out from under a click. Uses
   * gsap.delayedCall rather than setInterval so it shares the same clock as the
   * shuffle tween and can't fire mid-animation. */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (hovered !== null) return;

    const tick = gsap.delayedCall(AUTO_ADVANCE, () => {
      cycle(1);
      tick.restart(true);
    });
    return () => {
      tick.kill();
    };
  }, [cycle, hovered]);

  const onPointerDown = (event: React.PointerEvent, photoIdx: number) => {
    dragStart.current = { x: event.clientX, cardIdx: photoIdx };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent, photoIdx: number) => {
    if (dragStart.current?.cardIdx !== photoIdx) return;
    const card = cards.current[photoIdx];
    if (!card) return;
    const dx = event.clientX - dragStart.current.x;
    const base = positionFor(visibleRef.current.indexOf(photoIdx));
    gsap.set(card, { x: base.x + dx, rotation: base.rotate + dx * 0.08 });
  };

  const onPointerUp = (event: React.PointerEvent, photoIdx: number) => {
    if (!dragStart.current) return;
    const dx = event.clientX - dragStart.current.x;
    dragStart.current = null;
    const posIdx = visibleRef.current.indexOf(photoIdx);

    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      if (posIdx === 1) cycle(dx < 0 ? 1 : -1);
      else tapCard(photoIdx);
      return;
    }
    if (Math.abs(dx) < CLICK_SLOP) {
      tapCard(photoIdx);
      return;
    }
    // In-between drag: snap the card back where it came from.
    const props = positionFor(posIdx);
    const card = cards.current[photoIdx];
    if (card) {
      gsap.to(card, {
        x: props.x,
        rotation: props.rotate,
        duration: 0.4,
        ease: "back.out(1.5)",
      });
    }
  };

  return (
    <div className={styles.stack}>
      {visible.map((photoIdx, posIdx) => {
        const props = positionFor(posIdx);
        return (
          <div
            key={photoIdx}
            ref={(el) => {
              cards.current[photoIdx] = el;
            }}
            className={styles.stackCard}
            onPointerDown={(e) => onPointerDown(e, photoIdx)}
            onPointerMove={(e) => onPointerMove(e, photoIdx)}
            onPointerUp={(e) => onPointerUp(e, photoIdx)}
            onMouseEnter={() => setHovered(photoIdx)}
            onMouseLeave={() => setHovered(null)}
            style={{
              transform: `rotate(${props.rotate}deg) translateX(${props.x}px) scale(${props.scale})`,
              opacity: props.opacity,
              zIndex: props.zIndex,
            }}
          >
            <Image
              src={PHOTOS[photoIdx].src}
              alt={PHOTOS[photoIdx].caption}
              fill
              sizes="100px"
              className={styles.stackImage}
              draggable={false}
              priority={posIdx === 1}
            />
          </div>
        );
      })}

      {hovered !== null && visible[1] === hovered && (
        <div className={styles.stackCaption}>{PHOTOS[hovered].caption}</div>
      )}
    </div>
  );
}
