import { useEffect, useMemo, useState } from "react";
import {
  compute, DEFAULTS, formatCount, formatShare, lowerExpectations, OPEN, toGroups, type Filters, type Seeking,
} from "./calc";
import { LogoDefs } from "./components/chrome";
import { Matches } from "./components/Matches";
import { BuddyList, Help, Message, Welcome } from "./components/Panels";
import { Preferences } from "./components/Preferences";
import { Channels, Taskbar, Toolbar } from "./components/Shell";
import { Squares } from "./components/Squares";
import { VideoAd } from "./components/VideoAd";
import { useSurveyData } from "./data";
import { fromHash, toHash } from "./urlState";

const initialFilters = (): Filters => fromHash(window.location.hash) ?? DEFAULTS.men;

// The "reality check" headlines on the Welcome window: no standards except the ones named.
// One set per sex; each card shows the set matching its photo.
const OPEN_W: Filters = { ...OPEN, seeking: "women" };
const CHECK_FILTERS: Record<Seeking, Filters[]> = {
  men: [
    { ...OPEN, heightMin: 72 },
    { ...OPEN, minIncomeK: 100 },
    { ...OPEN, excludeMarried: true, heightMin: 72, minIncomeK: 100 },
  ],
  women: [
    { ...OPEN_W, heightMin: 68 },
    { ...OPEN_W, minIncomeK: 100 },
    { ...OPEN_W, excludeMarried: true, ageMax: 29, excludeOverweight: true, excludeObese: true },
  ],
};

// Keyword box: first matching pattern wins. "lower" runs the button instead of jumping.
const KEYWORDS: [RegExp, string][] = [
  [/lower|expect/, "lower"],
  [/number|standard|pref|calc|match|result|odds|read|mail/, "calculator"],
  [/square|chart|where|went/, "squares"],
  [/buddy|buddies|people|chat/, "buddies"],
  [/help|math|how|method|data|source/, "method"],
  [/home|welcome|top|start/, "top"],
];

const clockText = () => new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
const todayText = () => new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });

function jump(id: string) {
  const el = document.getElementById(id);
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 12, behavior: "smooth" });
}

export default function App() {
  const data = useSurveyData();
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [note, setNote] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [rev, setRev] = useState(0);
  const [lowers, setLowers] = useState(0);
  const [active, setActive] = useState<string | null>(null);
  const [win, setWin] = useState("welcome");
  const [keyword, setKeyword] = useState("");
  const [showChannels, setShowChannels] = useState(true);
  const [tick, setTick] = useState(0);
  const [clock, setClock] = useState(clockText);

  const ready = data.status === "ready";
  const result = useMemo(() => (ready ? compute(filters, data.cps, data.nh) : null), [ready, filters, data]);
  const groups = useMemo(() => (result ? toGroups(result) : []), [result]);
  const nextLower = useMemo(() => (ready ? lowerExpectations(filters, data.cps, data.nh) : null), [ready, filters, data]);
  const shares = useMemo(
    () =>
      ready
        ? {
            men: CHECK_FILTERS.men.map((f) => formatShare(compute(f, data.cps, data.nh).share)),
            women: CHECK_FILTERS.women.map((f) => formatShare(compute(f, data.cps, data.nh).share)),
          }
        : null,
    [ready, data],
  );

  useEffect(() => {
    history.replaceState(null, "", toHash(filters));
  }, [filters]);

  // Photo rotation and the taskbar clock.
  useEffect(() => {
    const photos = setInterval(() => setTick((t) => t + 1), 13000);
    const clockTimer = setInterval(() => setClock(clockText()), 20000);
    return () => {
      clearInterval(photos);
      clearInterval(clockTimer);
    };
  }, []);

  // Windows fade up as they scroll in, and the taskbar tracks the one most on screen.
  useEffect(() => {
    document.documentElement.classList.add("reveal-on");
    const reveal = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!("IntersectionObserver" in window)) {
      reveal.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      }),
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" },
    );
    reveal.forEach((el) => io.observe(el));
    const fallback = setTimeout(() => reveal.forEach((el) => el.classList.add("is-in")), 1200);

    const ratios: Record<string, number> = {};
    const winIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (ratios[(e.target as HTMLElement).dataset.win ?? ""] = e.intersectionRatio));
        const best = Object.entries(ratios).sort((a, b) => b[1] - a[1])[0];
        if (best && best[1] > 0) setWin(best[0]);
      },
      { threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] },
    );
    document.querySelectorAll("[data-win]").forEach((el) => winIo.observe(el));
    return () => {
      io.disconnect();
      winIo.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  const change = (f: Filters) => {
    setFilters(f);
    setNote(null);
    setCopied(false);
    setRev((r) => r + 1);
  };

  const lower = (): boolean => {
    if (!nextLower) return false;
    setFilters(nextLower.filters);
    setNote(nextLower.note);
    setCopied(false);
    setRev((r) => r + 1);
    setLowers((n) => n + 1);
    return true;
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      setNote("Couldn't reach the clipboard. The address bar has your link.");
    }
  };

  const keywordSubmit = () => {
    const k = keyword.trim().toLowerCase();
    const hit = KEYWORDS.find(([re]) => re.test(k));
    if (!hit) {
      setNote(k ? `Keyword "${k}" not found. Try "lower".` : 'Type a keyword first. Try "lower".');
      jump("calculator");
      return;
    }
    if (hit[1] === "lower") {
      if (!lower()) setNote("Nothing left to lower. You did it.");
      jump("calculator");
      return;
    }
    jump(hit[1]);
  };

  return (
    <div className="aol">
      <LogoDefs />
      <a className="skip" href="#calculator">Skip to the calculator</a>
      <Toolbar
        showChannels={showChannels}
        onToggleChannels={() => setShowChannels((s) => !s)}
        keyword={keyword}
        onKeyword={setKeyword}
        onKeywordSubmit={keywordSubmit}
        onLower={() => lower()}
        onCopy={copy}
        copied={copied}
      />

      <main className="mdi" data-chan={showChannels ? "on" : "off"}>
        {showChannels && <Channels win={win} />}

        <div className="mdi-center">
          <Welcome
            shares={shares}
            tick={tick}
            today={todayText()}
            canLower={!!nextLower}
            copied={copied}
            onLower={() => lower()}
            onCopy={copy}
            onReset={() => change(DEFAULTS[filters.seeking])}
          />

          <section id="calculator" className="calculator ele-reveal" data-reveal="" aria-label="Calculator">
            <Preferences filters={filters} onChange={change} />
            <div className="matches-col">
            <Matches
              status={data.status}
              result={result}
              seeking={filters.seeking}
              note={note}
              rev={rev}
              lowers={lowers}
              canLower={!!nextLower}
              copied={copied}
              onLower={() => lower()}
              onReset={() => change(DEFAULTS[filters.seeking])}
              onCopy={copy}
            />
            <VideoAd />
            </div>
          </section>

          <Squares result={result} groups={groups} seeking={filters.seeking} active={active} setActive={setActive} />
          <Help
            cpsSampled={ready ? formatCount(data.cps.adultsSampled) : "…"}
            nhMeasured={ready ? formatCount(data.nh.adultsMeasured) : "…"}
          />
          <Message />
        </div>

        <BuddyList
          result={result}
          groups={groups}
          seeking={filters.seeking}
          active={active}
          setActive={setActive}
          canLower={!!nextLower}
          onLower={() => lower()}
        />

        <footer className="footer">
          <p>
            A parody tribute to the “Lowered Expectations” sketch from MADtv. Not affiliated with MADtv, Fox, AOL, the
            Census Bureau or the CDC. Inspired by <a href="https://realitycalc.com/">realitycalc.com</a> and{" "}
            <a href="https://igotstandardsbro.com/">igotstandardsbro.com</a>, rebuilt on newer data.
          </p>
          <p>Everything runs in your browser. Nothing you pick is stored or sent anywhere. Photos are stand-ins, not survey respondents.</p>
        </footer>
      </main>

      <Taskbar win={win} clock={clock} />
    </div>
  );
}
