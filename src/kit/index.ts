// Even Lower Expectations UI kit: the AOL 6 / Windows 2000 pieces the site is built from.
// Import "../styles/tokens.css" and "../styles/app.css" (shipped as styles.css) for the look.
export { Logo, LogoDefs, StatusBar, TitleBar, WinControls } from "../components/chrome";
export { Preferences } from "../components/Preferences";
export { Matches } from "../components/Matches";
export { Squares } from "../components/Squares";
export { BuddyList, Help, Message, Welcome } from "../components/Panels";
export { TAPES, VideoAd } from "../components/VideoAd";
export type { Tape } from "../components/VideoAd";
export { Channels, Taskbar, Toolbar } from "../components/Shell";
export { SAMPLE_FILTERS, SAMPLE_GROUPS, SAMPLE_RESULT } from "./sample";
export {
  DEFAULTS, OPEN, RACES, compute, formatCount, formatHeight, formatShare, lowerExpectations, toGroups, verdict,
} from "../calc";
export type { Filters, Group, Race, Result, Seeking, Step } from "../calc";
