/**
 * Glossy AOL-style welcome-rail icons. Each draws at 44x36 with its own gradients,
 * so ids are prefixed per icon to stay unique on the page.
 */

const svgProps = { viewBox: "0 0 44 36", "aria-hidden": true, focusable: false } as const;

/** Gold "You've Got Mail" envelope with a pink heart seal. */
export function MatchesIcon() {
  return (
    <svg className="rail-icon" {...svgProps}>
      <defs>
        <linearGradient id="ri-env" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff2a8" />
          <stop offset="0.5" stopColor="#ffd400" />
          <stop offset="1" stopColor="#e0a400" />
        </linearGradient>
        <linearGradient id="ri-flap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff7c8" />
          <stop offset="1" stopColor="#f5c400" />
        </linearGradient>
      </defs>
      <rect x="3" y="7" width="38" height="25" rx="3" fill="url(#ri-env)" stroke="#7a5200" strokeWidth="1.4" />
      <path d="M3.7 30.8 17 19M40.3 30.8 27 19" stroke="#b07a00" strokeWidth="1.2" fill="none" />
      <path d="M3.5 8.5 22 22 40.5 8.5" fill="url(#ri-flap)" stroke="#7a5200" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M22 26.5c-3.4-2.4-5.2-4-5.2-6.1a2.6 2.6 0 0 1 5.2-.9 2.6 2.6 0 0 1 5.2.9c0 2.1-1.8 3.7-5.2 6.1Z" fill="#ff2d8a" stroke="#8a0a45" strokeWidth="0.9" />
      <ellipse cx="20" cy="20.2" rx="1.2" ry="0.7" fill="#fff" opacity="0.8" />
      <path d="M6 9.5h12" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

/** Two tilted snapshots, the front one showing sky, sun and hills. */
export function PicturesIcon() {
  return (
    <svg className="rail-icon" {...svgProps}>
      <defs>
        <linearGradient id="ri-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4f9ff0" />
          <stop offset="1" stopColor="#cfe7ff" />
        </linearGradient>
      </defs>
      <g transform="rotate(-10 16 18)">
        <rect x="4" y="6" width="24" height="22" rx="1.5" fill="#f4f1e8" stroke="#3a3a3a" strokeWidth="1.2" />
        <rect x="7" y="9" width="18" height="12" fill="#9b7bd6" />
      </g>
      <g transform="rotate(8 28 19)">
        <rect x="15" y="7" width="26" height="24" rx="1.5" fill="#fff" stroke="#2a2a2a" strokeWidth="1.3" />
        <rect x="18" y="10" width="20" height="14" fill="url(#ri-sky)" />
        <circle cx="33" cy="14" r="2.6" fill="#ffd400" stroke="#c98a00" strokeWidth="0.6" />
        <path d="M18 24l5-6 4 4 3-3 8 5Z" fill="#1baf7a" stroke="#0a6b48" strokeWidth="0.6" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

/** Clipboard checklist with green checks. */
export function StandardsIcon() {
  return (
    <svg className="rail-icon" {...svgProps}>
      <defs>
        <linearGradient id="ri-board" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d9a35f" />
          <stop offset="1" stopColor="#9c6224" />
        </linearGradient>
        <linearGradient id="ri-clip" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2f2f2" />
          <stop offset="1" stopColor="#9a9a9a" />
        </linearGradient>
      </defs>
      <rect x="10" y="4" width="24" height="30" rx="2.5" fill="url(#ri-board)" stroke="#5a3510" strokeWidth="1.3" />
      <rect x="13" y="8" width="18" height="23" fill="#fff" stroke="#8a7a60" strokeWidth="0.7" />
      <rect x="16.5" y="2" width="11" height="5.5" rx="1.5" fill="url(#ri-clip)" stroke="#4a4a4a" strokeWidth="1" />
      {[13, 19, 25].map((y) => (
        <g key={y}>
          <path d={`M15 ${y}l1.6 1.8 3-3.6`} fill="none" stroke="#1a9a3a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d={`M21.5 ${y}h7`} stroke="#6a7a8a" strokeWidth="1.3" strokeLinecap="round" />
        </g>
      ))}
    </svg>
  );
}

/** Two overlapping chat bubbles with a heart. */
export function ChatIcon() {
  return (
    <svg className="rail-icon" {...svgProps}>
      <defs>
        <linearGradient id="ri-b1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff9c4" />
          <stop offset="1" stopColor="#ffd400" />
        </linearGradient>
        <linearGradient id="ri-b2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff9ccb" />
          <stop offset="1" stopColor="#ff2d8a" />
        </linearGradient>
      </defs>
      <path d="M4 6h22a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H13l-6 5v-5H4a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3Z" fill="url(#ri-b1)" stroke="#7a5200" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M7 11h15M7 15.5h10" stroke="#a07000" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M20 14h19a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-2v5l-6-5H20a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3Z" fill="url(#ri-b2)" stroke="#8a0a45" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M29.5 26.5c-2.7-1.9-4.1-3.2-4.1-4.8a2 2 0 0 1 4.1-.7 2 2 0 0 1 4.1.7c0 1.6-1.4 2.9-4.1 4.8Z" fill="#fff" />
    </svg>
  );
}
