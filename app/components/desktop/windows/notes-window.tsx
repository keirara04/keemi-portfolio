"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { secretNote } from "@/lib/content";
import { useContent } from "@/lib/content-repo";
import { SECRET_FOUND_KEY } from "@/lib/easter-eggs";

export function NotesWindowContent() {
  const { notes } = useContent();
  const [selectedId, setSelectedId] = useState(notes[0]?.id);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [secretUnlocked, setSecretUnlocked] = useState(
    () => typeof window !== "undefined" && localStorage.getItem(SECRET_FOUND_KEY) === "1"
  );

  useEffect(() => {
    const onUnlock = () => setSecretUnlocked(true);
    window.addEventListener(SECRET_FOUND_KEY, onUnlock);
    return () => window.removeEventListener(SECRET_FOUND_KEY, onUnlock);
  }, []);

  const visibleNotes = secretUnlocked ? [...notes, secretNote] : notes;
  const selected = visibleNotes.find((n) => n.id === selectedId) ?? visibleNotes[0];

  return (
    <div className="-m-4 flex h-[calc(100%+2rem)] bg-white dark:bg-zinc-900">
      <AnimatePresence initial={false}>
        {sidebarOpen ? (
          <motion.aside
            key="sidebar"
            initial={{ width: 0 }}
            animate={{ width: "auto" }}
            exit={{ width: 0 }}
            transition={{ duration: 0.16, ease: "easeInOut" }}
            className="shrink-0 overflow-hidden border-r border-black/10 bg-zinc-50 dark:border-white/10 dark:bg-zinc-950/60"
          >
            <div className="h-full w-40 overflow-y-auto py-2 sm:w-48">
              <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                Notes
              </p>
              {visibleNotes.map((note) => (
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
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex shrink-0 items-center border-b border-black/5 px-2 py-1.5 dark:border-white/10">
          <button
            onClick={() => setSidebarOpen((open) => !open)}
            aria-label={sidebarOpen ? "Hide notes list" : "Show notes list"}
            aria-pressed={sidebarOpen}
            className="rounded-md p-1 text-zinc-500 transition hover:bg-black/5 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-100"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="h-4 w-4"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <rect x="2.5" y="4" width="15" height="12" rx="2" />
              <line x1="8" y1="4" x2="8" y2="16" />
            </svg>
          </button>
        </div>

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
    </div>
  );
}
