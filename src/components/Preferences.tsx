import type { CSSProperties } from "react";
import {
  AGE_MAX, AGE_MIN, DEFAULTS, HEIGHT_MAX, HEIGHT_MIN, INCOME_MAX_K, RACES,
  formatHeight, type Filters, type Race, type Seeking,
} from "../calc";
import { TitleBar } from "./chrome";

interface RangeProps {
  label: string;
  hint: string;
  min: number;
  max: number;
  low: number;
  high: number;
  format: (n: number, end: "low" | "high") => string;
  lowLabel: string;
  highLabel: string;
  onChange: (low: number, high: number) => void;
}

const frac = (n: number, min: number, max: number) => (n - min) / (max - min);

function DualRange({ label, hint, min, max, low, high, format, lowLabel, highLabel, onChange }: RangeProps) {
  const style = { "--lo": frac(low, min, max), "--hi": frac(high, min, max) } as CSSProperties;
  // When the thumbs meet, keep the one that can still move on top.
  const lowOnTop = low === high && low > (min + max) / 2;
  return (
    <fieldset className="group" role="group" aria-label={label}>
      <legend>{label}</legend>
      <div className="group-head">
        <span className="hint">{hint}</span>
        <output className="readout">
          {format(low, "low")} <span className="readout-to">to</span> {format(high, "high")}
        </output>
      </div>
      <div className="w-slider" style={style}>
        <div className="w-track" aria-hidden="true"><span className="w-fill" /></div>
        <input
          className={`w-range${lowOnTop ? " on-top" : ""}`} type="range" min={min} max={max} value={low}
          aria-label={`${label}, ${lowLabel}`} aria-valuetext={format(low, "low")}
          onChange={(e) => onChange(Math.min(Number(e.target.value), high), high)}
        />
        <input
          className="w-range" type="range" min={min} max={max} value={high}
          aria-label={`${label}, ${highLabel}`} aria-valuetext={format(high, "high")}
          onChange={(e) => onChange(low, Math.max(Number(e.target.value), low))}
        />
      </div>
    </fieldset>
  );
}

/**
 * The "Preferences — Your standards" window: who you are looking for, age and height ranges, income floor, race chips and deal-breaker checkboxes. Controlled by `filters` and `onChange`.
 * @category windows
 */
export function Preferences({ filters: f, onChange }: { filters: Filters; onChange: (f: Filters) => void }) {
  const set = (patch: Partial<Filters>) => onChange({ ...f, ...patch });
  const parentWord = f.seeking === "men" ? "dads" : "moms";
  const toggleRace = (r: Race) => {
    const next = f.races.includes(r) ? f.races.filter((x) => x !== r) : [...f.races, r].sort();
    set({ races: next.length === RACES.length ? [] : next });
  };
  const switches: { label: string; hint?: string; key: "excludeMarried" | "excludeParents" | "excludeOverweight" | "excludeObese" }[] = [
    { label: "No married people", key: "excludeMarried" },
    { label: `No ${parentWord}`, hint: "Own kids under 18 at home", key: "excludeParents" },
    { label: "Not overweight", hint: "BMI 25 to 29.9", key: "excludeOverweight" },
    { label: "Not obese", hint: "BMI 30 or more", key: "excludeObese" },
  ];
  const incomeText = f.minIncomeK === 0 ? "anything" : `$${f.minIncomeK}k${f.minIncomeK >= INCOME_MAX_K ? "+" : ""}`;

  return (
    <form className="win" data-win="prefs" aria-label="Your standards" onSubmit={(e) => e.preventDefault()}>
      <TitleBar icon={<span className="tb-icon" aria-hidden="true">⚙</span>} title="Preferences — Your standards" controls={["help", "close"]} />
      <div className="win-body prefs">
        <fieldset className="group">
          <legend>I'm looking for</legend>
          <div className="radios">
            {(["women", "men"] as Seeking[]).map((s) => (
              <label key={s} className="radio">
                <input type="radio" name="seeking" value={s} checked={f.seeking === s} onChange={() => onChange(DEFAULTS[s])} />
                <span className="radio-ui" aria-hidden="true" />
                {s === "women" ? "A woman" : "A man"}
              </label>
            ))}
          </div>
        </fieldset>

        <DualRange
          label="Age" hint="Drag both ends" min={AGE_MIN} max={AGE_MAX} low={f.ageMin} high={f.ageMax}
          lowLabel="lowest" highLabel="highest"
          format={(n, end) => (end === "high" && n >= AGE_MAX ? "80+" : String(n))}
          onChange={(ageMin, ageMax) => set({ ageMin, ageMax })}
        />

        <DualRange
          label="Height" hint="Measured, not self-reported" min={HEIGHT_MIN} max={HEIGHT_MAX} low={f.heightMin} high={f.heightMax}
          lowLabel="shortest" highLabel="tallest"
          format={(n, end) => (end === "high" && n >= HEIGHT_MAX ? "7'0\"+" : end === "low" && n <= HEIGHT_MIN ? "any" : formatHeight(n))}
          onChange={(heightMin, heightMax) => set({ heightMin, heightMax })}
        />

        <fieldset className="group">
          <legend><label htmlFor="ele-income">Earns at least</label></legend>
          <div className="group-head">
            <span className="hint">Personal income, before tax</span>
            <output className="readout" htmlFor="ele-income">{incomeText}</output>
          </div>
          <div className="w-slider" style={{ "--lo": 0, "--hi": f.minIncomeK / INCOME_MAX_K } as CSSProperties}>
            <div className="w-track" aria-hidden="true"><span className="w-fill" /></div>
            <input
              id="ele-income" className="w-range" type="range" min={0} max={INCOME_MAX_K} step={5} value={f.minIncomeK}
              aria-valuetext={f.minIncomeK === 0 ? "No minimum" : `$${f.minIncomeK},000 a year`}
              onChange={(e) => set({ minIncomeK: Number(e.target.value) })}
            />
          </div>
        </fieldset>

        <fieldset className="group">
          <legend>Race</legend>
          <div className="chips">
            <button type="button" className="btn chip" aria-pressed={f.races.length === 0} onClick={() => set({ races: [] })}>Any</button>
            {RACES.map((r) => (
              <button key={r.id} type="button" className="btn chip" aria-pressed={f.races.includes(r.id)} onClick={() => toggleRace(r.id)}>
                {r.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="group">
          <legend>Deal breakers</legend>
          <div className="checks">
            {switches.map((s) => (
              <label key={s.key} className="check">
                <input type="checkbox" checked={f[s.key]} onChange={(e) => set({ [s.key]: e.target.checked })} />
                <span className="check-ui" aria-hidden="true">{f[s.key] ? "✓" : ""}</span>
                <span className="check-text">
                  <span>{s.label}</span>
                  {s.hint && <span className="hint">{s.hint}</span>}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <p className="fine">Everything updates as you go. No sign-up, nothing leaves your browser, and nobody has to know.</p>
      </div>
    </form>
  );
}
