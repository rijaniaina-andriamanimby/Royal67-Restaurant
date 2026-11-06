from __future__ import annotations

from pathlib import Path
import pandas as pd


GT_COLUMNS = [
    "scanner", "finding_type", "finding_id", "package",
    "installed_version", "target", "scope", "artifact", "rationale",
]
STATUS_COLUMN = "verification_status"
VALID_STATUSES = {"CONFIRMED_AFFECTED", "CONFIRMED_NOT_AFFECTED", "REVIEW_REQUIRED"}


def load_ground_truth(path: str | Path) -> pd.DataFrame:
    frame = pd.read_csv(path, dtype=str, keep_default_na=False)
    missing = [column for column in GT_COLUMNS if column not in frame.columns]
    if missing:
        raise ValueError(f"Colonnes manquantes dans la ground truth : {', '.join(missing)}")

    # Legacy rows are deliberately unverified until explicitly reviewed.
    if STATUS_COLUMN not in frame.columns:
        frame[STATUS_COLUMN] = "REVIEW_REQUIRED"
    frame[STATUS_COLUMN] = frame[STATUS_COLUMN].fillna("").str.strip().str.upper()
    frame.loc[frame[STATUS_COLUMN] == "", STATUS_COLUMN] = "REVIEW_REQUIRED"
    invalid = sorted(set(frame[STATUS_COLUMN]) - VALID_STATUSES)
    if invalid:
        raise ValueError(f"Statuts Ground Truth invalides : {invalid}. Valeurs permises : {sorted(VALID_STATUSES)}")

    for column in ("scanner", "finding_type", "finding_id", "package", "installed_version", "target", "scope", "artifact"):
        frame[column] = frame[column].astype(str).str.strip()
    return frame


def _base_key(row: dict) -> tuple:
    return (
        str(row.get("scanner", "")).strip().lower(),
        str(row.get("finding_type", "")).strip().lower(),
        str(row.get("finding_id", "")).strip(),
        str(row.get("package", "")).strip().lower(),
        str(row.get("installed_version", "")).strip(),
        str(row.get("scope", "")).strip().lower(),
        str(row.get("artifact", "")).strip(),
    )


def calculate_metrics(
    findings: pd.DataFrame,
    ground_truth: pd.DataFrame | None,
    *,
    ground_truth_complete: bool = False,
) -> dict:
    """
    Calculate metrics only on explicitly reviewed GT records.

    CONFIRMED_AFFECTED records contribute TP/FN.
    CONFIRMED_NOT_AFFECTED records contribute FP only when detected.
    Unreviewed detections are never silently counted as FP.
    Recall/F1 are withheld unless the caller explicitly declares the GT
    exhaustive for the declared evaluation scope.
    """
    unavailable = {
        "available": False, "complete": False,
        "reason": "Ground Truth indépendante absente ou vide.",
        "by_scanner": [],
    }
    if ground_truth is None or ground_truth.empty:
        return unavailable

    required = ["scanner", "finding_type", "finding_id", "package", "installed_version", "scope", "artifact", "target"]
    missing = [column for column in required if column not in findings.columns]
    if missing:
        raise ValueError(f"Colonnes manquantes dans les détections : {missing}")

    gt = ground_truth.copy()
    if STATUS_COLUMN not in gt.columns:
        gt[STATUS_COLUMN] = "REVIEW_REQUIRED"
    gt[STATUS_COLUMN] = gt[STATUS_COLUMN].fillna("").astype(str).str.strip().str.upper()
    gt.loc[gt[STATUS_COLUMN] == "", STATUS_COLUMN] = "REVIEW_REQUIRED"
    invalid = sorted(set(gt[STATUS_COLUMN]) - VALID_STATUSES)
    if invalid:
        raise ValueError(f"Statuts Ground Truth invalides : {invalid}")

    detected = findings.copy()
    for column in required:
        detected[column] = detected[column].fillna("").astype(str).str.strip()

    output = []
    grouping = sorted({(str(r.scanner).lower(), str(r.finding_type).lower()) for r in gt.itertuples()})
    for scanner, finding_type in grouping:
        gt_part = gt[(gt.scanner.str.lower() == scanner) & (gt.finding_type.str.lower() == finding_type)]
        det_part = detected[(detected.scanner.str.lower() == scanner) & (detected.finding_type.str.lower() == finding_type)]

        detected_targets: dict[tuple, set[str]] = {}
        for row in det_part.to_dict("records"):
            base = _base_key(row)
            targets = detected_targets.setdefault(base, set())
            target = str(row.get("target", "")).strip()
            if target:
                targets.add(target)
            observed = str(row.get("observed_targets", "")).strip()
            if observed:
                targets.update(item.strip() for item in observed.split(";") if item.strip())

        tp = fp = fn = 0
        reviewed_positive = reviewed_negative = 0
        matched_positive = matched_negative = 0
        for row in gt_part.to_dict("records"):
            status = str(row.get(STATUS_COLUMN, "REVIEW_REQUIRED")).strip().upper()
            if status == "REVIEW_REQUIRED":
                continue
            base = _base_key(row)
            target = str(row.get("target", "")).strip()
            observed = detected_targets.get(base, set())
            is_detected = bool(observed) and (not target or target in observed)

            if status == "CONFIRMED_AFFECTED":
                reviewed_positive += 1
                if is_detected:
                    tp += 1
                    matched_positive += 1
                else:
                    fn += 1
            elif status == "CONFIRMED_NOT_AFFECTED":
                reviewed_negative += 1
                if is_detected:
                    fp += 1
                    matched_negative += 1

        precision = tp / (tp + fp) if reviewed_negative > 0 and (tp + fp) > 0 else None
        recall = tp / (tp + fn) if ground_truth_complete and (tp + fn) > 0 else None
        f1 = (2 * precision * recall / (precision + recall)) if precision is not None and recall is not None and precision + recall > 0 else None
        output.append({
            "scanner": scanner, "finding_type": finding_type,
            "tp": tp, "fp": fp, "fn": fn,
            "precision_reviewed_sample": precision,
            "recall": recall, "f1": f1,
            "reviewed_positive": reviewed_positive,
            "reviewed_negative": reviewed_negative,
            "matched_positive": matched_positive,
            "matched_negative": matched_negative,
            "unreviewed_gt": int((gt_part[STATUS_COLUMN] == "REVIEW_REQUIRED").sum()),
            "detections_total": int(len(detected_targets)),
            "ground_truth_complete": bool(ground_truth_complete),
        })

    has_reviewed = any(item["reviewed_positive"] + item["reviewed_negative"] > 0 for item in output)
    return {
        "available": has_reviewed,
        "complete": bool(ground_truth_complete),
        "reason": "" if ground_truth_complete else "Résultats partiels : les détections non examinées ne sont pas classées FP et le Recall/F1 global est désactivé.",
        "by_scanner": output,
    }
