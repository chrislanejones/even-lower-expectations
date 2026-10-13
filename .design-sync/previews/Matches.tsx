import { Matches, SAMPLE_RESULT } from "even-lower-expectations";

const noop = () => {};
const base = { result: SAMPLE_RESULT, seeking: "men" as const, rev: 0, lowers: 0, canLower: true, copied: false, onLower: noop, onReset: noop, onCopy: noop };

export function Ready() {
  return <div style={{ maxWidth: 460 }}><Matches {...base} status="ready" note={null} /></div>;
}

export function AfterLowering() {
  return <div style={{ maxWidth: 460 }}><Matches {...base} status="ready" lowers={1} note="Cut the income bar to $40k. Dutch is fine." copied /></div>;
}

export function Connecting() {
  return <div style={{ maxWidth: 460 }}><Matches {...base} status="loading" result={null} note={null} /></div>;
}
