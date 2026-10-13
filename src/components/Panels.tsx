import { formatCount, formatShare, type Group, type Result, type Seeking } from "../calc";
import { checkPhoto, checkSex } from "../photos";
import { Logo, StatusBar, TitleBar } from "./chrome";
import { ChatIcon, MatchesIcon, PicturesIcon, StandardsIcon } from "./RailIcons";

/** One disappointing fact per card slot, per sex. Shares come from App, computed from the survey data. */
export const CHECK_LABELS: Record<Seeking, string[]> = {
  men: [
    "of American men are 6 feet or taller",
    "of American men earn $100k or more",
    "of men are single, 6 feet, and make $100k",
  ],
  women: [
    "of American women are 5'8\" or taller",
    "of American women earn $100k or more",
    "of women are single, under 30, and not overweight",
  ],
};

interface WelcomeProps {
  shares: Record<Seeking, string[]> | null;
  tick: number;
  today: string;
  canLower: boolean;
  copied: boolean;
  onLower: () => void;
  onCopy: () => void;
  onReset: () => void;
}

function Photo({ slot, tick, credit }: { slot: number; tick: number; credit: boolean }) {
  const p = checkPhoto(slot, tick);
  return (
    <>
      <div
        key={tick}
        role="img"
        aria-label="Profile photo"
        className="photo-fill fade-in"
        style={{ backgroundImage: `url("${p.photo}")`, animationDelay: `${slot * 120}ms` }}
      />
      {credit && (p.creditHref
        ? <a className="photo-credit" href={p.creditHref} target="_blank" rel="noopener">{p.credit}</a>
        : <span className="photo-credit">{p.credit}</span>)}
    </>
  );
}

/**
 * The AOL-style "Welcome, Guest!" window: blue shortcut rail, banner, feature card with a rotating photo, Top News, and a My Places sidebar.
 * @category windows
 */
export function Welcome({ shares, tick, today, canLower, copied, onLower, onCopy, onReset }: WelcomeProps) {
  // Each card's fact follows the sex of the photo it shows this tick.
  const fact = (slot: number) => {
    const sex = checkSex(slot, tick);
    return { share: shares ? shares[sex][slot] : "…", label: CHECK_LABELS[sex][slot] };
  };
  return (
    <section id="top" className="win" data-win="welcome" aria-label="Welcome">
      <TitleBar icon={<span className="tb-icon tb-icon-doc" aria-hidden="true" />} title="Welcome, Guest!" />
      <div className="welcome">
        <nav className="welcome-rail" aria-label="Welcome shortcuts">
          <a href="#top" className="rail-brand">
            <Logo className="logo-rail" />
            <span className="rail-kicker">Even Lower</span>
            <span className="rail-script">Expectations</span>
          </a>
          <a href="#calculator" className="rail-link"><MatchesIcon />You've Got Matches</a>
          <a href="#pictures" className="rail-link"><PicturesIcon />You've Got Pictures</a>
          <a href="#calculator" className="rail-link"><StandardsIcon />My Standards</a>
          <a href="#squares" className="rail-link"><ChatIcon />Chat</a>
        </nav>

        <div className="welcome-main">
          <div className="welcome-banner">
            <span className="banner-title">Welcome to <span className="nowrap">Lower Expectations</span></span>
            <span className="banner-date">{today}</span>
          </div>

          <div className="welcome-content">
            <div className="welcome-col">
              <article className="ele-card feature">
                <div className="feature-photo"><Photo slot={0} tick={tick} credit /></div>
                <div className="feature-copy">
                  <p className="kicker">The Numbers on Dating</p>
                  <h1 className="feature-title">
                    <span className="block">Your type exists.</span>
                    <span className="title-line">The Census counted <span className="pink">how few.</span> <Logo className="logo-inline" /></span>
                  </h1>
                  <p className="body-text">
                    Set your standards and see how many real people in the US actually meet them. The numbers come from
                    the 2026 Census Bureau survey and the newest NCHS health exam data. When the answer stings, hit the
                    pink button.
                  </p>
                  <p className="body-text">
                    <strong className="pink">{fact(0).share}</strong> {fact(0).label}.{" "}
                    <a href="#calculator" className="ele-cta">Run the numbers <span className="ele-arrow" aria-hidden="true">↓</span></a>{" "}
                    <span aria-hidden="true" className="sep">|</span> <a href="#method">How it works</a>
                  </p>
                </div>
              </article>

              <div id="pictures" className="news">
                <p className="news-head">Top News <span>· all US adults · photos are stand-ins</span></p>
                <div className="news-grid">
                  {[1, 2].map((i) => {
                    const p = checkPhoto(i, tick);
                    return (
                      <article key={i} className="ele-card news-card">
                        <div className="news-photo"><Photo slot={i} tick={tick} credit={false} /></div>
                        <p>
                          <strong className="pink news-num">{fact(i).share}</strong> {fact(i).label}.{" "}
                          {p.creditHref
                            ? <a href={p.creditHref} target="_blank" rel="noopener" className="credit-link">{p.credit}</a>
                            : <span className="credit-link">{p.credit}</span>}
                        </p>
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>

            <aside className="places" aria-label="My Places">
              <h2>My Places</h2>
              <ul>
                <li><a href="#calculator">Preferences</a></li>
                <li><a href="#calculator">You've Got Matches!</a></li>
                <li><a href="#squares">Where everybody went</a></li>
                <li><a href="#method">How the math works</a></li>
                <li><a href="#buddies">Buddy List</a></li>
              </ul>
              <h2>Have You Tried?</h2>
              <div className="places-btns">
                <button type="button" className="btn-pink btn-small" onClick={onLower} disabled={!canLower}>
                  {canLower ? "Lower my expectations" : "Nothing left to lower"}
                </button>
                <button type="button" className="btn btn-left" onClick={onCopy}>{copied ? "Link copied" : "Copy link"}</button>
                <button type="button" className="btn btn-left" onClick={onReset}>Start over</button>
              </div>
              <p className="places-foot">Keyword: <strong>lower</strong></p>
            </aside>
          </div>

          <div className="now-on" aria-hidden="true">
            <strong>Now on ELE:</strong>
            <div className="marquee-lane">
              <div className="marquee">
                <span>Lowered expectations · even lower · lower than that · lower still ·</span>
                <span>Lowered expectations · even lower · lower than that · lower still ·</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <StatusBar>
        <div className="pane pane-grow">Census 2026 · NHANES 2021–23 · nothing leaves your browser</div>
        <div className="pane">Keyword: Welcome</div>
      </StatusBar>
    </section>
  );
}

/**
 * The "Help — How the math works" window: a data-sources table, method notes, and an OK button.
 * @category windows
 */
export function Help({ cpsSampled, nhMeasured }: { cpsSampled: string; nhMeasured: string }) {
  return (
    <section id="method" className="win ele-reveal" data-reveal="" data-win="help" aria-labelledby="method-title">
      <TitleBar icon={<span className="tb-icon" aria-hidden="true">?</span>} title="Help — How the math works" titleId="method-title" />
      <div className="win-body">
        <p className="body-text"><strong>Two federal surveys, one assumption, no made-up numbers.</strong></p>
        <div className="help-grid">
          <table className="w-table">
            <caption className="sr-only">Data sources</caption>
            <thead>
              <tr><th scope="col">Survey</th><th scope="col">Covers</th><th scope="col">Collected</th><th scope="col" className="num">Adults</th></tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row" className="src">
                  <a href="https://www.census.gov/data/datasets/time-series/demo/cps/cps-asec.html">CPS ASEC 2026</a>
                  <span>US Census Bureau</span>
                </th>
                <td>Age, race, marriage, kids at home, income</td>
                <td>Feb to Apr 2026 · income for 2025</td>
                <td className="num">{cpsSampled}</td>
              </tr>
              <tr>
                <th scope="row" className="src">
                  <a href="https://wwwn.cdc.gov/nchs/nhanes/continuousnhanes/default.aspx?Cycle=2021-2023">NHANES 2021–2023</a>
                  <span>National Center for Health Statistics</span>
                </th>
                <td>Measured height and body mass index</td>
                <td>Aug 2021 to Aug 2023</td>
                <td className="num">{nhMeasured}</td>
              </tr>
            </tbody>
          </table>
          <div className="sunken-white help-notes">
            <p>
              The Census survey counts people by age, race, marriage, kids and income, weighted up to the whole country.
              NHANES actually measures people with a tape and a scale, so height and weight come from there. We match the
              two on sex, age and race, then multiply. That assumes height and weight don't depend on income or marriage
              once age and race are fixed. It's not perfectly true, and it's the same shortcut the original calculators used.
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
        <div className="help-ok"><a href="#top" className="btn btn-strong">OK</a></div>
      </div>
    </section>
  );
}

/**
 * A small Windows message box with the envelope logo, "Lower. Your. Expectations." and Lower them / Cancel buttons.
 * @category windows
 */
export function Message() {
  return (
    <section className="win dialog ele-reveal" data-reveal="" aria-label="Message">
      <TitleBar title="Even Lower Expectations" controls={["close"]} />
      <div className="dialog-body">
        <Logo className="logo-dialog" />
        <h3>Lower. Your. Expectations.</h3>
      </div>
      <div className="dialog-btns">
        <a href="#calculator" className="btn-pink btn-dialog">Lower them</a>
        <span className="btn btn-dialog is-disabled" aria-disabled="true">Cancel</span>
      </div>
    </section>
  );
}

interface BuddyProps {
  result: Result | null;
  groups: Group[];
  seeking: Seeking;
  active: string | null;
  setActive: (key: string | null) => void;
  canLower: boolean;
  onLower: () => void;
}

/**
 * The AIM-style Buddy List sidebar window: match count, then each standard that ruled people out with its color and count.
 * @category windows
 */
export function BuddyList({ result, groups, seeking, active, setActive, canLower, onLower }: BuddyProps) {
  const matchesShort = result ? (result.matches < 1 ? "0" : formatCount(result.matches)) : "…";
  const oneIn = result ? (Number.isFinite(result.oneIn) ? `1 in ${formatCount(result.oneIn)}` : "1 in never") : "…";
  return (
    <aside id="buddies" className="win side buddies" aria-label="Buddy List">
      <TitleBar icon={<span className="tb-icon gold" aria-hidden="true">☺</span>} title="Buddy List" controls={["min", "close"]} />
      <div className="buddy-head"><span className="tool-chip gold teal-ink" aria-hidden="true">☺</span>Buddy List · {seeking}</div>
      <div className="sunken-white buddy-body">
        <p className="buddy-group">▼ Matches ({matchesShort})</p>
        <p className="buddy-match">{result ? formatShare(result.share) : "…"} of adult {seeking} · {oneIn}</p>
        <p className="buddy-group">▼ Ruled out by</p>
        <ul>
          {groups.filter((g) => g.key !== "match").map((g) => (
            <li
              key={g.key}
              className="w-row"
              tabIndex={0}
              data-on={active === g.key ? "" : undefined}
              onPointerEnter={() => setActive(g.key)}
              onPointerLeave={() => setActive(null)}
              onFocus={() => setActive(g.key)}
              onBlur={() => setActive(null)}
            >
              <span className={`swatch small c-${g.key}`} aria-hidden="true" />
              <span className="ellipsis">{g.label}</span>
              <span className="tabnum">{formatCount(g.people)}</span>
            </li>
          ))}
        </ul>
        <p className="buddy-group dim">▶ Online now (0/{matchesShort})</p>
      </div>
      <div className="buddy-btns">
        <button type="button" className="btn-pink btn-small" onClick={onLower} disabled={!canLower}>Lower</button>
        <a href="#calculator" className="btn">Setup</a>
        <a href="#method" className="btn">Help</a>
      </div>
    </aside>
  );
}
