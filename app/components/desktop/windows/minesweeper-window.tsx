"use client";

import { useEffect, useRef, useState } from "react";
import {
  DIFFICULTIES,
  createGame,
  minesRemaining,
  reveal,
  toggleFlag,
  type Difficulty,
  type GameState,
} from "@/lib/minesweeper";
import { showToast } from "../toast-host";

const NUMBER_COLORS: Record<number, string> = {
  1: "text-blue-600",
  2: "text-green-600",
  3: "text-red-600",
  4: "text-blue-900",
  5: "text-rose-900",
  6: "text-teal-600",
  7: "text-zinc-900",
  8: "text-zinc-500",
};

function MineGlyph() {
  return (
    <svg viewBox="0 0 16 16" className="h-3 w-3" aria-hidden>
      <circle cx="8" cy="8" r="4" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <line x1="8" y1="1.5" x2="8" y2="14.5" />
        <line x1="1.5" y1="8" x2="14.5" y2="8" />
        <line x1="3.5" y1="3.5" x2="12.5" y2="12.5" />
        <line x1="12.5" y1="3.5" x2="3.5" y2="12.5" />
      </g>
    </svg>
  );
}

function FlagGlyph() {
  return (
    <svg viewBox="0 0 16 16" className="h-3 w-3" aria-hidden>
      <line x1="5" y1="2" x2="5" y2="14" stroke="#3f3f46" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M5 2.5 L12.5 5.5 L5 8.5 Z" fill="#dc2626" />
    </svg>
  );
}

function Face({ status }: { status: GameState["status"] }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <circle cx="12" cy="12" r="11" fill="#fbbf24" stroke="#a16207" />
      {status === "lost" ? (
        <g stroke="#3f3f46" strokeWidth="1.6" strokeLinecap="round">
          <line x1="6.5" y1="7" x2="10" y2="10.5" />
          <line x1="10" y1="7" x2="6.5" y2="10.5" />
          <line x1="14" y1="7" x2="17.5" y2="10.5" />
          <line x1="17.5" y1="7" x2="14" y2="10.5" />
          <path d="M8 17.5 Q12 14 16 17.5" fill="none" />
        </g>
      ) : status === "won" ? (
        <g>
          <rect x="4.5" y="7" width="6.5" height="3.5" rx="1" fill="#18181b" />
          <rect x="13" y="7" width="6.5" height="3.5" rx="1" fill="#18181b" />
          <line x1="11" y1="8.5" x2="13" y2="8.5" stroke="#18181b" strokeWidth="1.4" />
          <path d="M8 15.5 Q12 19 16 15.5" stroke="#3f3f46" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <circle cx="8.5" cy="9" r="1.4" fill="#3f3f46" />
          <circle cx="15.5" cy="9" r="1.4" fill="#3f3f46" />
          <path d="M8 15 Q12 18.5 16 15" stroke="#3f3f46" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}

function Counter({ value }: { value: number }) {
  return (
    <span className="rounded bg-zinc-900 px-2 py-0.5 font-mono text-sm font-bold tabular-nums text-red-500">
      {String(Math.max(-99, Math.min(999, value))).padStart(3, "0")}
    </span>
  );
}

export function MinesweeperWindowContent() {
  const [difficulty, setDifficulty] = useState<Difficulty>(DIFFICULTIES[0]);
  const [game, setGame] = useState<GameState>(() =>
    createGame(DIFFICULTIES[0].rows, DIFFICULTIES[0].cols, DIFFICULTIES[0].mines)
  );
  const [flagMode, setFlagMode] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (game.status === "playing" && !timerRef.current) {
      timerRef.current = setInterval(() => setSeconds((s) => Math.min(s + 1, 999)), 1000);
    }
    if (game.status !== "playing" && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [game.status]);

  useEffect(() => {
    if (game.status === "won") {
      showToast("🏆 Minesweeper champion. Hire this person immediately.");
    }
  }, [game.status]);

  const restart = (next: Difficulty = difficulty) => {
    setGame(createGame(next.rows, next.cols, next.mines));
    setSeconds(0);
  };

  const handleCell = (r: number, c: number, forceFlag: boolean) => {
    if (forceFlag || flagMode) {
      setGame((prev) => toggleFlag(prev, r, c));
    } else {
      setGame((prev) => reveal(prev, r, c));
    }
  };

  return (
    <div className="flex h-full flex-col items-center gap-3 text-sm">
      <div className="flex items-center gap-2">
        {DIFFICULTIES.map((d) => (
          <button
            key={d.label}
            onClick={() => {
              setDifficulty(d);
              restart(d);
            }}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
              difficulty.label === d.label
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-600 hover:text-zinc-900 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            {d.label}
          </button>
        ))}
        <button
          onClick={() => setFlagMode((f) => !f)}
          aria-pressed={flagMode}
          aria-label="Toggle flag mode"
          className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition ${
            flagMode
              ? "bg-red-600 text-white"
              : "bg-zinc-100 text-zinc-600 hover:text-zinc-900 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:text-white"
          }`}
        >
          <FlagGlyph />
          Flag
        </button>
      </div>

      <div className="flex w-full max-w-xs items-center justify-between rounded-lg bg-zinc-200 px-3 py-1.5 dark:bg-zinc-800">
        <Counter value={minesRemaining(game)} />
        <button
          onClick={() => restart()}
          aria-label="New game"
          className="rounded-md p-1 transition hover:bg-black/10 active:scale-95 dark:hover:bg-white/10"
        >
          <Face status={game.status} />
        </button>
        <Counter value={seconds} />
      </div>

      <div
        className="grid touch-manipulation gap-px rounded-md bg-zinc-300 p-px dark:bg-zinc-700"
        style={{ gridTemplateColumns: `repeat(${game.cols}, minmax(0, 1fr))` }}
        role="grid"
        aria-label="Minesweeper board"
      >
        {game.board.map((row, r) =>
          row.map((cell, c) => {
            const revealed = cell.revealed;
            return (
              <button
                key={`${r}-${c}`}
                role="gridcell"
                aria-label={`Cell ${r + 1}, ${c + 1}`}
                onClick={() => handleCell(r, c, false)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleCell(r, c, true);
                }}
                disabled={game.status === "won" || game.status === "lost"}
                className={`flex h-7 w-7 items-center justify-center text-xs font-bold sm:h-6 sm:w-6 ${
                  revealed
                    ? cell.mine
                      ? "bg-red-500 text-zinc-900"
                      : `bg-zinc-100 dark:bg-zinc-600 ${NUMBER_COLORS[cell.adjacent] ?? ""}`
                    : "bg-zinc-400/80 shadow-[inset_1px_1px_0_rgba(255,255,255,0.5),inset_-1px_-1px_0_rgba(0,0,0,0.2)] hover:bg-zinc-400 dark:bg-zinc-500"
                }`}
              >
                {revealed ? (
                  cell.mine ? (
                    <MineGlyph />
                  ) : cell.adjacent > 0 ? (
                    cell.adjacent
                  ) : null
                ) : cell.flagged ? (
                  <FlagGlyph />
                ) : null}
              </button>
            );
          })
        )}
      </div>

      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        {game.status === "won"
          ? "You win. Hire this person immediately."
          : game.status === "lost"
            ? "Boom. The face button starts a new game."
            : "Right-click or use Flag mode to mark mines."}
      </p>
    </div>
  );
}
