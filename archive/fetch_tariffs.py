#!/usr/bin/env python3
"""
Fetch tariff data using world_trade_data package
"""
import os
import pandas as pd
import pathlib
from world_trade_data import get_tariff_reported, get_indicator

# Output directory setup
TARIFF_DIR = pathlib.Path("data/tariff")
TARIFF_DIR.mkdir(parents=True, exist_ok=True)

def fetch_mfn_tariffs(reporters, year="2023"):
    """
    Fetch MFN tariff rates for specified reporters
    
    Parameters:
    -----------
    reporters : list
        List of reporter codes (can use ISO3 like 'USA' or numeric like '840')
    year : str
        Year to fetch data for
    
    Returns:
    --------
    DataFrame with tariff data
    """
    all_tariffs = []
    
    for reporter in reporters:
        print(f"Fetching tariffs for {reporter}, year {year}...")
        
        # Method 1: Direct HS6 tariff rates (more detailed)
        try:
            # Get HS6-level tariffs
            df = get_tariff_reported(
                reporter=reporter, 
                partner='all',     # All partners
                product='all',     # All products
                year=year
            )
            print(f"  ✓ Retrieved {len(df)} tariff lines")
            all_tariffs.append(df)
            
            # Save individual reporter data
            out_file = TARIFF_DIR / f"tariff_{reporter}_{year}.csv"
            df.to_csv(out_file, index=False)
            print(f"  ✓ Saved to {out_file}")
            
        except Exception as e:
            print(f"  ✗ Error with get_tariff_reported: {e}")
            
            # Method 2: Fallback to indicator approach
            try:
                # Try using indicator approach instead
                print("  Trying alternative method...")
                df = get_indicator(
                    reporter=reporter,
                    year=year,
                    partner='wld',  # World
                    product='all',  # All products
                    indicator='AHS-SMPL-AVRG',  # Applied MFN simple average
                    datasource='tradestats-tariff'
                )
                print(f"  ✓ Retrieved {len(df)} tariff records")
                all_tariffs.append(df)
                
                # Save individual reporter data
                out_file = TARIFF_DIR / f"tariff_indicator_{reporter}_{year}.csv"
                df.to_csv(out_file, index=False)
                print(f"  ✓ Saved to {out_file}")
                
            except Exception as e2:
                print(f"  ✗ Error with get_indicator: {e2}")
    
    # Combine all data
    if all_tariffs:
        combined = pd.concat(all_tariffs, ignore_index=True)
        out_file = TARIFF_DIR / f"combined_tariffs_{year}.csv"
        combined.to_csv(out_file, index=False)
        print(f"\n✓ Combined data saved to {out_file}")
        return combined
    else:
        print("\n✗ No tariff data retrieved")
        return pd.DataFrame()

if __name__ == "__main__":
    # Example usage - can be USA/CHN or 840/156
    reporters = ['USA', 'CHN', 'DEU', 'JPN', 'GBR']
    # Alternative numeric codes: ['840', '156', '276', '392', '826']
    
    df = fetch_mfn_tariffs(reporters, year="2023")
    print("\nSample data:")
    print(df.head())