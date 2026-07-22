"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import {
  WindowManagerContext,
  type OpenOrigin,
  type WindowConfig,
  type WindowManagerContextValue,
  type WindowState,
} from "../desktop/window-manager-context";
import { LockScreen } from "./lock-screen";
import { HomeScreen, type LaunchOrigin } from "./home-screen";
import { AppView, type NavInfo } from "./app-view";

type StackEntry = { id: string; title: string; config: WindowConfig };

function toWindowState(config: WindowConfig, index: number): WindowState {
  return {
    ...config,
    isOpen: true,
    isMinimized: false,
    isMaximized: true,
    position: config.defaultPosition,
    size: config.defaultSize,
    zIndex: 10 + index,
  };
}

export function IPhone() {
  const [locked, setLocked] = useState(true);
  const [stack, setStack] = useState<StackEntry[]>([]);
  const [nav, setNav] = useState<NavInfo>({ type: "launch", origin: null });
  const [launchOrigin, setLaunchOrigin] = useState<LaunchOrigin | null>(null);

  const launch = useCallback((config: WindowConfig, origin: LaunchOrigin) => {
    setNav({ type: "launch", origin });
    setLaunchOrigin(origin);
    setStack([{ id: config.id, title: config.title, config }]);
  }, []);

  const push = useCallback((config: WindowConfig) => {
    setNav({ type: "push", origin: null });
    setStack((prev) => [
      ...prev.filter((entry) => entry.id !== config.id),
      { id: config.id, title: config.title, config },
    ]);
  }, []);

  const back = useCallback(() => {
    setStack((prev) => {
      if (prev.length <= 1) {
        setNav({ type: "close", origin: launchOrigin });
        return [];
      }
      setNav({ type: "pop", origin: null });
      return prev.slice(0, -1);
    });
  }, [launchOrigin]);

  const goHome = useCallback(() => {
    setNav({ type: "close", origin: launchOrigin });
    setStack([]);
  }, [launchOrigin]);

  // Bridge: the same context the window contents already use, reinterpreted —
  // "open a window" becomes "show that fullscreen app".
  const bridge = useMemo<WindowManagerContextValue>(() => {
    const windows = Object.fromEntries(
      stack.map((entry, i) => [entry.id, toWindowState(entry.config, i)])
    );
    const noop = () => {};
    return {
      windows,
      isMobile: true,
      orderedOpenWindows: Object.values(windows),
      openWindow: (config: WindowConfig, origin?: OpenOrigin) => {
        if (stack.length === 0 && origin) {
          launch(config, origin);
        } else {
          push(config);
        }
      },
      focusWindow: (id: string) => {
        const entry = stack.find((e) => e.id === id);
        if (entry && stack[stack.length - 1]?.id !== id) push(entry.config);
      },
      closeWindow: back,
      minimizeWindow: back,
      toggleMaximizeWindow: noop,
      updateWindowPosition: noop,
      updateWindowSize: noop,
      getOpenOrigin: () => null,
      getDismissAction: () => null,
    };
  }, [stack, launch, push, back]);

  const top = stack[stack.length - 1];

  return (
    <WindowManagerContext.Provider value={bridge}>
      <div className="absolute inset-0 overflow-hidden">
        <HomeScreen onLaunch={launch} />

        <AnimatePresence custom={nav}>
          {top ? (
            <AppView
              key={top.id}
              id={top.id}
              title={top.title}
              nav={nav}
              canGoBack={stack.length > 1}
              onBack={back}
              onHome={goHome}
            />
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {locked ? <LockScreen onUnlock={() => setLocked(false)} /> : null}
        </AnimatePresence>
      </div>
    </WindowManagerContext.Provider>
  );
}
