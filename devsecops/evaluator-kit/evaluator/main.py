from __future__ import annotations

import argparse
import json
from pathlib import Path
from collections import Counter

from evaluator.parsers.semgrep_parser import load_semgrep
from evaluator.parsers.trivy_parser import load_trivy
from evaluator.normalizer import to_dataframe, deduplicate, severity_summary
from evaluator.metrics import load_ground_truth, calculate_metrics


def build_summary(frame, dedup_frame, scan_metadata, metrics):
    def counts(df):
        return {
            "observations": int(len(df)),
            "by_scanner": {str(k): int(v) for k, v in df["scanner"].value_counts().items()},
            "by_type": {str(k): int(v) for k, v in df["finding_type"].value_counts().items()},
            "by_severity": {str(k): int(v) for k, v in df["severity"].value_counts().items()},
        }

    return {
        "project": "Royal67 Restaurant",
        "scan_metadata": scan_metadata,
        "raw": counts(frame),
        "deduplicated": counts(dedup_frame),
        "ground_truth_metrics": metrics,
        "methodology_note": (
            "Les observations brutes sont conservées. La déduplication regroupe les observations "
            "d'une même vulnérabilité/package/version dans une image, même si plusieurs binaires "
            "ou cibles la signalent. Les métriques de classification exigent une ground truth "
            "indépendante et exhaustive pour le périmètre déclaré."
        ),
    }


def main():
    parser = argparse.ArgumentParser(description="Évaluateur de rapports Semgrep et Trivy")
    parser.add_argument("--semgrep", action="append", default=[], help="Chemin d'un rapport JSON Semgrep (répétable)")
    parser.add_argument("--trivy", action="append", default=[], help="Chemin d'un rapport JSON Trivy (répétable)")
    parser.add_argument("--ground-truth", default=None, help="CSV de référence indépendante")
    parser.add_argument("--output-dir", default="reports/evaluation", help="Dossier de sortie")
    args = parser.parse_args()

    findings, metadata = [], []
    for path in args.semgrep:
        parsed, meta = load_semgrep(path)
        findings.extend(parsed)
        metadata.append(meta)
    for path in args.trivy:
        parsed, meta = load_trivy(path)
        findings.extend(parsed)
        metadata.append(meta)

    if not findings:
        raise SystemExit("Aucun rapport fourni ou aucune observation détectée.")

    frame = to_dataframe(findings)
    dedup_frame = deduplicate(frame)
    gt = load_ground_truth(args.ground_truth) if args.ground_truth else None
    metrics = calculate_metrics(dedup_frame, gt)

    output = Path(args.output_dir)
    output.mkdir(parents=True, exist_ok=True)
    frame.to_csv(output / "normalized_findings.csv", index=False, encoding="utf-8-sig")
    dedup_frame.to_csv(output / "deduplicated_findings.csv", index=False, encoding="utf-8-sig")
    severity_summary(frame).to_csv(output / "severity_summary.csv", index=False, encoding="utf-8-sig")

    summary = build_summary(frame, dedup_frame, metadata, metrics)
    (output / "summary.json").write_text(json.dumps(summary, indent=2, ensure_ascii=False), encoding="utf-8")

    print(json.dumps(summary["raw"], indent=2, ensure_ascii=False))
    print(f"\nRapports générés dans : {output.resolve()}")
    if not metrics["available"]:
        print("Precision / Recall / F1 : indisponibles (ground truth indépendante non fournie).")


if __name__ == "__main__":
    main()
