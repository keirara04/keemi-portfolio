"use client";

import { useRef, useSyncExternalStore } from "react";
import { profile } from "@/lib/content";
import {
  ABOUT_WINDOW_ID,
  CONTACT_WINDOW_ID,
  PROJECTS_WINDOW_ID,
  QUOTE_WINDOW_ID,
  windowConfigById,
} from "./window-registry";
import { useWindowManager } from "./window-manager-context";
import { AppleLogo, BatteryIcon, ControlCenterIcon, MagnifierIcon, WifiIcon } from "./icons";
import { showToast } from "./toast-host";

const APPLE_CLICK_TARGET = 5;
const APPLE_CLICK_WINDOW_MS = 2500;

// e.g. "Tue Jul 22  12:41 AM" — matches the macOS menu bar clock
function formatMenuBarClock() {
  const now = new Date();
  const date = now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  const time = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return `${date}  ${time}`;
}

function subscribeToClock(callback: () => void) {
  const interval = setInterval(callback, 1000 * 30);
  return () => clearInterval(interval);
}

function useClock() {
  return useSyncExternalStore(subscribeToClock, formatMenuBarClock, () => "");
}

export function MenuBar({
  onSpotlight,
  onControlCenter,
}: {
  onSpotlight?: () => void;
  onControlCenter?: () => void;
}) {
  const time = useClock();
  const { openWindow } = useWindowManager();
  const appleClicks = useRef<number[]>([]);

  const handleAppleClick = () => {
    const now = Date.now();
    appleClicks.current = [...appleClicks.current, now].filter(
      (t) => now - t < APPLE_CLICK_WINDOW_MS
    );
    if (appleClicks.current.length >= APPLE_CLICK_TARGET) {
      appleClicks.current = [];
      showToast("🍎 You found a secret. Nothing here — just a friendly hello.");
    }
  };

  const goTo = (id: string, e?: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e?.currentTarget.getBoundingClientRect();
    openWindow(
      windowConfigById[id],
      rect ? { x: rect.x + rect.width / 2, y: rect.y + rect.height } : undefined
    );
  };

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex h-8 items-center gap-4 bg-white/60 px-4 text-[13px] text-black shadow-[0_1px_0_rgba(0,0,0,0.08)] backdrop-blur-2xl dark:bg-black/40 dark:text-white">
      <button
        onClick={handleAppleClick}
        aria-label="Apple menu"
        className="shrink-0 rounded p-0.5 transition hover:bg-black/10 dark:hover:bg-white/15"
      >
        <AppleLogo className="h-4 w-4" />
      </button>
      <span className="font-bold">{profile.shortName}</span>

      <nav className="hidden items-center gap-4 sm:flex">
        <button
          onClick={(e) => goTo(ABOUT_WINDOW_ID, e)}
          className="rounded px-1.5 py-0.5 transition hover:bg-black/10 dark:hover:bg-white/15"
        >
          About
        </button>
        <button
          onClick={(e) => goTo(PROJECTS_WINDOW_ID, e)}
          className="rounded px-1.5 py-0.5 transition hover:bg-black/10 dark:hover:bg-white/15"
        >
          Projects
        </button>
        <button
          onClick={(e) => goTo(CONTACT_WINDOW_ID, e)}
          className="rounded px-1.5 py-0.5 transition hover:bg-black/10 dark:hover:bg-white/15"
        >
          Contact
        </button>
      </nav>

      <div className="ml-auto flex items-center gap-3.5">
        <button
          onClick={(e) => goTo(QUOTE_WINDOW_ID, e)}
          className="hidden rounded-full bg-black px-3 py-0.5 text-xs font-semibold text-white transition hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200 sm:inline-block"
        >
          Reach Out
        </button>
        {onControlCenter ? (
          <button
            aria-label="Control Center"
            onClick={onControlCenter}
            className="hidden rounded p-0.5 transition hover:bg-black/10 dark:hover:bg-white/15 sm:block"
          >
            <ControlCenterIcon className="h-3.5 w-3.5" />
          </button>
        ) : null}
        {onSpotlight ? (
          <button
            aria-label="Spotlight search"
            onClick={onSpotlight}
            className="hidden rounded p-0.5 transition hover:bg-black/10 dark:hover:bg-white/15 sm:block"
          >
            <MagnifierIcon className="h-3.5 w-3.5" />
          </button>
        ) : null}
        <span className="hidden sm:block">
          <WifiIcon className="h-[11px] w-[15px] opacity-90" />
        </span>
        <span className="hidden sm:block">
          <BatteryIcon className="h-[11px] w-[22px] opacity-90" />
        </span>
        <span className="tabular-nums">{time}</span>
      </div>
    </div>
  );
}
