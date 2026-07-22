export type Cell = {
  mine: boolean;
  adjacent: number;
  revealed: boolean;
  flagged: boolean;
};

export type GameStatus = "ready" | "playing" | "won" | "lost";

export type GameState = {
  rows: number;
  cols: number;
  mines: number;
  board: Cell[][];
  status: GameStatus;
  flagsPlaced: number;
  revealedCount: number;
};

export type Difficulty = { label: string; rows: number; cols: number; mines: number };

export const DIFFICULTIES: Difficulty[] = [
  { label: "Easy", rows: 9, cols: 9, mines: 10 },
  { label: "Medium", rows: 12, cols: 12, mines: 24 },
];

export function createGame(rows: number, cols: number, mines: number): GameState {
  const board = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      mine: false,
      adjacent: 0,
      revealed: false,
      flagged: false,
    }))
  );
  return { rows, cols, mines, board, status: "ready", flagsPlaced: 0, revealedCount: 0 };
}

function neighborsOf(rows: number, cols: number, r: number, c: number): [number, number][] {
  const result: [number, number][] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) result.push([nr, nc]);
    }
  }
  return result;
}

// Plant mines everywhere except the first-clicked cell and its neighbors,
// so the first reveal is always a safe opening.
function plantMines(state: GameState, safeR: number, safeC: number, random: () => number): GameState {
  const { rows, cols, mines } = state;
  const forbidden = new Set([`${safeR},${safeC}`]);
  for (const [nr, nc] of neighborsOf(rows, cols, safeR, safeC)) forbidden.add(`${nr},${nc}`);

  const candidates: [number, number][] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!forbidden.has(`${r},${c}`)) candidates.push([r, c]);
    }
  }
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  const mineSet = new Set(candidates.slice(0, mines).map(([r, c]) => `${r},${c}`));

  const board = state.board.map((row, r) =>
    row.map((cell, c) => {
      const mine = mineSet.has(`${r},${c}`);
      const adjacent = neighborsOf(rows, cols, r, c).filter(([nr, nc]) =>
        mineSet.has(`${nr},${nc}`)
      ).length;
      return { ...cell, mine, adjacent };
    })
  );
  return { ...state, board, status: "playing" };
}

export function reveal(
  state: GameState,
  r: number,
  c: number,
  random: () => number = Math.random
): GameState {
  if (state.status === "won" || state.status === "lost") return state;
  const cell = state.board[r]?.[c];
  if (!cell || cell.revealed || cell.flagged) return state;

  const next = state.status === "ready" ? plantMines(state, r, c, random) : state;

  if (next.board[r][c].mine) {
    const board = next.board.map((row) =>
      row.map((cellState) => (cellState.mine ? { ...cellState, revealed: true } : cellState))
    );
    return { ...next, board, status: "lost" };
  }

  // Flood-fill reveal from the clicked cell across zero-adjacent regions.
  const board = next.board.map((row) => row.map((cellState) => ({ ...cellState })));
  const queue: [number, number][] = [[r, c]];
  let revealedCount = next.revealedCount;
  while (queue.length > 0) {
    const [qr, qc] = queue.pop()!;
    const target = board[qr][qc];
    if (target.revealed || target.flagged) continue;
    board[qr][qc] = { ...target, revealed: true };
    revealedCount++;
    if (target.adjacent === 0) {
      for (const [nr, nc] of neighborsOf(next.rows, next.cols, qr, qc)) {
        if (!board[nr][nc].revealed && !board[nr][nc].mine) queue.push([nr, nc]);
      }
    }
  }

  const won = revealedCount === next.rows * next.cols - next.mines;
  return { ...next, board, revealedCount, status: won ? "won" : "playing" };
}

export function toggleFlag(state: GameState, r: number, c: number): GameState {
  if (state.status === "won" || state.status === "lost") return state;
  const cell = state.board[r]?.[c];
  if (!cell || cell.revealed) return state;

  const board = state.board.map((row, rowIndex) =>
    rowIndex === r
      ? row.map((cellState, colIndex) =>
          colIndex === c ? { ...cellState, flagged: !cellState.flagged } : cellState
        )
      : row
  );
  return { ...state, board, flagsPlaced: state.flagsPlaced + (cell.flagged ? -1 : 1) };
}

export function minesRemaining(state: GameState): number {
  return state.mines - state.flagsPlaced;
}
