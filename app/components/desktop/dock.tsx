"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useContent } from "@/lib/content-repo";
import { dockApps, windowConfigById } from "./window-registry";
import { useWindowManager } from "./window-manager-context";
import {
  AboutAppIcon,
  FinderFaceIcon,
  GitHubIcon,
  InvoiceAppIcon,
  LinkedInIcon,
  MailAppIcon,
  MinesweeperAppIcon,
  NotesAppIcon,
  QuoteAppIcon,
  TerminalAppIcon,
} from "./icons";

const BASE_SIZE = 48;
const MAX_SIZE = 76;
const MAGNIFY_RADIUS = 140;

function DockAppIcon({ windowId }: { windowId: string }) {
  if (windowId === "about") {
    return <AboutAppIcon className="h-full w-full" />;
  }
  if (windowId === "projects") {
    return <FinderFaceIcon className="h-full w-full" />;
  }
  if (windowId === "terminal") {
    return <TerminalAppIcon className="h-full w-full" />;
  }
  if (windowId === "notes") {
    return <NotesAppIcon className="h-full w-full" />;
  }
  if (windowId === "minesweeper") {
    return <MinesweeperAppIcon className="h-full w-full" />;
  }
  if (windowId === "quote") {
    return <QuoteAppIcon className="h-full w-full" />;
  }
  if (windowId === "contact") {
    return <MailAppIcon className="h-full w-full" />;
  }
  if (windowId === "invoice") {
    return <InvoiceAppIcon className="h-full w-full" />;
  }
  return null;
}

function DockItem({
  mouseX,
  label,
  dockId,
  isActive,
  onClick,
  children,
}: {
  mouseX: MotionValue<number>;
  label: string;
  dockId?: string;
  isActive?: boolean;
  onClick: (origin: { x: number; y: number }) => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  const distance = useTransform(mouseX, (x) => {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return MAGNIFY_RADIUS;
    return x - bounds.x - bounds.width / 2;
  });

  const sizeTarget = useTransform(
    distance,
    [-MAGNIFY_RADIUS, 0, MAGNIFY_RADIUS],
    [BASE_SIZE, MAX_SIZE, BASE_SIZE]
  );
  const size = useSpring(sizeTarget, { mass: 0.1, stiffness: 170, damping: 14 });

  return (
    <motion.button
      ref={ref}
      aria-label={label}
      data-dock-app={dockId}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        onClick({ x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 });
      }}
      whileTap={{ scale: 0.9 }}
      style={{ width: size, height: size }}
      className="group relative flex shrink-0 items-end justify-center"
    >
      <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-black/10 bg-zinc-100/90 px-2 py-0.5 text-xs text-zinc-800 opacity-0 shadow backdrop-blur transition-opacity group-hover:opacity-100 dark:border-white/10 dark:bg-zinc-800/90 dark:text-zinc-100">
        {label}
      </span>
      <span className="flex h-full w-full items-center justify-center drop-shadow-md">
        {children}
      </span>
      {isActive ? (
        <span className="absolute -bottom-1.5 h-1 w-1 rounded-full bg-zinc-800/80 dark:bg-white/80" />
      ) : null}
    </motion.button>
  );
}

export function Dock() {
  const { profile } = useContent();
  const { windows, openWindow, isMobile } = useWindowManager();
  const mouseX = useMotionValue(Infinity);

  if (isMobile) return null;

  return (
    <div className="fixed inset-x-0 bottom-2 z-50 flex justify-center">
      <motion.div
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="flex h-16 items-end gap-2.5 rounded-2xl border border-white/30 bg-white/40 px-3 pb-2 shadow-2xl shadow-black/20 backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-900/40"
      >
        {dockApps.map((app) => {
          const win = windows[app.windowId];
          const isOpen = Boolean(win?.isOpen);
          return (
            <DockItem
              key={app.windowId}
              mouseX={mouseX}
              label={app.label}
              dockId={app.windowId}
              isActive={isOpen && !win?.isMinimized}
              // openWindow already restores/focuses an existing window (minimized or not)
              onClick={(origin) => openWindow(windowConfigById[app.windowId], origin)}
            >
              <DockAppIcon windowId={app.windowId} />
            </DockItem>
          );
        })}

        <div className="mx-1 h-10 w-px self-center bg-black/15 dark:bg-white/15" aria-hidden />

        <DockItem
          mouseX={mouseX}
          label="GitHub"
          onClick={() => window.open(profile.links.github, "_blank", "noopener,noreferrer")}
        >
          <span className="flex h-full w-full items-center justify-center rounded-[22%] bg-linear-to-br from-zinc-700 to-zinc-950 shadow-inner shadow-white/10">
            <GitHubIcon className="h-3/5 w-3/5 text-white" />
          </span>
        </DockItem>

        <DockItem
          mouseX={mouseX}
          label="LinkedIn"
          onClick={() => window.open(profile.links.linkedin, "_blank", "noopener,noreferrer")}
        >
          <span className="flex h-full w-full items-center justify-center rounded-[22%] bg-linear-to-br from-sky-600 to-blue-800 shadow-inner shadow-white/10">
            <LinkedInIcon className="h-3/5 w-3/5 text-white" />
          </span>
        </DockItem>
      </motion.div>
    </div>
  );
}
