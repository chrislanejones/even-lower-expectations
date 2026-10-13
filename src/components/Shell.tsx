import type { FormEvent } from "react";
import { Logo, TitleBar, WinControls } from "./chrome";

export const TASKS = [
  { id: "welcome", label: "Welcome", href: "#top" },
  { id: "prefs", label: "Preferences", href: "#calculator" },
  { id: "matches", label: "You've Got Matches!", href: "#calculator" },
  { id: "chart", label: "Where everybody went", href: "#squares" },
  { id: "help", label: "Help", href: "#method" },
] as const;

interface ToolbarProps {
  showChannels: boolean;
  onToggleChannels: () => void;
  keyword: string;
  onKeyword: (k: string) => void;
  onKeywordSubmit: () => void;
  onLower: () => void;
  onCopy: () => void;
  copied: boolean;
}

const TOOL_GROUPS = [
  { name: "Mail", tone: "mail", tools: [{ label: "Read", glyph: "✉", href: "#calculator", chip: "gold" }, { label: "Write", glyph: "✎", href: "#calculator", chip: "white" }] },
  { name: "People", tone: "people", tools: [{ label: "Buddies", glyph: "☺", href: "#buddies", chip: "gold" }, { label: "Chat", glyph: "♥", href: "#squares", chip: "white heart" }] },
  { name: "Services", tone: "services", tools: [{ label: "Chart", glyph: "▦", href: "#squares", chip: "white" }, { label: "Data", glyph: "▤", href: "#method", chip: "gold" }] },
  { name: "Settings", tone: "settings", tools: [{ label: "Preferences", glyph: "⚙", href: "#calculator", chip: "white" }, { label: "Help", glyph: "?", href: "#method", chip: "gold" }] },
] as const;

/**
 * The AOL 6 app header: title bar, File/Edit menu, colored Mail/People/Services/Settings/Favorites tool groups, and the keyword address bar.
 * @category shell
 */
export function Toolbar({ showChannels, onToggleChannels, keyword, onKeyword, onKeywordSubmit, onLower, onCopy, copied }: ToolbarProps) {
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onKeywordSubmit();
  };
  return (
    <header className="toolbar">
      <div className="titlebar">
        <Logo className="logo-title" />
        <span className="titlebar-text">Even Lower Expectations — Online</span>
        <WinControls />
      </div>
      <nav className="menubar" aria-label="Menu">
        <span className="w-menu">File</span>
        <span className="w-menu">Edit</span>
        <span className="w-menu">Print</span>
        <a className="w-menu" href="#squares">Window</a>
        <a className="w-menu" href="#top">Sign Off</a>
        <a className="w-menu" href="#method">Help</a>
      </nav>

      <div className="toolgroups">
        {TOOL_GROUPS.map((g) => (
          <div key={g.name} className={`toolgroup tone-${g.tone}`}>
            <div className="toolgroup-tab">{g.name} <span aria-hidden="true">▼</span></div>
            <div className="toolgroup-row">
              {g.tools.map((t) => (
                <a key={t.label} href={t.href} className="w-tool">
                  <span className={`tool-chip ${t.chip}`} aria-hidden="true">{t.glyph}</span>{t.label}
                </a>
              ))}
            </div>
          </div>
        ))}
        <div className="toolgroup tone-favorites">
          <div className="toolgroup-tab">Favorites <span aria-hidden="true">▼</span></div>
          <div className="toolgroup-row">
            <button type="button" className="w-tool" onClick={onLower}>
              <span className="tool-chip pink" aria-hidden="true">↓</span>Lower
            </button>
            <button type="button" className="w-tool" onClick={onCopy}>
              <span className="tool-chip white" aria-hidden="true">⎘</span>{copied ? "Link copied" : "Copy link"}
            </button>
          </div>
        </div>
        <a href="#top" aria-label="Welcome" className="toolbar-badge">
          <Logo plush={false} />
        </a>
      </div>

      <div className="addressbar">
        <button type="button" className="btn btn-tiny" onClick={onToggleChannels} aria-pressed={showChannels}>
          {showChannels ? "Hide Channels" : "Show Channels"}
        </button>
        <span className="navbtns" aria-hidden="true">
          <span className="navbtn dim">◄</span>
          <span className="navbtn dim">►</span>
          <span className="navbtn">⟳</span>
        </span>
        <form className="keyword-form" onSubmit={submit}>
          <label htmlFor="aol-keyword" className="sr-only">Keyword</label>
          <input
            id="aol-keyword" type="text" className="field-sunken" value={keyword}
            onChange={(e) => onKeyword(e.target.value)} placeholder="Type Keywords or Web Addresses here"
          />
          <button type="submit" className="btn">Go</button>
          <button type="submit" className="btn btn-blue">Search</button>
          <button type="submit" className="btn">Keyword</button>
        </form>
      </div>
    </header>
  );
}

/**
 * The left Channels rail of blue gradient buttons, one per window. `win` highlights the current one.
 * @category shell
 */
export function Channels({ win }: { win: string }) {
  return (
    <aside className="win side channels" aria-label="Channels">
      <TitleBar title="Channels" controls={["close"]} />
      <div className="chan-list">
        {TASKS.map((t) => (
          <a key={t.id} href={t.href} className={`w-chan${win === t.id ? " is-on" : ""}`} aria-current={win === t.id ? "true" : undefined}>
            {t.label}
          </a>
        ))}
        <a href="#pictures" className="w-chan teal">Reality Checks</a>
        <a href="#buddies" className="w-chan plum">Buddy List</a>
      </div>
      <div className="side-foot">Keyword: <strong>lower</strong></div>
    </aside>
  );
}

/**
 * The fixed Windows 2000 taskbar along the bottom: Sign On button, one task button per window, and a tray clock.
 * @category shell
 */
export function Taskbar({ win, clock }: { win: string; clock: string }) {
  return (
    <nav className="taskbar" aria-label="Windows">
      <a href="#top" className="btn start">
        <Logo plush={false} />Sign On
      </a>
      <span className="taskbar-sep" aria-hidden="true" />
      <div className="tasks">
        {TASKS.map((t) => (
          <a key={t.id} href={t.href} className={`w-task${win === t.id ? " is-on" : ""}`} aria-current={win === t.id ? "true" : undefined}>
            {t.label}
          </a>
        ))}
      </div>
      <div className="tray">
        <span aria-hidden="true" className="tray-heart">♥</span>
        <span>56k</span>
        <span className="tabnum">{clock}</span>
      </div>
    </nav>
  );
}
