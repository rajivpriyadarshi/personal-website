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
    const workSection = document.getElementById("work");
    if (!workSection) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(workSection);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out ${
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
