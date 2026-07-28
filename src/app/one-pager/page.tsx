import type { Metadata } from "next";
import { OnePagerClient } from "./OnePagerClient";

export const metadata: Metadata = {
  title: "Rajiv Priyadarshi — One Pager",
  description: "A single-page portfolio overview.",
};

export default function OnePagerPage() {
  return <OnePagerClient />;
}
