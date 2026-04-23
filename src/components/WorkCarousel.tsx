"use client";

import { useState, useRef, useEffect } from "react";
import { ImagePlaceholder, LogoPlaceholder } from "./ImagePlaceholder";

interface Project {
  title: string;
  description: string;
  tags?: string[];
}

interface WorkCarouselProps {
  company: string;
  role: string;
  period: string;
  location?: string;
  summary: string;
  projects: Project[];
}

function ArrowLeftIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ArrowRightIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

export function WorkCarousel({
  company,
  role,
  period,
  location,
  summary,
  projects,
}: WorkCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const companySlug = company.toLowerCase().replace(/\s+/g, "-");

  const getCardWidth = () => {
    if (!carouselRef.current) return 0;
    const containerWidth = carouselRef.current.offsetWidth;
    // Match the card widths: 85% mobile, 45% tablet, 35% desktop
    if (window.innerWidth >= 1024) return containerWidth * 0.35 + 16;
    if (window.innerWidth >= 768) return containerWidth * 0.45 + 16;
    return containerWidth * 0.85 + 16;
  };

  const scrollTo = (index: number) => {
    if (carouselRef.current) {
      const cardWidth = getCardWidth();
      const scrollAmount = index * cardWidth;
      carouselRef.current.scrollTo({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const scrollPrev = () => {
    if (currentIndex > 0) {
      scrollTo(currentIndex - 1);
    }
  };

  const scrollNext = () => {
    if (currentIndex < projects.length - 1) {
      scrollTo(currentIndex + 1);
    }
  };

  const handleScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      const cardWidth = getCardWidth();
      const newIndex = Math.round(scrollLeft / cardWidth);
      setCurrentIndex(newIndex);

      // Update arrow visibility
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    // Initial check for scroll buttons
    handleScroll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      id={`work-section-${companySlug}`}
      className="work-section border-t-hairline pt-16 pb-20"
    >
      {/* ============ COMPANY HEADER ============ */}
      <div
        id={`company-header-${companySlug}`}
        className="company-header container-wide mb-16"
      >
        <div className="company-header-inner flex flex-col md:flex-row md:items-start gap-6 md:gap-12">
          {/* Company Logo */}
          <div id={`company-logo-${companySlug}`} className="company-logo">
            <LogoPlaceholder className="shrink-0" />
          </div>

          {/* Company Info */}
          <div
            id={`company-info-${companySlug}`}
            className="company-info flex-1"
          >
            {/* Company Title Row */}
            <div
              id={`company-title-row-${companySlug}`}
              className="company-title-row flex flex-col md:flex-row md:items-baseline md:justify-between gap-2 mb-4"
            >
              <h3
                id={`company-name-${companySlug}`}
                className="company-name font-editorial text-4xl md:text-5xl text-text"
              >
                {company}
              </h3>
              <div
                id={`company-meta-${companySlug}`}
                className="company-meta flex gap-4 text-text-muted"
              >
                <span className="company-period body-sm">{period}</span>
                {location && (
                  <>
                    <span className="text-text-light">|</span>
                    <span className="company-location body-sm">{location}</span>
                  </>
                )}
              </div>
            </div>

            {/* Company Role */}
            <p
              id={`company-role-${companySlug}`}
              className="company-role label text-accent mb-4"
            >
              {role}
            </p>

            {/* Company Summary */}
            <p
              id={`company-summary-${companySlug}`}
              className="company-summary body-base text-text-muted max-w-2xl"
            >
              {summary}
            </p>
          </div>
        </div>
      </div>

      {/* ============ PROJECTS CAROUSEL ============ */}
      <div
        id={`projects-carousel-${companySlug}`}
        className="projects-carousel relative"
      >
        {/* Carousel Arrow - Left */}
        <button
          id={`carousel-arrow-left-${companySlug}`}
          onClick={scrollPrev}
          className={`carousel-arrow carousel-arrow-left absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center glass-strong text-text hover:text-accent transition-all ${
            canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          aria-label="Previous project"
        >
          <ArrowLeftIcon className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        {/* Carousel Arrow - Right */}
        <button
          id={`carousel-arrow-right-${companySlug}`}
          onClick={scrollNext}
          className={`carousel-arrow carousel-arrow-right absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center glass-strong text-text hover:text-accent transition-all ${
            canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          aria-label="Next project"
        >
          <ArrowRightIcon className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        {/* Carousel Track */}
        <div
          ref={carouselRef}
          onScroll={handleScroll}
          id={`carousel-track-${companySlug}`}
          className="carousel-track flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-6 md:px-12 mt-8 scroll-smooth"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            scrollSnapType: "x mandatory",
          }}
        >
          {projects.map((project, index) => (
            <div
              key={index}
              id={`project-card-${companySlug}-${index}`}
              className="project-card-wrapper snap-start shrink-0 w-[85%] md:w-[45%] lg:w-[35%]"
              style={{ scrollSnapAlign: "start" }}
            >
              <div className="project-card card p-6 h-full flex flex-col">
                {/* Project Image */}
                <div className="project-image mb-6">
                  <ImagePlaceholder
                    aspectRatio="16/10"
                    className="w-full"
                    label="Project"
                  />
                </div>

                {/* Project Content */}
                <div className="project-content flex-1">
                  <h4 className="project-title font-editorial text-xl text-text mb-3">
                    {project.title}
                  </h4>
                  <p className="project-description body-sm text-text-muted mb-4 line-clamp-3">
                    {project.description}
                  </p>
                </div>

                {/* Project Tags */}
                {project.tags && (
                  <div className="project-tags flex flex-wrap gap-2 mt-auto pt-4 border-t-hairline">
                    {project.tags.map((tag, i) => (
                      <span key={i} className="project-tag label-sm text-text-light">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Navigation Dots */}
        {projects.length > 1 && (
          <div
            id={`carousel-nav-${companySlug}`}
            className="carousel-nav flex justify-center items-center gap-4 mt-8"
          >
            {/* Dot indicators - show subset for many projects */}
            <div className="carousel-dots flex gap-2">
              {projects.length <= 10 ? (
                projects.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollTo(index)}
                    className={`carousel-dot w-2 h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? "bg-accent w-6"
                        : "bg-border-strong hover:bg-border-rule"
                    }`}
                    aria-label={`Go to project ${index + 1}`}
                  />
                ))
              ) : (
                <span className="label-sm text-text-muted">
                  {currentIndex + 1} / {projects.length}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
