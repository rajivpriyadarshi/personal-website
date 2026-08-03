import type { Metadata } from "next";
import { PortfolioAugustClient } from "./portfolio-august/PortfolioAugustClient";

export const metadata: Metadata = {
  title: "Rajiv Priyadarshi — Product Designer",
  description:
    "I'm a dreamer, big-picture thinker, I tell stories, and I love solving complex problems.",
};

export default function Home() {
  return <PortfolioAugustClient />;
}
