import { StatusBar, TitleBar } from "even-lower-expectations";

export function UnderAWindow() {
  return (
    <div className="win" style={{ width: 420 }}>
      <TitleBar title="Where everybody went" />
      <div className="win-body"><p className="body-text">Point at a color to see who it ruled out.</p></div>
      <StatusBar>
        <div className="pane pane-grow">Earns $80k or more a year ruled out about 25.5 million men</div>
        <div className="pane">1,000 squares</div>
      </StatusBar>
    </div>
  );
}

export function VcrPanes() {
  return (
    <div className="win" style={{ width: 420 }}>
      <StatusBar>
        <div className="pane pane-grow osd"><span className="osd-dot" /> PLAY ▶</div>
        <div className="pane osd">CH 03</div>
        <div className="pane osd lowered is-on">LOWERED · SP</div>
      </StatusBar>
    </div>
  );
}
