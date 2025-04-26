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

# Top 50 U.S. goods trading partners by total trade in 2023 (ISO 3166-1 numeric codes)
PARTNERS = [
    156, 484, 704, 276, 392, 372, 124, 410, 158, 380,
    356, 764, 458, 756, 360, 250,  40, 752, 348, 710,
    376, 246, 643, 608, 566, 203, 616, 682,  12, 578,
    862, 702, 170, 724, 818, 152,  32,  76, 826,  56,
     36, 344, 528, 784, 792, 642, 804, 414, 634, 604
]

# All HS chapter codes from '01' through '99'
HS_GROUPS = [f"{i:02d}" for i in range(1, 100)]

FLOWS = {'M': 'M', 'X': 'X'}  # M=import, X=export

def main():
    os.makedirs(os.path.dirname(OUT_CSV), exist_ok=True)
    if os.path.exists(OUT_CSV):
        print(f"⇢ {OUT_CSV} already exists; skipping fetch.")
        return

    # Calculate total operations for progress tracking
    total_requests = len(REPORTERS) * len(PARTNERS) * len(HS_GROUPS) * len(FLOWS)
    completed = 0
    last_percentage = 0
    
    print(f"Starting fetch of {total_requests} total API requests...")

    frames = []
    for reporter in REPORTERS:
        for partner in tqdm(PARTNERS, desc="Partners", leave=False):
            for hs in HS_GROUPS:
                for flow_code, flow in FLOWS.items():
                    print(f"→ {reporter}->{partner}  HS{hs} {YEAR} flow:{flow_code}")
                    try:
                        df = comtradeapicall.previewFinalData(
                            typeCode='C', 
                            freqCode='A',
                            clCode='HS', 
                            period=str(YEAR),
                            reporterCode=str(reporter), 
                            partnerCode=str(partner),
                            cmdCode=hs, 
                            flowCode=flow,
                            partner2Code=None,
                            customsCode=None,
                            motCode=None,
                            maxRecords=50000,
                            format_output='JSON',
                            aggregateBy=None,
                            breakdownMode='classic',
                            countOnly=None,
                            includeDesc=True
                        )
                        df['flowCode'] = flow_code
                        frames.append(df)
                    except Exception as e:
                        print(f"Error fetching data: {e}")
                    
                    # Update progress tracking
                    completed += 1
                    percentage = int((completed / total_requests) * 100)
                    
                    # Log every 5% change
                    if percentage >= last_percentage + 5 or percentage == 100:
                        last_percentage = percentage
                        print(f"✓ Progress: {percentage}% complete ({completed}/{total_requests} requests)")

    if frames:
        print("Merging all data frames...")
        merged = pd.concat(frames, ignore_index=True)
        merged.to_csv(OUT_CSV, index=False)
        print(f"✓ Saved merged CSV → {OUT_CSV}  ({len(merged)} rows)")
    else:
        print("No data was retrieved. Please check your parameters and API key.")

if __name__ == '__main__':
    main()
