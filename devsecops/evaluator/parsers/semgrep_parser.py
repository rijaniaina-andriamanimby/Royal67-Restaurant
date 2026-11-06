from __future__ import annotations

from pathlib import Path
from typing import Any
import json


def load_semgrep(path: str | Path) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    """Parse Semgrep JSON schema: results[], errors[], paths, time."""
    source = Path(path)
    with source.open("r", encoding="utf-8") as stream:
        report = json.load(stream)

    findings: list[dict[str, Any]] = []
    for item in report.get("results") or []:
        extra = item.get("extra") or {}
        metadata = extra.get("metadata") or {}
        start = item.get("start") or {}
        end = item.get("end") or {}
        findings.append({
            "scanner": "semgrep",
            "finding_type": "sast",
            "finding_id": item.get("check_id") or "UNKNOWN_RULE",
            "title": metadata.get("shortlink") or item.get("check_id") or "Semgrep finding",
            "message": extra.get("message") or "",
            "severity": str(extra.get("severity") or "UNKNOWN").upper(),
            "path": item.get("path") or "",
            "target": item.get("path") or "",
            "line_start": start.get("line"),
            "line_end": end.get("line"),
            "package": "",
            "installed_version": "",
            "fixed_version": "",
            "cwe": metadata.get("cwe") or [],
            "references": metadata.get("references") or [],
            "fingerprint": item.get("fingerprint") or "",
            "status": item.get("validation_state") or "",
            "scope": "source",
            "artifact": "",
            "description": extra.get("message") or "",
        })

    metadata = {
        "scanner": "semgrep",
        "source_file": str(source),
        "version": report.get("version"),
        "findings_reported": len(findings),
        "errors_count": len(report.get("errors") or []),
        "errors": report.get("errors") or [],
        "scanned_targets_count": len((report.get("paths") or {}).get("scanned") or []),
        "scan_time_seconds": (report.get("time") or {}).get("total_time"),
    }
    return findings, metadata
