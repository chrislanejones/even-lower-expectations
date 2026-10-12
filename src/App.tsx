import { useEffect, useMemo, useRef, useState } from "react";
import {
  AGE_MAX, AGE_MIN, HEIGHT_MAX, HEIGHT_MIN,
  compute, DEFAULTS, formatCount, formatShare, lowerExpectations, type Filters,
} from "./calc";
import { TvIcon } from "./components/TvIcon";
import { Controls } from "./components/Controls";
import { Funnel } from "./components/Funnel";
import { Screen } from "./components/Screen";
import { useSurveyData } from "./data";
import { fromHash, toHash } from "./urlState";

const initialFilters = (): Filters => fromHash(window.location.hash) ?? DEFAULTS.men;

// No standards at all: the base for the hero's reality checks.
const OPEN: Filters = {
  ...DEFAULTS.men, ageMin: AGE_MIN, ageMax: AGE_MAX, heightMin: HEIGHT_MIN, heightMax: HEIGHT_MAX,
  excludeMarried: false, excludeParents: false, excludeOverweight: false, excludeObese: false, minIncomeK: 0, races: [],
};
const CHECKS: { label: string; f: Filters }[] = [
  { label: "of American men are 6 feet or taller", f: { ...OPEN, heightMin: 72 } },
  { label: "of American men earn $100k or more", f: { ...OPEN, minIncomeK: 100 } },
  { label: "of men are single, 6 feet, and make $100k", f: { ...OPEN, excludeMarried: true, heightMin: 72, minIncomeK: 100 } },
];

export default function App() {
  const data = useSurveyData();
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [note, setNote] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const screenRef = useRef<HTMLDivElement>(null);
  const [screenVisible, setScreenVisible] = useState(true);

  const ready = data.status === "ready";
  const result = useMemo(
    () => (ready ? compute(filters, data.cps, data.nh) : null),
    [ready, filters, data],
  );
  const checks = useMemo(
    () => (ready ? CHECKS.map((c) => ({ ...c, share: compute(c.f, data.cps, data.nh).share })) : null),
    [ready, data],
  );
  const nextLower = useMemo(
    () => (ready ? lowerExpectations(filters, data.cps, data.nh) : null),
    [ready, filters, data],
  );

  useEffect(() => {
    history.replaceState(null, "", toHash(filters));
  }, [filters]);

  useEffect(() => {
    const el = screenRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([entry]) => setScreenVisible(entry.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const change = (f: Filters) => {
    setFilters(f);
    setNote(null);
    setCopied(false);
  };

  const lower = () => {
    if (!nextLower) return;
    setFilters(nextLower.filters);
    setNote(nextLower.note);
    setCopied(false);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      setNote("Couldn't reach the clipboard. The address bar has your link.");
    }
  };

  return (
    <>
      <a className="skip" href="#calculator">Skip to the calculator</a>
      <header className="masthead">
        <a className="wordmark" href="#top" aria-label="Even Lower Expectations, home">
          <TvIcon className="wordmark-tv" />
          <span>Even Lower Expectations</span>
        </a>
        <nav aria-label="Page">
          <a href="#funnel-title">The squares</a>
          <a href="#method">How it works</a>
        </nav>
      </header>

      <main id="top">
        <section className="intro">
          <div className="intro-copy">
            <h1>
              Find the one.
              <br />
              Then lower the{" "}
              <span className="bar-word">
                bar.
                <svg className="bar-sag" viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M2 3C30 19 70 19 98 8" />
                </svg>
              </span>
            </h1>
            <p className="lede">
              Set your standards and see how many real people in the US actually meet them. The numbers come from
              the 2026 Census Bureau survey and the newest NCHS health exam data. When the answer stings, hit the
              pink button.
            </p>
            <a className="btn btn-ink" href="#calculator">Run the numbers</a>
          </div>

          <aside className="checks" aria-labelledby="checks-title">
            <p className="checks-title" id="checks-title">Reality checks</p>
            <ol className="checks-list">
              {CHECKS.map((c, i) => (
                <li key={c.label}>
                  <span className="checks-num">{checks ? formatShare(checks[i].share) : "…"}</span>
                  <span className="checks-label">{c.label}</span>
                </li>
              ))}
            </ol>
            <p className="checks-src">All adults. Census 2026 and NHANES 2021–23.</p>
          </aside>
        </section>

        <section className="workbench" id="calculator" aria-label="Calculator">
          <Controls filters={filters} onChange={change} />
          <div className="workbench-screen" ref={screenRef}>
            <Screen
              result={result}
              seeking={filters.seeking}
              status={data.status}
              note={note}
              canLower={!!nextLower}
              onLower={lower}
              onReset={() => change(DEFAULTS[filters.seeking])}
              onCopy={copy}
              copied={copied}
            />
          </div>
        </section>

        {result && <Funnel result={result} seeking={filters.seeking} />}

        <section className="method" id="method" aria-labelledby="method-title">
          <div className="section-head">
            <h2 id="method-title">How the math works</h2>
            <p>Two federal surveys, one assumption, no made-up numbers.</p>
          </div>

          <div className="method-grid">
            <table className="sources">
              <caption className="sr-only">Data sources</caption>
              <thead>
                <tr><th scope="col">Survey</th><th scope="col">Covers</th><th scope="col">Collected</th><th scope="col">Adults</th></tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">
                    <a href="https://www.census.gov/data/datasets/time-series/demo/cps/cps-asec.html">CPS ASEC 2026</a>
                    <span>US Census Bureau</span>
                  </th>
                  <td>Age, race, marriage, kids at home, income</td>
                  <td>Feb to Apr 2026 · income for 2025</td>
                  <td className="num">{ready ? formatCount(data.cps.adultsSampled) : "…"}</td>
                </tr>
                <tr>
                  <th scope="row">
                    <a href="https://wwwn.cdc.gov/nchs/nhanes/continuousnhanes/default.aspx?Cycle=2021-2023">NHANES 2021–2023</a>
                    <span>National Center for Health Statistics</span>
                  </th>
                  <td>Measured height and body mass index</td>
                  <td>Aug 2021 to Aug 2023</td>
                  <td className="num">{ready ? formatCount(data.nh.adultsMeasured) : "…"}</td>
                </tr>
              </tbody>
            </table>

            <div className="method-notes">
              <p>
                The Census survey counts people by age, race, marriage, kids and income, weighted up to the whole
                country. NHANES actually measures people with a tape and a scale, so height and weight come from
                there. We match the two on sex, age and race, then multiply. That assumes height and weight don't
                depend on income or marriage once age and race are fixed. It's not perfectly true, and it's the
                same shortcut the original calculators used.
              </p>
              <ul>
                <li>“Married” means currently married, spouse present or not. Separated and divorced count as single.</li>
                <li>“Kids” means the person's own child under 18 living in the same home.</li>
                <li>Income is total personal income for 2025, before tax, from all sources.</li>
                <li>Hispanic covers any race. White, Black and Asian mean non-Hispanic.</li>
                <li>Both surveys cap age at 80, so the top of the slider means 80 and older.</li>
                <li>Results with tiny samples get a warning on the screen. Treat them as vibes.</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {Array.from({ length: 2 }, (_, k) => (
              <span key={k}>
                Lowered expectations <i>·</i> even lower <i>·</i> lower than that <i>·</i> lower still <i>·</i>{" "}
              </span>
            ))}
          </div>
        </div>
        <div className="footer-body">
          <p>
            A parody tribute to the “Lowered Expectations” sketch from MADtv. Not affiliated with MADtv, Fox, the
            Census Bureau or the CDC. Inspired by <a href="https://realitycalc.com/">realitycalc.com</a> and{" "}
            <a href="https://igotstandardsbro.com/">igotstandardsbro.com</a>, rebuilt on newer data.
          </p>
          <p className="footer-small">
            Everything runs in your browser. Nothing you pick is stored or sent anywhere.
          </p>
        </div>
      </footer>

      {result && !screenVisible && (
        <a className="mini-readout" href="#calculator">
          <span className="mini-share">{formatShare(result.share)}</span>
          <span>of {filters.seeking} fit · see the screen</span>
        </a>
      )}
    </>
  );
}
