import type { Metadata } from "next";
import { ppEditorial, sohne } from "@/fonts";
import "./globals.css";
import { Geist, Dancing_Script } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});
const dancingScript = Dancing_Script({subsets:['latin'],variable:'--font-dancing'});

export const metadata: Metadata = {
  title: "Rajiv Priyadarshi — Product Designer",
  description:
    "Versatile product design generalist with 10 years of building digital products across fintech, logistics, edtech, hospitality, and SaaS. Based in Singapore.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", ppEditorial.variable, sohne.variable, "font-sans", geist.variable, dancingScript.variable)}
    >
      <body className="min-h-full flex flex-col bg-gradient-warm">
        {children}
      </body>
    </html>
  );
}
