import { WinControls } from "even-lower-expectations";

export function Sets() {
  return (
    <div style={{ display: "flex", gap: 16, alignItems: "center", padding: "10px 12px", background: "linear-gradient(90deg,var(--title1),var(--title2))", width: 300 }}>
      <WinControls />
      <WinControls controls={["min", "close"]} />
      <WinControls controls={["help", "close"]} />
    </div>
  );
}
