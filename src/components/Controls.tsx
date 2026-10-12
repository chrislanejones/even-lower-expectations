import { useId, type CSSProperties } from "react";
import {
  AGE_MAX, AGE_MIN, DEFAULTS, HEIGHT_MAX, HEIGHT_MIN, INCOME_MAX_K, RACES,
  formatHeight, type Filters, type Race, type Seeking,
} from "../calc";

interface DualRangeProps {
  label: string;
  min: number;
  max: number;
  low: number;
  high: number;
  format: (n: number, end: "low" | "high") => string;
  onChange: (low: number, high: number) => void;
}

function DualRange({ label, min, max, low, high, format, onChange }: DualRangeProps) {
  const id = useId();
  const frac = (n: number) => (n - min) / (max - min);
  const style = { "--lo": frac(low), "--hi": frac(high) } as CSSProperties;
  // When the thumbs meet, keep the one that can still move on top.
  const lowOnTop = low === high && low > (min + max) / 2;
  return (
    <div className="field" role="group" aria-labelledby={id}>
      <div className="field-head">
        <span className="field-label" id={id}>{label}</span>
        <output className="field-value">
          {format(low, "low")} <span aria-hidden="true">to</span><span className="sr-only">to</span> {format(high, "high")}
        </output>
      </div>
      <div className="slider slider-dual" style={style}>
        <div className="slider-track" aria-hidden="true"><span className="slider-fill" /></div>
        <input
          type="range" min={min} max={max} value={low}
          className={lowOnTop ? "on-top" : undefined}
          aria-label={`${label}, lowest`}
          aria-valuetext={format(low, "low")}
          onChange={(e) => onChange(Math.min(Number(e.target.value), high), high)}
        />
        <input
          type="range" min={min} max={max} value={high}
          aria-label={`${label}, highest`}
          aria-valuetext={format(high, "high")}
          onChange={(e) => onChange(low, Math.max(Number(e.target.value), low))}
        />
      </div>
    </div>
  );
}

function Switch({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="switch">
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="switch-ui" aria-hidden="true" />
      <span className="switch-text">
        <span>{label}</span>
        {hint && <span className="switch-hint">{hint}</span>}
      </span>
    </label>
  );
}

interface ControlsProps {
  filters: Filters;
  onChange: (f: Filters) => void;
}

export function Controls({ filters: f, onChange }: ControlsProps) {
  const set = (patch: Partial<Filters>) => onChange({ ...f, ...patch });
  const parentWord = f.seeking === "men" ? "dads" : "moms";

  const toggleRace = (r: Race) => {
    const next = f.races.includes(r) ? f.races.filter((x) => x !== r) : [...f.races, r].sort();
    set({ races: next.length === RACES.length ? [] : next });
  };

  return (
    <form className="controls" onSubmit={(e) => e.preventDefault()} aria-label="Your standards">
      <fieldset className="seeking">
        <legend className="field-label">I'm looking for</legend>
        <div className="segmented">
          {(["women", "men"] as Seeking[]).map((s) => (
            <label key={s} className="segment">
              <input
                type="radio" name="seeking" value={s}
                checked={f.seeking === s}
                onChange={() => onChange(DEFAULTS[s])}
              />
              <span>{s === "women" ? "A woman" : "A man"}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <DualRange
        label="Age"
        min={AGE_MIN} max={AGE_MAX}
        low={f.ageMin} high={f.ageMax}
        format={(n, end) => (end === "high" && n >= AGE_MAX ? "80+" : String(n))}
        onChange={(ageMin, ageMax) => set({ ageMin, ageMax })}
      />

      <DualRange
        label="Height"
        min={HEIGHT_MIN} max={HEIGHT_MAX}
        low={f.heightMin} high={f.heightMax}
        format={(n, end) =>
          end === "high" && n >= HEIGHT_MAX ? "7'0\"+" : end === "low" && n <= HEIGHT_MIN ? "any" : formatHeight(n)}
        onChange={(heightMin, heightMax) => set({ heightMin, heightMax })}
      />

      <div className="field">
        <div className="field-head">
          <label className="field-label" htmlFor="income">Earns at least</label>
          <output className="field-value" htmlFor="income">
            {f.minIncomeK === 0 ? "anything" : `$${f.minIncomeK}k${f.minIncomeK >= INCOME_MAX_K ? "+" : ""}`}
          </output>
        </div>
        <div className="slider slider-single" style={{ "--lo": 0, "--hi": f.minIncomeK / INCOME_MAX_K } as CSSProperties}>
          <div className="slider-track" aria-hidden="true"><span className="slider-fill" /></div>
          <input
            id="income" type="range" min={0} max={INCOME_MAX_K} step={5}
            value={f.minIncomeK}
            aria-valuetext={f.minIncomeK === 0 ? "No minimum" : `$${f.minIncomeK},000 a year`}
            onChange={(e) => set({ minIncomeK: Number(e.target.value) })}
          />
        </div>
      </div>

      <fieldset className="field">
        <legend className="field-label">Race</legend>
        <div className="chips">
          <label className="chip">
            <input type="checkbox" checked={f.races.length === 0} onChange={() => set({ races: [] })} />
            <span>Any</span>
          </label>
          {RACES.map((r) => (
            <label key={r.id} className="chip">
              <input type="checkbox" checked={f.races.includes(r.id)} onChange={() => toggleRace(r.id)} />
              <span>{r.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="field switches">
        <legend className="field-label">Deal breakers</legend>
        <Switch label="No married people" checked={f.excludeMarried} onChange={(v) => set({ excludeMarried: v })} />
        <Switch label={`No ${parentWord}`} hint="Own kids under 18 at home" checked={f.excludeParents} onChange={(v) => set({ excludeParents: v })} />
        <Switch label="Not overweight" hint="BMI 25 to 29.9" checked={f.excludeOverweight} onChange={(v) => set({ excludeOverweight: v })} />
        <Switch label="Not obese" hint="BMI 30 or more" checked={f.excludeObese} onChange={(v) => set({ excludeObese: v })} />
      </fieldset>

      <p className="controls-note">Everything updates as you go. No sign-up, nothing leaves your browser, and nobody has to know.</p>
    </form>
  );
}
