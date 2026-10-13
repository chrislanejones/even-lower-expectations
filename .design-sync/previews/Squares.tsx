import { useState } from "react";
import { SAMPLE_GROUPS, SAMPLE_RESULT, Squares } from "even-lower-expectations";

// The live squares grow in over ~1s. Cards show the settled state.
const settled = <style>{".sq{animation:none}"}</style>;

export function WhereEverybodyWent() {
  const [active, setActive] = useState<string | null>(null);
  return <>{settled}<Squares result={SAMPLE_RESULT} groups={SAMPLE_GROUPS} seeking="men" active={active} setActive={setActive} /></>;
}

export function HighlightIncome() {
  const [active, setActive] = useState<string | null>("income");
  return <>{settled}<Squares result={SAMPLE_RESULT} groups={SAMPLE_GROUPS} seeking="men" active={active} setActive={setActive} /></>;
}
