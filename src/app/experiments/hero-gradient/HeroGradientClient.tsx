"use client";

import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { GradientCanvas, type Theme } from "./GradientCanvas";
import { cn } from "@/lib/utils";

const FADE_STOPS =
  "0%, rgba(0,0,0,0.738) 19%, rgba(0,0,0,0.541) 34%, rgba(0,0,0,0.382) 47%, rgba(0,0,0,0.278) 56.5%, rgba(0,0,0,0.194) 65%, rgba(0,0,0,0.126) 73%, rgba(0,0,0,0.075) 80.2%, rgba(0,0,0,0.042) 86.1%, rgba(0,0,0,0.021) 91%, rgba(0,0,0,0.008) 95.2%, rgba(0,0,0,0) 100%";

export function HeroGradientClient() {
  const [palette, setPalette] = useState("");
  const [theme, setTheme] = useState<Theme>("dark");
  const isLight = theme === "light";

  return (
    <main
      className={cn(
        "relative min-h-screen w-full overflow-hidden transition-colors duration-700",
        isLight ? "bg-[#faf8f2]" : "bg-black",
      )}
    >
      <section className="relative flex min-h-screen w-full items-center justify-center">
        <GradientCanvas theme={theme} onPaletteChange={setPalette} />

        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 right-0 z-[5] h-64 transition-opacity duration-700"
          style={{
            background: isLight
              ? `linear-gradient(to top, #faf8f2 ${FADE_STOPS.replaceAll("rgba(0,0,0,", "rgba(250,248,242,")}`
              : `linear-gradient(to top, black ${FADE_STOPS}`,
          }}
        />

        <button
          type="button"
          onClick={() => setTheme(isLight ? "dark" : "light")}
          aria-label={isLight ? "Switch to dark theme" : "Switch to light theme"}
          className={cn(
            "absolute right-6 top-6 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-[25px] transition-colors duration-300",
            isLight
              ? "border-black/10 bg-black/5 text-black/70 hover:bg-black/10 hover:text-black"
              : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white",
          )}
        >
          {isLight ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
          <span
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.2em] backdrop-blur-[25px] transition-colors duration-700",
              isLight
                ? "border-black/10 bg-black/5 text-black/60"
                : "border-white/15 bg-white/5 text-white/70",
            )}
          >
            Experiment
          </span>
          <h1
            className={cn(
              "max-w-3xl text-5xl font-medium leading-[1.05] tracking-tight transition-colors duration-700 md:text-7xl",
              isLight ? "text-[#1a1814]" : "text-white",
            )}
          >
            Interactive hero gradient
          </h1>
          <p
            className={cn(
              "max-w-xl text-base transition-colors duration-700 md:text-lg",
              isLight ? "text-black/55" : "text-white/60",
            )}
          >
            A WebGL2 shader that warps toward the pointer and drifts through
            colour over time. Click anywhere to jump to the next palette.
          </p>
          <span
            className={cn(
              "mt-2 text-xs uppercase tracking-[0.2em] transition-colors duration-700",
              isLight ? "text-black/40" : "text-white/40",
            )}
          >
            {palette}
          </span>
        </div>
      </section>
    </main>
  );
}
