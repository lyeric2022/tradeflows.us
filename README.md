# Trade Policy Data Pipeline

A reproducible data‐engineering workflow that ingests, harmonizes, and merges  
• bilateral trade flows (UN Comtrade)  
• MFN tariff schedules (WITS)  
• HS­6 price‐elasticities (Kee et al.)  

…into one joined dataset ready for economic modelling, dashboarding, or Foundry lineage.

---

## 🚀 Features

- **Idempotent ingestion**: only re‐fetches Comtrade or WITS if no local file exists  
- **Multi‐source support**: UN Comtrade SDMX, WITS SDMX & offline ZIPs, Kee‑Nicita‑Olarreaga CSV  
- **Data harmonization**: aligns reporter ISO‑3, partner groups, HS2022 codes, calendar years  
- **Rapid QA**: built‐in scripts for basic completeness checks and output summaries  
- **One‑line merge**: joins flows × tariffs × elasticities for downstream analysis

---

## 📂 Repository Structure

.  
├── data/  
│   ├── raw/                # downloaded Comtrade & WITS ZIPs  
│   └── processed/  
│       ├── trade_flows.csv # UN Comtrade flows  
│       ├── wits_mfn_h6_offline.csv  
│       └── flows_with_mfn.csv # final joined output  
├── scripts/  
│   ├── fetch_trade.py      # Comtrade SDMX fetch + cache  
│   ├── wits_fetch.py       # WITS online fetch (SDMX)  
│   ├── ingest_wits.py      # offline ZIP unzip + assemble  
│   └── merge.py            # combine flows, tariffs, elasticities  
├── utils/  
│   └── iso_lookup.csv      # numeric ISO → ISO‑3  
├── requirements.txt  
├── README.md  
└── LICENSE  

---

## ⚙️ Quickstart

1. **Install dependencies**  
   ```bash
   python3 -m venv venv && source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Fetch & preprocess data**  
   ```bash
   # only downloads if missing
   python scripts/fetch_trade.py
   python scripts/wits_fetch.py   # or: python scripts/ingest_wits.py
   ```

3. **Merge everything**  
   ```bash
   python scripts/merge.py
   # outputs: data/processed/flows_with_mfn.csv
   ```

4. **Quick QA**  
   ```bash
   python - <<'PY'
   import pandas as pd
   df = pd.read_csv('data/processed/flows_with_mfn.csv')
   print(df.head(), df.isna().sum().to_dict())
   PY
   ```

---

## 💡 Contributing

- Add new data sources under `scripts/`  
- Improve QA in `scripts/qc_*.py`  
- File issues or PRs for missing HS concordances  

---

## 📜 License

Distributed under MIT. See LICENSE for details.

---

## 📝 Project Description (for your Palantir video / write‑up)

> **Title**  
> **Trade Policy Data Pipeline**  

---

### 🎯 Problem  
Trade policy analysts and economists routinely need to combine disparate international datasets—bilateral trade flows, national tariff schedules, and product‐level demand elasticities—into a single, model‐ready table. Manually wrangling these feeds is error‑prone, time‑consuming, and non‑reproducible.

---

### 💡 Solution  
I built a **fully automated, idempotent pipeline** in Python (and easily ported to Foundry/AIP) that:

1. **Fetches trade flows** from UN Comtrade’s SDMX API only when missing  
2. **Ingests MFN tariff schedules** via the WITS SDMX endpoint or offline ZIP extracts  
3. **Loads Kee et al. HS‑6 elasticities** from a prepared CSV  
4. **Harmonizes key identifiers** (ISO‑3, HS‑2022, calendar years)  
5. **Joins everything** into one flat CSV ready for gravity models, dashboard charts, or policy simulations

Every step checks for existing files—so rerunning the workflow never re‑downloads unchanged data, ensuring both speed and auditability.

---

### 👥 Users & Impact  
- **Economists & policy analysts** get a turnkey dataset, saving hours of scripting and QA  
- **Foundry teams** can operationalize this as a chained Transform pipeline with full lineage  
- **Decision‑makers** can pull up‐to‑date trade & tariff tables to model the effect of a tariff change or FTA shock in real time

By abstracting away the messy details—SDMX quirks, ZIP extraction, code‐list concordances—this tool lets users focus on *analysis* rather than *plumbing*. In a live Foundry demo, a 3‑click workflow can refresh all inputs, recompute aggregates (e.g. HS2‐level averages), and visualize trade‐weighted tariff changes on a world map.

---

### 🔧 Tech Stack & Next Steps  
- **Python** with `requests`, `pandas`, `tqdm`  
- **SDMX APIs** (Comtrade + WITS) + offline ZIP support  
- (Future) port transform logic to **Foundry AIP** for modular, GUI‑driven pipelines  
- (Future) schedule **daily refresh** tasks and live **lineage** in Palantir

This demo shows not just *what* I built, but *how* I’d operationalize it in a mission‑critical environment: reproducible, efficient, and audit‑ready.

---

**That’s my “build”: a foundational data‑engineering layer for trade‑policy insights powered by Palantir technology.**







