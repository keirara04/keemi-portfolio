"use client";

import { AnimatePresence, motion } from "motion/react";

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <motion.circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="42 100"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "center" }}
        opacity={0.9}
      />
    </svg>
  );
}

function ActionButton({
  isBusy,
  disabled,
  onClick,
  idleLabel,
  busyLabel,
  className,
}: {
  isBusy: boolean;
  disabled?: boolean;
  onClick: () => void;
  idleLabel: string;
  busyLabel: string;
  className: string;
}) {
  return (
    <motion.button
      type="button"
      disabled={isBusy || disabled}
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      animate={isBusy ? { scale: [1, 1.015, 1] } : { scale: 1 }}
      transition={isBusy ? { duration: 1.1, repeat: Infinity, ease: "easeInOut" } : { duration: 0.15 }}
      className={`flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-md px-4 py-2.5 text-sm font-semibold shadow-sm transition disabled:cursor-wait disabled:opacity-70 ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isBusy ? (
          <motion.span
            key="busy"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2"
          >
            <Spinner />
            {busyLabel}
          </motion.span>
        ) : (
          <motion.span
            key="idle"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {idleLabel}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export function GenerateActions({
  isPreviewing,
  isGenerating,
  onPreview,
  onGenerate,
  solidColorClass,
  outlineColorClass,
}: {
  isPreviewing: boolean;
  isGenerating: boolean;
  onPreview: () => void;
  onGenerate: () => void;
  solidColorClass: string;
  outlineColorClass: string;
}) {
  const busy = isPreviewing || isGenerating;

  return (
    <div className="sticky bottom-0 flex gap-2 bg-inherit pt-1">
      <ActionButton
        isBusy={isPreviewing}
        disabled={busy && !isPreviewing}
        onClick={onPreview}
        idleLabel="Preview"
        busyLabel="Loading…"
        className={outlineColorClass}
      />
      <ActionButton
        isBusy={isGenerating}
        disabled={busy && !isGenerating}
        onClick={onGenerate}
        idleLabel="Generate PDF"
        busyLabel="Generating…"
        className={`text-white ${solidColorClass}`}
      />
    </div>
  );
}
