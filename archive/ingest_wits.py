#!/usr/bin/env python
"""
Ingest WITS “AVEMFN_H6_*_U2.zip” packages and convert them to a single
tidy CSV (REPORTER, YEAR, PRODUCT, VALUE).

▪ Put all the ZIP files in  data/offline_h6/
▪ Run:  python import_wits_offline.py
▪ Output: data/processed/wits_mfn_h6_offline.csv
"""
from pathlib import Path
import zipfile, io, pandas as pd

SRC  = Path("data/offline_h6")                          # where the zips live
OUT  = Path("data/processed/wits_mfn_h6_offline.csv")
OUT.parent.mkdir(parents=True, exist_ok=True)

def extract_csv_from_any(zip_path: Path) -> bytes:
    """Return raw bytes of the first *.csv found, drilling through one
    level of ‘zip‑in‑zip’ if necessary."""
    with zipfile.ZipFile(zip_path) as z1:
        member = next((m for m in z1.namelist() if m.lower().endswith(".csv")),
                      None)
        # If top‑level entries are folders, look inside the first folder
        if member is None:
            nested_zip = next((m for m in z1.namelist() if m.lower().endswith(".zip")), None)
            if nested_zip is None:
                raise RuntimeError(f"No CSV in {zip_path.name}")
            with z1.open(nested_zip) as fh:
                with zipfile.ZipFile(io.BytesIO(fh.read())) as z2:
                    member = next(m for m in z2.namelist() if m.lower().endswith(".csv"))
                    return z2.read(member)
        return z1.read(member)

frames = []
for zip_path in sorted(SRC.glob("AVEMFN_H6_*_U2.zip")):
    raw = extract_csv_from_any(zip_path)
    df  = pd.read_csv(io.BytesIO(raw), dtype={"ProductCode": str})
    df  = (df
           .rename(columns={"Reporter_ISO_N": "REPORTER",
                            "Year": "YEAR",
                            "ProductCode": "PRODUCT",
                            "SimpleAverage": "VALUE"})[
                 ["REPORTER", "YEAR", "PRODUCT", "VALUE"]]
           .assign(SOURCE="offline_H6"))
    frames.append(df)

if not frames:
    raise SystemExit("⚠️  No ZIP files found – check SRC folder.")

final = pd.concat(frames, ignore_index=True)
final.to_csv(OUT, index=False)
print(f"✓ Combined {len(frames)} files → {OUT}  ({len(final):,} rows)")
