
from __future__ import annotations

from pathlib import Path
import pandas as pd


GT_COLUMNS = [
    "scanner",
    "finding_type",
    "finding_id",
    "package",
    "installed_version",
    "target",
    "scope",
    "artifact",
    "rationale",
]


def load_ground_truth(path: str | Path) -> pd.DataFrame:
    frame = pd.read_csv(
        path,
        dtype=str,
        keep_default_na=False
    )

    missing = [
        column for column in GT_COLUMNS
        if column not in frame.columns
    ]

    if missing:
        raise ValueError(
            f"Colonnes manquantes dans la ground truth : "
            f"{', '.join(missing)}"
        )

    return frame[GT_COLUMNS]


def _base_key(row: dict) -> tuple:
    """
    Identifie une vulnérabilité dans un artefact précis.
    Deux images différentes ne sont plus fusionnées.
    """
    return (
        str(row.get("scanner", "")).strip().lower(),
        str(row.get("finding_type", "")).strip().lower(),
        str(row.get("finding_id", "")).strip(),
        str(row.get("package", "")).strip(),
        str(row.get("installed_version", "")).strip(),
        str(row.get("scope", "")).strip().lower(),
        str(row.get("artifact", "")).strip(),
    )


def calculate_metrics(
    findings: pd.DataFrame,
    ground_truth: pd.DataFrame | None
) -> dict:

    if ground_truth is None or ground_truth.empty:
        return {
            "available": False,
            "reason": "Ground truth indépendante absente ou vide.",
            "by_scanner": [],
        }

    required = [
        "scanner", "finding_type", "finding_id",
        "package", "installed_version", "scope",
        "artifact", "target"
    ]

    missing = [c for c in required if c not in findings.columns]

    if missing:
        raise ValueError(
            f"Colonnes manquantes dans les détections : {missing}"
        )

    detected = findings.drop_duplicates(
        subset=[
            "scanner", "finding_type", "finding_id",
            "package", "installed_version", "scope",
            "artifact", "target"
        ]
    )

    output = []

    scanners = sorted(
        set(ground_truth["scanner"].str.lower())
    )

    for scanner in scanners:

        scanner_gt = ground_truth[
            ground_truth["scanner"].str.lower() == scanner
        ]

        types = sorted(
            set(scanner_gt["finding_type"].str.lower())
        )

        for finding_type in types:

            gt_part = scanner_gt[
                scanner_gt["finding_type"].str.lower()
                == finding_type
            ]

            det_part = detected[
                (detected["scanner"].str.lower() == scanner)
                & (
                    detected["finding_type"].str.lower()
                    == finding_type
                )
            ]

            # Détections regroupées par artefact et vulnérabilité.
            detected_targets: dict[tuple, set[str]] = {}

            for row in det_part.to_dict("records"):

                key = _base_key(row)

                targets = detected_targets.setdefault(
                    key, set()
                )

                target = str(row.get("target", "")).strip()

                if target:
                    targets.add(target)

                observed = str(
                    row.get("observed_targets", "")
                ).strip()

                if observed:
                    targets.update(
                        t.strip()
                        for t in observed.split(";")
                        if t.strip()
                    )

            gt_keys = set()
            matched_keys = set()

            for row in gt_part.to_dict("records"):

                base = _base_key(row)
                target = str(row.get("target", "")).strip()

                gt_key = base + ((target,) if target else tuple())

                if gt_key in gt_keys:
                    continue

                gt_keys.add(gt_key)

                candidates = detected_targets.get(base, set())

                if candidates and (
                    not target or target in candidates
                ):
                    matched_keys.add(gt_key)

            tp = len(matched_keys)
            fn = len(gt_keys) - tp

            # Détections sans référence correspondante.
            fp = 0

            for base, targets in detected_targets.items():

                matching_gt = [
                    row
                    for row in gt_part.to_dict("records")
                    if _base_key(row) == base
                ]

                if not matching_gt:
                    fp += 1
                    continue

                targetless_reference = any(
                    not str(row.get("target", "")).strip()
                    for row in matching_gt
                )

                allowed_targets = {
                    str(row.get("target", "")).strip()
                    for row in matching_gt
                    if str(row.get("target", "")).strip()
                }

                if not targetless_reference and not (
                    targets & allowed_targets
                ):
                    fp += 1

            precision = (
                tp / (tp + fp)
                if (tp + fp) else None
            )

            recall = (
                tp / (tp + fn)
                if (tp + fn) else None
            )

            f1 = (
                2 * precision * recall / (precision + recall)
                if (
                    precision is not None
                    and recall is not None
                    and precision + recall > 0
                )
                else None
            )

            output.append({
                "scanner": scanner,
                "finding_type": finding_type,
                "tp": tp,
                "fp": fp,
                "fn": fn,
                "precision": precision,
                "recall": recall,
                "f1": f1,
                "ground_truth_size": len(gt_keys),
                "detections_size": len(detected_targets),
            })

    return {
        "available": True,
        "reason": "",
        "by_scanner": output,
    }
