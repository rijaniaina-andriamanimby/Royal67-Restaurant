import unittest
import pandas as pd

from evaluator.metrics import calculate_metrics, load_ground_truth


class MetricsTests(unittest.TestCase):
    def setUp(self):
        self.findings = pd.DataFrame([
            {"scanner": "trivy", "finding_type": "vulnerability", "finding_id": "CVE-A",
             "package": "pkg-a", "installed_version": "1.0", "scope": "filesystem",
             "artifact": ".", "target": "package-lock.json", "observed_targets": "package-lock.json"},
            {"scanner": "trivy", "finding_type": "vulnerability", "finding_id": "CVE-B",
             "package": "pkg-b", "installed_version": "2.0", "scope": "filesystem",
             "artifact": ".", "target": "package-lock.json", "observed_targets": "package-lock.json"},
        ])
        base = {"scanner": "trivy", "finding_type": "vulnerability", "scope": "filesystem", "artifact": ".",
                "target": "package-lock.json", "rationale": "independent review"}
        self.gt = pd.DataFrame([
            {**base, "finding_id": "CVE-A", "package": "pkg-a", "installed_version": "1.0", "verification_status": "CONFIRMED_AFFECTED"},
            {**base, "finding_id": "CVE-B", "package": "pkg-b", "installed_version": "2.0", "verification_status": "CONFIRMED_NOT_AFFECTED"},
            {**base, "finding_id": "CVE-C", "package": "pkg-c", "installed_version": "3.0", "verification_status": "REVIEW_REQUIRED"},
        ])

    def test_reviewed_positive_and_negative_are_counted(self):
        result = calculate_metrics(self.findings, self.gt)
        row = result["by_scanner"][0]
        self.assertEqual((row["tp"], row["fp"], row["fn"]), (1, 1, 0))
        self.assertEqual(row["unreviewed_gt"], 1)
        self.assertEqual(row["precision_reviewed_sample"], 0.5)
        self.assertIsNone(row["recall"])
        self.assertIsNone(row["f1"])

    def test_recall_and_f1_only_when_scope_declared_complete(self):
        result = calculate_metrics(self.findings, self.gt, ground_truth_complete=True)
        row = result["by_scanner"][0]
        self.assertEqual(row["recall"], 1.0)
        self.assertEqual(row["f1"], 2 / 3)

    def test_legacy_ground_truth_is_not_assumed_validated(self):
        legacy = self.gt.drop(columns=["verification_status"])
        legacy["finding_id"] = "CVE-A"
        legacy = legacy.iloc[[0]]
        result = calculate_metrics(self.findings, legacy)
        self.assertFalse(result["available"])


if __name__ == "__main__":
    unittest.main()
