"use client";

import { useState } from "react";
import { motion } from "motion/react";

const NOTE_TEXT =
  "it's been a while... and i still have no clients yet...\nhow am I gonna afford a ticket home at this rate...\n\n(the Quote app is right there btw hehe)";

export function StickyNote() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.15}
      whileDrag={{ scale: 1.04, rotate: 0, cursor: "grabbing" }}
      initial={{ opacity: 0, y: 12, rotate: -2.5 }}
      animate={{ opacity: 1, y: 0, rotate: -2.5 }}
      transition={{ delay: 0.6, duration: 0.4 }}
      className="group absolute bottom-24 left-6 z-5 w-52 cursor-grab select-none rounded-[2px] border border-black/5 bg-[repeating-linear-gradient(white_0_23px,#e5e7eb_23px_24px)] p-4 pt-5 font-mono text-[11.5px] leading-relaxed whitespace-pre-line text-zinc-700 shadow-[0_10px_25px_-8px_rgba(0,0,0,0.35)] dark:bg-[repeating-linear-gradient(#27272a_0_23px,#3f3f46_23px_24px)] dark:text-zinc-200"
    >
      <span
        aria-hidden
        className="absolute -top-2 left-4 h-4 w-11 -rotate-6 bg-rose-200/80 shadow-sm dark:bg-rose-300/70"
      />
      <span
        aria-hidden
        className="absolute -top-2 right-4 h-4 w-11 rotate-6 bg-sky-200/80 shadow-sm dark:bg-sky-300/70"
      />
      <button
        onClick={() => setDismissed(true)}
        aria-label="Remove sticky note"
        className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900/70 text-[9px] text-white opacity-40 transition hover:bg-zinc-900 hover:opacity-100 group-hover:opacity-70"
      >
        ✕
      </button>
      {NOTE_TEXT}
    </motion.div>
  );
}
