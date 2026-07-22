"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { AppleLogo, AboutAppIcon } from "./icons";

export function AccountLoginScreen({ onSelect }: { onSelect: () => void }) {
  const [selecting, setSelecting] = useState(false);

  return (
    <motion.div
      className="fixed inset-0 z-100 flex flex-col items-center justify-center gap-10 overflow-hidden bg-zinc-950"
      animate={{ opacity: selecting ? 0 : 1 }}
      transition={{ duration: 0.35 }}
      onAnimationComplete={() => {
        if (selecting) onSelect();
      }}
    >
      <Image
        src="/portfolio-homebackground.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="scale-110 object-cover opacity-40 blur-2xl"
      />
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative flex flex-col items-center gap-10">
        <div className="flex items-center gap-2 text-white/70">
          <AppleLogo className="h-5 w-5" />
          <span className="text-sm font-medium">Keemi OS</span>
        </div>

        <button
          onClick={() => setSelecting(true)}
          className="group flex flex-col items-center gap-3"
        >
          <span className="h-24 w-24 overflow-hidden rounded-full shadow-2xl ring-4 ring-white/10 transition group-hover:ring-white/30">
            <AboutAppIcon className="h-full w-full" />
          </span>
          <span className="text-lg font-semibold text-white">Customer</span>
          <span className="text-xs text-white/50">No password needed. Just click to continue</span>
        </button>
      </div>
    </motion.div>
  );
}
