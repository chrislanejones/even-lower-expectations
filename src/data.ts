import { useEffect, useState } from "react";
import type { CpsData, NhanesData } from "./calc";

export type DataState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; cps: CpsData; nh: NhanesData };

export function useSurveyData(): DataState {
  const [state, setState] = useState<DataState>({ status: "loading" });
  useEffect(() => {
    let alive = true;
    const get = (name: string) =>
      fetch(`${import.meta.env.BASE_URL}data/${name}`).then((r) => {
        if (!r.ok) throw new Error(name);
        return r.json();
      });
    Promise.all([get("cps.json"), get("nhanes.json")])
      .then(([cps, nh]) => alive && setState({ status: "ready", cps, nh }))
      .catch(() => alive && setState({ status: "error" }));
    return () => {
      alive = false;
    };
  }, []);
  return state;
}
