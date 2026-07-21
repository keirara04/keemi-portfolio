"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { AppleLogo } from "./icons";

export function BootScreen({ onFinish }: { onFinish: () => void }) {
  const [leaving, setLeaving] = useState(false);

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
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
          onAnimationComplete={() => setLeaving(true)}
        />
      </div>
    </motion.div>
  );
}
