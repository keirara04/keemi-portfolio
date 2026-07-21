"use client";

import { useSyncExternalStore } from "react";

function subscribeToClock(callback: () => void) {
  const interval = setInterval(callback, 1000 * 30);
  return () => clearInterval(interval);
}

// e.g. "1:53"
export function useShortTime() {
  return useSyncExternalStore(
    subscribeToClock,
    () =>
      new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).replace(/\s?[AP]M/i, ""),
    () => ""
  );
}

// e.g. "Tuesday, July 22"
export function useLongDate() {
  return useSyncExternalStore(
    subscribeToClock,
    () => new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" }),
    () => ""
  );
}
