from __future__ import annotations

import argparse
import json
from pathlib import Path


def sanitize_semgrep(path: Path) -> bool:
    if not path.is_file():
        return False

    report = json.loads(path.read_text(encoding="utf-8"))
    for finding in report.get("results") or []:
        extra = finding.get("extra")
        if not isinstance(extra, dict):
            continue
        # Source snippets and metavariables can contain credentials or tokens.
        for sensitive_field in ("lines", "metavars", "dataflow_trace", "fix"):
            extra.pop(sensitive_field, None)

    path.write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return True


def sanitize_trivy(path: Path) -> bool:
    if not path.is_file():
        return False

    report = json.loads(path.read_text(encoding="utf-8"))
    for result in report.get("Results") or []:
        for secret in result.get("Secrets") or []:
            # Keep rule metadata and location, but remove matched content and
            # source-code context that could disclose the detected secret.
            for sensitive_field in ("Match", "Code", "Raw", "Secret"):
                secret.pop(sensitive_field, None)

    path.write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return True


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Redact potentially sensitive source snippets from scanner JSON reports."
    )
    parser.add_argument("--semgrep", action="append", default=[])
    parser.add_argument("--trivy", action="append", default=[])
    args = parser.parse_args()

    if not args.semgrep and not args.trivy:
        parser.error("Provide at least one --semgrep or --trivy report.")

    processed = 0
    for raw_path in args.semgrep:
        path = Path(raw_path)
        processed += int(sanitize_semgrep(path))
    for raw_path in args.trivy:
        path = Path(raw_path)
        processed += int(sanitize_trivy(path))

    print(f"Rapports nettoyés : {processed}")


if __name__ == "__main__":
    main()
