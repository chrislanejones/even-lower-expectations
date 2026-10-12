import { AGE_MAX, AGE_MIN, DEFAULTS, HEIGHT_MAX, HEIGHT_MIN, INCOME_MAX_K, type Filters, type Race } from "./calc";

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export function toHash(f: Filters): string {
  const p = new URLSearchParams({
    s: f.seeking === "men" ? "m" : "w",
    a: `${f.ageMin}-${f.ageMax}`,
    h: `${f.heightMin}-${f.heightMax}`,
    i: String(f.minIncomeK),
    x: [f.excludeMarried && "m", f.excludeParents && "k", f.excludeOverweight && "o", f.excludeObese && "b"].filter(Boolean).join(""),
  });
  if (f.races.length) p.set("r", f.races.join(""));
  return `#${p.toString()}`;
}

export function fromHash(hash: string): Filters | null {
  if (!hash || hash.length < 2) return null;
  const p = new URLSearchParams(hash.slice(1));
  const s = p.get("s");
  if (s !== "m" && s !== "w") return null;
  const base = DEFAULTS[s === "m" ? "men" : "women"];
  const pair = (key: string, lo: number, hi: number, fallback: [number, number]): [number, number] => {
    const [a, b] = (p.get(key) ?? "").split("-").map(Number);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return fallback;
    const x = clamp(a, lo, hi), y = clamp(b, lo, hi);
    return x <= y ? [x, y] : [y, x];
  };
  const [ageMin, ageMax] = pair("a", AGE_MIN, AGE_MAX, [base.ageMin, base.ageMax]);
  const [heightMin, heightMax] = pair("h", HEIGHT_MIN, HEIGHT_MAX, [base.heightMin, base.heightMax]);
  const income = Number(p.get("i"));
  const x = p.get("x") ?? "";
  const races = [...new Set((p.get("r") ?? "").split("").map(Number))].filter((r): r is Race => r >= 0 && r <= 3);
  return {
    seeking: base.seeking,
    ageMin, ageMax, heightMin, heightMax,
    minIncomeK: Number.isFinite(income) ? clamp(Math.round(income / 5) * 5, 0, INCOME_MAX_K) : base.minIncomeK,
    excludeMarried: x.includes("m"),
    excludeParents: x.includes("k"),
    excludeOverweight: x.includes("o"),
    excludeObese: x.includes("b"),
    races,
  };
}
