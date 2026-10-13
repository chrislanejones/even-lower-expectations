# Even Lower Expectations kit: conventions

An AOL 6 on Windows 2000 look: gray desktop, beveled gray windows with navy-to-sky title bars, hot-pink accent, Tahoma. Everything is styled by plain CSS classes and `var(--*)` tokens from `styles.css`. There is no provider and no theme object.

## Setup

- Render `<LogoDefs />` once near the top of the page, before any `Logo`. Without it the envelope logo paints no gradients.
- Put the page on the desktop color: `background: var(--desk)` on the page wrapper. Text is `13px` Tahoma by default.
- Data windows (`Matches`, `Squares`, `BuddyList`) take a `result` and `groups`. Use `SAMPLE_RESULT` and `SAMPLE_GROUPS` for real numbers, or `compute()` + `toGroups()` when you have survey data. `Preferences` takes `DEFAULTS.men`, `DEFAULTS.women` or `SAMPLE_FILTERS`.
- `Squares` and `BuddyList` share hover state: pass the same `active` and `setActive` to both.
- `Taskbar` is `position: fixed` at the bottom. Leave about `64px` of bottom padding on the page.

## Build your own window

A window is a `.win` box with `TitleBar` first, a `.win-body`, and an optional `StatusBar`.

| Need | Classes |
|---|---|
| Window shell | `.win`, `.win-body`, `.titlebar` (via `TitleBar`), `.tb-icon`, `.tb-icon-doc`, `.tb-icon-gold` |
| Status bar | `StatusBar` with `.pane` children; `.pane-grow` for the wide one |
| Buttons | `.btn` (gray bevel), `.btn-pink` (the one primary action), `.btn-blue` (Search), `.btn-small`, `.btn-lower` (full-width pink), `.btn-tiny`, `.btn-strong` (default OK) |
| Toggle buttons | `.btn.chip` with `aria-pressed` |
| Form groups | `<fieldset class="group">` + `<legend>`, `.group-head`, `.readout` (bold value), `.hint` |
| Text | `.body-text` (12px/18px), `.fine` (11px gray), `.kicker`, `.pink` |
| Sunken areas | `.sunken-white`, `.field-sunken` (text input) |
| Tables | `.w-table`, `.num` cells, `.w-row` (navy hover, `data-on` to pin) |
| Checkbox / radio | `label.check` > `input` + `.check-ui` + `.check-text`; `label.radio` > `input` + `.radio-ui` |
| Slider | `.w-slider` with `--lo`/`--hi` as 0 to 1 fractions, containing `.w-track` > `.w-fill`, then `input.w-range` (two for a range) |
| Standard colors | `.c-age`, `.c-race`, `.c-married`, `.c-parent`, `.c-income`, `.c-height`, `.c-body`, `.c-match`; `.swatch` for a key chip |

Tokens: `--desk`, `--face`, `--face-lit`, `--accent`, `--accent-deep`, `--title1`, `--title2`, `--navy`, `--royal`, `--sky`, `--gold`, `--link`. Bevels are box-shadow tokens: `--raised`, `--pressed`, `--sunken`, `--sunken-thin`, `--pink-raised`. Never use rounded corners or soft drop shadows on chrome; bevels only. Keep one pink button per window.

## Where the truth lives

Read `styles.css` (it imports `_ds_bundle.css`, which holds every class above) and each component's `.prompt.md` and `.d.ts`.

## Example

```jsx
const { LogoDefs, TitleBar, StatusBar, Matches, SAMPLE_RESULT } = window.EvenLowerExpectations;

<div style={{ background: "var(--desk)", padding: 24 }}>
  <LogoDefs />
  <form className="win" style={{ maxWidth: 420 }}>
    <TitleBar icon={<span className="tb-icon">⚙</span>} title="Preferences — Dating rules" controls={["help", "close"]} />
    <div className="win-body">
      <fieldset className="group">
        <legend>Deal breakers</legend>
        <label className="check"><input type="checkbox" defaultChecked /><span className="check-ui">✓</span><span className="check-text">No smokers</span></label>
      </fieldset>
      <button type="button" className="btn-pink btn-lower">Lower my expectations <span>↓</span></button>
    </div>
    <StatusBar><div className="pane pane-grow">Ready</div><div className="pane">56k</div></StatusBar>
  </form>
  <Matches status="ready" result={SAMPLE_RESULT} seeking="men" note={null} rev={0} lowers={0}
    canLower copied={false} onLower={() => {}} onReset={() => {}} onCopy={() => {}} />
</div>
```
