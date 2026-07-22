"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { profile } from "@/lib/content";
import { useLongDate, useShortTime } from "../mobile/use-time";

const IDLE_MS = 2 * 60 * 1000;

// Fades to a drifting-clock screensaver after two idle minutes (or when the
// terminal's `screensaver` command fires the custom event); any input wakes it.
export function Screensaver() {
  const [active, setActive] = useState(false);
  const time = useShortTime();
  const date = useLongDate();

  useEffect(() => {
    let timer = setTimeout(() => setActive(true), IDLE_MS);
    // Grace period so the keystroke/click that triggered the terminal command
    // doesn't bubble up and instantly wake the screensaver it just started.
    let shownAt = 0;
    // pointermove fires dozens of times a second; throttle so it doesn't
    // churn clearTimeout/setTimeout on every pixel of mouse movement.
    let lastReset = 0;
    const RESET_THROTTLE_MS = 1000;
    const reset = () => {
      const now = Date.now();
      if (now - shownAt < 600) return;
      if (now - lastReset < RESET_THROTTLE_MS) return;
      lastReset = now;
      clearTimeout(timer);
      setActive(false);
      timer = setTimeout(() => setActive(true), IDLE_MS);
    };
    const show = () => {
      shownAt = Date.now();
      setActive(true);
    };

    const events = ["pointermove", "pointerdown", "keydown", "wheel", "touchstart"] as const;
    for (const event of events) window.addEventListener(event, reset, { passive: true });
    window.addEventListener("keemi:screensaver", show);
    return () => {
      clearTimeout(timer);
      for (const event of events) window.removeEventListener(event, reset);
      window.removeEventListener("keemi:screensaver", show);
    };
  }, []);

  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-96 flex items-center justify-center bg-black"
          aria-label="Screensaver"
        >
          <motion.div
            animate={{ x: [0, 40, -30, 15, 0], y: [0, -25, 20, -12, 0] }}
            transition={{ duration: 60, repeat: Infinity, ease: "easeInOut" }}
            className="text-center text-white"
          >
            <p className="text-7xl font-semibold tabular-nums">{time}</p>
            <p className="mt-2 text-sm text-white/60">{date}</p>
            <p className="mt-8 text-xs uppercase tracking-[0.3em] text-white/40">
              {profile.name} — portfolio
            </p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
