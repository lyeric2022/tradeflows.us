# fetch_trade.py
"""
Downloads and caches UN Comtrade flow data by reporter, partner, HS6 group, and flow (M/X).
Only fetches if the target CSV does not already exist.
"""
import os
import pandas as pd
import requests
import comtradeapicall
from tqdm import tqdm

# Configuration
COMTRADE_KEY = os.environ.get('COMTRADE_KEY')  # Get API key from environment variable
if not COMTRADE_KEY:
    raise ValueError("COMTRADE_KEY environment variable is not set")
OUT_CSV = 'data/processed/trade_flows.csv'
YEAR = 2023
REPORTERS = [842]
PARTNERS = [
    # Original partners
    156, 392, 124, 276, 0,  # CHN, JPN, CAN, DEU, WLD
    
    # Additional 20 countries
    840, 826, 250, 380, 724,  # USA, GBR, FRA, ITA, ESP
    484, 76, 410, 356, 360,   # MEX, BRA, KOR, IND, IDN
    36, 554, 710, 458, 764,   # AUS, NZL, ZAF, MYS, THA
    608, 792, 643, 682, 784   # PHL, TUR, RUS, SAU, ARE
]  # Expanded list of major trading partners
HS_GROUPS = ['85', '88']            # HS sections
FLOWS = {'M': 'M', 'X': 'X'}        # M=import, X=export


def main():
    os.makedirs(os.path.dirname(OUT_CSV), exist_ok=True)
    if os.path.exists(OUT_CSV):
        print(f"⇢ {OUT_CSV} already exists; skipping fetch.")
        return

    frames = []
    for reporter in REPORTERS:
        for partner in PARTNERS:
            for hs in HS_GROUPS:
                for flow_code, flow in FLOWS.items():
                    print(f"→ {reporter}->{partner}  HS{hs} {YEAR} flow:{flow_code}")
                    try:
                        # Use previewFinalData for basic access without subscription key
                        df = comtradeapicall.previewFinalData(
                            typeCode='C', 
                            freqCode='A',
                            clCode='HS', 
                            period=str(YEAR),
                            reporterCode=str(reporter), 
                            partnerCode=str(partner),
                            cmdCode=hs, 
                            flowCode=flow,
                            partner2Code=None,    # Add missing parameter
                            customsCode=None,     # Add missing parameter 
                            motCode=None,         # Add missing parameter
                            maxRecords=50000, 
                            format_output='JSON',
                            aggregateBy=None,     # Optional parameter
                            breakdownMode='classic', # Optional parameter
                            countOnly=None,       # Optional parameter
                            includeDesc=True)     # Optional parameter
                        
                        # Same updates needed for the getFinalData call if you uncomment it
                        
                        df['flowCode'] = flow_code
                        frames.append(df)
                    except Exception as e:
                        print(f"Error fetching data: {e}")

    if frames:
        merged = pd.concat(frames, ignore_index=True)
        merged.to_csv(OUT_CSV, index=False)
        print(f"✓ Saved merged CSV → {OUT_CSV}  ({len(merged)} rows)")
    else:
        print("No data was retrieved. Please check your parameters and API key.")

if __name__ == '__main__':
    main()