import { describe, expect, it } from "vitest";
import { bundles, calculateEstimate, features, projectTypes, timelineOptions } from "./quote";

describe("calculateEstimate", () => {
  it("returns null for an unknown project type", () => {
    expect(calculateEstimate("not-a-type", [], "standard")).toBeNull();
  });

  it("matches the base project type range with no features on standard timeline", () => {
    const type = projectTypes[0];
    const estimate = calculateEstimate(type.id, [], "standard");
    expect(estimate).toEqual({ min: type.minPrice, max: type.maxPrice });
  });

  it("increases the estimate as features are added", () => {
    const type = projectTypes[0];
    const withoutFeatures = calculateEstimate(type.id, [], "standard")!;
    const withFeatures = calculateEstimate(type.id, [features[0].id, features[1].id], "standard")!;
    expect(withFeatures.min).toBeGreaterThan(withoutFeatures.min);
    expect(withFeatures.max).toBeGreaterThan(withoutFeatures.max);
  });

  it("applies the rush timeline surcharge on top of the standard range", () => {
    const type = projectTypes[0];
    const standard = calculateEstimate(type.id, [], "standard")!;
    const rush = calculateEstimate(type.id, [], "rush")!;
    expect(rush.min).toBeGreaterThan(standard.min);
    expect(rush.max).toBeGreaterThan(standard.max);
  });

  it("falls back to the standard timeline for an unknown timeline id", () => {
    const type = projectTypes[0];
    const standard = calculateEstimate(type.id, [], "standard")!;
    const unknown = calculateEstimate(type.id, [], "not-a-timeline")!;
    expect(unknown).toEqual(standard);
  });

  it("ignores unknown feature ids", () => {
    const type = projectTypes[0];
    const clean = calculateEstimate(type.id, [], "standard")!;
    const withJunk = calculateEstimate(type.id, ["not-a-feature"], "standard")!;
    expect(withJunk).toEqual(clean);
  });

  it("every project type and feature has a positive, sensible price range", () => {
    for (const type of projectTypes) {
      expect(type.minPrice).toBeGreaterThan(0);
      expect(type.maxPrice).toBeGreaterThan(type.minPrice);
    }
    for (const feature of features) {
      expect(feature.minPrice).toBeGreaterThan(0);
      expect(feature.maxPrice).toBeGreaterThan(feature.minPrice);
    }
  });

  it("timeline surcharges are non-negative and max >= min", () => {
    for (const timeline of timelineOptions) {
      expect(timeline.minSurcharge).toBeGreaterThanOrEqual(0);
      expect(timeline.maxSurcharge).toBeGreaterThanOrEqual(timeline.minSurcharge);
    }
  });

  it("every bundle references a real project type and real feature ids", () => {
    for (const bundle of bundles) {
      expect(projectTypes.some((t) => t.id === bundle.projectTypeId)).toBe(true);
      for (const featureId of bundle.featureIds) {
        expect(features.some((f) => f.id === featureId)).toBe(true);
      }
    }
  });

  it("every bundle produces a valid estimate", () => {
    for (const bundle of bundles) {
      const estimate = calculateEstimate(bundle.projectTypeId, bundle.featureIds, "standard");
      expect(estimate).not.toBeNull();
      expect(estimate!.min).toBeLessThanOrEqual(estimate!.max);
    }
  });
});
