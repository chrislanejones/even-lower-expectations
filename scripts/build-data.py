#!/usr/bin/env python3
"""Build the compact datasets the calculator ships with.

Sources (download into one folder, pass it as the only argument):
  - US Census Bureau, CPS ASEC 2026 person file   pppub26.csv
      https://www2.census.gov/programs-surveys/cps/datasets/2026/march/asecpub26csv.zip
  - NCHS, NHANES Aug 2021-Aug 2023 demographics   DEMO_L.xpt
      https://wwwn.cdc.gov/Nchs/Data/Nhanes/Public/2021/DataFiles/DEMO_L.xpt
  - NCHS, NHANES Aug 2021-Aug 2023 body measures  BMX_L.xpt
      https://wwwn.cdc.gov/Nchs/Data/Nhanes/Public/2021/DataFiles/BMX_L.xpt

Writes public/data/cps.json and public/data/nhanes.json.
Standard library only.
"""

import csv
import json
import struct
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "data"

# Race codes shared by both files:
# 0 White (non-Hispanic) · 1 Black (non-Hispanic) · 2 Hispanic (any race)
# 3 Asian (non-Hispanic) · 4 Other / multiracial
INCOME_STEP = 5000
INCOME_TOP_BUCKET = 60  # $300k and up


def cps_race(prdtrace: int, hisp: int) -> int:
    if hisp == 1:
        return 2
    return {1: 0, 2: 1, 4: 3}.get(prdtrace, 4)


def build_cps(path: Path) -> dict:
    rows = []
    # child line numbers per household, for the "has kids at home" flag
    parents_by_hh: dict[str, set[int]] = defaultdict(set)
    with path.open(newline="") as f:
        for r in csv.DictReader(f):
            age = int(r["A_AGE"])
            if age < 18:
                for col in ("PEPAR1", "PEPAR2"):
                    line = int(r[col])
                    if line > 0:
                        parents_by_hh[r["PH_SEQ"]].add(line)
                continue
            rows.append(
                (
                    r["PH_SEQ"],
                    int(r["A_LINENO"]),
                    int(r["A_SEX"]),
                    age,
                    cps_race(int(r["PRDTRACE"]), int(r["PEHSPNON"])),
                    int(r["A_MARITL"]),
                    int(r["PTOTVAL"]),
                    int(r["MARSUPWT"]),
                )
            )

    cells: dict[tuple, float] = defaultdict(float)
    total_weight = 0.0
    for hh, line, sex, age, race, marital, income, wt in rows:
        weight = wt / 100.0  # MARSUPWT carries two implied decimals
        married = 1 if marital in (1, 2, 3) else 0
        parent = 1 if line in parents_by_hh.get(hh, ()) else 0
        bucket = min(max(income, 0) // INCOME_STEP, INCOME_TOP_BUCKET)
        cells[(sex - 1, min(age, 85), race, married, parent, bucket)] += weight
        total_weight += weight

    keys = sorted(cells)
    cols = list(zip(*keys))
    return {
        "source": "US Census Bureau, Current Population Survey, 2026 Annual Social and Economic Supplement (CPS ASEC)",
        "incomeYear": 2025,
        "incomeStep": INCOME_STEP,
        "incomeTopBucket": INCOME_TOP_BUCKET,
        "adultsSampled": len(rows),
        "adultPopulation": round(total_weight),
        "fields": ["sex", "age", "race", "married", "parent", "incomeBucket", "weight"],
        "sex": cols[0],
        "age": cols[1],
        "race": cols[2],
        "married": cols[3],
        "parent": cols[4],
        "incomeBucket": cols[5],
        "weight": [round(cells[k]) for k in keys],
    }


# --- SAS XPORT v5 reader -------------------------------------------------

def ibm_to_float(b: bytes):
    if b[0] in (0x2E, 0x5F) or 0x41 <= b[0] <= 0x5A:
        if not any(b[1:]):
            return None  # SAS missing value
    b = b.ljust(8, b"\x00")
    mant = int.from_bytes(b[1:], "big")
    if mant == 0:
        return 0.0
    sign = -1.0 if b[0] & 0x80 else 1.0
    exp = (b[0] & 0x7F) - 64
    return sign * (mant / float(1 << 56)) * (16.0 ** exp)


def read_xpt(path: Path, wanted: list[str]) -> list[dict]:
    data = path.read_bytes()
    marker = b"HEADER RECORD*******NAMESTR HEADER RECORD!!!!!!!"
    pos = data.index(marker)
    nvars = int(data[pos + 54 : pos + 58])
    pos += 80
    variables = []
    for i in range(nvars):
        rec = data[pos + i * 140 : pos + (i + 1) * 140]
        ntype, _, nlng, _ = struct.unpack(">hhhh", rec[:8])
        name = rec[8:16].decode("ascii").strip()
        npos = struct.unpack(">l", rec[84:88])[0]
        variables.append((name, ntype, nlng, npos))
    obs = data.index(b"HEADER RECORD*******OBS     HEADER RECORD!!!!!!!", pos)
    body = data[obs + 80 :]
    rowlen = sum(v[2] for v in variables)
    keep = [v for v in variables if v[0] in wanted]
    out = []
    for start in range(0, len(body) - rowlen + 1, rowlen):
        row = body[start : start + rowlen]
        if not row.strip(b" "):
            break  # trailing padding
        rec = {}
        for name, ntype, nlng, npos in keep:
            raw = row[npos : npos + nlng]
            rec[name] = ibm_to_float(raw) if ntype == 1 else raw.decode("latin-1").strip()
        out.append(rec)
    return out


def nhanes_race(r: float) -> int:
    return {1: 2, 2: 2, 3: 0, 4: 1, 6: 3}.get(int(r), 4)


def build_nhanes(demo_path: Path, bmx_path: Path) -> dict:
    demo = {
        int(r["SEQN"]): r
        for r in read_xpt(demo_path, ["SEQN", "RIAGENDR", "RIDAGEYR", "RIDRETH3", "WTMEC2YR"])
    }
    body = read_xpt(bmx_path, ["SEQN", "BMXHT", "BMXBMI"])
    sex, age, race, height, bmi, weight = [], [], [], [], [], []
    for r in body:
        d = demo.get(int(r["SEQN"]))
        if not d or d["RIDAGEYR"] is None or d["RIDAGEYR"] < 18:
            continue
        if r["BMXHT"] is None or r["BMXBMI"] is None or not d["WTMEC2YR"]:
            continue
        sex.append(int(d["RIAGENDR"]) - 1)
        age.append(int(d["RIDAGEYR"]))
        race.append(nhanes_race(d["RIDRETH3"]))
        height.append(round(r["BMXHT"] / 2.54 * 10))  # tenths of an inch
        bmi.append(round(r["BMXBMI"] * 10))
        weight.append(round(d["WTMEC2YR"]))
    return {
        "source": "National Center for Health Statistics, National Health and Nutrition Examination Survey, August 2021 to August 2023 (NHANES)",
        "adultsMeasured": len(sex),
        "fields": ["sex", "age", "race", "heightTenthsIn", "bmiTenths", "weight"],
        "sex": sex,
        "age": age,
        "race": race,
        "heightTenthsIn": height,
        "bmiTenths": bmi,
        "weight": weight,
    }


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit("usage: build-data.py <folder with pppub26.csv, DEMO_L.xpt, BMX_L.xpt>")
    src = Path(sys.argv[1])
    OUT.mkdir(parents=True, exist_ok=True)

    cps = build_cps(src / "pppub26.csv")
    (OUT / "cps.json").write_text(json.dumps(cps, separators=(",", ":")))
    print(f"cps: {cps['adultsSampled']:,} adults sampled -> {len(cps['weight']):,} cells, "
          f"{cps['adultPopulation']:,} weighted adults")

    nh = build_nhanes(src / "DEMO_L.xpt", src / "BMX_L.xpt")
    (OUT / "nhanes.json").write_text(json.dumps(nh, separators=(",", ":")))
    print(f"nhanes: {nh['adultsMeasured']:,} measured adults")


if __name__ == "__main__":
    main()
