import json
import tempfile
import unittest
from pathlib import Path

from scripts.sanitize_scan_reports import sanitize_semgrep, sanitize_trivy


class SanitizerTests(unittest.TestCase):
    def write_report(self, payload):
        handle = tempfile.NamedTemporaryFile(
            mode="w", suffix=".json", encoding="utf-8", delete=False
        )
        json.dump(payload, handle)
        handle.close()
        path = Path(handle.name)
        self.addCleanup(lambda: path.unlink(missing_ok=True))
        return path

    def test_semgrep_source_snippets_are_removed(self):
        path = self.write_report({
            "results": [{
                "extra": {
                    "message": "Potential secret",
                    "lines": "SENSITIVE_SAMPLE",
                    "metavars": {"$TOKEN": {"abstract_content": "SENSITIVE_SAMPLE"}},
                }
            }]
        })
        self.assertTrue(sanitize_semgrep(path))
        serialized = path.read_text(encoding="utf-8")
        self.assertNotIn("SENSITIVE_SAMPLE", serialized)
        self.assertIn("Potential secret", serialized)

    def test_trivy_secret_match_and_code_are_removed(self):
        path = self.write_report({
            "Results": [{
                "Secrets": [{
                    "RuleID": "generic-api-key",
                    "Match": "SENSITIVE_SAMPLE",
                    "Code": {"Lines": [{"Content": "SENSITIVE_SAMPLE"}]},
                }]
            }]
        })
        self.assertTrue(sanitize_trivy(path))
        serialized = path.read_text(encoding="utf-8")
        self.assertNotIn("SENSITIVE_SAMPLE", serialized)
        parsed = json.loads(serialized)
        self.assertEqual(parsed["Results"][0]["Secrets"][0]["RuleID"], "generic-api-key")


if __name__ == "__main__":
    unittest.main()
