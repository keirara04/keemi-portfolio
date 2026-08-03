import { afterEach, describe, expect, it } from "vitest";
import { projects } from "./content";
import { PRELOAD_IMAGE_URLS, preloadImage, preloadImages } from "./preload-images";

type MockImageOutcome = "load" | "error";

function installMockImage(outcomeFor: (src: string) => MockImageOutcome) {
  class MockImage {
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    private _src = "";

    set src(value: string) {
      this._src = value;
      const outcome = outcomeFor(value);
      queueMicrotask(() => {
        if (outcome === "load") this.onload?.();
        else this.onerror?.();
      });
    }

    get src() {
      return this._src;
    }
  }

  const original = globalThis.Image;
  // @ts-expect-error - test double, not a full Image implementation
  globalThis.Image = MockImage;
  return () => {
    globalThis.Image = original;
  };
}

describe("PRELOAD_IMAGE_URLS", () => {
  it("includes the wallpaper and profile photo", () => {
    expect(PRELOAD_IMAGE_URLS).toContain("https://keemi-spaces-1.sgp1.cdn.digitaloceanspaces.com/images/portfolio-homebackground.jpg");
    expect(PRELOAD_IMAGE_URLS).toContain("https://keemi-spaces-1.sgp1.cdn.digitaloceanspaces.com/images/portfolio-profile.jpg");
  });

  it("includes every project screenshot", () => {
    const expectedScreenshots = projects.flatMap((p) => p.screenshots?.map((s) => s.src) ?? []);
    for (const src of expectedScreenshots) {
      expect(PRELOAD_IMAGE_URLS).toContain(src);
    }
  });
});

describe("preloadImage", () => {
  let restore: () => void;

  afterEach(() => {
    restore?.();
  });

  it("resolves when the image loads", async () => {
    restore = installMockImage(() => "load");
    await expect(preloadImage("/ok.png")).resolves.toBeUndefined();
  });

  it("resolves (does not reject) when the image fails to load", async () => {
    restore = installMockImage(() => "error");
    await expect(preloadImage("/missing.png")).resolves.toBeUndefined();
  });
});

describe("preloadImages", () => {
  let restore: () => void;

  afterEach(() => {
    restore?.();
  });

  it("resolves immediately for an empty list", async () => {
    await expect(preloadImages([])).resolves.toBeUndefined();
  });

  it("reports increasing progress as each image settles, mixing successes and failures", async () => {
    restore = installMockImage((src) => (src.includes("bad") ? "error" : "load"));
    const calls: [number, number][] = [];

    await preloadImages(["/a.png", "/bad.png", "/c.png"], (loaded, total) => {
      calls.push([loaded, total]);
    });

    expect(calls).toHaveLength(3);
    expect(calls.every(([, total]) => total === 3)).toBe(true);
    expect(calls.map(([loaded]) => loaded).sort((a, b) => a - b)).toEqual([1, 2, 3]);
  });
});
