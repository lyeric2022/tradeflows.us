"""
Downloads and caches UN Comtrade flow data by reporter, partner, HS6 group, and flow (M/X).
Resumes from previous runs by appending to existing data.
Auto-retries when hitting API rate limits.
"""
import os
import pandas as pd
import requests
import comtradeapicall
import re
import time
from tqdm import tqdm

# Configuration
COMTRADE_KEY = os.environ.get('COMTRADE_KEY')  # Get API key from environment variable
if not COMTRADE_KEY:
    raise ValueError("COMTRADE_KEY environment variable is not set")
OUT_CSV = 'data/processed/trade_flows.csv'
YEAR = 2023
REPORTERS = [842]  # Will be replaced with all available reporters

# Top 50 U.S. goods trading partners by total trade in 2023 (ISO 3166-1 numeric codes)
PARTNERS = [
    156, 484, 704, 276, 392, 372, 124, 410, 158, 380,
    356, 764, 458, 756, 360, 250,  40, 752, 348, 710,
    376, 246, 643, 608, 566, 203, 616, 682,  12, 578,
    862, 702, 170, 724, 818, 152,  32,  76, 826,  56,
     36, 344, 528, 784, 792, 642, 804, 414, 634, 604
]

# All HS chapter codes from '01' through '99'
HS_GROUPS = [f"{i:02d}" for i in range(1, 99)] # HS chapters 1 to 99 due to API limits

FLOWS = {'M': 'M', 'X': 'X'}  # M=import, X=export

# Helper function to create a unique key for each request
def create_key(reporter, partner, hs, flow_code):
    return f"{reporter}_{partner}_{hs}_{flow_code}"

def get_all_reporters():
    """Get all available reporter countries from the Comtrade API"""
    try:
        print("Fetching all available reporters from Comtrade API...")
        # Use a longer timeout for this request
        response = requests.get("https://comtradeapi.un.org/data/v1/getReferences/reporters", timeout=30)
        data = response.json()
        
        if 'data' in data:
            # Extract reporter IDs and sort them
            reporters = [int(item['id']) for item in data['data'] if item.get('id')]
            print(f"Found {len(reporters)} reporters available in the API")
            return sorted(reporters)
        else:
            print("Unable to fetch reporters, using default list")
            return REPORTERS
    except Exception as e:
        print(f"Error fetching reporters: {e}")
        print("Using default reporter list")
        return REPORTERS

def find_last_position(df):
    """Find the last position in the dataframe to resume processing from"""
    if df is None or len(df) == 0:
        return None
    
    # Get unique combinations from the dataframe
    combos = df[['reporterCode', 'partnerCode', 'cmdCode', 'flowCode']].drop_duplicates()
    
    # Make sure cmdCode is a string with at least 2 characters (HS chapter)
    combos['cmdCode'] = combos['cmdCode'].astype(str)
    combos['cmdCode'] = combos['cmdCode'].apply(lambda x: x.zfill(2)[:2])
    
    # Get the last combination based on our iteration order
    last_reporter = combos['reporterCode'].max()
    
    # For this reporter, get the last partner
    reporter_combos = combos[combos['reporterCode'] == last_reporter]
    last_partner = reporter_combos['partnerCode'].max()
    
    # For this reporter+partner, get the last HS code
    partner_combos = reporter_combos[reporter_combos['partnerCode'] == last_partner]
    last_hs = partner_combos['cmdCode'].max()
    
    # For this reporter+partner+hs, get the last flow
    hs_combos = partner_combos[partner_combos['cmdCode'] == last_hs]
    last_flow = hs_combos['flowCode'].max()
    
    print(f"Resuming from last position: Reporter={last_reporter}, Partner={last_partner}, HS={last_hs}, Flow={last_flow}")
    
    return {
        'reporter': int(last_reporter),
        'partner': int(last_partner),
        'hs': last_hs,
        'flow': last_flow
    }

def parse_wait_time(error_msg):
    """Extract wait time from API error message or default to 60 seconds"""
    wait_time_match = re.search(r'replenished in (\d+):(\d+):(\d+)', error_msg)
    
    if wait_time_match:
        hours, minutes, seconds = map(int, wait_time_match.groups())
        return hours * 3600 + minutes * 60 + seconds
    else:
        # Default to 60 seconds if we can't parse the time
        return 60

def main():
    os.makedirs(os.path.dirname(OUT_CSV), exist_ok=True)
    
    # Get all reporters instead of using the fixed list
    global REPORTERS
    REPORTERS = get_all_reporters()
    
    # Check for existing data and track what's already been fetched
    completed_requests = set()
    existing_data = None
    last_position = None
    
    if os.path.exists(OUT_CSV):
        print(f"⇢ {OUT_CSV} exists - loading to resume from last checkpoint")
        try:
            existing_data = pd.read_csv(OUT_CSV)
            
            # Find the last position in the CSV to resume from
            last_position = find_last_position(existing_data)
            
            # Extract unique combinations that have already been processed
            for _, row in existing_data.iterrows():
                reporter = row.get('reporterCode')
                partner = row.get('partnerCode')
                hs = str(row.get('cmdCode')).zfill(2)[:2]  # Get first 2 digits and ensure it's padded
                flow_code = row.get('flowCode')
                
                if all(x is not None for x in [reporter, partner, hs, flow_code]):
                    completed_requests.add(create_key(reporter, partner, hs, flow_code))
            
            print(f"✓ Found {len(completed_requests)} already completed reporter-partner-HS-flow combinations")
        except Exception as e:
            print(f"Error reading existing CSV: {e}")
            print("Will start fresh but append to the file")
    
    # Calculate total operations and remaining ones for progress tracking
    total_requests = len(REPORTERS) * len(PARTNERS) * len(HS_GROUPS) * len(FLOWS)
    remaining_requests = total_requests - len(completed_requests)
    
    print(f"Starting fetch of remaining {remaining_requests} API requests out of {total_requests} total...")

    frames = []
    completed = 0
    last_percentage = 0
    # Save much more frequently - every 10 requests instead of every 5%
    save_checkpoint_every = 10
    
    # Helper function to save checkpoint data
    def save_checkpoint(frames_to_save, existing_df=None):
        if not frames_to_save:
            return existing_df
        
        checkpoint_df = pd.concat(frames_to_save, ignore_index=True)
        
        if existing_df is not None:
            combined_df = pd.concat([existing_df, checkpoint_df], ignore_index=True)
            combined_df.to_csv(OUT_CSV, index=False)
            print(f"✓ Checkpoint saved: combined {len(existing_df)} existing + {len(checkpoint_df)} new rows")
            return combined_df
        else:
            checkpoint_df.to_csv(OUT_CSV, index=False)
            print(f"✓ Initial checkpoint saved with {len(checkpoint_df)} rows")
            return checkpoint_df
    
    # Determine starting positions based on last_position
    reporter_start_idx = 0
    if last_position:
        # Find the index of the last reporter
        try:
            reporter_start_idx = REPORTERS.index(last_position['reporter'])
        except ValueError:
            print(f"Warning: Last reporter {last_position['reporter']} not found in REPORTERS list. Starting from beginning.")
            reporter_start_idx = 0
    
    # Loop through reporters, starting from the last one
    for reporter_idx in range(reporter_start_idx, len(REPORTERS)):
        reporter = REPORTERS[reporter_idx]
        
        # Determine partner starting position for this reporter
        partner_start_idx = 0
        if last_position and reporter == last_position['reporter']:
            try:
                partner_start_idx = PARTNERS.index(last_position['partner'])
            except ValueError:
                print(f"Warning: Last partner {last_position['partner']} not found in PARTNERS list. Starting from first partner for reporter {reporter}.")
        
        for partner_idx in range(partner_start_idx, len(PARTNERS)):
            partner = PARTNERS[partner_idx]
            
            # Determine HS starting position for this reporter+partner
            hs_start_idx = 0
            if last_position and reporter == last_position['reporter'] and partner == last_position['partner']:
                try:
                    hs_start_idx = HS_GROUPS.index(last_position['hs'])
                except ValueError:
                    print(f"Warning: Last HS code {last_position['hs']} not found. Starting from first HS code for reporter {reporter}, partner {partner}.")
            
            for hs_idx in range(hs_start_idx, len(HS_GROUPS)):
                hs = HS_GROUPS[hs_idx]
                
                # Determine flow starting position
                flow_start_idx = 0
                if last_position and reporter == last_position['reporter'] and partner == last_position['partner'] and hs == last_position['hs']:
                    # Find the starting flow
                    flow_keys = list(FLOWS.keys())
                    try:
                        flow_start_idx = flow_keys.index(last_position['flow'])
                        # Move to the next flow (we've already done this one)
                        flow_start_idx += 1
                    except ValueError:
                        print(f"Warning: Last flow {last_position['flow']} not found. Starting from first flow for this combination.")
                
                # If we've already processed all flows for the last position, move to next HS code
                if last_position and flow_start_idx >= len(FLOWS):
                    continue
                
                flow_keys = list(FLOWS.keys())
                for flow_idx in range(flow_start_idx, len(flow_keys)):
                    flow_code = flow_keys[flow_idx]
                    flow = FLOWS[flow_code]
                    
                    # After the first iteration, we don't need to use last_position anymore
                    # We'll be continuing the regular iteration pattern
                    last_position = None
                    
                    # Skip if this combination has already been fetched
                    request_key = create_key(reporter, partner, hs, flow_code)
                    if request_key in completed_requests:
                        continue
                    
                    # Keep trying until we get data or encounter a non-rate-limit error
                    success = False
                    max_retries = 60  # Safety limit to prevent infinite loops
                    retries = 0
                    
                    while not success and retries < max_retries:
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
                            
                            # Check if response is a rate limit error dict
                            if isinstance(df, dict) and 'statusCode' in df and df.get('statusCode') == 403 and "quota" in str(df.get('message', '')).lower():
                                print(f"{df}")  # Print the error message for debugging
                                
                                # This is a rate limit error - handle it properly
                                retries += 1
                                wait_seconds = parse_wait_time(str(df.get('message', '')))
                                
                                print(f"\n⏱️ RATE LIMIT REACHED: API quota exceeded. Waiting {wait_seconds} seconds before retry {retries}/{max_retries}...")
                                
                                # Checkpoint save if we have data so far
                                if frames:
                                    print("Saving checkpoint before waiting...")
                                    checkpoint_df = pd.concat(frames, ignore_index=True)
                                    
                                    if existing_data is not None:
                                        combined_df = pd.concat([existing_data, checkpoint_df], ignore_index=True)
                                        combined_df.to_csv(OUT_CSV, index=False)
                                        print(f"✓ Checkpoint saved: combined {len(existing_data)} existing + {len(checkpoint_df)} new rows")
                                        existing_data = combined_df
                                    else:
                                        checkpoint_df.to_csv(OUT_CSV, index=False)
                                        existing_data = checkpoint_df
                                        print(f"✓ Initial checkpoint saved with {len(checkpoint_df)} rows")
                                    
                                    frames = []
                                
                                # Wait for the quota to replenish - force at least 60 seconds
                                wait_seconds = max(wait_seconds, 60)
                                print(f"⏱️ Starting wait of {wait_seconds} seconds at {time.strftime('%H:%M:%S')}...")
                                time.sleep(wait_seconds)  # Simple sleep instead of countdown
                                print(f"⏱️ Wait completed at {time.strftime('%H:%M:%S')}, now retrying...")
                                continue  # Skip the rest of this iteration and retry
                            # Also check for None responses which could be rate limit errors
                            elif df is None:
                                print("Received None response - likely a rate limit error")
                                retries += 1
                                # Default wait time of 60 seconds if we can't determine from the response
                                wait_seconds = 60
                                
                                print(f"\n⏱️ RATE LIMIT SUSPECTED: Waiting {wait_seconds} seconds before retry {retries}/{max_retries}...")
                                
                                # Checkpoint save if we have data so far (same as above)
                                if frames:
                                    print("Saving checkpoint before waiting...")
                                    checkpoint_df = pd.concat(frames, ignore_index=True)
                                    
                                    if existing_data is not None:
                                        combined_df = pd.concat([existing_data, checkpoint_df], ignore_index=True)
                                        combined_df.to_csv(OUT_CSV, index=False)
                                        print(f"✓ Checkpoint saved: combined {len(existing_data)} existing + {len(checkpoint_df)} new rows")
                                        existing_data = combined_df
                                    else:
                                        checkpoint_df.to_csv(OUT_CSV, index=False)
                                        existing_data = checkpoint_df
                                        print(f"✓ Initial checkpoint saved with {len(checkpoint_df)} rows")
                                    
                                    frames = []
                                
                                # Wait for the quota to replenish
                                for remaining in range(wait_seconds, 0, -1):
                                    print(f"\rWaiting {remaining} seconds for API quota to replenish...", end="")
                                    time.sleep(1)
                                print("\nRetrying request...")
                                continue  # Skip the rest of this iteration and retry
                            elif isinstance(df, dict) and 'statusCode' in df:
                                # Other API error, not rate-limit related
                                print(f"API returned error: {df}")
                                print(f"Skipping due to API error")
                                success = True  # Mark as "successful" to exit retry loop
                                continue
                            
                            # Only process as DataFrame if we actually got valid data
                            if isinstance(df, pd.DataFrame):
                                df['flowCode'] = flow_code
                                frames.append(df)
                                completed_requests.add(request_key)
                                success = True
                                
                                # Save after every successful API request that returns data
                                if len(frames) >= 5:  # Save after collecting just 5 dataframes
                                    existing_data = save_checkpoint(frames, existing_data)
                                    frames = []  # Clear frames after saving
                            else:
                                print(f"Unexpected response type: {type(df)}")
                                success = True  # Exit the retry loop
                                
                        except Exception as e:
                            error_str = str(e)
                            print(f"Error fetching data: {e}")
                            
                            # Check if this is a rate limit error
                            if "Out of call volume quota" in error_str or ("403" in error_str and "quota" in error_str.lower()):
                                retries += 1
                                if retries >= max_retries:
                                    print(f"Maximum retries ({max_retries}) exceeded. Moving to next request.")
                                    break
                                
                                wait_seconds = parse_wait_time(error_str)
                                print(f"\n⏱️ RATE LIMIT REACHED: API quota exceeded. Waiting {wait_seconds} seconds before retry {retries}/{max_retries}...")
                                
                                # Checkpoint save before waiting
                                if frames:
                                    print("Saving checkpoint before waiting...")
                                    checkpoint_df = pd.concat(frames, ignore_index=True)
                                    
                                    if existing_data is not None:
                                        combined_df = pd.concat([existing_data, checkpoint_df], ignore_index=True)
                                        combined_df.to_csv(OUT_CSV, index=False)
                                        print(f"✓ Checkpoint saved: combined {len(existing_data)} existing + {len(checkpoint_df)} new rows")
                                        existing_data = combined_df
                                    else:
                                        checkpoint_df.to_csv(OUT_CSV, index=False)
                                        existing_data = checkpoint_df
                                        print(f"✓ Initial checkpoint saved with {len(checkpoint_df)} rows")
                                    
                                    frames = []
                                
                                # Wait for the quota to replenish
                                for remaining in range(wait_seconds, 0, -1):
                                    print(f"\rWaiting {remaining} seconds for API quota to replenish...", end="")
                                    time.sleep(1)
                                print("\nRetrying request...")
                            else:
                                # Non-rate-limit error, skip after logging
                                print(f"Skipping due to non-rate-limit error: {e}")
                                success = True  # Mark as "successful" to exit retry loop
                    
                    # Only increment counters if we actually completed the request
                    # (either successfully or with a non-rate-limit error)
                    if success:
                        # Update progress tracking
                        completed += 1
                        percentage = int((completed / remaining_requests) * 100)
                        
                        # Log every 5% change
                        if percentage >= last_percentage + 5 or percentage == 100:
                            last_percentage = percentage
                            print(f"✓ Progress: {percentage}% complete ({completed}/{remaining_requests} remaining requests)")
                        
                        # Periodic checkpoint saving
                        if frames and completed % save_checkpoint_every == 0:
                            print(f"Creating checkpoint after {completed} requests...")
                            checkpoint_df = pd.concat(frames, ignore_index=True)
                            
                            if existing_data is not None:
                                # Combine with existing data
                                combined_df = pd.concat([existing_data, checkpoint_df], ignore_index=True)
                                combined_df.to_csv(OUT_CSV, index=False)
                                print(f"✓ Checkpoint saved: combined {len(existing_data)} existing + {len(checkpoint_df)} new rows")
                                # Update existing data for next checkpoint
                                existing_data = combined_df
                            else:
                                # First checkpoint with no existing data
                                checkpoint_df.to_csv(OUT_CSV, index=False)
                                existing_data = checkpoint_df
                                print(f"✓ Initial checkpoint saved with {len(checkpoint_df)} rows")
                            
                            # Clear frames to free memory
                            frames = []

    # Final save for any remaining data
    if frames:
        print("Processing final data...")
        final_df = pd.concat(frames, ignore_index=True)
        
        if existing_data is not None:
            # Combine with existing data for final save
            combined_df = pd.concat([existing_data, final_df], ignore_index=True)
            combined_df.to_csv(OUT_CSV, index=False)
            print(f"✓ Saved final CSV → {OUT_CSV}  ({len(combined_df)} total rows)")
        else:
            # No existing data (shouldn't happen at this point but handling it)
            final_df.to_csv(OUT_CSV, index=False)
            print(f"✓ Saved final CSV → {OUT_CSV}  ({len(final_df)} rows)")
    elif existing_data is not None:
        print(f"✓ No new data to add. Current CSV has {len(existing_data)} rows")
    else:
        print("No data was retrieved. Please check your parameters and API key.")

if __name__ == '__main__':
    main()
