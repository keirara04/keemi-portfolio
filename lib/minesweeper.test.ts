import { describe, expect, it } from "vitest";
import {
  createGame,
  minesRemaining,
  reveal,
  toggleFlag,
  type GameState,
} from "./minesweeper";

// Deterministic "random" so mine placement is reproducible in tests.
const fixedRandom = () => 0;

function countMines(state: GameState): number {
  return state.board.flat().filter((cell) => cell.mine).length;
}

describe("createGame", () => {
  it("creates an empty board with the requested dimensions", () => {
    const game = createGame(9, 9, 10);
    expect(game.board).toHaveLength(9);
    expect(game.board[0]).toHaveLength(9);
    expect(game.status).toBe("ready");
    expect(countMines(game)).toBe(0);
  });
});

describe("reveal", () => {
  it("plants exactly the requested number of mines on first reveal", () => {
    const game = reveal(createGame(9, 9, 10), 4, 4, fixedRandom);
    expect(countMines(game)).toBe(10);
    expect(game.status).toBe("playing");
  });

  it("never places a mine on or adjacent to the first click", () => {
    const game = reveal(createGame(9, 9, 10), 4, 4, fixedRandom);
    for (let r = 3; r <= 5; r++) {
      for (let c = 3; c <= 5; c++) {
        expect(game.board[r][c].mine).toBe(false);
      }
    }
  });

  it("flood-reveals the safe opening around the first click", () => {
    const game = reveal(createGame(9, 9, 10), 4, 4, fixedRandom);
    expect(game.board[4][4].revealed).toBe(true);
    expect(game.revealedCount).toBeGreaterThan(1);
  });

  it("loses when a mine is revealed and shows all mines", () => {
    let game = reveal(createGame(9, 9, 10), 4, 4, fixedRandom);
    const mineCell = (() => {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (game.board[r][c].mine) return [r, c] as const;
        }
      }
      throw new Error("no mine found");
    })();
    game = reveal(game, mineCell[0], mineCell[1], fixedRandom);
    expect(game.status).toBe("lost");
    expect(game.board.flat().filter((cell) => cell.mine && cell.revealed)).toHaveLength(10);
  });

  it("wins when all non-mine cells are revealed", () => {
    let game = reveal(createGame(5, 5, 3), 0, 0, fixedRandom);
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (!game.board[r][c].mine) game = reveal(game, r, c, fixedRandom);
      }
    }
    expect(game.status).toBe("won");
  });

  it("ignores reveals on flagged cells", () => {
    let game = reveal(createGame(9, 9, 10), 4, 4, fixedRandom);
    const target = game.board.flat().findIndex((cell) => !cell.revealed);
    const r = Math.floor(target / 9);
    const c = target % 9;
    game = toggleFlag(game, r, c);
    const after = reveal(game, r, c, fixedRandom);
    expect(after.board[r][c].revealed).toBe(false);
  });

  it("does not mutate the previous state", () => {
    const before = createGame(9, 9, 10);
    const snapshot = JSON.stringify(before);
    reveal(before, 4, 4, fixedRandom);
    expect(JSON.stringify(before)).toBe(snapshot);
  });
});

describe("toggleFlag", () => {
  it("places and removes flags, tracking the mine counter", () => {
    let game = createGame(9, 9, 10);
    game = toggleFlag(game, 0, 0);
    expect(game.board[0][0].flagged).toBe(true);
    expect(minesRemaining(game)).toBe(9);
    game = toggleFlag(game, 0, 0);
    expect(game.board[0][0].flagged).toBe(false);
    expect(minesRemaining(game)).toBe(10);
  });

  it("cannot flag a revealed cell", () => {
    let game = reveal(createGame(9, 9, 10), 4, 4, fixedRandom);
    game = toggleFlag(game, 4, 4);
    expect(game.board[4][4].flagged).toBe(false);
  });

  it("is inert after the game is over", () => {
    let game = reveal(createGame(9, 9, 10), 4, 4, fixedRandom);
    const mine = game.board.flat().findIndex((cell) => cell.mine);
    game = reveal(game, Math.floor(mine / 9), mine % 9, fixedRandom);
    expect(game.status).toBe("lost");
    const after = toggleFlag(game, 0, 0);
    expect(after).toBe(game);
  });
});
