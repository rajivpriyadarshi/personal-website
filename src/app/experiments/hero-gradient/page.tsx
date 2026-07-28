import type { Metadata } from "next";
import { HeroGradientClient } from "./HeroGradientClient";

export const metadata: Metadata = {
  title: "Hero Gradient — Experiments",
  description:
    "Interactive WebGL gradient that reacts to the pointer and drifts through colour over time.",
};

export default function HeroGradientPage() {
  return <HeroGradientClient />;
}
