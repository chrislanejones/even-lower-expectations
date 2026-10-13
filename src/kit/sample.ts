import { DEFAULTS, toGroups, type Filters, type Result } from "../calc";

/**
 * A real result to render the data windows with: the default "a man" search
 * (20 to 40, single, $80k+, 6'0"+, not obese) computed from CPS ASEC 2026 and
 * NHANES 2021-2023. Counts are rounded to whole people.
 */
export const SAMPLE_RESULT: Result = {
  steps: [
    { key: "all", label: "All adult men in the US", count: 128732364 },
    { key: "age", label: "Aged 20 to 40", count: 47981410 },
    { key: "married", label: "Not married", count: 31049630 },
    { key: "income", label: "Earns $80k or more a year", count: 5499958 },
    { key: "height", label: "6'0\" or taller", count: 1072275 },
    { key: "body", label: "Not obese", count: 789730 },
  ],
  base: 128732364,
  matches: 789730,
  share: 0.006134662755163366,
  oneIn: 163.00814566511082,
  measuredSample: 716,
};

/** The filters that produced SAMPLE_RESULT. */
export const SAMPLE_FILTERS: Filters = DEFAULTS.men;

/** SAMPLE_RESULT split into the 1,000-square groups. */
export const SAMPLE_GROUPS = toGroups(SAMPLE_RESULT);
