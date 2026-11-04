from __future__ import annotations

import json
from pathlib import Path
import pandas as pd
import streamlit as st

st.set_page_config(page_title="Royal67 · DevSecOps", page_icon="🛡️", layout="wide")
st.title("🛡️ Royal67 — DevSecOps Security Evaluation")
st.caption("Analyse descriptive des rapports Semgrep et Trivy")

default_summary = Path(__file__).resolve().parents[3] / "reports" / "evaluation" / "summary.json"
summary_path = Path(st.sidebar.text_input("Chemin de summary.json", str(default_summary)))
if not summary_path.exists():
    st.warning("Rapport d'évaluation introuvable. Exécute d'abord evaluator.main.")
    st.code("python -m evaluator.main --help")
    st.stop()

summary = json.loads(summary_path.read_text(encoding="utf-8"))
csv_path = summary_path.parent / "normalized_findings.csv"
dedup_path = summary_path.parent / "deduplicated_findings.csv"
if not csv_path.exists():
    st.error(f"Fichier manquant : {csv_path}")
    st.stop()

df = pd.read_csv(csv_path).fillna("")
dedup = pd.read_csv(dedup_path).fillna("") if dedup_path.exists() else df.copy()

raw = summary.get("raw", {})
cols = st.columns(4)
cols[0].metric("Observations brutes", raw.get("observations", 0))
cols[1].metric("Après déduplication", summary.get("deduplicated", {}).get("observations", 0))
cols[2].metric("Scanners", len(summary.get("scan_metadata", [])))
cols[3].metric("Ground truth", "Disponible" if summary.get("ground_truth_metrics", {}).get("available") else "À construire")

st.subheader("Répartition par sévérité")
if not df.empty and "severity" in df:
    severity = df.groupby("severity").size().sort_values(ascending=False)
    st.bar_chart(severity)

left, right = st.columns(2)
with left:
    st.subheader("Par scanner")
    if not df.empty:
        st.bar_chart(df.groupby("scanner").size())
with right:
    st.subheader("Par type de détection")
    if not df.empty:
        st.bar_chart(df.groupby("finding_type").size())

st.subheader("Résultats par cible")
if not df.empty:
    grouped = df.groupby(["scanner", "scope", "target", "finding_type", "severity"]).size().reset_index(name="observations")
    st.dataframe(grouped, use_container_width=True, hide_index=True)

st.subheader("Métriques expérimentales")
metrics = summary.get("ground_truth_metrics", {})
if not metrics.get("available"):
    st.info(metrics.get("reason", "Ground truth indépendante requise."))
else:
    metric_df = pd.DataFrame(metrics.get("by_scanner", []))
    if metric_df.empty:
        st.info("Aucune ligne de référence exploitable.")
    else:
        st.dataframe(metric_df, use_container_width=True, hide_index=True)

st.subheader("Observations normalisées")
scanner_options = sorted(df["scanner"].unique().tolist()) if not df.empty else []
selected = st.multiselect("Filtrer par scanner", scanner_options, default=scanner_options)
view = df[df["scanner"].isin(selected)] if selected else df.iloc[0:0]
st.dataframe(view, use_container_width=True, hide_index=True)

st.download_button(
    "Télécharger les observations CSV",
    data=df.to_csv(index=False).encode("utf-8-sig"),
    file_name="royal67-normalized-findings.csv",
    mime="text/csv",
)
