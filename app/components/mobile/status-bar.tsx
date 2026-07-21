"use client";

import { BatteryIcon, SignalBarsIcon, WifiIcon } from "../desktop/icons";
import { useShortTime } from "./use-time";

export function StatusBar({ light }: { light?: boolean }) {
  const time = useShortTime();

  return (
    <div
      className={`pointer-events-none flex h-11 w-full items-center justify-between px-7 pt-2 text-sm font-semibold ${
        light ? "text-white" : "text-zinc-900 dark:text-white"
      }`}
    >
      <span className="tabular-nums">{time}</span>
      <span className="flex items-center gap-1.5">
        <SignalBarsIcon className="h-3 w-4.5" />
        <WifiIcon className="h-3 w-4" />
        <BatteryIcon className="h-3 w-6" />
      </span>
    </div>
  );
}
