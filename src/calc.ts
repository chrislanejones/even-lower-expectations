export type Seeking = "women" | "men";
export type Race = 0 | 1 | 2 | 3;

export const RACES: { id: Race; label: string }[] = [
  { id: 0, label: "White" },
  { id: 1, label: "Black" },
  { id: 2, label: "Hispanic" },
  { id: 3, label: "Asian" },
];

export const AGE_MIN = 18;
export const AGE_MAX = 80; // NHANES top-codes at 80, so 80 means "80 and up"
export const HEIGHT_MIN = 54; // 4'6"
export const HEIGHT_MAX = 84; // 7'0" and up
export const INCOME_MAX_K = 300; // $300k and up

export interface Filters {
  seeking: Seeking;
  ageMin: number;
  ageMax: number;
  excludeMarried: boolean;
  excludeParents: boolean;
  races: Race[]; // empty means any
  heightMin: number; // inches
  heightMax: number; // inches
  excludeOverweight: boolean;
  excludeObese: boolean;
  minIncomeK: number;
}

export interface CpsData {
  source: string;
  incomeYear: number;
  incomeStep: number;
  incomeTopBucket: number;
  adultsSampled: number;
  adultPopulation: number;
  sex: number[];
  age: number[];
  race: number[];
  married: number[];
  parent: number[];
  incomeBucket: number[];
  weight: number[];
}

export interface NhanesData {
  source: string;
  adultsMeasured: number;
  sex: number[];
  age: number[];
  race: number[];
  heightTenthsIn: number[];
  bmiTenths: number[];
  weight: number[];
}

export interface Step {
  key: string;
  label: string;
  count: number;
}

export interface Result {
  steps: Step[];
  base: number;
  matches: number;
  share: number; // of all adults of the sex being sought
  oneIn: number;
  measuredSample: number; // unweighted NHANES people behind the body-size share
}

export const DEFAULTS: Record<Seeking, Filters> = {
  women: {
    seeking: "women",
    ageMin: 18,
    ageMax: 29,
    excludeMarried: true,
    excludeParents: true,
    races: [],
    heightMin: 59,
    heightMax: 68,
    excludeOverweight: true,
    excludeObese: true,
    minIncomeK: 0,
  },
  men: {
    seeking: "men",
    ageMin: 20,
    ageMax: 40,
    excludeMarried: true,
    excludeParents: false,
    races: [],
    heightMin: 72,
    heightMax: HEIGHT_MAX,
    excludeOverweight: false,
    excludeObese: true,
    minIncomeK: 80,
  },
};

const sexIndex = (s: Seeking) => (s === "men" ? 0 : 1);
const inAge = (age: number, f: Filters) =>
  age >= f.ageMin && (f.ageMax >= AGE_MAX ? true : age <= f.ageMax);
const inRace = (race: number, f: Filters) =>
  f.races.length === 0 || (f.races as number[]).includes(race);

export function compute(f: Filters, cps: CpsData, nh: NhanesData): Result {
  const sex = sexIndex(f.seeking);
  const minBucket = Math.min(Math.round((f.minIncomeK * 1000) / cps.incomeStep), cps.incomeTopBucket);

  let all = 0, aged = 0, raced = 0, single = 0, childfree = 0, earning = 0;
  for (let i = 0; i < cps.weight.length; i++) {
    if (cps.sex[i] !== sex) continue;
    const w = cps.weight[i];
    all += w;
    if (!inAge(cps.age[i], f)) continue;
    aged += w;
    if (!inRace(cps.race[i], f)) continue;
    raced += w;
    if (f.excludeMarried && cps.married[i] === 1) continue;
    single += w;
    if (f.excludeParents && cps.parent[i] === 1) continue;
    childfree += w;
    if (cps.incomeBucket[i] < minBucket) continue;
    earning += w;
  }

  // NHANES: share of this sex/age/race group that fits the height and body filters
  const hMin = f.heightMin * 10;
  const hMax = f.heightMax >= HEIGHT_MAX ? Infinity : f.heightMax * 10 + 9;
  let group = 0, tall = 0, fit = 0, measuredSample = 0;
  for (let i = 0; i < nh.weight.length; i++) {
    if (nh.sex[i] !== sex || !inAge(nh.age[i], f) || !inRace(nh.race[i], f)) continue;
    const w = nh.weight[i];
    group += w;
    measuredSample++;
    const h = nh.heightTenthsIn[i];
    if (h < hMin || h > hMax) continue;
    tall += w;
    const bmi = nh.bmiTenths[i];
    if (f.excludeObese && bmi >= 300) continue;
    if (f.excludeOverweight && bmi >= 250 && bmi < 300) continue;
    fit += w;
  }
  const heightShare = group > 0 ? tall / group : 0;
  const bodyShare = tall > 0 ? fit / tall : 0;

  const steps: Step[] = [{ key: "all", label: `All adult ${f.seeking} in the US`, count: all }];
  const ageLabel = f.ageMax >= AGE_MAX ? `${f.ageMin} and older` : `Aged ${f.ageMin} to ${f.ageMax}`;
  steps.push({ key: "age", label: ageLabel, count: aged });
  if (f.races.length > 0) {
    const names = RACES.filter((r) => f.races.includes(r.id)).map((r) => r.label);
    steps.push({ key: "race", label: names.join(" or "), count: raced });
  }
  if (f.excludeMarried) steps.push({ key: "married", label: "Not married", count: single });
  if (f.excludeParents) steps.push({ key: "parent", label: "No kids at home", count: childfree });
  if (f.minIncomeK > 0) {
    steps.push({ key: "income", label: `Earns $${f.minIncomeK}k or more a year`, count: earning });
  }
  const afterHeight = earning * heightShare;
  if (f.heightMin > HEIGHT_MIN || f.heightMax < HEIGHT_MAX) {
    steps.push({ key: "height", label: heightLabel(f), count: afterHeight });
  }
  const matches = afterHeight * bodyShare;
  if (f.excludeObese || f.excludeOverweight) {
    const label = f.excludeObese && f.excludeOverweight
      ? "Not overweight or obese"
      : f.excludeObese ? "Not obese" : "Not overweight (obese is fine)";
    steps.push({ key: "body", label, count: matches });
  }

  const share = all > 0 ? matches / all : 0;
  return {
    steps,
    base: all,
    matches,
    share,
    oneIn: share > 0 ? 1 / share : Infinity,
    measuredSample,
  };
}

export function formatHeight(inches: number): string {
  const ft = Math.floor(inches / 12);
  return `${ft}'${inches - ft * 12}"`;
}

function heightLabel(f: Filters): string {
  if (f.heightMax >= HEIGHT_MAX) return `${formatHeight(f.heightMin)} or taller`;
  if (f.heightMin <= HEIGHT_MIN) return `${formatHeight(f.heightMax)} or shorter`;
  return `Between ${formatHeight(f.heightMin)} and ${formatHeight(f.heightMax)}`;
}

export function formatCount(n: number): string {
  if (n >= 1e6) return `${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1)} million`;
  return Number(n.toPrecision(n >= 1000 ? 3 : 2)).toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export function formatShare(share: number): string {
  const pct = share * 100;
  if (pct === 0) return "0%";
  if (pct < 0.01) return "<0.01%";
  if (pct < 1) return `${pct.toFixed(2)}%`;
  if (pct < 10) return `${pct.toFixed(1)}%`;
  return `${Math.round(pct)}%`;
}

export interface Verdict {
  title: string;
  line: string;
}

export function verdict(share: number): Verdict {
  const pct = share * 100;
  if (pct >= 25) return { title: "Already lowered", line: "Your expectations are at sea level. Respect." };
  if (pct >= 10) return { title: "Reasonable", line: "Suspiciously reasonable. Are you sure you filled this out?" };
  if (pct >= 3) return { title: "Picky", line: "Picky, but the tape's still rolling." };
  if (pct >= 1) return { title: "Rewind", line: "One in a hundred. Bring a book to the bar." };
  if (pct >= 0.1) return { title: "Lower them", line: "Lower. Your. Expectations." };
  return { title: "Even lower", line: "This person may be a rumor. Lower them again." };
}

interface Relaxation {
  filters: Filters;
  note: string;
}

/** Every single-knob loosening of the current filters, each with a line of copy. */
function relaxations(f: Filters): Relaxation[] {
  const out: Relaxation[] = [];
  const them = f.seeking === "men" ? "he" : "she";
  if (f.minIncomeK > 0) {
    const next = f.minIncomeK <= 10 ? 0 : Math.floor(f.minIncomeK / 2 / 5) * 5;
    out.push({
      filters: { ...f, minIncomeK: next },
      note: next === 0 ? "Dropped the income minimum. Love is free. Dinner is not." : `Cut the income bar to $${next}k. Dutch is fine.`,
    });
  }
  if (f.heightMin > HEIGHT_MIN) {
    const next = Math.max(HEIGHT_MIN, f.heightMin - 2);
    out.push({ filters: { ...f, heightMin: next }, note: `Shortest now ${formatHeight(next)}. ${cap(them)} can wear boots.` });
  }
  if (f.heightMax < HEIGHT_MAX) {
    const next = Math.min(HEIGHT_MAX, f.heightMax + 2);
    out.push({ filters: { ...f, heightMax: next }, note: `Tallest now ${formatHeight(next)}. You can wear boots.` });
  }
  if (f.excludeOverweight) {
    out.push({ filters: { ...f, excludeOverweight: false }, note: "A few extra pounds are back in. More to love." });
  }
  if (f.excludeObese) {
    out.push({ filters: { ...f, excludeObese: false }, note: "BMI is off the table. It was a bad metric anyway." });
  }
  if (f.races.length > 0) {
    out.push({ filters: { ...f, races: [] }, note: "Any race now. Look at you, growing." });
  }
  if (f.ageMin > AGE_MIN) {
    const next = Math.max(AGE_MIN, f.ageMin - 5);
    out.push({ filters: { ...f, ageMin: next }, note: `Youngest now ${next}. Check ID.` });
  }
  if (f.ageMax < AGE_MAX) {
    const next = Math.min(AGE_MAX, f.ageMax + 5);
    out.push({ filters: { ...f, ageMax: next }, note: `Oldest now ${next}. Mature is a vibe.` });
  }
  if (f.excludeParents) {
    out.push({ filters: { ...f, excludeParents: false }, note: "Kids are fine now. Instant family, no labor." });
  }
  if (f.excludeMarried) {
    out.push({ filters: { ...f, excludeMarried: false }, note: `Married people are back in. ${cap(them)} said it's complicated.` });
  }
  return out;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Apply the single loosening that adds the most matches. Null when nothing is left to give up. */
export function lowerExpectations(f: Filters, cps: CpsData, nh: NhanesData): Relaxation | null {
  let best: Relaxation | null = null;
  let bestCount = compute(f, cps, nh).matches;
  for (const r of relaxations(f)) {
    const count = compute(r.filters, cps, nh).matches;
    if (count > bestCount) {
      best = r;
      bestCount = count;
    }
  }
  return best;
}

/** No standards at all: the base for the "reality check" headlines. */
export const OPEN: Filters = {
  ...DEFAULTS.men,
  ageMin: AGE_MIN, ageMax: AGE_MAX, heightMin: HEIGHT_MIN, heightMax: HEIGHT_MAX,
  excludeMarried: false, excludeParents: false, excludeOverweight: false, excludeObese: false,
  minIncomeK: 0, races: [],
};

export interface Group {
  key: string; // the standard that cut these people, or "match"
  label: string;
  people: number;
  cells: number;
}

/** Split the population into "cut by step X" groups plus the matches, as `total` squares. */
export function toGroups(result: Result, total = 1000): Group[] {
  const { steps } = result;
  const groups: Group[] = [];
  for (let i = 1; i < steps.length; i++) {
    const cut = steps[i - 1].count - steps[i].count;
    groups.push({ key: steps[i].key, label: steps[i].label, people: Math.max(cut, 0), cells: 0 });
  }
  groups.push({ key: "match", label: "Your matches", people: result.matches, cells: 0 });
  const base = steps[0]?.count || 1;

  // Largest-remainder rounding so the squares always add up to exactly `total`.
  const raw = groups.map((g) => (g.people / base) * total);
  groups.forEach((g, i) => (g.cells = Math.floor(raw[i])));
  let left = total - groups.reduce((n, g) => n + g.cells, 0);
  const order = raw.map((r, i) => [r - Math.floor(r), i] as const).sort((a, b) => b[0] - a[0]);
  for (const [, i] of order) {
    if (left <= 0) break;
    groups[i].cells++;
    left--;
  }
  // A match smaller than one square still gets one, so it never vanishes.
  const match = groups[groups.length - 1];
  if (match.people > 0 && match.cells === 0) {
    const biggest = groups.reduce((a, b) => (b.cells > a.cells ? b : a));
    biggest.cells--;
    match.cells = 1;
  }
  return groups;
}
