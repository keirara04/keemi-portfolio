"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "motion/react";
import { WindowManagerProvider, useWindowManager } from "./window-manager-context";
import {
  aboutWindowConfig,
  projectWindowConfig,
  projectWindowId,
  projectsWindowConfig,
  terminalWindowConfig,
  windowConfigById,
} from "./window-registry";
import { MenuBar } from "./menu-bar";
import { Dock } from "./dock";
import { Window } from "./window";
import { BootScreen } from "./boot-screen";
import { ControlCenter, useTheme } from "./control-center";
import { WindowErrorBoundary } from "./window-error-boundary";
import { WindowContentFor } from "./window-content";
import { FolderIcon } from "./icons";
import { IPhone } from "../mobile/iphone";
import { projects } from "@/lib/content";

// Split rarely-opened surfaces out of the initial bundle; they load on demand.
const Spotlight = dynamic(() => import("./spotlight").then((m) => m.Spotlight), {
  ssr: false,
});

const wallpapers = [
  { kind: "image" as const },
  { kind: "css" as const, className: "bg-linear-to-br from-indigo-950 via-purple-900 to-rose-800" },
  { kind: "css" as const, className: "bg-linear-to-br from-sky-300 via-cyan-500 to-blue-900" },
];

function DesktopProjectIcons() {
  const { openWindow, focusWindow, windows, isMobile } = useWindowManager();

  if (isMobile) return null;

  return (
    // z-5 keeps icons above <main>'s backdrop but below windows (z 11+)
    <div className="absolute right-5 top-12 z-5 flex flex-col gap-5">
      {projects.map((project, index) => {
        const winId = projectWindowId(project.id);
        return (
          <button
            key={project.id}
            onDoubleClick={(e) => {
              const win = windows[winId];
              if (win?.isOpen && !win.isMinimized) {
                focusWindow(winId);
                return;
              }
              const rect = e.currentTarget.getBoundingClientRect();
              openWindow(projectWindowConfig(project.id, index), {
                x: rect.x + rect.width / 2,
                y: rect.y + rect.height / 2,
              });
            }}
            className="group flex w-24 flex-col items-center gap-1 rounded-lg p-2 focus:outline-none"
            title={`Double-click to open ${project.name}`}
          >
            <FolderIcon className="h-12 w-14 drop-shadow-lg transition group-hover:scale-105 group-focus:scale-105" />
            <span className="rounded px-1 text-center text-xs font-medium leading-tight text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.6)] group-focus:bg-sky-600/80">
              {project.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ContextMenu({
  position,
  onClose,
  onChangeWallpaper,
}: {
  position: { x: number; y: number };
  onClose: () => void;
  onChangeWallpaper: () => void;
}) {
  const { openWindow } = useWindowManager();

  const items = [
    {
      label: "New Terminal",
      action: () => openWindow(terminalWindowConfig),
    },
    {
      label: "Change Wallpaper",
      action: onChangeWallpaper,
    },
    {
      label: "About This Site",
      action: () => openWindow(aboutWindowConfig),
    },
    {
      label: "Hire Me",
      action: () => openWindow(windowConfigById.contact),
    },
  ];

  return (
    <div
      className="fixed inset-0 z-80"
      onClick={onClose}
      onContextMenu={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div
        className="absolute w-52 rounded-lg border border-white/30 bg-zinc-100/90 py-1 text-[13px] shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-800/90"
        style={{ left: position.x, top: position.y }}
        onClick={(e) => e.stopPropagation()}
        role="menu"
      >
        {items.map((item) => (
          <button
            key={item.label}
            role="menuitem"
            onClick={() => {
              item.action();
              onClose();
            }}
            className="block w-full px-3 py-1 text-left text-zinc-800 transition hover:bg-sky-600 hover:text-white dark:text-zinc-100"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const subscribeNoop = () => () => {};

function DesktopSurface() {
  const { orderedOpenWindows, openWindow, isMobile } = useWindowManager();
  const hasBooted = useRef(false);
  // Server snapshot says "not booted" so the boot overlay is in the SSR HTML;
  // returning visitors flip to done right after hydration.
  const alreadyBooted = useSyncExternalStore(
    subscribeNoop,
    () => sessionStorage.getItem("keemi-booted") === "1",
    () => false
  );
  const [bootFinished, setBootFinished] = useState(false);
  const bootDone = alreadyBooted || bootFinished;
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [controlCenterOpen, setControlCenterOpen] = useState(false);
  const [wallpaperIndex, setWallpaperIndex] = useState(0);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const { mode: themeMode, setMode: setThemeMode } = useTheme();

  useEffect(() => {
    // Mobile gets the iPhone shell instead of auto-opened windows
    if (!bootDone || isMobile || hasBooted.current) return;
    hasBooted.current = true;
    openWindow(aboutWindowConfig);
    const timer = setTimeout(() => openWindow(projectsWindowConfig), 200);
    return () => clearTimeout(timer);
  }, [bootDone, isMobile, openWindow]);

  useEffect(() => {
    if (isMobile) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSpotlightOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMobile]);

  const handleBootFinish = useCallback(() => {
    sessionStorage.setItem("keemi-booted", "1");
    setBootFinished(true);
  }, []);

  const wallpaper = wallpapers[wallpaperIndex];
  const visibleWindows = orderedOpenWindows.filter((w) => !w.isMinimized);

  return (
    <div
      className="relative min-h-dvh overflow-hidden"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
      }}
      onContextMenu={(e) => {
        if (isMobile) return;
        // Only hijack right-click on the bare desktop, not inside windows/dock
        if ((e.target as HTMLElement).closest('[role="dialog"], [role="menu"], nav, button, a, input')) {
          return;
        }
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY });
      }}
    >
      {/* Crossfade between wallpapers; the one-time scale settle after a fresh
          boot makes the desktop feel like it "arrives" */}
      <motion.div
        className="absolute inset-0"
        initial={bootFinished ? { scale: 1.07 } : false}
        animate={{ scale: 1 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <AnimatePresence>
          <motion.div
            key={wallpaperIndex}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
          >
            {wallpaper.kind === "image" ? (
              <>
                <Image
                  src="/portfolio-homebackground.jpg"
                  alt=""
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/10 dark:bg-black/40" />
              </>
            ) : (
              <div className={`absolute inset-0 ${wallpaper.className}`} />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {isMobile ? (
        bootDone ? <IPhone /> : null
      ) : (
        <>
          <MenuBar
            onSpotlight={() => setSpotlightOpen(true)}
            onControlCenter={() => setControlCenterOpen((open) => !open)}
          />

          <DesktopProjectIcons />

          <main className="relative min-h-dvh pt-10 pb-24">
            <AnimatePresence>
              {visibleWindows.map((win) => (
                <Window key={win.id} window={win}>
                  <WindowErrorBoundary>
                    <WindowContentFor id={win.id} />
                  </WindowErrorBoundary>
                </Window>
              ))}
            </AnimatePresence>
          </main>

          <Dock />

          {spotlightOpen ? <Spotlight onClose={() => setSpotlightOpen(false)} /> : null}

          {controlCenterOpen ? (
            <ControlCenter
              themeMode={themeMode}
              onThemeChange={setThemeMode}
              wallpaperIndex={wallpaperIndex}
              wallpaperCount={wallpapers.length}
              onWallpaperChange={setWallpaperIndex}
              onClose={() => setControlCenterOpen(false)}
            />
          ) : null}

          {contextMenu ? (
            <ContextMenu
              position={contextMenu}
              onClose={() => setContextMenu(null)}
              onChangeWallpaper={() => setWallpaperIndex((i) => (i + 1) % wallpapers.length)}
            />
          ) : null}
        </>
      )}

      {!bootDone ? <BootScreen onFinish={handleBootFinish} /> : null}
    </div>
  );
}

export function Desktop() {
  return (
    <WindowManagerProvider>
      <DesktopSurface />
    </WindowManagerProvider>
  );
}
