from __future__ import annotations

from collections import defaultdict
from typing import Any
import pandas as pd


COLUMNS = [
    "scanner", "finding_type", "finding_id", "title", "severity", "message",
    "path", "target", "line_start", "line_end", "package", "package_id",
    "installed_version", "fixed_version", "scope", "artifact", "artifact_type",
    "result_type", "result_class", "status", "fingerprint", "cwe",
    "references", "description", "published_date",
]


def to_dataframe(findings: list[dict[str, Any]]) -> pd.DataFrame:
    frame = pd.DataFrame(findings)
    for column in COLUMNS:
        if column not in frame.columns:
            frame[column] = ""
    frame = frame[COLUMNS].copy()
    for column in ("cwe", "references"):
        frame[column] = frame[column].apply(
            lambda value: "; ".join(map(str, value)) if isinstance(value, list) else str(value or "")
        )
    return frame


def _dedup_key(row: dict[str, Any]) -> tuple:
    """
    For image scans, group the same CVE/package/version reported from several
    bundled platform binaries, while retaining the original target paths.
    For filesystem scans, keep the target in the key to avoid merging frontend
    and backend lockfile observations.
    """
    common = (
        row.get("scanner"), row.get("finding_type"), row.get("finding_id"),
        row.get("package"), row.get("installed_version"), row.get("severity"),
        row.get("artifact"),
    )
    if row.get("scope") == "image":
        return common
    return common + (row.get("target"),)


def deduplicate(frame: pd.DataFrame) -> pd.DataFrame:
    if frame.empty:
        result = frame.copy()
        result["occurrences"] = pd.Series(dtype="int64")
        result["observed_targets"] = pd.Series(dtype="object")
        return result

    groups: dict[tuple, list[dict[str, Any]]] = defaultdict(list)
    for row in frame.to_dict(orient="records"):
        groups[_dedup_key(row)].append(row)

    output = []
    for rows in groups.values():
        first = dict(rows[0])
        first["occurrences"] = len(rows)
        first["observed_targets"] = "; ".join(sorted({str(r.get("target") or "") for r in rows if r.get("target")}))
        output.append(first)

    return pd.DataFrame(output)


def severity_summary(frame: pd.DataFrame) -> pd.DataFrame:
    if frame.empty:
        return pd.DataFrame(columns=["scanner", "finding_type", "severity", "count"])
    return (
        frame.groupby(["scanner", "finding_type", "severity"], dropna=False)
        .size().reset_index(name="count")
        .sort_values(["scanner", "finding_type", "severity"])
    )
