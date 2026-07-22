"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { dailySchedule } from "@/lib/content";

export function DailyScheduleWidget() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.15}
      whileDrag={{ scale: 1.03, rotate: 0, cursor: "grabbing" }}
      initial={{ opacity: 0, y: -10, rotate: 1.5 }}
      animate={{ opacity: 1, y: 0, rotate: 1.5 }}
      transition={{ delay: 0.75, duration: 0.4 }}
      className="group absolute left-6 top-14 z-5 w-56 cursor-grab select-none rounded-md border border-black/10 bg-white/95 p-3.5 pt-6 shadow-[0_10px_25px_-8px_rgba(0,0,0,0.35)] dark:border-white/10 dark:bg-zinc-800/95"
    >
      <span
        aria-hidden
        className="absolute -top-2.5 left-1/2 h-5 w-9 -translate-x-1/2 rounded-sm bg-zinc-400 shadow-sm dark:bg-zinc-500"
      />
      <button
        onClick={() => setDismissed(true)}
        aria-label="Remove schedule"
        className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900/70 text-[9px] text-white opacity-40 transition hover:bg-zinc-900 hover:opacity-100 group-hover:opacity-70"
      >
        ✕
      </button>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
        My &quot;Totally Real&quot; Schedule
      </p>
      <ul className="flex flex-col gap-1.5">
        {dailySchedule.map((item) => (
          <li
            key={item.time}
            className="flex gap-2 text-[11px] leading-snug text-zinc-700 dark:text-zinc-300"
          >
            <span className="w-10 shrink-0 font-mono font-semibold text-zinc-500 dark:text-zinc-400">
              {item.time}
            </span>
            <span>{item.activity}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
