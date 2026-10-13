import { LogoDefs, Welcome } from "even-lower-expectations";

const noop = () => {};

export function WelcomeGuest() {
  return (
    <>
      <LogoDefs />
      <Welcome shares={{ men: ["16%", "25%", "0.97%"], women: ["5.0%", "13%", "7.2%"] }} tick={0} today="Oct 12" canLower copied={false} onLower={noop} onCopy={noop} onReset={noop} />
    </>
  );
}
