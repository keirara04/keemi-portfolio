"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

const TOAST_EVENT = "keemi:toast";
const TOAST_DURATION = 3200;

export function showToast(message: string) {
  window.dispatchEvent(new CustomEvent<{ message: string }>(TOAST_EVENT, { detail: { message } }));
}

export function ToastHost() {
  const [toast, setToast] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onToast = (e: Event) => {
      const detail = (e as CustomEvent<{ message: string }>).detail;
      setToast(detail.message);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setToast(null), TOAST_DURATION);
    };
    window.addEventListener(TOAST_EVENT, onToast);
    return () => {
      window.removeEventListener(TOAST_EVENT, onToast);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-12 z-90 flex justify-center">
      <AnimatePresence>
        {toast ? (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="rounded-full border border-white/20 bg-zinc-900/90 px-4 py-2 text-sm font-medium text-white shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/90 dark:text-zinc-900"
          >
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
