import { Logo, LogoDefs } from "even-lower-expectations";

export function OncePerPage() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: 16, fontSize: 12 }}>
      <LogoDefs />
      <Logo className="logo-dialog" />
      <span>LogoDefs draws nothing itself. It supplies the envelope gradients, so render it once before any Logo.</span>
    </div>
  );
}
