from __future__ import annotations

from pathlib import Path
from typing import Any
import json


def _as_list(value: Any) -> list:
    return value if isinstance(value, list) else []


def load_trivy(path: str | Path) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    """Parse Trivy JSON Results[] including vulnerabilities, misconfigs and secrets."""
    source = Path(path)
    with source.open("r", encoding="utf-8") as stream:
        report = json.load(stream)

    artifact = report.get("ArtifactName") or ""
    artifact_type = report.get("ArtifactType") or ""
    is_image = artifact_type == "container_image"
    scope = "image" if is_image else "filesystem"
    version = ((report.get("Trivy") or {}).get("Version"))

    findings: list[dict[str, Any]] = []
    for result in report.get("Results") or []:
        target = result.get("Target") or ""
        result_type = result.get("Type") or ""
        result_class = result.get("Class") or ""

        for item in _as_list(result.get("Vulnerabilities")):
            pkg = item.get("PkgName") or ""
            findings.append({
                "scanner": "trivy",
                "finding_type": "vulnerability",
                "finding_id": item.get("VulnerabilityID") or "UNKNOWN_VULNERABILITY",
                "title": item.get("Title") or item.get("VulnerabilityID") or "Vulnerability",
                "message": item.get("Description") or "",
                "severity": str(item.get("Severity") or "UNKNOWN").upper(),
                "path": item.get("PkgPath") or target,
                "target": target,
                "line_start": None,
                "line_end": None,
                "package": pkg,
                "package_id": item.get("PkgID") or "",
                "installed_version": item.get("InstalledVersion") or "",
                "fixed_version": item.get("FixedVersion") or "",
                "cwe": item.get("CweIDs") or [],
                "references": item.get("References") or ([item["PrimaryURL"]] if item.get("PrimaryURL") else []),
                "fingerprint": item.get("Fingerprint") or "",
                "status": item.get("Status") or "",
                "scope": scope,
                "artifact": artifact,
                "artifact_type": artifact_type,
                "result_type": result_type,
                "result_class": result_class,
                "description": item.get("Description") or "",
                "published_date": item.get("PublishedDate") or "",
            })

        for item in _as_list(result.get("Misconfigurations")):
            finding_id = item.get("ID") or item.get("AVDID") or "UNKNOWN_MISCONFIG"
            findings.append({
                "scanner": "trivy",
                "finding_type": "misconfiguration",
                "finding_id": finding_id,
                "title": item.get("Title") or finding_id,
                "message": item.get("Message") or item.get("Description") or "",
                "severity": str(item.get("Severity") or "UNKNOWN").upper(),
                "path": target,
                "target": target,
                "line_start": (item.get("CauseMetadata") or {}).get("StartLine"),
                "line_end": (item.get("CauseMetadata") or {}).get("EndLine"),
                "package": "",
                "package_id": "",
                "installed_version": "",
                "fixed_version": "",
                "cwe": [],
                "references": item.get("References") or ([item["PrimaryURL"]] if item.get("PrimaryURL") else []),
                "fingerprint": "",
                "status": item.get("Status") or "",
                "scope": scope,
                "artifact": artifact,
                "artifact_type": artifact_type,
                "result_type": result_type,
                "result_class": result_class,
                "description": item.get("Description") or "",
                "published_date": "",
            })

        for item in _as_list(result.get("Secrets")):
            rule_id = item.get("RuleID") or item.get("Category") or "UNKNOWN_SECRET"
            findings.append({
                "scanner": "trivy",
                "finding_type": "secret",
                "finding_id": rule_id,
                "title": item.get("Title") or rule_id,
                "message": item.get("Title") or rule_id,
                "severity": str(item.get("Severity") or "UNKNOWN").upper(),
                "path": item.get("Target") or target,
                "target": target,
                "line_start": item.get("StartLine"),
                "line_end": item.get("EndLine"),
                "package": "",
                "package_id": "",
                "installed_version": "",
                "fixed_version": "",
                "cwe": [],
                "references": [],
                "fingerprint": item.get("Fingerprint") or "",
                "status": item.get("Status") or "",
                "scope": scope,
                "artifact": artifact,
                "artifact_type": artifact_type,
                "result_type": result_type,
                "result_class": result_class,
                "description": "Secret détecté par Trivy ; contenu masqué.",
                "published_date": "",
            })

    metadata = {
        "scanner": "trivy",
        "source_file": str(source),
        "version": version,
        "artifact": artifact,
        "artifact_type": artifact_type,
        "scope": scope,
        "created_at": report.get("CreatedAt"),
        "commit": (report.get("Metadata") or {}).get("Commit"),
        "branch": (report.get("Metadata") or {}).get("Branch"),
        "findings_reported": len(findings),
        "results_count": len(report.get("Results") or []),
    }
    return findings, metadata
