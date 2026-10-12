import { formatCount, formatShare, verdict, type Result, type Seeking } from "../calc";

interface ScreenProps {
  result: Result | null;
  seeking: Seeking;
  status: "loading" | "error" | "ready";
  note: string | null;
  canLower: boolean;
  onLower: () => void;
  onReset: () => void;
  onCopy: () => void;
  copied: boolean;
}

export function Screen({ result, seeking, status, note, canLower, onLower, onReset, onCopy, copied }: ScreenProps) {
  const v = result ? verdict(result.share) : null;
  return (
    <section className="tv" aria-label="Your odds">
      <div className="screen" data-status={status}>
        <div className="osd osd-top" aria-hidden="true">
          <span>{status === "ready" ? "PLAY ▶" : status === "loading" ? "TRACKING" : "NO SIGNAL"}</span>
          <span>CH 03</span>
        </div>

        {status === "loading" && <p className="screen-msg">Rewinding the tape…</p>}
        {status === "error" && (
          <p className="screen-msg">The tape got eaten. Reload the page and try again.</p>
        )}

        {result && v && (
          <div className="readout" aria-live="polite" aria-atomic="true">
            <p className="readout-label">of adult {seeking} in the US fit</p>
            <p className="readout-share">{formatShare(result.share)}</p>
            <dl className="readout-facts">
              <div>
                <dt>That's about</dt>
                <dd>{result.matches < 1 ? "nobody" : `${formatCount(result.matches)} ${seeking}`}</dd>
              </div>
              <div>
                <dt>Or</dt>
                <dd>{Number.isFinite(result.oneIn) ? `1 in ${formatCount(result.oneIn)}` : "1 in never"}</dd>
              </div>
            </dl>
            <p className="verdict">
              <span className="verdict-title">{v.title}.</span> {v.line}
            </p>
            {result.measuredSample < 60 && (
              <p className="small-sample">
                Heads up: only {result.measuredSample} people in the health survey match this age and race mix, so the height and weight part is a rough guess.
              </p>
            )}
          </div>
        )}

        <div className="osd osd-bottom" aria-hidden="true">
          <span>LOWERED</span>
          <span>SP</span>
        </div>
      </div>

      <div className="tv-actions">
        <button type="button" className="btn btn-primary" onClick={onLower} disabled={!canLower}>
          {canLower ? "Lower my expectations" : "Nothing left to lower"}
        </button>
        <div className="tv-secondary">
          <button type="button" className="btn btn-quiet" onClick={onReset}>Start over</button>
          <button type="button" className="btn btn-quiet" onClick={onCopy} data-state={copied ? "success" : undefined}>
            {copied ? "Link copied" : "Copy link"}
          </button>
        </div>
      </div>
      <p className="lowered-note" role="status">{note ?? ""}</p>
    </section>
  );
}
