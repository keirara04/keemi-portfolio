"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { AppleLogo } from "./icons";
import { PRELOAD_IMAGE_URLS, preloadImages } from "@/lib/preload-images";

// Floor so the boot screen never flashes instantly, even when every image is
// already browser-cached (e.g. a second boot within the same session).
const MIN_BOOT_MS = 1200;

export function BootScreen({ onFinish }: { onFinish: () => void }) {
  const [leaving, setLeaving] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const minDelay = new Promise<void>((resolve) => setTimeout(resolve, MIN_BOOT_MS));
    const loaded = preloadImages(PRELOAD_IMAGE_URLS, (loadedCount, total) => {
      if (!cancelled) setProgress(Math.round((loadedCount / total) * 100));
    });

    Promise.all([minDelay, loaded]).then(() => {
      if (cancelled) return;
      setProgress(100);
      setLeaving(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-100 flex flex-col items-center justify-center gap-10 bg-black"
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={{ duration: 0.4 }}
      onAnimationComplete={() => {
        if (leaving) onFinish();
      }}
    >
      <AppleLogo className="h-20 w-20 text-white" />
      <div className="h-1.5 w-44 overflow-hidden rounded-full bg-zinc-800">
        <motion.div
          className="h-full rounded-full bg-white"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}
