import type { ReactNode } from "react";

/**
 * Shared gradients and soft shadows for every Logo. Render once near the top of the page, before any Logo.
 * @category chrome
 */
export function LogoDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="ele-env" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fffaf6" /><stop offset="1" stopColor="#efd9cc" /></linearGradient>
        <linearGradient id="ele-flap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#f3e1d6" /></linearGradient>
        <linearGradient id="ele-heart" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff8fc3" /><stop offset="1" stopColor="#ff2d8a" /></linearGradient>
        <filter id="ele-plush" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="2.5" stdDeviation="1.8" floodColor="#6b3b2a" floodOpacity="0.32" /></filter>
        <filter id="ele-plush-heart" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="1.5" stdDeviation="1.2" floodColor="#b3145f" floodOpacity="0.45" /></filter>
      </defs>
    </svg>
  );
}

const HEART = "M38 50 C31.5 45 27 41.5 27 36.5 C27 33.2 29.6 31 32.4 31 C34.8 31 36.9 32.4 38 34.2 C39.1 32.4 41.2 31 43.6 31 C46.4 31 49 33.2 49 36.5 C49 41.5 44.5 45 38 50 Z";
const FLAP = "M15 22 Q15 16 21 16 L55 16 Q61 16 61 22 L61 24 L38 42 L15 24 Z";

/**
 * The love-letter envelope. `plush` adds the soft shadows and highlights.
 * @category chrome
 */
export function Logo({ className, plush = true }: { className?: string; plush?: boolean }) {
  return (
    <svg className={`ele-logo ${className ?? ""}`} viewBox="12 13 52 41" aria-hidden="true" focusable="false">
      <g filter={plush ? "url(#ele-plush)" : undefined}>
        <rect x="15" y="16" width="46" height="34" rx="8" fill="url(#ele-env)" />
        {plush && <path d="M15 24 L28 36 M61 24 L48 36" stroke="#e2c4b4" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.8" />}
        <path d={FLAP} fill="url(#ele-flap)" stroke="#e2c4b4" strokeWidth="1.2" strokeLinejoin="round" />
        {plush && <ellipse cx="27" cy="21" rx="7" ry="2.4" fill="#fff" opacity="0.7" />}
      </g>
      <g filter={plush ? "url(#ele-plush-heart)" : undefined}>
        <path d={HEART} fill="url(#ele-heart)" />
        {plush && <ellipse cx="33.5" cy="35" rx="2.6" ry="1.4" fill="#fff" opacity="0.75" transform="rotate(-25 33.5 35)" />}
      </g>
    </svg>
  );
}

type Ctl = "min" | "max" | "close" | "help";
const GLYPH: Record<Ctl, string> = { min: "_", max: "□", close: "×", help: "?" };

/**
 * The minimize, maximize, close and help boxes on a title bar. Decorative only.
 * @category chrome
 */
export function WinControls({ controls = ["min", "max", "close"] }: { controls?: Ctl[] }) {
  return (
    <span className="tb-ctls" aria-hidden="true">
      {controls.map((c) => <span key={c} className={`tb-ctl tb-${c}`}>{GLYPH[c]}</span>)}
    </span>
  );
}

/**
 * The navy-to-sky gradient title bar every window starts with. Put it first inside a `.win` container.
 * @category chrome
 */
export function TitleBar({ icon, title, titleId, controls }: { icon?: ReactNode; title: ReactNode; titleId?: string; controls?: Ctl[] }) {
  return (
    <div className="titlebar">
      {icon}
      <span className="titlebar-text" id={titleId}>{title}</span>
      <WinControls controls={controls} />
    </div>
  );
}

/** The row of sunken panes along the bottom of a window. Children are `.pane` divs; add `.pane-grow` to the wide one.
 * @category chrome
 */
export function StatusBar({ children }: { children: ReactNode }) {
  return <div className="statusbar">{children}</div>;
}
