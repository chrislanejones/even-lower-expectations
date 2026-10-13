import { useEffect, useRef, useState } from "react";
import { StatusBar, TitleBar } from "./chrome";

export interface Tape {
  src: string;
  poster: string;
  /** Shown in the title bar after "Personal Ad". */
  id: string;
  blurb: string;
  alt: string;
}

/** The two personal ads, in play order. The woman runs first; the man follows when she ends. */
export const TAPES: Tape[] = [
  {
    src: "/video/video-date-1990.mp4",
    poster: "/video/video-date-1990-poster.webp",
    id: "#1990",
    blurb: "Loves long walks to the mailbox and a 28.8 modem. Single since June 1990.",
    alt: "A woman in a pink sweater records her video dating ad, June 1990",
  },
  {
    src: "/video/video-date-1990-man.mp4",
    poster: "/video/video-date-1990-man-poster.webp",
    id: "#1999",
    blurb: "Owns one armchair and one tank top. Will explain both. Taped May 1999.",
    alt: "A man in a gray tank top sits in an armchair and records his video dating ad, May 1999",
  },
];

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/**
 * A tiny AOL-era video window playing 160px, 12fps personal ads, shown blown up with hard pixels.
 * Never autoplays and never unmutes on its own: the poster shows until Play, playback starts muted,
 * and sound comes on only when the viewer presses "Sound on" (Chrome allows audio only after a click).
 * Tapes play in order; when one ends the next starts, and Next skips ahead.
 * @category windows
 */
export function VideoAd({ tapes = TAPES }: { tapes?: Tape[] }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [time, setTime] = useState(0);
  const [length, setLength] = useState(15);
  // Whether playback should carry on into the next tape (set by Play or a tape ending, cleared by Pause).
  const rolling = useRef(false);
  const tape = tapes[index];

  // Changing tapes swaps the <video> source; keep playing only if the viewer had it rolling.
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.load();
    setTime(0);
    if (rolling.current) v.play().catch(() => setPlaying(false));
  }, [index]);

  const advance = () => setIndex((i) => (i + 1) % tapes.length);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      rolling.current = true;
      void v.play();
    } else {
      rolling.current = false;
      v.pause();
    }
  };

  const next = () => {
    if (tapes.length < 2) return;
    rolling.current = true;
    advance();
  };

  return (
    <section className="win video-ad" aria-label="Video personal ads">
      <TitleBar icon={<span className="tb-icon" aria-hidden="true">▶</span>} title={`AOL Video — Personal Ad ${tape.id}`} controls={["min", "close"]} />
      <div className="video-body">
        <div className="video-bezel">
          <div className="video-bezel-top" aria-hidden="true">
            <span className="video-aol">AOL</span>
            <span className="video-aol-word">Video</span>
            <span className="video-rec"><i />REC</span>
          </div>
          <div className="video-screen">
            <video
              ref={ref}
              poster={tape.poster}
              muted={muted}
              playsInline
              preload="metadata"
              aria-label={tape.alt}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={advance}
              onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => setLength(e.currentTarget.duration || 15)}
            >
              <source src={tape.src} type="video/mp4" />
            </video>
          </div>
          <div className="video-bezel-bottom" aria-hidden="true">
            <span className="video-vents"><i /><i /><i /><i /><i /><i /></span>
            <span className="video-lcd">{fmt(time)} / {fmt(length)}</span>
          </div>
        </div>
        <div className="video-side">
          <p className="video-blurb">{tape.blurb}</p>
          <div className="video-controls">
            <button type="button" className="w-tool video-tool" onClick={toggle} aria-pressed={playing}>
              <span className="tool-chip gold" aria-hidden="true">{playing ? "❚❚" : "▶"}</span>{playing ? "Pause" : "Play"}
            </button>
            <button type="button" className="w-tool video-tool" onClick={next} aria-label="Next tape">
              <span className="tool-chip white" aria-hidden="true">⏭</span>Next
            </button>
            <button type="button" className="w-tool video-tool" onClick={() => setMuted((m) => !m)} aria-pressed={!muted}>
              <span className="tool-chip white" aria-hidden="true">{muted ? "✕" : "♪"}</span>{muted ? "Sound off" : "Sound on"}
            </button>
          </div>
        </div>
      </div>
      <StatusBar>
        <div className="pane pane-grow" aria-hidden="true">{playing ? "Streaming at 28.8 kbps…" : time > 0 ? "Paused" : "Press Play to connect"}</div>
        <div className="pane" aria-hidden="true">Tape {index + 1} of {tapes.length}</div>
      </StatusBar>
    </section>
  );
}
