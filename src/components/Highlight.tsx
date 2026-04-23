import { ReactNode } from "react";

interface HighlightProps {
  children: ReactNode;
}

/**
 * Highlight - Inline text highlight for important keywords
 * Use inside descriptions to emphasize recruiter-relevant info
 * Marker-style background highlight
 */
export function Highlight({ children }: HighlightProps) {
  return (
    <span
      className="text-text"
      style={{
        backgroundColor: "rgba(228, 184, 148, 0.4)",
        padding: "2px 6px",
        borderRadius: "4px",
      }}
    >
      {children}
    </span>
  );
}

export default Highlight;
