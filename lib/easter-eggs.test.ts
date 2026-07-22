import { describe, expect, it } from "vitest";
import { KONAMI_SEQUENCE, matchesKonami } from "./easter-eggs";

describe("matchesKonami", () => {
  it("returns false when the buffer is shorter than the sequence", () => {
    expect(matchesKonami(["ArrowUp", "ArrowUp"])).toBe(false);
  });

  it("returns true once the exact sequence has been typed", () => {
    expect(matchesKonami(KONAMI_SEQUENCE)).toBe(true);
  });

  it("matches on the tail of a longer buffer", () => {
    const buffer = ["x", "y", "z", ...KONAMI_SEQUENCE];
    expect(matchesKonami(buffer)).toBe(true);
  });

  it("is case-insensitive for the b/a keys", () => {
    const buffer = [...KONAMI_SEQUENCE.slice(0, -2), "B", "A"];
    expect(matchesKonami(buffer)).toBe(true);
  });

  it("returns false for an unrelated sequence", () => {
    expect(matchesKonami(["ArrowDown", "ArrowDown", "ArrowUp", "ArrowUp"])).toBe(false);
  });

  it("returns false when the order is wrong", () => {
    const shuffled = [...KONAMI_SEQUENCE].reverse();
    expect(matchesKonami(shuffled)).toBe(false);
  });
});
