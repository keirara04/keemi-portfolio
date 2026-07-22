"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// useLayoutEffect runs synchronously before paint (useEffect runs after), so
// the mobile check below resolves before the browser ever paints the
// desktop-only account-login screen on a phone. Falls back to useEffect
// during SSR, where layout effects are unsupported and would just warn.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export type WindowId = string;

export type WindowPosition = { x: number; y: number };
export type WindowSize = { width: number; height: number };

export type WindowConfig = {
  id: WindowId;
  title: string;
  defaultPosition: WindowPosition;
  defaultSize: WindowSize;
  minSize?: WindowSize;
  /** Open centered in the viewport instead of at defaultPosition (desktop only). */
  centered?: boolean;
};

export type WindowState = WindowConfig & {
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  position: WindowPosition;
  size: WindowSize;
  zIndex: number;
  preMaximize?: { position: WindowPosition; size: WindowSize };
};

export type OpenOrigin = { x: number; y: number };

export type WindowManagerContextValue = {
  windows: Record<WindowId, WindowState>;
  isMobile: boolean;
  openWindow: (config: WindowConfig, origin?: OpenOrigin) => void;
  closeWindow: (id: WindowId) => void;
  minimizeWindow: (id: WindowId) => void;
  getOpenOrigin: (id: WindowId) => OpenOrigin | null;
  getDismissAction: (id: WindowId) => "close" | "minimize" | null;
  toggleMaximizeWindow: (id: WindowId) => void;
  focusWindow: (id: WindowId) => void;
  updateWindowPosition: (id: WindowId, position: WindowPosition) => void;
  updateWindowSize: (id: WindowId, size: WindowSize) => void;
  orderedOpenWindows: WindowState[];
};

// Exported so the mobile shell can provide a bridged implementation where
// "open a window" means "switch to that fullscreen app".
export const WindowManagerContext = createContext<WindowManagerContextValue | null>(null);

const BASE_Z_INDEX = 10;
const MOBILE_BREAKPOINT_QUERY = "(max-width: 768px)";
const MENU_BAR_HEIGHT = 32;

function centeredPosition(size: WindowSize): WindowPosition {
  if (typeof window === "undefined") return { x: 80, y: 72 };
  return {
    x: Math.max(20, (window.innerWidth - size.width) / 2),
    y: Math.max(MENU_BAR_HEIGHT + 12, (window.innerHeight - size.height) / 2),
  };
}

export function WindowManagerProvider({ children }: { children: React.ReactNode }) {
  const [windows, setWindows] = useState<Record<WindowId, WindowState>>({});
  const [isMobile, setIsMobile] = useState(false);
  const zCounter = useRef(BASE_Z_INDEX);

  useIsomorphicLayoutEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_BREAKPOINT_QUERY);
    const update = () => setIsMobile(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  const nextZIndex = useCallback(() => {
    zCounter.current += 1;
    return zCounter.current;
  }, []);

  // Where each window was opened from (dock icon, folder icon…) so it can
  // scale out of that point, and how it was dismissed so the exit animation
  // knows whether to fly to the dock (minimize) or fade in place (close).
  const openOrigins = useRef<Record<WindowId, OpenOrigin>>({});
  const dismissActions = useRef<Record<WindowId, "close" | "minimize">>({});

  // Idempotent read (safe in a lazy state initializer under StrictMode);
  // openWindow overwrites or clears the entry on every open instead.
  const getOpenOrigin = useCallback(
    (id: WindowId) => openOrigins.current[id] ?? null,
    []
  );

  const getDismissAction = useCallback(
    (id: WindowId) => dismissActions.current[id] ?? null,
    []
  );

  const openWindow = useCallback(
    (config: WindowConfig, origin?: OpenOrigin) => {
      if (origin) {
        openOrigins.current[config.id] = origin;
      } else {
        delete openOrigins.current[config.id];
      }
      setWindows((prev) => {
        const existing = prev[config.id];
        if (existing) {
          return {
            ...prev,
            [config.id]: {
              ...existing,
              isOpen: true,
              isMinimized: false,
              zIndex: nextZIndex(),
            },
          };
        }
        return {
          ...prev,
          [config.id]: {
            ...config,
            isOpen: true,
            isMinimized: false,
            isMaximized: false,
            position: config.centered ? centeredPosition(config.defaultSize) : config.defaultPosition,
            size: config.defaultSize,
            zIndex: nextZIndex(),
          },
        };
      });
    },
    [nextZIndex]
  );

  const closeWindow = useCallback((id: WindowId) => {
    dismissActions.current[id] = "close";
    setWindows((prev) => {
      if (!prev[id]) return prev;
      return { ...prev, [id]: { ...prev[id], isOpen: false, isMinimized: false } };
    });
  }, []);

  const minimizeWindow = useCallback((id: WindowId) => {
    dismissActions.current[id] = "minimize";
    setWindows((prev) => {
      if (!prev[id]) return prev;
      return { ...prev, [id]: { ...prev[id], isMinimized: true } };
    });
  }, []);

  const toggleMaximizeWindow = useCallback((id: WindowId) => {
    setWindows((prev) => {
      const win = prev[id];
      if (!win) return prev;
      if (win.isMaximized && win.preMaximize) {
        return {
          ...prev,
          [id]: {
            ...win,
            isMaximized: false,
            position: win.preMaximize.position,
            size: win.preMaximize.size,
            preMaximize: undefined,
          },
        };
      }
      return {
        ...prev,
        [id]: {
          ...win,
          isMaximized: true,
          preMaximize: { position: win.position, size: win.size },
        },
      };
    });
  }, []);

  const focusWindow = useCallback(
    (id: WindowId) => {
      setWindows((prev) => {
        if (!prev[id]) return prev;
        return { ...prev, [id]: { ...prev[id], zIndex: nextZIndex() } };
      });
    },
    [nextZIndex]
  );

  const updateWindowPosition = useCallback((id: WindowId, position: WindowPosition) => {
    setWindows((prev) => {
      if (!prev[id]) return prev;
      return { ...prev, [id]: { ...prev[id], position } };
    });
  }, []);

  const updateWindowSize = useCallback((id: WindowId, size: WindowSize) => {
    setWindows((prev) => {
      if (!prev[id]) return prev;
      return { ...prev, [id]: { ...prev[id], size } };
    });
  }, []);

  // Insertion order, NOT z-order: re-sorting by zIndex would physically move DOM
  // nodes when a window is focused on pointerdown, which cancels the in-flight
  // click. Stacking is handled purely by CSS z-index.
  const orderedOpenWindows = useMemo(
    () => Object.values(windows).filter((w) => w.isOpen),
    [windows]
  );

  const value = useMemo(
    () => ({
      windows,
      isMobile,
      openWindow,
      closeWindow,
      minimizeWindow,
      toggleMaximizeWindow,
      focusWindow,
      updateWindowPosition,
      updateWindowSize,
      orderedOpenWindows,
      getOpenOrigin,
      getDismissAction,
    }),
    [
      windows,
      isMobile,
      openWindow,
      closeWindow,
      minimizeWindow,
      toggleMaximizeWindow,
      focusWindow,
      updateWindowPosition,
      updateWindowSize,
      orderedOpenWindows,
      getOpenOrigin,
      getDismissAction,
    ]
  );

  return (
    <WindowManagerContext.Provider value={value}>{children}</WindowManagerContext.Provider>
  );
}

export function useWindowManager() {
  const ctx = useContext(WindowManagerContext);
  if (!ctx) {
    throw new Error("useWindowManager must be used within a WindowManagerProvider");
  }
  return ctx;
}
