"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useContent } from "@/lib/content-repo";
import { StatusBar } from "./status-bar";
import { useLongDate, useShortTime } from "./use-time";

export function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const { profile } = useContent();
  const time = useShortTime();
  const date = useLongDate();

  return (
    <motion.div
      className="absolute inset-0 z-60 flex flex-col"
      exit={{ y: "-100%", opacity: 0.6 }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0.4, bottom: 0 }}
      onDragEnd={(_, info) => {
        if (info.offset.y < -60 || info.velocity.y < -400) onUnlock();
      }}
      onClick={onUnlock}
      role="button"
      aria-label="Unlock"
    >
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" />

      <div className="relative flex flex-1 flex-col items-center">
        <StatusBar light />

        <div className="mt-10 text-center text-white">
          <p className="text-sm font-medium opacity-90">{date}</p>
          <p className="text-[76px] font-semibold leading-none tracking-tight tabular-nums [text-shadow:0_2px_16px_rgba(0,0,0,0.25)]">
            {time}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.3 }}
          className="mx-6 mt-10 flex w-[calc(100%-3rem)] items-center gap-3 rounded-2xl bg-white/80 p-3 shadow-lg backdrop-blur-xl dark:bg-zinc-800/80"
        >
          <Image
            src="https://keemi-spaces-1.sgp1.cdn.digitaloceanspaces.com/images/portfolio-profile.jpg"
            alt=""
            width={38}
            height={38}
            className="h-9.5 w-9.5 rounded-lg object-cover"
          />
          <div className="min-w-0 flex-1 text-left">
            <p className="text-[13px] font-semibold text-zinc-900 dark:text-white">
              {profile.name}
            </p>
            <p className="truncate text-xs text-zinc-600 dark:text-zinc-300">
              Open for freelance work — tap to explore the portfolio
            </p>
          </div>
        </motion.div>

        <div className="mt-auto flex flex-col items-center gap-2 pb-4 text-white">
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-xs font-medium"
          >
            Swipe up to open
          </motion.p>
          <span className="h-1 w-32 rounded-full bg-white/90" />
        </div>
      </div>
    </motion.div>
  );
}
