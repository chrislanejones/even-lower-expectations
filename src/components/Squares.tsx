import { formatCount, type Group, type Result, type Seeking } from "../calc";
import { StatusBar, TitleBar } from "./chrome";

interface SquaresProps {
  result: Result | null;
  groups: Group[];
  seeking: Seeking;
  active: string | null;
  setActive: (key: string | null) => void;
}

/**
 * The "Where everybody went" window: 1,000 colored squares showing which standard ruled people out, a key table, and a hover readout in the status bar.
 * @category windows
 */
export function Squares({ result, groups, seeking, active, setActive }: SquaresProps) {
  const perCell = result ? result.base / 1000 : 0;
  const match = groups[groups.length - 1];
  const activeGroup = groups.find((g) => g.key === active);
  const hover = activeGroup
    ? activeGroup.key === "match"
      ? `Your matches: about ${formatCount(activeGroup.people)} ${seeking}`
      : `${activeGroup.label} ruled out about ${formatCount(activeGroup.people)} ${seeking}`
    : "Point at a color to see who it ruled out.";

  const cells: string[] = [];
  for (const g of groups) for (let i = 0; i < g.cells; i++) cells.push(g.key);
  const aria = `1,000 squares. ${groups
    .filter((g) => g.cells > 0 || g.key === "match")
    .map((g) => `${g.key === "match" ? "Matches" : `Cut by ${g.label}`}: ${g.cells}`)
    .join(". ")}.`;

  return (
    <section id="squares" className="win ele-reveal" data-reveal="" data-win="chart" aria-labelledby="squares-title">
      <TitleBar icon={<span className="tb-icon" aria-hidden="true">▦</span>} title="Where everybody went" titleId="squares-title" />
      <div className="win-body">
        <p className="body-text">
          All adult {seeking} in the US, as 1,000 squares. One square is about {result ? formatCount(perCell) : "…"} people, and
          each <span className="only-wide">column is 1%</span><span className="only-narrow">row is 2.5%</span>. Each color is the
          standard that ruled them out. Pink is who's left.
        </p>
        <div className="sunken-white squares-well">
          <div
            className="squares"
            data-active={active ?? undefined}
            role="img"
            aria-label={aria}
            onPointerOver={(e) => {
              const key = (e.target as HTMLElement).dataset.g;
              if (key && key !== active) setActive(key);
            }}
            onPointerLeave={() => setActive(null)}
          >
            {cells.map((key, i) => (
              <span key={i} data-g={key} className={`sq c-${key}`} style={{ animationDelay: `${Math.min(i * 1.2, 900)}ms` }} />
            ))}
          </div>
        </div>

        <table className="w-table">
          <caption className="sr-only">Who each standard ruled out</caption>
          <thead>
            <tr>
              <th scope="col">Standard</th>
              <th scope="col" className="num">Ruled out</th>
              <th scope="col" className="num">Still in</th>
            </tr>
          </thead>
          <tbody>
            {result && groups.map((g, i) => {
              const stillIn = g.key === "match" ? g.people : result.steps[i + 1].count;
              return (
                <tr
                  key={g.key}
                  className={`w-row${g.key === "match" ? " is-match" : ""}`}
                  data-on={active === g.key ? "" : undefined}
                  tabIndex={0}
                  onPointerEnter={() => setActive(g.key)}
                  onPointerLeave={() => setActive(null)}
                  onFocus={() => setActive(g.key)}
                  onBlur={() => setActive(null)}
                >
                  <th scope="row">
                    <span className="swatch-wrap"><span className={`swatch c-${g.key}`} aria-hidden="true" />{g.label}</span>
                  </th>
                  <td className="num">{g.key === "match" ? "—" : formatCount(g.people)}</td>
                  <td className="num">{stillIn < 1 ? "0" : formatCount(stillIn)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {match && match.people > 0 && match.people < perCell && (
          <p className="fine">Your matches are less than one square, so we drew one anyway. Squint.</p>
        )}
      </div>
      <StatusBar>
        <div className="pane pane-grow" aria-hidden="true">{hover}</div>
        <div className="pane" aria-hidden="true">1,000 squares</div>
      </StatusBar>
    </section>
  );
}
