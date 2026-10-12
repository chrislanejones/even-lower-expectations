import { useState } from "react";
import { formatCount, type Result } from "../calc";

const CELLS = 1000;

interface Group {
  key: string; // color key: the standard that cut these people, or "match"
  label: string;
  people: number;
  cells: number;
}

/** Split the population into "cut by step X" groups plus the matches, as 1,000 squares. */
function toGroups(result: Result): Group[] {
  const { steps } = result;
  const groups: Group[] = [];
  for (let i = 1; i < steps.length; i++) {
    const cut = steps[i - 1].count - steps[i].count;
    groups.push({ key: steps[i].key, label: steps[i].label, people: Math.max(cut, 0), cells: 0 });
  }
  groups.push({ key: "match", label: "Your matches", people: result.matches, cells: 0 });
  const total = steps[0]?.count || 1;

  // Largest-remainder rounding so the squares always add up to exactly 1,000.
  const raw = groups.map((g) => (g.people / total) * CELLS);
  groups.forEach((g, i) => (g.cells = Math.floor(raw[i])));
  let left = CELLS - groups.reduce((n, g) => n + g.cells, 0);
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

export function Funnel({ result, seeking }: { result: Result; seeking: string }) {
  const [active, setActive] = useState<string | null>(null);
  const groups = toGroups(result);
  const perCell = result.base / CELLS;
  const match = groups[groups.length - 1];
  const shown = groups.filter((g) => g.cells > 0 || g.key === "match");

  const cells: string[] = [];
  for (const g of groups) for (let i = 0; i < g.cells; i++) cells.push(g.key);

  const activeGroup = groups.find((g) => g.key === active);

  return (
    <section className="funnel" aria-labelledby="funnel-title">
      <div className="section-head">
        <h2 id="funnel-title">Where everybody went</h2>
        <p>
          All adult {seeking} in the US, as 1,000 squares. One square is about {formatCount(perCell)} people, and <span className="only-wide">each column</span><span className="only-narrow">each row</span> is <span className="only-wide">1%</span><span className="only-narrow">2.5%</span>.
          Each color is the standard that ruled them out. Pink is who's left.
        </p>
      </div>

      <div
        className="squares"
        data-active={active ?? undefined}
        role="img"
        aria-label={`1,000 squares. ${shown.map((g) => `${g.key === "match" ? "Matches" : `Cut by ${g.label}`}: ${g.cells}`).join(". ")}.`}
        onPointerOver={(e) => {
          const key = (e.target as HTMLElement).dataset.g;
          if (key) setActive(key);
        }}
        onPointerLeave={() => setActive(null)}
      >
        {cells.map((key, i) => (
          <span key={i} data-g={key} className={`sq sq-${key}`} />
        ))}
      </div>

      <p className="squares-hover" aria-hidden="true">
        {activeGroup
          ? activeGroup.key === "match"
            ? `Your matches: about ${formatCount(activeGroup.people)} ${seeking}`
            : `${activeGroup.label} ruled out about ${formatCount(activeGroup.people)} ${seeking}`
          : "Point at a color to see who it ruled out."}
      </p>

      <table className="squares-key">
        <caption className="sr-only">Who each standard ruled out</caption>
        <thead>
          <tr>
            <th scope="col">Standard</th>
            <th scope="col" className="num">Ruled out</th>
            <th scope="col" className="num">Still in</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g, i) => {
            const stillIn = g.key === "match" ? g.people : result.steps[i + 1].count;
            return (
              <tr
                key={g.key}
                className={g.key === "match" ? "key-match" : undefined}
                data-on={active === g.key ? "" : undefined}
                tabIndex={0}
                onPointerEnter={() => setActive(g.key)}
                onPointerLeave={() => setActive(null)}
                onFocus={() => setActive(g.key)}
                onBlur={() => setActive(null)}
              >
                <th scope="row">
                  <span className={`swatch sq-${g.key}`} aria-hidden="true" />
                  {g.key === "match" ? "Your matches" : g.label}
                </th>
                <td className="num">{g.key === "match" ? "—" : formatCount(g.people)}</td>
                <td className="num">{stillIn < 1 ? "0" : formatCount(stillIn)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {match.people > 0 && match.people < perCell && (
        <p className="squares-note">Your matches are less than one square, so we drew one anyway. Squint.</p>
      )}
    </section>
  );
}
