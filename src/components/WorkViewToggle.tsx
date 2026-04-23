"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type ViewMode = "detailed" | "tldr";

interface WorkViewContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const WorkViewContext = createContext<WorkViewContextType | null>(null);

export function useWorkView() {
  const context = useContext(WorkViewContext);
  if (!context) {
    throw new Error("useWorkView must be used within WorkViewProvider");
  }
  return context;
}

export function WorkViewProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>("detailed");

  return (
    <WorkViewContext.Provider value={{ viewMode, setViewMode }}>
      {children}
    </WorkViewContext.Provider>
  );
}

export function WorkViewToggle() {
  const { viewMode, setViewMode } = useWorkView();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkVisibility = () => {
      const workSection = document.getElementById("work");
      const contactSection = document.getElementById("contact");

      if (!workSection) return;

      const workRect = workSection.getBoundingClientRect();
      const contactRect = contactSection?.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Show when work section is in view
      const workInView = workRect.top < windowHeight * 0.8 && workRect.bottom > windowHeight * 0.2;

      // Hide when contact section comes into view
      const contactInView = contactRect && contactRect.top < windowHeight * 0.8;

      setIsVisible(workInView && !contactInView);
    };

    checkVisibility();
    window.addEventListener("scroll", checkVisibility, { passive: true });
    window.addEventListener("resize", checkVisibility, { passive: true });

    return () => {
      window.removeEventListener("scroll", checkVisibility);
      window.removeEventListener("resize", checkVisibility);
    };
  }, []);

  return (
    <div
      className={`fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-16 pointer-events-none"
      }`}
      style={{
        transitionTimingFunction: isVisible ? "cubic-bezier(0.34, 1.56, 0.64, 1)" : "ease-out",
      }}
    >
      <div className="flex items-center gap-1 bg-surface-solid border border-border-strong rounded-full shadow-lg p-1.5">
        <button
          onClick={() => setViewMode("detailed")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            viewMode === "detailed"
              ? "bg-text text-bg"
              : "text-text-muted hover:text-text"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          Detailed
        </button>
        <button
          onClick={() => setViewMode("tldr")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            viewMode === "tldr"
              ? "bg-text text-bg"
              : "text-text-muted hover:text-text"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
          </svg>
          TL;DR
        </button>
      </div>
    </div>
  );
}
