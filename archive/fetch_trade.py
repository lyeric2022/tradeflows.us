#!/usr/bin/env python3
"""
Bulk‑download UN Comtrade Plus trade flows.

Edit the CONFIG dicts (REPORTERS, PARTNERS, HS, PERIODS) to taste.
Run:  python fetch_trade.py
"""

from __future__ import annotations
import os, pathlib, datetime as dt, itertools, json, pandas as pd
from dotenv import load_dotenv
import comtradeapicall as ct          # pip install comtradeapicall>=0.4.2

# ╭─┈┈┈┈┈┈┈┈  USER CONFIG  ┈┈┈┈┈┈┈┈╮
REPORTERS = ['842']                  # USA; numeric M49 codes
PARTNERS  = ['156','392','124','276','0']   # CN, JP, CA, DE, World
HS_CODES  = ['85','88']              # Electronics & Aircraft ch. (examples)
PERIODS   = ['2023']                 # annual; use '202301'..'202312' for monthly
FLOWS     = ['M','X']                # M imports, X exports
TYPE      = 'C'                      # C commodities
FREQ      = 'A'                      # A annual (or 'M')
CL_CODE   = 'HS'                     # HS, SITC, …
MAXREC    = 250000                   # free‑tier cap
BREAKDOWN = 'classic'                # partner × product
OUT_RAW   = pathlib.Path('data/raw')
OUT_CSV   = pathlib.Path('data/processed/trade_flows.csv')
# ╰────────────────────────────────╯

def fetch_slice(key:str, **params) -> pd.DataFrame:
    """One API call → DataFrame; also save raw json for provenance."""
    df = ct.getFinalData(key, **params,
                         partner2Code=None, customsCode=None, motCode=None,
                         maxRecords=MAXREC, format_output='JSON',
                         aggregateBy=None, breakdownMode=BREAKDOWN,
                         includeDesc=True)
    # raw save
    OUT_RAW.mkdir(parents=True, exist_ok=True)
    stamp = dt.datetime.now(dt.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    fname = f"{params['reporterCode']}_{params['partnerCode']}_{params['cmdCode']}_\
{params['period']}_{params['flowCode']}_{stamp}.json"
    (OUT_RAW/fname).write_text(df.to_json(orient='records', indent=2))
    return df

def main():
    load_dotenv()
    key = os.getenv('COMTRADE_KEY')
    if not key:
        raise RuntimeError('COMTRADE_KEY missing in .env')

    combos = itertools.product(REPORTERS, PARTNERS, HS_CODES, PERIODS, FLOWS)
    frames  = []
    for rep, par, hs, prd, flow in combos:
        print(f"→ {rep}->{par}  HS{hs}  {prd}  flow:{flow}")
        try:
            df = fetch_slice(key,
                typeCode=TYPE, freqCode=FREQ, clCode=CL_CODE,
                period=prd, reporterCode=rep, partnerCode=par,
                cmdCode=hs, flowCode=flow)
            frames.append(df)
        except Exception as exc:
            print("  ✗ Skipped:", exc)

    if not frames:
        print('No data retrieved!')
        return

    merged = pd.concat(frames, ignore_index=True)
    OUT_CSV.parent.mkdir(parents=True, exist_ok=True)
    merged.to_csv(OUT_CSV, index=False)
    print(f'\n✓ Saved merged CSV → {OUT_CSV}  ({len(merged):,} rows)')

if __name__ == '__main__':
    main()
