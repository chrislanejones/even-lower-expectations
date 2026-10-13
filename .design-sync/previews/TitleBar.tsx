import { TitleBar } from "even-lower-expectations";

export function Window() {
  return (
    <div className="win" style={{ width: 360 }}>
      <TitleBar icon={<span className="tb-icon tb-icon-doc" aria-hidden="true" />} title="Welcome, Guest!" />
      <div className="win-body"><p className="body-text">Every window is a .win box with a TitleBar first.</p></div>
    </div>
  );
}

export function ControlSets() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: 360 }}>
      <TitleBar icon={<span className="tb-icon" aria-hidden="true">⚙</span>} title="Preferences — Your standards" controls={["help", "close"]} />
      <TitleBar icon={<span className="tb-icon tb-icon-gold" aria-hidden="true" />} title="You've Got Matches!" controls={["min", "close"]} />
      <TitleBar title="Even Lower Expectations" controls={["close"]} />
    </div>
  );
}
