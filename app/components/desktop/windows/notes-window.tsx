"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { notes } from "@/lib/content";

export function NotesWindowContent() {
  const [selectedId, setSelectedId] = useState(notes[0]?.id);
  const selected = notes.find((n) => n.id === selectedId) ?? notes[0];

  return (
    <div className="-m-4 flex h-[calc(100%+2rem)] bg-white dark:bg-zinc-900">
      <aside className="w-40 shrink-0 overflow-y-auto border-r border-black/10 bg-zinc-50 py-2 dark:border-white/10 dark:bg-zinc-950/60 sm:w-48">
        <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
          Notes
        </p>
        {notes.map((note) => (
          <button
            key={note.id}
            onClick={() => setSelectedId(note.id)}
            className={`block w-full px-3 py-2 text-left transition ${
              note.id === selected?.id
                ? "bg-amber-200/70 dark:bg-amber-400/20"
                : "hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <p className="truncate text-xs font-semibold text-zinc-800 dark:text-zinc-100">
              {note.title}
            </p>
            <p className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">{note.date}</p>
          </button>
        ))}
      </aside>

      <AnimatePresence mode="wait">
        <motion.article
          key={selected?.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.12 }}
          className="flex-1 overflow-y-auto p-4"
        >
          <p className="text-center text-[11px] text-zinc-400 dark:text-zinc-500">{selected?.date}</p>
          <h2 className="mt-1 text-base font-bold text-zinc-900 dark:text-white">
            {selected?.title}
          </h2>
          <div className="mt-2 whitespace-pre-wrap text-[13px] leading-relaxed text-zinc-700 dark:text-zinc-300">
            {selected?.body}
          </div>
        </motion.article>
      </AnimatePresence>
    </div>
  );
}
