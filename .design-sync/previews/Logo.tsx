import { Logo, LogoDefs } from "even-lower-expectations";

export function Sizes() {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 24, padding: 16 }}>
      <LogoDefs />
      <Logo className="logo-title" />
      <Logo className="logo-dialog" />
      <Logo className="logo-rail" />
      <Logo className="logo-rail" plush={false} />
    </div>
  );
}

export function OnTheRail() {
  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "14px 18px", color: "#fff", background: "linear-gradient(180deg,var(--royal2),var(--royal) 60%,#102f80)" }}>
      <LogoDefs />
      <Logo className="logo-rail" />
      <span className="rail-kicker">Even Lower</span>
      <span className="rail-script">Expectations</span>
    </div>
  );
}
