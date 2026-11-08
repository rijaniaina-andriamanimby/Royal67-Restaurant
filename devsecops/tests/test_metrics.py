
import unittest
import tempfile
from pathlib import Path

import pandas as pd

from evaluator.metrics import calculate_metrics, load_ground_truth
from evaluator.normalizer import to_dataframe, deduplicate


class MetricsTests(unittest.TestCase):

    def setUp(self):
        # ----------------------------------------------------
        # 1. Détections : même structure que main.py
        # ----------------------------------------------------

        raw_findings = [
            {
                "scanner": "trivy",
                "finding_type": "vulnerability",
                "finding_id": "CVE-A",
                "package": "pkg-a",
                "installed_version": "1.0",
                "scope": "filesystem",
                "artifact": ".",
                "target": "package-lock.json",
                "severity": "HIGH",
            },
            {
                "scanner": "trivy",
                "finding_type": "vulnerability",
                "finding_id": "CVE-B",
                "package": "pkg-b",
                "installed_version": "2.0",
                "scope": "filesystem",
                "artifact": ".",
                "target": "package-lock.json",
                "severity": "HIGH",
            },
        ]

        normalized = to_dataframe(raw_findings)
        self.findings = deduplicate(normalized)

        # ----------------------------------------------------
        # 2. Ground Truth V2
        # ----------------------------------------------------

        base = {
            "app_version_or_commit": "test-commit",
            "category": "SCA",
            "subcategory": "VULNERABLE_DEPENDENCY",
            "expected_scanner": "trivy",
            "finding_type": "vulnerability",
            "target": "package-lock.json",
            "scope": "filesystem",
            "artifact": ".",
            "location_or_line": "",
            "expected_rule_id": "",
            "expected_finding": "Vulnérabilité de dépendance à vérifier",
            "application_applicability": "NOT_DEMONSTRATED",
            "evidence_reference": "test-evidence",
            "notes": "Independent review",
        }

        self.gt = pd.DataFrame([
            {
                **base,
                "gt_id": "DEP-001",
                "component": "pkg-a",
                "installed_version": "1.0",
                "advisory_id": "CVE-A",
                "verification_status": "CONFIRMED_AFFECTED",
            },
            {
                **base,
                "gt_id": "DEP-002",
                "component": "pkg-b",
                "installed_version": "2.0",
                "advisory_id": "CVE-B",
                "verification_status": "CONFIRMED_NOT_AFFECTED",
            },
            {
                **base,
                "gt_id": "DEP-003",
                "component": "pkg-c",
                "installed_version": "3.0",
                "advisory_id": "CVE-C",
                "verification_status": "REVIEW_REQUIRED",
            },
        ])

    # --------------------------------------------------------
    # TEST 1 : comptabilisation des cas vérifiés
    # --------------------------------------------------------

    def test_reviewed_positive_and_negative_are_counted(self):

        result = calculate_metrics(
            self.findings,
            self.gt,
            ground_truth_complete=False,
        )

        self.assertTrue(result["available"])

        row = next(
            item for item in result["by_scanner"]
            if item["scanner"] == "trivy"
        )

        self.assertEqual(
            (row["tp"], row["fp"], row["fn"]),
            (1, 1, 0),
        )

        self.assertEqual(row["unreviewed_gt"], 1)

        self.assertAlmostEqual(
            row["precision_reviewed_sample"],
            0.5,
        )

        self.assertIsNone(row["recall"])
        self.assertIsNone(row["f1"])

    # --------------------------------------------------------
    # TEST 2 : Recall et F1 uniquement si Ground Truth complet
    # --------------------------------------------------------

    def test_recall_and_f1_only_when_scope_declared_complete(self):

        result = calculate_metrics(
            self.findings,
            self.gt,
            ground_truth_complete=True,
        )

        row = next(
            item for item in result["by_scanner"]
            if item["scanner"] == "trivy"
        )

        self.assertTrue(result["available"])
        self.assertTrue(result["complete"])

        self.assertEqual(row["tp"], 1)
        self.assertEqual(row["fp"], 1)
        self.assertEqual(row["fn"], 0)

        self.assertAlmostEqual(row["recall"], 1.0)
        self.assertAlmostEqual(row["f1"], 2 / 3)

    # --------------------------------------------------------
    # TEST 3 : ancien Ground Truth sans statut
    # --------------------------------------------------------

    def test_legacy_ground_truth_is_not_assumed_validated(self):

        # Création d'un ancien CSV avec les anciennes colonnes.
        legacy = pd.DataFrame([
            {
                "scanner": "trivy",
                "finding_type": "vulnerability",
                "finding_id": "CVE-A",
                "package": "pkg-a",
                "installed_version": "1.0",
                "target": "package-lock.json",
                "scope": "filesystem",
                "artifact": ".",
                "rationale": "Independent review",
            }
        ])

        with tempfile.TemporaryDirectory() as tmp_dir:

            csv_path = Path(tmp_dir) / "legacy-ground-truth.csv"
            legacy.to_csv(csv_path, index=False)

            loaded = load_ground_truth(csv_path)

            # Un ancien fichier sans statut ne doit pas
            # être considéré automatiquement comme validé.
            self.assertIn(
                "verification_status",
                loaded.columns,
            )

            self.assertTrue(
                (loaded["verification_status"] == "REVIEW_REQUIRED").all()
            )

            result = calculate_metrics(
                self.findings,
                loaded,
            )

            self.assertFalse(result["available"])


if __name__ == "__main__":
    unittest.main()
