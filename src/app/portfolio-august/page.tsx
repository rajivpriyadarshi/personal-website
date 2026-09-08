import type { Metadata } from "next";
import { PortfolioAugustClient } from "./PortfolioAugustClient";

export const metadata: Metadata = {
  title: "Rajiv Priyadarshi — Design Leader",
  description:
    "I'm a dreamer, big-picture thinker, I tell stories, and I love solving complex problems.",
};

export default function PortfolioAugustPage() {
  return <PortfolioAugustClient />;
}
