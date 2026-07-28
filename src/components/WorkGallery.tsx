"use client";

import { useEffect, useRef, useState } from "react";

interface WorkGalleryProps {
  images?: string[];
  itemCount?: number;
}

export function WorkGallery({ images, itemCount = 6 }: WorkGalleryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Create placeholder items
  const items = images || Array.from({ length: itemCount }, (_, i) => null);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 3000); // 3 seconds per item

    return () => clearInterval(interval);
  }, [isPaused, items.length]);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const itemWidth = 800 + 16; // width + gap
    const targetScroll = currentIndex * itemWidth;

    scrollContainer.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    });
  }, [currentIndex]);

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  return (
    <div
      className="w-full overflow-hidden relative"
      style={{ marginTop: "32px", marginBottom: "32px" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Left Arrow */}
      <button
        onClick={goToPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-surface-solid border border-border flex items-center justify-center text-text-muted hover:text-text hover:border-border-strong transition-colors"
        aria-label="Previous image"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Right Arrow */}
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-surface-solid border border-border flex items-center justify-center text-text-muted hover:text-text hover:border-border-strong transition-colors"
        aria-label="Next image"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide"
        style={{ scrollBehavior: "smooth", scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((image, index) => (
          <div
            key={index}
            className="shrink-0 bg-bg-alt rounded-lg flex items-center justify-center transition-opacity duration-300"
            style={{
              width: "800px",
              height: "500px",
              opacity: index === currentIndex ? 1 : 0.6,
            }}
          >
            {image ? (
              <img
                src={image}
                alt={`Gallery image ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <svg
                className="w-12 h-12 text-text-light/30"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
