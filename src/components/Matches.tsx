import { formatCount, formatShare, verdict, type Result, type Seeking } from "../calc";
import { MATCH_PHOTO } from "../photos";
import { StatusBar, TitleBar } from "./chrome";

interface MatchesProps {
  status: "loading" | "error" | "ready";
  result: Result | null;
  seeking: Seeking;
  note: string | null;
  rev: number;
  lowers: number;
  canLower: boolean;
  copied: boolean;
  onLower: () => void;
  onReset: () => void;
  onCopy: () => void;
}

/**
 * The "You've Got Matches!" window: match photo, the big share of adults who fit, count, 1-in-N, verdict, the pink Lower button and a VCR-style status bar.
 * @category windows
 */
export function Matches({ status, result, seeking, note, rev, lowers, canLower, copied, onLower, onReset, onCopy }: MatchesProps) {
  const photo = MATCH_PHOTO[seeking];
  const pop = rev % 2 ? "pop-b" : "pop-a";
  const v = result ? verdict(result.share) : null;

  return (
    <section className="win matches" data-win="matches" aria-label="Your odds">
      <TitleBar icon={<span className="tb-icon tb-icon-gold" aria-hidden="true" />} title="You've Got Matches!" controls={["min", "close"]} />
      <div className="matches-body">
        <div className="photo-frame">
          <img src={photo.photo} alt="" loading="lazy" decoding="async" />
          {photo.creditHref
            ? <a className="photo-credit" href={photo.creditHref} target="_blank" rel="noopener">{photo.credit}</a>
            : <span className="photo-credit">{photo.credit}</span>}
        </div>
        <div className="matches-readout">
          {status === "loading" && (
            <p className="connecting"><span className="blink-dot" aria-hidden="true" />Connecting at 56,000 bps…</p>
          )}
          {status === "error" && <p className="connecting">The connection was lost. Reload the page to sign on again.</p>}
          {status === "ready" && result && v && (
            <div aria-live="polite" aria-atomic="true" className="readout-stack">
              <p className="of-line">of adult {seeking} in the US fit</p>
              <p className={`big-share ${pop}`}>{formatShare(result.share)}</p>
              <div className="pills">
                <span className={`pill ${pop}`} style={{ animationDelay: "60ms" }}>
                  About {result.matches < 1 ? "nobody" : `${formatCount(result.matches)} ${seeking}`}
                </span>
                <span className={`pill ${pop}`} style={{ animationDelay: "120ms" }}>
                  {Number.isFinite(result.oneIn) ? `1 in ${formatCount(result.oneIn)}` : "1 in never"}
                </span>
              </div>
              <p className={`verdict ${pop}`} style={{ animationDelay: "180ms" }}>
                <strong>{v.title}.</strong> {v.line}
              </p>
              {result.measuredSample < 60 && (
                <p className="warn">
                  <span className="warn-icon" aria-hidden="true">!</span>
                  <span>Only {result.measuredSample} people in the health survey match this age and race mix, so the height and weight part is a rough guess.</span>
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="matches-actions">
        <button type="button" className="btn-pink btn-lower" onClick={onLower} disabled={!canLower}>
          <span>{canLower ? "Lower my expectations" : "Nothing left to lower"}</span>
          <span className="ele-arrow" aria-hidden="true">↓</span>
        </button>
        <div className="btn-row">
          <button type="button" className="btn" onClick={onReset}>Start over</button>
          <button type="button" className="btn" onClick={onCopy}>{copied ? "Link copied" : "Copy link"}</button>
        </div>
        <p role="status" className={`note ${note ? pop : ""}`}>{note}</p>
      </div>

      <StatusBar>
        <div className="pane pane-grow osd" aria-hidden="true">
          <span className={`osd-dot${status === "loading" ? " blinking" : ""}`} />
          {status === "ready" ? "PLAY ▶" : status === "loading" ? "TRACKING" : "NO SIGNAL"}
        </div>
        <div className="pane osd" aria-hidden="true">CH 03</div>
        <div
          key={note ? `l${lowers}` : "idle"}
          className={`pane osd lowered${note ? " is-on" : ""}`}
          aria-hidden="true"
        >
          LOWERED · SP
        </div>
      </StatusBar>
    </section>
  );
}
