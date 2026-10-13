# design-sync notes

- This repo is an app, not a published library. The kit entry is `src/kit/index.ts`, compiled by `pnpm build:kit` into `dist-kit/` (gitignored). Always run `pnpm build:kit` before the converter and pass `--entry ./dist-kit/kit/index.js --node-modules ./node_modules`.
- `build:kit` also concatenates `src/styles/tokens.css` + `src/styles/app.css` into `dist-kit/kit.css`, which is `cssEntry`. Edit the source stylesheets, never `kit.css`.
- Several components share one source file, so every component is pinned in `componentSrcMap`. Groups come from `@category` in each component's JSDoc (chrome, windows, shell).
- Prop contracts for data windows are hand-written in `dtsPropsFor`, because the extractor dropped `| null` and left `Result`, `Group`, `Filters` undefined. If a component's props change, update `dtsPropsFor` too.
- Playwright must match the cached Chromium. This machine caches chromium-1243, which is playwright@1.63.0. Install that exact version in `.ds-sync/`.
- The scroll fade-in (`.ele-reveal`) only hides content when `<html>` has `.reveal-on`, which `App.tsx` adds. Kit windows used elsewhere always show.
- The Squares preview disables the `.sq` grow animation with an inline style tag, so captures show the settled grid.
- `Taskbar` is `position: fixed`; its preview wraps it in a `transform` box so it stays in the card. It uses `cardMode: single`.

## Known render warns

- None at last sync.

## Re-sync risks

- `SAMPLE_RESULT` in `src/kit/sample.ts` is a frozen copy of the default men's result from the 2026 data. If `public/data/*.json` is rebuilt, recompute it.
- Preview photos are hotlinked from images.unsplash.com. Captures need network access, and a removed photo shows as a black frame.
- `dtsPropsFor` duplicates the prop shapes by hand and will go stale silently when components change.
