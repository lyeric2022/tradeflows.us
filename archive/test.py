#!/usr/bin/env python3
"""
wits_fetch.py – download (or reuse) MFN summary tariffs from the WITS API
-------------------------------------------------------------------------

The WITS endpoint used:

  https://wits.worldbank.org/API/V1/SDMX/V21/rest/data/DF_WITS_Tariff_TRAINS/
      .{reporter}.0..reported/
      ?startPeriod={year}&endPeriod={year}
      &detail=codeandcombinations             # HS‑6 summary
      &format=CSV

* reporter   – 3‑digit ISO‑numeric (e.g. USA → 840, CHN → 156)
* partner=0  – MFN (world) – gives the **applied MFN rate**
* product=.. – blank = ALL products
"""

from __future__ import annotations
import os
import pathlib
import sys
import requests
import pandas as pd
from tqdm import tqdm

BASE_URL = (
    "https://wits.worldbank.org/API/V1/SDMX/V21/rest/data/"
    "DF_WITS_Tariff_TRAINS/.{reporter}.0..reported/"
    "?startPeriod={year}&endPeriod={year}"
    "&detail=codeandcombinations&format=CSV"
)

DATA_DIR = pathlib.Path(__file__).resolve().parent / "data" / "raw" / "wits"
DATA_DIR.mkdir(parents=True, exist_ok=True)


def fetch_mfn_summary(reporter: str | int, year: int, force: bool = False) -> pd.DataFrame:
    """
    Download (or load from cache) the MFN simple‑average tariff schedule
    for `reporter` in `year`.

    Parameters
    ----------
    reporter : str | int
        3‑digit ISO‑numeric reporter code, e.g. 840 = USA.
    year     : int
    force    : bool
        If True, re‑download even if the CSV already exists.

    Returns
    -------
    pandas.DataFrame
    """
    reporter = str(reporter).zfill(3)
    out_file = DATA_DIR / f"mfn_{reporter}_{year}.csv"

    if out_file.is_file() and not force:
        return pd.read_csv(out_file)

    url = BASE_URL.format(reporter=reporter, year=year)
    print(f"→ WITS API {reporter} {year}  …", end=" ", flush=True)

    r = requests.get(url, timeout=120)
    if r.status_code != 200:
        raise RuntimeError(f"WITS API {r.status_code}: {r.text[:280]}")

    out_file.write_bytes(r.content)
    print("✓  saved", out_file.relative_to(DATA_DIR.parent.parent))

    return pd.read_csv(out_file)


def bulk_fetch(reporters: list[int | str], year: int, force: bool = False) -> pd.DataFrame:
    """
    Convenience wrapper: pull many reporters and concatenate the results.
    """
    frames = []
    for rep in tqdm(reporters, desc=f"{year} MFN tariffs"):
        try:
            df = fetch_mfn_summary(rep, year, force=force)
            frames.append(df)
        except Exception as exc:
            sys.stderr.write(f"\n[warn] {rep}: {exc}\n")

    merged = pd.concat(frames, ignore_index=True)
    return merged


if __name__ == "__main__":
    # Example usage ---------------------------------------------------------
    # USA (840), China (156), Japan (392), Germany (276)
    reporters = [840, 156, 392, 276]
    year = 2023

    df_all = bulk_fetch(reporters, year)
    print(df_all.head())
