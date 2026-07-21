"use client";

import { Component, type ReactNode } from "react";

type State = { hasError: boolean };

// Catches a crash inside one window's content so the rest of the desktop
// keeps working; the fallback renders inside the window chrome.
export class WindowErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm">
          <p className="font-medium text-zinc-800 dark:text-zinc-200">
            This window ran into a problem.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="rounded-md bg-zinc-900 px-3 py-1 text-xs font-semibold text-white dark:bg-white dark:text-zinc-900"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
