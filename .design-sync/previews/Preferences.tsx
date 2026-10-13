import { useState } from "react";
import { DEFAULTS, Preferences } from "even-lower-expectations";

export function LookingForAMan() {
  const [filters, setFilters] = useState(DEFAULTS.men);
  return <div style={{ maxWidth: 440 }}><Preferences filters={filters} onChange={setFilters} /></div>;
}

export function LookingForAWoman() {
  const [filters, setFilters] = useState({ ...DEFAULTS.women, races: [2, 3] as (0 | 1 | 2 | 3)[] });
  return <div style={{ maxWidth: 440 }}><Preferences filters={filters} onChange={setFilters} /></div>;
}
