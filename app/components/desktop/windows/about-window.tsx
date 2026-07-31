"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { useContent } from "@/lib/content-repo";

const TABS = ["Overview", "Skills", "Interests"] as const;
type Tab = (typeof TABS)[number];

// Fullscreen photo viewer styled like macOS Quick Look, rendered in a portal
// because the window's transform would trap position:fixed inside it.
function QuickLook({ name, onClose }: { name: string; onClose: () => void }) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
      className="fixed inset-0 z-95 flex flex-col items-center justify-center gap-3 bg-black/75 backdrop-blur-md"
      role="dialog"
      aria-label={`Photo of ${name}`}
    >
      <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-white/90">
        <span className="font-medium">{name}.jpg</span>
        <span className="text-white/50">— Quick Look</span>
      </div>
      <motion.div
        initial={{ scale: 0.85, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 8 }}
        transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative h-[70vh] w-[min(80vw,32rem)] overflow-hidden rounded-2xl shadow-2xl"
      >
        <Image
          src="/portfolio-profile.jpg"
          alt={name}
          fill
          sizes="80vw"
          className="object-cover"
          priority
        />
      </motion.div>
      <p className="text-xs text-white/60">Click anywhere or press Esc to close</p>
    </motion.div>,
    document.body
  );
}

function TiltPhoto({ name, onOpen }: { name: string; onOpen: () => void }) {
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 200, damping: 18 });
  const springY = useSpring(rotateY, { stiffness: 200, damping: 18 });

  return (
    <motion.button
      onClick={onOpen}
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        rotateY.set(((e.clientX - rect.x) / rect.width - 0.5) * 18);
        rotateX.set(((e.clientY - rect.y) / rect.height - 0.5) * -18);
      }}
      onPointerLeave={() => {
        rotateX.set(0);
        rotateY.set(0);
      }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      style={{ rotateX: springX, rotateY: springY, transformPerspective: 500 }}
      className="group relative h-24 w-24 overflow-hidden rounded-full shadow-md"
      aria-label="View photo fullscreen"
    >
      <Image
        src="/portfolio-profile.jpg"
        alt={name}
        fill
        sizes="96px"
        className="object-cover"
      />
      <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-[10px] font-medium text-transparent transition group-hover:bg-black/35 group-hover:text-white">
        Quick Look
      </span>
    </motion.button>
  );
}

export function AboutWindowContent() {
  const { interests, profile, skillGroups, specs } = useContent();
  const [tab, setTab] = useState<Tab>("Overview");
  const [quickLookOpen, setQuickLookOpen] = useState(false);

  return (
    <div className="flex h-full flex-col gap-4 text-sm">
      <div
        role="tablist"
        aria-label="About sections"
        className="mx-auto flex shrink-0 rounded-lg bg-zinc-200/70 p-0.5 dark:bg-zinc-800"
      >
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`rounded-md px-4 py-1 text-xs font-medium transition ${
              tab === t
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-600 dark:text-white"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.14, ease: "easeOut" }}
          className="flex min-h-0 flex-1 flex-col"
        >
          {tab === "Overview" ? (
            <div className="mx-auto my-auto flex w-full max-w-md flex-col items-center gap-4 text-center">
              <TiltPhoto name={profile.name} onOpen={() => setQuickLookOpen(true)} />
              <div>
                <p className="text-lg font-semibold text-zinc-900 dark:text-white">{profile.name}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{profile.title}</p>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  From Malaysia · Korea University, Seoul
                </p>
              </div>


              <p className="leading-relaxed text-zinc-700 dark:text-zinc-300">{profile.bio}</p>

              <dl className="grid w-full grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 border-t border-black/5 pt-3 text-left text-xs dark:border-white/10">
                {specs.map((spec) => (
                  <div key={spec.label} className="contents">
                    <dt className="font-medium text-zinc-500 dark:text-zinc-400">{spec.label}</dt>
                    <dd className="text-zinc-800 dark:text-zinc-200">{spec.value}</dd>
                  </div>
                ))}
              </dl>

              <a
                href="/resume.pdf"
                download
                className="rounded-md bg-zinc-900 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Download Resume
              </a>
            </div>
          ) : null}

          {tab === "Skills" ? (
            <div className="mx-auto flex w-full max-w-md flex-col gap-3">
              {skillGroups.map((group, groupIndex) => (
                <div key={group.category}>
                  <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                    {group.category}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {group.items.map((item, itemIndex) => (
                      <motion.span
                        key={item}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: groupIndex * 0.05 + itemIndex * 0.02, duration: 0.15 }}
                        whileHover={{ scale: 1.08, y: -1 }}
                        className="cursor-default rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                      >
                        {item}
                      </motion.span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {tab === "Interests" ? (
            <div className="mx-auto flex w-full max-w-md flex-col gap-3">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                What I like building and exploring:
              </p>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {interests.map((interest, i) => (
                  <motion.li
                    key={interest}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.15 }}
                    whileHover={{ scale: 1.02 }}
                    className="rounded-lg border border-black/5 bg-zinc-50 px-3 py-2 text-xs text-zinc-700 dark:border-white/10 dark:bg-zinc-800/60 dark:text-zinc-300"
                  >
                    {interest}
                  </motion.li>
                ))}
              </ul>
              <div className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white dark:bg-white dark:text-zinc-900">
                {profile.freelanceNote}
              </div>
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {quickLookOpen ? (
          <QuickLook name={profile.name} onClose={() => setQuickLookOpen(false)} />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
