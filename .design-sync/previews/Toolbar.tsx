import { useState } from "react";
import { LogoDefs, Toolbar } from "even-lower-expectations";

export function AolHeader() {
  const [keyword, setKeyword] = useState("lower");
  const [show, setShow] = useState(true);
  return (
    <>
      <LogoDefs />
      <Toolbar showChannels={show} onToggleChannels={() => setShow((s) => !s)} keyword={keyword} onKeyword={setKeyword} onKeywordSubmit={() => {}} onLower={() => {}} onCopy={() => {}} copied={false} />
    </>
  );
}
