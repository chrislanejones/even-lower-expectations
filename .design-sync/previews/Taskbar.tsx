import { LogoDefs, Taskbar } from "even-lower-expectations";

// The taskbar is position: fixed. The transform makes this box its containing block, so it sits in the card.
export function AtTheBottom() {
  return (
    <div style={{ position: "relative", height: 32, transform: "translateZ(0)", background: "var(--desk)" }}>
      <LogoDefs />
      <Taskbar win="matches" clock="11:34 PM" />
    </div>
  );
}
