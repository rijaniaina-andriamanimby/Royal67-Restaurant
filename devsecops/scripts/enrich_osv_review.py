#!/usr/bin/env python3
"""Enrich the manual vulnerability-review queue with OSV advisory evidence.

This script NEVER marks a candidate as true/false positive automatically.
OSV matches are evidence for human review, not proof of application exploitability.
"""
from __future__ import annotations

import argparse
import json
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

OSV = "https://api.osv.dev/v1"


def request_json(url: str, payload: dict | None = None) -> dict:
    data = None if payload is None else json.dumps(payload).encode("utf-8")
    request = Request(
        url,
        data=data,
        headers={"Content-Type": "application/json", "User-Agent": "Royal67-GroundTruth-Review/1.0"},
        method="GET" if data is None else "POST",
    )
    with urlopen(request, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def affected_evidence(vuln: dict) -> str:
    chunks = []
    for affected in vuln.get("affected", []):
        package = affected.get("package", {})
        name = package.get("name", "")
        ecosystem = package.get("ecosystem", "")
        ranges = []
        for item in affected.get("ranges", []):
            events = item.get("events", [])
            rendered = []
            for event in events:
                if "introduced" in event:
                    rendered.append(f"introduced={event['introduced']}")
                if "fixed" in event:
                    rendered.append(f"fixed={event['fixed']}")
                if "last_affected" in event:
                    rendered.append(f"last_affected={event['last_affected']}")
            ranges.append(f"{item.get('type', 'range')}: " + ", ".join(rendered))
        versions = ", ".join(affected.get("versions", [])[:20])
        chunks.append(f"{ecosystem}/{name}: " + (" | ".join(ranges) if ranges else f"versions={versions}"))
    return " ; ".join(chunks)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", default="reports/ground-truth/high-review-to-validate.csv")
    parser.add_argument("--output", default="reports/ground-truth/high-review-osv-enriched.csv")
    args = parser.parse_args()

    import csv
    source = Path(args.input)
    destination = Path(args.output)
    with source.open("r", encoding="utf-8-sig", newline="") as stream:
        rows = list(csv.DictReader(stream))
        fields = list(rows[0].keys()) if rows else []
    if not rows:
        raise SystemExit(f"Aucune ligne dans {source}")

    queries = []
    for row in rows:
        ecosystem = row.get("ecosystem", "").strip()
        package = row.get("package", "").strip()
        version = row.get("installed_version", "").strip()
        queries.append({"package": {"name": package, "ecosystem": ecosystem}, "version": version})

    print(f"Interrogation OSV pour {len(queries)} candidats...")
    response = request_json(f"{OSV}/querybatch", {"queries": queries})
    results = response.get("results", [])
    if len(results) != len(rows):
        raise RuntimeError(f"Réponse OSV inattendue : {len(results)} résultats pour {len(rows)} candidats")

    ids = sorted({v.get("id", "") for result in results for v in result.get("vulns", []) if v.get("id")})
    details = {}
    for index, vuln_id in enumerate(ids, start=1):
        try:
            details[vuln_id] = request_json(f"{OSV}/vulns/{vuln_id}")
        except (HTTPError, URLError, TimeoutError) as exc:
            details[vuln_id] = {"id": vuln_id, "_lookup_error": str(exc)}
        if index % 20 == 0:
            print(f"Avis détaillés récupérés : {index}/{len(ids)}")
        time.sleep(0.05)

    checked_at = datetime.now(timezone.utc).isoformat()
    extra = ["osv_ids", "osv_summaries", "affected_version_evidence", "osv_checked_at_utc", "verification_status", "application_applicability", "review_notes"]
    for field in extra:
        if field not in fields:
            fields.append(field)

    for row, result in zip(rows, results):
        vuln_ids = sorted({v.get("id", "") for v in result.get("vulns", []) if v.get("id")})
        matched = [details[v] for v in vuln_ids if v in details]
        row["osv_ids"] = ";".join(vuln_ids)
        row["osv_summaries"] = " ; ".join(f"{v.get('id', '')}: {v.get('summary', '')}" for v in matched)
        row["affected_version_evidence"] = " ; ".join(affected_evidence(v) for v in matched if v.get("affected"))
        row["osv_checked_at_utc"] = checked_at
        # Deliberately never auto-classify from OSV presence/absence.
        row["verification_status"] = "REVIEW_REQUIRED"
        row["application_applicability"] = "NOT_ASSESSED"
        row["review_notes"] = "Avis OSV à examiner ; confirmer indépendamment le package, la version, l'artefact et le contexte applicatif."

    destination.parent.mkdir(parents=True, exist_ok=True)
    with destination.open("w", encoding="utf-8-sig", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Fichier enrichi : {destination}")
    print(f"Candidats : {len(rows)} | Avis OSV distincts : {len(ids)}")
    print("Aucun candidat n'a été automatiquement classé TP ou FP.")


if __name__ == "__main__":
    main()
