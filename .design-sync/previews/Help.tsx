import { Help, formatCount } from "even-lower-expectations";

export function HowTheMathWorks() {
  return <Help cpsSampled={formatCount(103285)} nhMeasured={formatCount(6235)} />;
}
