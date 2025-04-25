# merge.py
import pandas as pd
import pycountry

def num_to_iso3(code):
    try:
        return pycountry.countries.get(numeric=str(int(code)).zfill(3)).alpha_3
    except:
        return None

def main():
    # ------------------------------------------------------------
    # 1) load Comtrade flows
    df_flow = pd.read_csv("data/processed/trade_flows.csv")

    # detect + rename 'year'
    if "year" not in df_flow.columns:
        if "refYear" in df_flow.columns:
            df_flow = df_flow.rename(columns={"refYear": "year"})
        elif "period" in df_flow.columns:
            df_flow["year"] = df_flow["period"].astype(int)
        else:
            raise KeyError("No year/refYear/period column found in trade_flows.csv")
    df_flow["year"] = df_flow["year"].astype(int)

    # HS2 is just cmdCode as int
    df_flow["cmdCode"] = df_flow["cmdCode"].astype(int)
    df_flow["hs2"]     = df_flow["cmdCode"]

    # rename reporterISO → reporterISO3
    df_flow = df_flow.rename(columns={"reporterISO": "reporterISO3"})

    # ------------------------------------------------------------
    # 2) load offline WITS H6 MFN rates
    df_wits = pd.read_csv("data/processed/wits_mfn_h6_offline.csv")
    df_wits["reporterISO3"] = df_wits["REPORTER"].apply(num_to_iso3)
    df_wits["year"]         = df_wits["YEAR"].astype(int)
    df_wits["hs6"]          = df_wits["PRODUCT"].astype(str).str.zfill(6)
    df_wits["hs2"]          = df_wits["hs6"].str[:2].astype(int)
    df_wits["mfnRate"]      = df_wits["VALUE"].astype(float)
    df_wits = df_wits.dropna(subset=["reporterISO3","year","hs2","mfnRate"])

    # average to HS2
    df_mfn2 = (
        df_wits
        .groupby(["reporterISO3","year","hs2"], as_index=False)
        .mfnRate
        .mean()
    )

    # ------------------------------------------------------------
    # 3) merge MFN into flows
    # Note: Moved this merging to step 5 below
    
    # ------------------------------------------------------------
    # 4) load Kee elasticities and aggregate to HS2
    df_elas = pd.read_csv("data/csv/kee_elasticities.csv") \
        .rename(columns={"iso3": "reporterISO3", "elasticity": "tau"})
    df_elas["hs2"] = df_elas["hs2"].astype(int)

    # compute a single elasticity per reporter & HS2  
    df_tau2 = (
        df_elas
        .groupby(["reporterISO3", "hs2"], as_index=False)
        .tau
        .mean()
        .rename(columns={"tau": "tau_mean"})
    )

    # ------------------------------------------------------------
    # 5) merge MFN & tau into flows
    merged = (
        df_flow
        .merge(df_mfn2, on=["reporterISO3","year","hs2"], how="left")
        .merge(df_tau2, on=["reporterISO3","hs2"], how="left")
        .drop(columns=["hs2"])
    )

    # ------------------------------------------------------------
    # 6) build primary keys
    # a) flowID: unique per flow record
    merged["flowID"] = (
        merged["reporterISO3"] + "_" +
        merged["partnerISO"]     + "_" +
        merged["cmdCode"].astype(str)   + "_" +
        merged["flowCode"]      + "_" +
        merged["year"].astype(str)
    )

    # b) timeID: unique per time object (we’re annual, so just year)
    merged["timeID"] = "time_" + merged["year"].astype(str)

    # ------------------------------------------------------------
    # 7) emit time dimension table for your Ontology
    time_dim = (
        merged[["timeID","year"]]
        .drop_duplicates()
        .sort_values("year")
    )
    time_dim.to_csv("data/processed/time_dimension.csv", index=False)
    print(f"✓ Wrote time dimension → data/processed/time_dimension.csv ({len(time_dim)} rows)")

    # ------------------------------------------------------------
    # 8) write out enriched flows, including both PKs
    out_cols = [
        "flowID","timeID",
        # then everything else you need downstream:
        "typeCode","freqCode","refPeriodId","year","refMonth","period",
        "reporterCode","reporterISO3","reporterDesc",
        "flowCode","flowDesc",
        "partnerCode","partnerISO","partnerDesc",
        "partner2Code","partner2ISO","partner2Desc",
        "classificationCode","classificationSearchCode","isOriginalClassification",
        "cmdCode","cmdDesc","aggrLevel","isLeaf",
        "customsCode","customsDesc","mosCode","motCode","motDesc",
        "qtyUnitCode","qtyUnitAbbr","qty","isQtyEstimated",
        "altQtyUnitCode","altQtyUnitAbbr","altQty","isAltQtyEstimated",
        "netWgt","isNetWgtEstimated","grossWgt","isGrossWgtEstimated",
        "cifvalue","fobvalue","primaryValue","legacyEstimationFlag",
        "isReported","isAggregate","mfnRate","tau_mean"
    ]
    merged.to_csv("data/processed/flows_with_mfn.csv", columns=out_cols, index=False)
    print(f"✓ Wrote merged → data/processed/flows_with_mfn.csv ({len(merged)} rows)")

if __name__ == "__main__":
    main()
