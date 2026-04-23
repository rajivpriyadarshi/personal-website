"use client";

import { useState, useEffect } from "react";

interface Photo {
  src: string;
  caption: string;
}

const photos: Photo[] = [
  { src: "/rajiv.jpg", caption: "Me at Mount Titlis, Switzerland" },
  { src: "/photos/1-spiderman.jpeg", caption: "My wanna be spiderman look" },
  { src: "/photos/2-friends.png", caption: "Me with friends" },
  { src: "/photos/3-amsterdam.png", caption: "Me in Amsterdam" },
  { src: "/photos/4-pushups-everest.png", caption: "Me doing pushups around Everest base camp" },
  { src: "/photos/5-everest.jpg", caption: "Me near Everest Base camp" },
];

export function PhotoCarousel() {
  const [current, setCurrent] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrevious(current);
      setIsTransitioning(true);
      setCurrent((prev) => (prev + 1) % photos.length);

      setTimeout(() => {
        setIsTransitioning(false);
        setPrevious(null);
      }, 1000);
    }, 3000);

    return () => clearInterval(interval);
  }, [current]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative rounded-lg aspect-[4/5] overflow-hidden">
        {/* Previous image - fades out */}
        {previous !== null && isTransitioning && (
          <img
            src={photos[previous].src}
            alt={photos[previous].caption}
            className="absolute inset-0 w-full h-full object-cover rounded-lg animate-slide-out-left z-10"
          />
        )}
        {/* Current image - fades in */}
        <img
          src={photos[current].src}
          alt={photos[current].caption}
          className={`absolute inset-0 w-full h-full object-cover rounded-lg ${
            isTransitioning ? "animate-slide-in-right" : ""
          }`}
        />
      </div>
      <p
        className={`font-dancing text-center text-text-muted mt-3 text-lg ${
          isTransitioning ? "animate-fade-in" : ""
        }`}
      >
        {photos[current].caption}
      </p>
    </div>
  );
}
