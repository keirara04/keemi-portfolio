"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { useWindowManager, type WindowState } from "./window-manager-context";

const DESKTOP_TOP_INSET = 32; // menu bar height
const DESKTOP_BOTTOM_INSET = 96; // dock clearance

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function TrafficLight({
  color,
  glyph,
  label,
  isActive,
  onClick,
  onPointerDown,
}: {
  color: string;
  glyph: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
  onPointerDown: (e: React.PointerEvent) => void;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      onPointerDown={onPointerDown}
      className={`relative flex h-3 w-3 items-center justify-center rounded-full border transition ${
        isActive
          ? `${color} border-black/10`
          : "border-black/10 bg-zinc-300 dark:bg-zinc-600"
      }`}
    >
      <span className="text-[9px] font-bold leading-none text-black/60 opacity-0 transition-opacity group-hover/lights:opacity-100">
        {glyph}
      </span>
    </button>
  );
}

export function Window({ window: win, children }: { window: WindowState; children: React.ReactNode }) {
  const {
    windows,
    isMobile,
    closeWindow,
    minimizeWindow,
    toggleMaximizeWindow,
    focusWindow,
    updateWindowPosition,
    updateWindowSize,
    getOpenOrigin,
    getDismissAction,
  } = useWindowManager();

  const isActive = useMemo(() => {
    const openZs = Object.values(windows)
      .filter((w) => w.isOpen && !w.isMinimized)
      .map((w) => w.zIndex);
    return win.zIndex === Math.max(...openZs);
  }, [windows, win.zIndex]);

  // Captured once on mount: where this window was opened from (dock icon,
  // folder icon…). Drives the scale-out-of-the-source entrance.
  const [entranceOrigin] = useState(() => getOpenOrigin(win.id));

  const dragState = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(
    null
  );
  const resizeState = useRef<{ startX: number; startY: number; originW: number; originH: number } | null>(
    null
  );

  const handleTitlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (isMobile || win.isMaximized) return;
      focusWindow(win.id);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      dragState.current = {
        startX: e.clientX,
        startY: e.clientY,
        originX: win.position.x,
        originY: win.position.y,
      };
    },
    [isMobile, win.isMaximized, win.id, win.position, focusWindow]
  );

  const handleTitlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragState.current) return;
      const dx = e.clientX - dragState.current.startX;
      const dy = e.clientY - dragState.current.startY;
      const viewportW = typeof window !== "undefined" ? window.innerWidth : 1280;
      const viewportH = typeof window !== "undefined" ? window.innerHeight : 800;
      const nextX = clamp(dragState.current.originX + dx, -win.size.width + 120, viewportW - 120);
      const nextY = clamp(
        dragState.current.originY + dy,
        DESKTOP_TOP_INSET,
        viewportH - DESKTOP_BOTTOM_INSET
      );
      updateWindowPosition(win.id, { x: nextX, y: nextY });
    },
    [win.id, win.size.width, updateWindowPosition]
  );

  const handleTitlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    dragState.current = null;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }, []);

  const handleResizePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (isMobile || win.isMaximized) return;
      e.stopPropagation();
      focusWindow(win.id);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      resizeState.current = {
        startX: e.clientX,
        startY: e.clientY,
        originW: win.size.width,
        originH: win.size.height,
      };
    },
    [isMobile, win.isMaximized, win.id, win.size, focusWindow]
  );

  const handleResizePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!resizeState.current) return;
      const dx = e.clientX - resizeState.current.startX;
      const dy = e.clientY - resizeState.current.startY;
      const nextW = clamp(resizeState.current.originW + dx, win.minSize?.width ?? 280, 900);
      const nextH = clamp(resizeState.current.originH + dy, win.minSize?.height ?? 220, 800);
      updateWindowSize(win.id, { width: nextW, height: nextH });
    },
    [win.id, win.minSize, updateWindowSize]
  );

  const handleResizePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    resizeState.current = null;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }, []);

  // Raise the window like real macOS does, without starting a title-bar drag
  const handleControlPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    focusWindow(win.id);
  };

  const desktopStyle: React.CSSProperties = win.isMaximized
    ? {
        left: 8,
        top: DESKTOP_TOP_INSET + 8,
        width: `calc(100vw - 16px)`,
        height: `calc(100vh - ${DESKTOP_TOP_INSET + DESKTOP_BOTTOM_INSET}px)`,
        zIndex: win.zIndex,
      }
    : {
        left: win.position.x,
        top: win.position.y,
        width: win.size.width,
        height: win.size.height,
        zIndex: win.zIndex,
      };

  const windowCenter = () => {
    if (isMobile) return null;
    if (win.isMaximized) {
      return { x: globalThis.innerWidth / 2, y: globalThis.innerHeight / 2 };
    }
    return {
      x: win.position.x + win.size.width / 2,
      y: win.position.y + win.size.height / 2,
    };
  };

  // Minimize flies into the matching dock icon; close fades in place.
  const exitVariant = () => {
    const center = windowCenter();
    if (center && getDismissAction(win.id) === "minimize") {
      const iconId = win.id.startsWith("project-") ? "projects" : win.id;
      const icon = document.querySelector(`[data-dock-app="${iconId}"]`);
      if (icon) {
        const rect = icon.getBoundingClientRect();
        return {
          x: rect.x + rect.width / 2 - center.x,
          y: rect.y + rect.height / 2 - center.y,
          scale: 0.05,
          opacity: 0,
          transition: { duration: 0.32, ease: [0.32, 0.72, 0, 1] as const },
        };
      }
    }
    return { opacity: 0, scale: 0.9, transition: { duration: 0.15 } };
  };

  const center = windowCenter();
  const entrance =
    center && entranceOrigin
      ? {
          x: entranceOrigin.x - center.x,
          y: entranceOrigin.y - center.y,
          scale: 0.08,
          opacity: 0.4,
        }
      : { opacity: 0, scale: 0.96, x: 0, y: 8 };

  return (
    <motion.div
      role="dialog"
      aria-label={win.title}
      initial={entrance}
      animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
      variants={{ exit: exitVariant }}
      exit="exit"
      transition={{ duration: 0.26, ease: [0.32, 0.72, 0, 1] }}
      onPointerDown={() => focusWindow(win.id)}
      className={
        isMobile
          ? "relative mb-6 w-full overflow-hidden rounded-xl border border-black/10 bg-white/95 shadow-lg backdrop-blur dark:border-white/10 dark:bg-zinc-900/95"
          : `absolute overflow-hidden rounded-xl border shadow-2xl backdrop-blur-xl ${
              isActive
                ? "border-black/15 bg-white/97 shadow-black/25 dark:border-white/15 dark:bg-zinc-900/97"
                : "border-black/10 bg-white/95 shadow-black/10 dark:border-white/10 dark:bg-zinc-900/95"
            }`
      }
      style={isMobile ? undefined : desktopStyle}
    >
      <div
        className={`flex h-8 shrink-0 items-center gap-2 border-b px-3 ${
          isActive
            ? "border-black/10 bg-linear-to-b from-zinc-50 to-zinc-200/90 dark:border-white/10 dark:from-zinc-700 dark:to-zinc-800"
            : "border-black/5 bg-zinc-100/70 dark:border-white/5 dark:bg-zinc-800/70"
        }`}
        style={{ touchAction: "none", cursor: isMobile ? "default" : "grab" }}
        onPointerDown={handleTitlePointerDown}
        onPointerMove={handleTitlePointerMove}
        onPointerUp={handleTitlePointerUp}
        onDoubleClick={() => !isMobile && toggleMaximizeWindow(win.id)}
      >
        <div className="group/lights flex items-center gap-2">
          <TrafficLight
            color="bg-[#ff5f57]"
            glyph="×"
            label={`Close ${win.title}`}
            isActive={isActive}
            onClick={() => closeWindow(win.id)}
            onPointerDown={handleControlPointerDown}
          />
          <TrafficLight
            color="bg-[#febc2e]"
            glyph="−"
            label={`Minimize ${win.title}`}
            isActive={isActive}
            onClick={() => minimizeWindow(win.id)}
            onPointerDown={handleControlPointerDown}
          />
          <TrafficLight
            color="bg-[#28c840]"
            glyph="+"
            label={`Zoom ${win.title}`}
            isActive={isActive}
            onClick={() => toggleMaximizeWindow(win.id)}
            onPointerDown={handleControlPointerDown}
          />
        </div>
        <p
          className={`pointer-events-none flex-1 select-none truncate text-center text-[13px] font-semibold ${
            isActive ? "text-zinc-700 dark:text-zinc-200" : "text-zinc-400 dark:text-zinc-500"
          }`}
        >
          {win.title}
        </p>
        <div className="w-13" aria-hidden />
      </div>

      <div className="h-[calc(100%-2rem)] overflow-y-auto p-4">{children}</div>

      {!isMobile && !win.isMaximized ? (
        <div
          role="presentation"
          aria-hidden
          onPointerDown={handleResizePointerDown}
          onPointerMove={handleResizePointerMove}
          onPointerUp={handleResizePointerUp}
          className="absolute bottom-0 right-0 h-4 w-4 cursor-nwse-resize"
          style={{ touchAction: "none" }}
        />
      ) : null}
    </motion.div>
  );
}
