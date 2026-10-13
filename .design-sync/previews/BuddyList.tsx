import { useState } from "react";
import { BuddyList, SAMPLE_GROUPS, SAMPLE_RESULT } from "even-lower-expectations";

export function Sidebar() {
  const [active, setActive] = useState<string | null>(null);
  return (
    <div style={{ width: 220 }}>
      <BuddyList result={SAMPLE_RESULT} groups={SAMPLE_GROUPS} seeking="men" active={active} setActive={setActive} canLower onLower={() => {}} />
    </div>
  );
}

export function RowHighlighted() {
  const [active, setActive] = useState<string | null>("height");
  return (
    <div style={{ width: 220 }}>
      <BuddyList result={SAMPLE_RESULT} groups={SAMPLE_GROUPS} seeking="men" active={active} setActive={setActive} canLower={false} onLower={() => {}} />
    </div>
  );
}
