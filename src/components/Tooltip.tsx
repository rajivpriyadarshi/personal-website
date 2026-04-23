"use client";

import { useState, ReactNode } from "react";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className="absolute z-50 left-full top-1/2 -translate-y-1/2 ml-3 w-72 md:w-80"
          style={{ pointerEvents: "none" }}
        >
          <div className="bg-surface-solid border border-border-strong rounded-lg shadow-xl p-4 text-left">
            <div className="text-sm text-text-muted leading-relaxed">
              {content}
            </div>
          </div>
          {/* Arrow */}
          <div className="absolute top-1/2 -translate-y-1/2 -left-[7px]">
            <div className="w-3 h-3 bg-surface-solid border-l border-b border-border-strong rotate-45" />
          </div>
        </div>
      )}
    </span>
  );
}
