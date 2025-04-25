
# ingest_wits.py
"""
Scans a directory of WITS offline ZIP exports (H6 MFN):
unzips each, reads its CSV, tags reporter/year, and concatenates into one table.
"""
import os
import zipfile
import pandas as pd
from glob import glob

ZIP_DIR = 'data/raw/wits_h6_offline'
OUT_CSV = 'data/processed/wits_mfn_h6_offline.csv'


def main():
    os.makedirs(os.path.dirname(OUT_CSV), exist_ok=True)
    if os.path.exists(OUT_CSV):
        print(f"⇢ {OUT_CSV} already exists; skipping ingest.")
        return

    all_frames = []
    for zippath in sorted(glob(os.path.join(ZIP_DIR, '*.zip'))):
        fname = os.path.basename(zippath)
        # expect names like AVEMFN_H6_USA_2023_U2.zip
        parts = fname.replace('.zip', '').split('_')
        _, nomen, reporter, year, _ = parts

        with zipfile.ZipFile(zippath, 'r') as zf:
            # find the CSV inside
            for member in zf.namelist():
                if member.lower().endswith('.csv'):
                    with zf.open(member) as f:
                        df = pd.read_csv(f)
                        df['reporterISO3'] = reporter
                        df['year'] = int(year)
                        all_frames.append(df)
                    break

    combined = pd.concat(all_frames, ignore_index=True)
    combined.to_csv(OUT_CSV, index=False)
    print(f"✓ Combined {len(all_frames)} files → {OUT_CSV}  ({len(combined)} rows)")

if __name__ == '__main__':
    main()