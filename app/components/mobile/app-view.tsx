"use client";

import { motion } from "motion/react";
import { ChevronLeftIcon } from "../desktop/icons";
import { WindowContentFor } from "../desktop/window-content";
import { StatusBar } from "./status-bar";
import type { LaunchOrigin } from "./home-screen";

export type NavInfo = {
  type: "launch" | "push" | "pop" | "close";
  origin: LaunchOrigin | null;
};

const screenCenter = () => ({ x: globalThis.innerWidth / 2, y: globalThis.innerHeight / 2 });

const variants = {
  enter: ({ type, origin }: NavInfo) => {
    if (type === "push") return { x: "100%", y: 0, scale: 1, opacity: 1, borderRadius: 0 };
    if (type === "pop") return { x: "-18%", y: 0, scale: 1, opacity: 0.7, borderRadius: 0 };
    const c = screenCenter();
    return {
      x: origin ? origin.x - c.x : 0,
      y: origin ? origin.y - c.y : 120,
      scale: 0.1,
      opacity: 0.5,
      borderRadius: 40,
    };
  },
  center: { x: 0, y: 0, scale: 1, opacity: 1, borderRadius: 0 },
  exit: ({ type, origin }: NavInfo) => {
    if (type === "pop") return { x: "100%", y: 0, scale: 1, opacity: 1, borderRadius: 0 };
    if (type === "push") return { x: "-18%", y: 0, scale: 1, opacity: 0.7, borderRadius: 0 };
    const c = screenCenter();
    return {
      x: origin ? origin.x - c.x : 0,
      y: origin ? origin.y - c.y : 120,
      scale: 0.1,
      opacity: 0,
      borderRadius: 40,
    };
  },
};

export function AppView({
  id,
  title,
  nav,
  canGoBack,
  onBack,
  onHome,
}: {
  id: string;
  title: string;
  nav: NavInfo;
  canGoBack: boolean;
  onBack: () => void;
  onHome: () => void;
}) {
  return (
    <motion.div
      custom={nav}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
      className="absolute inset-0 z-50 flex flex-col overflow-hidden bg-white dark:bg-zinc-950"
      role="dialog"
      aria-label={title}
    >
      <StatusBar />

      <div className="flex h-11 shrink-0 items-center px-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-sky-600 dark:text-sky-400"
          aria-label={canGoBack ? "Back" : "Home"}
        >
          <ChevronLeftIcon className="h-3.5 w-2.5" />
          {canGoBack ? "Back" : "Home"}
        </button>
        <p className="absolute left-1/2 -translate-x-1/2 text-sm font-semibold text-zinc-900 dark:text-white">
          {title}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 pb-10">
        <WindowContentFor id={id} />
      </div>

      <button
        onClick={onHome}
        aria-label="Go to home screen"
        className="absolute inset-x-0 bottom-0 flex h-8 items-end justify-center pb-2"
      >
        <span className="h-1 w-32 rounded-full bg-zinc-900/80 dark:bg-white/80" />
      </button>
    </motion.div>
  );
}
