#!/usr/bin/env python3
"""
End‑to‑end trade‑tariff‑elasticity ETL.

• Pulls monthly bilateral trade from UN Comtrade Plus
• Joins WTO MFN tariff % (download once ↯ link below)
• Joins Kee‑Nicita‑Olarreaga import‑elasticities (HS‑6 level)
• Writes merged CSV for deck.gl / Globe.gl / Palantir Foundry
"""

from __future__ import annotations
import os, pathlib, datetime as dt, itertools, json, pandas as pd
from dotenv import load_dotenv
import comtradeapicall as ct                            # :contentReference[oaicite:4]{index=4}

# ─── USER CONFIG ────────────────────────────────────────────────────────────────
REPORTERS = ['842']                                    # USA
PARTNERS  = ['156','392','124','276','826']            # CN, JP, CA, DE, GB
HS_CODES  = ['85','88','90']                           # add Optics (90)
PERIODS   = [f'2023{m:02d}' for m in range(1,13)]      # full 2023 monthly
FLOWS     = ['M','X']
TYPE, FREQ, CL, BREAKDOWN = 'C', 'M', 'HS', 'classic'
MAXREC    = 250_000
RAW_DIR   = pathlib.Path('data/raw')
MERGED_CSV= pathlib.Path('data/processed/trade_tariff_elasticity.csv')

# Local copies of external tables
TARIFF_CSV= pathlib.Path('lookups/wto_mfn_2023.csv')    # ↯ wget from WTO TDF
ELAS_CSV  = pathlib.Path('lookups/kee_elasticities.csv')# ↯ Kee–Nicita table
# ────────────────────────────────────────────────────────────────────────────────

def pull_trade(key:str) -> pd.DataFrame:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    frames=[]
    for rep, par, hs, per, flow in itertools.product(REPORTERS,PARTNERS,HS_CODES,PERIODS,FLOWS):
        df=ct.getFinalData(
            key, typeCode=TYPE,freqCode=FREQ,clCode=CL,period=per,
            reporterCode=rep,partnerCode=par,cmdCode=hs,flowCode=flow,
            partner2Code=None,customsCode=None,motCode=None,
            maxRecords=MAXREC, format_output='JSON',
            aggregateBy=None, breakdownMode=BREAKDOWN, includeDesc=True)
        ts=dt.datetime.now(dt.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
        (RAW_DIR/f'{rep}_{par}_{hs}_{per}_{flow}_{ts}.json').write_text(
            df.to_json(orient='records',indent=2))
        frames.append(df)
    return pd.concat(frames,ignore_index=True) if frames else pd.DataFrame()

def main():
    load_dotenv(); key=os.getenv('COMTRADE_KEY')
    if not key: raise RuntimeError('COMTRADE_KEY missing')
    trade=pull_trade(key)
    if trade.empty: raise RuntimeError('No trade rows pulled!')

    # ── join WTO tariffs (HS‑6; year 2023) ──────────────────────────────────────
    tariffs=pd.read_csv(TARIFF_CSV)     # cols: reporterISO,partnerISO,hs6,tariff_pct
    trade['hs6']=trade['cmdCode'].str[:6]
    trade=trade.merge(tariffs, how='left',
                      left_on=['reporterISO','partnerISO','hs6'],
                      right_on=['reporterISO','partnerISO','hs6'])

    # ── join demand elasticities (Kee et al.) ───────────────────────────────────
    elas=pd.read_csv(ELAS_CSV)          # cols: hs6, elasticity
    trade=trade.merge(elas, on='hs6', how='left')

    # ── tidy & save ────────────────────────────────────────────────────────────
    keep=['reporterISO','partnerISO','period','flowCode','hs6',
          'primaryValue','tariff_pct','elasticity']
    trade[keep].to_csv(MERGED_CSV,index=False)
    print(f'✓ merged dataset → {MERGED_CSV}  ({len(trade):,} rows)')

if __name__=='__main__':
    main()