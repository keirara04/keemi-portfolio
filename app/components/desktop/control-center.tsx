"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";

export type ThemeMode = "light" | "dark" | "auto";
const THEME_STORAGE_KEY = "keemi-theme";

export function useTheme() {
  // Lazy init: server renders "auto"; nothing displays the mode until the
  // Control Center opens (post-hydration), so no mismatch.
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "auto";
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : "auto";
  });

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = mode === "dark" || (mode === "auto" && media.matches);
      document.documentElement.classList.toggle("dark", dark);
    };
    apply();
    localStorage.setItem(THEME_STORAGE_KEY, mode);
    if (mode === "auto") {
      media.addEventListener("change", apply);
      return () => media.removeEventListener("change", apply);
    }
  }, [mode]);

  return { mode, setMode };
}

export function ControlCenter({
  themeMode,
  onThemeChange,
  wallpaperIndex,
  wallpaperCount,
  onWallpaperChange,
  onClose,
}: {
  themeMode: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
  wallpaperIndex: number;
  wallpaperCount: number;
  onWallpaperChange: (index: number) => void;
  onClose: () => void;
}) {
  const wallpaperPreviews = [
    <Image
      key="photo"
      src="/portfolio-homebackground.jpg"
      alt=""
      fill
      sizes="96px"
      className="object-cover"
    />,
    <span key="g1" className="absolute inset-0 bg-linear-to-br from-indigo-950 via-purple-900 to-rose-800" />,
    <span key="g2" className="absolute inset-0 bg-linear-to-br from-sky-300 via-cyan-500 to-blue-900" />,
  ];

  return (
    <div className="fixed inset-0 z-85" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: -6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.14, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="absolute right-2 top-9 w-72 rounded-2xl border border-white/30 bg-zinc-100/85 p-3 shadow-2xl shadow-black/30 backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-800/85"
        role="dialog"
        aria-label="Control Center"
      >
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Appearance
        </p>
        <div className="flex rounded-lg bg-zinc-200/70 p-0.5 dark:bg-zinc-900/60">
          {(["light", "dark", "auto"] as const).map((option) => (
            <button
              key={option}
              onClick={() => onThemeChange(option)}
              className={`flex-1 rounded-md px-2 py-1 text-xs font-medium capitalize transition ${
                themeMode === option
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-600 dark:text-white"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <p className="mb-1.5 mt-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Wallpaper
        </p>
        <div className="flex gap-2">
          {Array.from({ length: wallpaperCount }, (_, i) => (
            <button
              key={i}
              onClick={() => onWallpaperChange(i)}
              aria-label={`Wallpaper ${i + 1}`}
              className={`relative h-12 flex-1 overflow-hidden rounded-lg transition ${
                wallpaperIndex === i
                  ? "ring-2 ring-sky-500 ring-offset-1 ring-offset-transparent"
                  : "opacity-80 hover:opacity-100"
              }`}
            >
              {wallpaperPreviews[i]}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
