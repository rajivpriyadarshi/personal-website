import type { Metadata } from "next";
import { CubeRevealClient } from "./CubeRevealClient";

export const metadata: Metadata = {
  title: "Cube Reveal — Experiments",
  description:
    "A grid of 3D cubes flies toward the camera on scroll, uncovering the scene and cinematic display type behind it.",
};

export default function CubeRevealPage() {
  return <CubeRevealClient />;
}
