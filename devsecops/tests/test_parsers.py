import json
import tempfile
import unittest
from pathlib import Path

from evaluator.parsers.semgrep_parser import load_semgrep
from evaluator.parsers.trivy_parser import load_trivy
from evaluator.normalizer import to_dataframe, deduplicate


class ParserTests(unittest.TestCase):
    def write_json(self, obj):
        tmp = tempfile.NamedTemporaryFile(mode="w", suffix=".json", encoding="utf-8", delete=False)
        json.dump(obj, tmp)
        tmp.close()
        self.addCleanup(lambda: Path(tmp.name).unlink(missing_ok=True))
        return tmp.name

    def test_semgrep_shape(self):
        path = self.write_json({
            "version": "1.0",
            "results": [{
                "check_id": "rule.x", "path": "server/app.js",
                "start": {"line": 2}, "end": {"line": 2},
                "extra": {"message": "audit", "severity": "INFO", "metadata": {"cwe": ["CWE-352"]}}
            }],
            "errors": [], "paths": {"scanned": ["server/app.js"]},
            "time": {"total_time": 1.25}
        })
        findings, meta = load_semgrep(path)
        self.assertEqual(len(findings), 1)
        self.assertEqual(findings[0]["finding_id"], "rule.x")
        self.assertEqual(meta["scan_time_seconds"], 1.25)

    def test_trivy_vulnerability_and_misconfig(self):
        path = self.write_json({
            "Trivy": {"Version": "0.1"}, "ArtifactName": "sample",
            "ArtifactType": "repository",
            "Results": [{
                "Target": "package-lock.json", "Class": "lang-pkgs", "Type": "npm",
                "Vulnerabilities": [{
                    "VulnerabilityID": "CVE-TEST", "PkgName": "pkg",
                    "InstalledVersion": "1.0", "Severity": "HIGH"
                }],
                "Misconfigurations": [{"ID": "DS-1", "Title": "test", "Severity": "LOW"}]
            }]
        })
        findings, _ = load_trivy(path)
        self.assertEqual(len(findings), 2)
        self.assertEqual({x["finding_type"] for x in findings}, {"vulnerability", "misconfiguration"})

    def test_image_dedup_keeps_occurrences(self):
        frame = to_dataframe([
            {"scanner":"trivy","finding_type":"vulnerability","finding_id":"CVE-X",
             "package":"pkg","installed_version":"1","severity":"HIGH","scope":"image",
             "artifact":"image:tag","target":"binary-a"},
            {"scanner":"trivy","finding_type":"vulnerability","finding_id":"CVE-X",
             "package":"pkg","installed_version":"1","severity":"HIGH","scope":"image",
             "artifact":"image:tag","target":"binary-b"},
        ])
        result = deduplicate(frame)
        self.assertEqual(len(result), 1)
        self.assertEqual(result.iloc[0]["occurrences"], 2)


if __name__ == "__main__":
    unittest.main()
