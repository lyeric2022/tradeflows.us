#!/usr/bin/env python
"""
Download MFN (reported) simple‑average tariff schedules from WITS UNCTAD‑TRAINS
for a list of reporter ISO‑numeric codes and a single year.  Results are saved
to data/processed/wits_mfn_tariffs.csv and the raw JSON for each call is cached
in data/raw/ to minimise API traffic.

▪ Endpoint used
   https://wits.worldbank.org/API/V1/SDMX/V21/datasource/TRN/...

▪ API docs
   – User‑Guide v1.4.1, §“Tariff Data Request (URL style)” :contentReference[oaicite:2]{index=2}
"""
from __future__ import annotations
import os, json, requests, pandas as pd
from pathlib import Path
from tqdm import tqdm

BASE = "https://wits.worldbank.org/API/V1/SDMX/V21/datasource/TRN"
CACHE = Path("data/raw")
OUT   = Path("data/processed/wits_mfn_tariffs.csv")
CACHE.mkdir(parents=True, exist_ok=True)
OUT.parent.mkdir(parents=True, exist_ok=True)

def fetch_raw(reporter: int, year: int, partner="000", datatype="reported") -> dict:
    """Download (or load from cache) one SDMX‑JSON tariff schedule."""
    fn = CACHE / f"wits_{reporter}_{partner}_{year}_{datatype}.json"
    if fn.exists():
        return json.loads(fn.read_text())

    url = (f"{BASE}/reporter/{reporter}/partner/{partner}/product/All/"
           f"year/{year}/datatype/{datatype}?format=JSON")
    r = requests.get(url, timeout=60)
    r.raise_for_status()
    fn.write_text(r.text)
    return r.json()

def decode_series(msg: dict) -> pd.DataFrame:
    """Flatten an SDMX‑JSON message into a tidy DataFrame."""
    dims   = msg["structure"]["dimensions"]["series"]
    dim_id = [d["id"] for d in dims]
    maps   = [{i: v["id"] for i, v in enumerate(d["values"])} for d in dims]

    data_sets = msg["dataSets"][0]["series"]
    rows = []
    for key, item in data_sets.items():
        parts = list(map(int, key.split(":")))
        # first (and only) time‑period observation
        obs_val = next(iter(item["observations"].values()))[0]
        rec = {dim_id[i]: maps[i][parts[i]] for i in range(len(parts))}
        # if product dimension absent (i.e. aggregated ‘All’) fill manually
        if not any("PRODUCT" in d.upper() for d in rec):
            rec["PRODUCT"] = "ALL"
        rec["VALUE"] = obs_val
        rows.append(rec)
    return pd.DataFrame(rows)

def bulk_fetch(reporters: list[int], year: int) -> pd.DataFrame:
    frames = []
    for rep in tqdm(reporters, desc=f"{year} MFN tariffs"):
        try:
            raw   = fetch_raw(rep, year)
            frame = decode_series(raw)
            frame["YEAR"] = year
            frames.append(frame)
        except Exception as exc:
            print(f"⚠️  {rep} {year}: {exc}")
    return pd.concat(frames, ignore_index=True) if frames else pd.DataFrame()

if __name__ == "__main__":
    # ► Edit these two lists as you like
    reporters = [840, 156]           #  USA, China   (ISO numeric codes)
    year      = 2023

    df = bulk_fetch(reporters, year)
    if df.empty:
        print("[WITS] No data returned – check availability (country/year).")
    else:
        df.to_csv(OUT, index=False)
        print(f"✓ Saved → {OUT}  ({len(df)} rows)")
