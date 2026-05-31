import type { Metadata } from "next";
import { PortfolioGridClient } from "./PortfolioGridClient";

export const metadata: Metadata = {
  title: "Portfolio Grid",
  description: "GSAP-driven portfolio grid study route.",
};

export default function PortfolioGridPage() {
  return <PortfolioGridClient />;
}
