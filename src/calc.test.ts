import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { compute, DEFAULTS, formatCount, formatShare, lowerExpectations, type CpsData, type Filters, type NhanesData } from "./calc";

const load = <T,>(name: string): T => JSON.parse(readFileSync(new URL(`../public/data/${name}`, import.meta.url), "utf8"));
const cps = load<CpsData>("cps.json");
const nh = load<NhanesData>("nhanes.json");

const open: Filters = {
  seeking: "men", ageMin: 18, ageMax: 80, excludeMarried: false, excludeParents: false,
  races: [], heightMin: 54, heightMax: 84, excludeOverweight: false, excludeObese: false, minIncomeK: 0,
};

describe("compute", () => {
  it("returns everyone when nothing is filtered", () => {
    const r = compute(open, cps, nh);
    expect(r.share).toBeCloseTo(1, 6);
    expect(r.matches).toBeGreaterThan(120e6);
  });

  it("splits adults into men and women that sum to the total", () => {
    const men = compute(open, cps, nh).base;
    const women = compute({ ...open, seeking: "women" }, cps, nh).base;
    expect(men + women).toBeCloseTo(cps.adultPopulation, -3);
  });

  it("narrows monotonically down the funnel", () => {
    for (const f of [DEFAULTS.men, DEFAULTS.women]) {
      const counts = compute(f, cps, nh).steps.map((s) => s.count);
      for (let i = 1; i < counts.length; i++) expect(counts[i]).toBeLessThanOrEqual(counts[i - 1] + 1e-6);
    }
  });

  it("puts roughly 15-18% of adult men at 6 feet or taller", () => {
    const r = compute({ ...open, heightMin: 72 }, cps, nh);
    expect(r.share).toBeGreaterThan(0.14);
    expect(r.share).toBeLessThan(0.19);
  });

  it("puts adult obesity near the published 40%", () => {
    const r = compute({ ...open, ageMin: 20, excludeObese: true }, cps, nh);
    const step = r.steps.find((s) => s.key === "age")!;
    expect(1 - r.matches / step.count).toBeGreaterThan(0.36);
    expect(1 - r.matches / step.count).toBeLessThan(0.44);
  });
});

describe("lowerExpectations", () => {
  it("always increases matches and eventually runs out", () => {
    let f: Filters = DEFAULTS.men;
    let last = compute(f, cps, nh).matches;
    for (let i = 0; i < 40; i++) {
      const step = lowerExpectations(f, cps, nh);
      if (!step) break;
      const now = compute(step.filters, cps, nh).matches;
      expect(now).toBeGreaterThan(last);
      last = now;
      f = step.filters;
    }
    expect(lowerExpectations(f, cps, nh)).toBeNull();
  });
});

describe("formatting", () => {
  it("formats counts and shares", () => {
    expect(formatCount(2_345_678)).toBe("2.3 million");
    expect(formatCount(48_321)).toBe("48,300");
    expect(formatCount(87)).toBe("87");
    expect(formatShare(0.0004)).toBe("0.04%");
    expect(formatShare(0.123)).toBe("12%");
  });
});
