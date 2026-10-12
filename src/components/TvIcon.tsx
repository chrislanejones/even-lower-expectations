/** A little CRT with rabbit ears and a broken heart on the screen. Colors come from tokens. */
export function TvIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 36" aria-hidden="true" focusable="false">
      <path d="M14 10 8 1.5M26 10l6-8.5" fill="none" stroke="var(--color-ink)" strokeWidth="2.6" strokeLinecap="round" />
      <rect x="2" y="9" width="36" height="26" rx="6" fill="var(--color-ink)" />
      <rect x="6" y="13" width="22" height="18" rx="3" fill="var(--color-screen-2)" />
      <path
        d="M17 27.5c-4-3-6-5.3-6-8a3 3 0 0 1 6-1 3 3 0 0 1 6 1c0 2.7-2 5-6 8Z"
        fill="var(--color-accent)"
      />
      <path
        d="M17.2 17.3l-1.9 2.7 2.8 2.3-2 2.6 1.6 2.6"
        fill="none"
        stroke="var(--color-screen-2)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx="33" cy="18" r="2" fill="var(--color-paper)" />
      <circle cx="33" cy="25" r="2" fill="var(--color-paper)" />
    </svg>
  );
}
