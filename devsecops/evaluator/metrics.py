
from __future__ import annotations

from pathlib import Path
import pandas as pd


# ============================================================
# GROUND TRUTH V2 : SCHEMA
# ============================================================

GT_COLUMNS = [
    "gt_id",
    "app_version_or_commit",
    "category",
    "subcategory",
    "expected_scanner",
    "component",
    "installed_version",
    "advisory_id",
    "scope",
    "target",
    "artifact",
    "location_or_line",
    "expected_rule_id",
    "expected_finding",
    "verification_status",
    "application_applicability",
    "evidence_reference",
    "notes",
]

STATUS_COLUMN = "verification_status"

VALID_STATUSES = {
    "CONFIRMED_AFFECTED",
    "CONFIRMED_NOT_AFFECTED",
    "REVIEW_REQUIRED",
}


# Correspondance entre les catégories Ground Truth et les
# finding_type produits par les parsers.
CATEGORY_FINDING_TYPES = {
    "sca": {"vulnerability"},
    "sast": {"sast", "code", "semgrep"},
    "container": {"misconfiguration", "config", "vulnerability"},
    "application": {"application", "manual"},
}


# ============================================================
# NORMALISATION DES VALEURS
# ============================================================

def clean(value) -> str:
    """Convertit une valeur en chaîne propre."""
    if value is None:
        return ""

    if pd.isna(value):
        return ""

    return str(value).strip()


def normalize(value) -> str:
    """Normalisation pour les comparaisons."""
    return clean(value).lower()


def normalize_scanner(value) -> str:
    """Normalise les noms des scanners."""

    scanner = normalize(value)

    if "semgrep" in scanner:
        return "semgrep"

    if "trivy" in scanner:
        return "trivy"

    if scanner in {"manual", "manuel", "controle manuel"}:
        return "manual"

    return scanner


# ============================================================
# CHARGEMENT DU GROUND TRUTH V2
# ============================================================

def load_ground_truth(path: str | Path) -> pd.DataFrame:

    path = Path(path)

    if not path.exists():
        raise FileNotFoundError(
            f"Fichier Ground Truth introuvable : {path}"
        )

    frame = pd.read_csv(
        path,
        dtype=str,
        keep_default_na=False,
        encoding="utf-8-sig",
    )

    # --------------------------------------------------------
    # 1. Détection et conversion de l'ancien format
    # --------------------------------------------------------

    legacy_columns = {
        "scanner",
        "finding_id",
        "package",
    }

    is_legacy = (
        bool(legacy_columns.intersection(frame.columns))
        and "expected_scanner" not in frame.columns
    )

    if is_legacy:

        # Correspondance des anciennes colonnes vers V2.
        rename_map = {
            "scanner": "expected_scanner",
            "finding_id": "advisory_id",
            "package": "component",
            "rationale": "notes",
        }

        frame = frame.rename(columns=rename_map)

        # Génération d'identifiants pour les anciennes lignes.
        if "gt_id" not in frame.columns:
            frame["gt_id"] = [
                f"LEGACY-{i:04d}"
                for i in range(1, len(frame) + 1)
            ]

        # Détermination de la catégorie.
        if "category" not in frame.columns:

            def infer_category(row):
                finding_type = normalize(
                    row.get("finding_type")
                )

                scanner = normalize_scanner(
                    row.get("expected_scanner")
                )

                if finding_type == "vulnerability":
                    return "SCA"

                if scanner == "semgrep":
                    return "SAST"

                if finding_type in {
                    "misconfiguration",
                    "config",
                }:
                    return "CONTAINER"

                return "APPLICATION"

            frame["category"] = frame.apply(
                infer_category,
                axis=1,
            )

        # Une ancienne référence n'est jamais considérée
        # comme validée automatiquement.
        frame["verification_status"] = "REVIEW_REQUIRED"

        print(
            "[Ground Truth] Ancien format détecté : "
            "conversion vers V2 effectuée."
        )

    # --------------------------------------------------------
    # 2. Compléter les colonnes V2 absentes
    # --------------------------------------------------------

    for column in GT_COLUMNS:
        if column not in frame.columns:
            frame[column] = ""

    frame = frame[GT_COLUMNS].copy()

    # --------------------------------------------------------
    # 3. Nettoyage
    # --------------------------------------------------------

    for column in GT_COLUMNS:
        frame[column] = frame[column].apply(clean)

    frame[STATUS_COLUMN] = (
        frame[STATUS_COLUMN]
        .str.upper()
        .str.strip()
    )

    # Tout statut absent devient REVIEW_REQUIRED.
    frame.loc[
        frame[STATUS_COLUMN] == "",
        STATUS_COLUMN
    ] = "REVIEW_REQUIRED"

    invalid = sorted(
        set(frame[STATUS_COLUMN]) - VALID_STATUSES
    )

    if invalid:
        raise ValueError(
            f"Statuts Ground Truth invalides : {invalid}. "
            f"Valeurs autorisées : {sorted(VALID_STATUSES)}"
        )

    # --------------------------------------------------------
    # 4. Vérification des identifiants
    # --------------------------------------------------------

    duplicated = frame[
        frame["gt_id"].duplicated(keep=False)
        & (frame["gt_id"] != "")
    ]

    if not duplicated.empty:
        ids = duplicated["gt_id"].tolist()

        raise ValueError(
            f"Identifiants gt_id dupliqués : {ids}"
        )

    # --------------------------------------------------------
    # 5. Validation des références confirmées
    # --------------------------------------------------------

    confirmed = frame[
        frame[STATUS_COLUMN].isin({
            "CONFIRMED_AFFECTED",
            "CONFIRMED_NOT_AFFECTED",
        })
    ]

    invalid_confirmed = []

    for _, row in confirmed.iterrows():

        category = normalize(row["category"])

        if category == "sca" and not row["advisory_id"]:
            invalid_confirmed.append(row["gt_id"])

        elif category == "sast" and not row["expected_rule_id"]:
            invalid_confirmed.append(row["gt_id"])

        elif not (
            row["advisory_id"]
            or row["expected_rule_id"]
        ):
            invalid_confirmed.append(row["gt_id"])

    if invalid_confirmed:
        raise ValueError(
            "Références confirmées sans identifiant de "
            "correspondance valide : "
            + ", ".join(sorted(set(invalid_confirmed)))
        )

    return frame


# ============================================================
# IDENTIFIANT DE CORRESPONDANCE
# ============================================================

def expected_identifier(row: dict) -> str:
    """
    SCA       -> advisory_id (CVE/GHSA)
    SAST      -> expected_rule_id
    CONTAINER -> expected_rule_id ou advisory_id
    """

    category = normalize(row.get("category"))

    if category == "sca":
        return clean(row.get("advisory_id"))

    if category == "sast":
        return clean(row.get("expected_rule_id"))

    return (
        clean(row.get("expected_rule_id"))
        or clean(row.get("advisory_id"))
    )


def detected_identifier(row: dict) -> str:
    return clean(row.get("finding_id"))


# ============================================================
# CORRESPONDANCE GROUND TRUTH / DETECTIONS
# ============================================================

def matches_category(
    gt_row: dict,
    finding_row: dict,
) -> bool:

    category = normalize(gt_row.get("category"))

    allowed = CATEGORY_FINDING_TYPES.get(category)

    if not allowed:
        return False

    detected_type = normalize(
        finding_row.get("finding_type")
    )

    return detected_type in allowed


def matches_target(
    gt_row: dict,
    finding_row: dict,
) -> bool:
    """
    Le target V2 peut correspondre au target ou au path
    normalisé du scanner.
    """

    expected = clean(gt_row.get("target"))

    if not expected:
        return True

    possible_targets = {
        clean(finding_row.get("target")),
        clean(finding_row.get("path")),
    }

    observed = clean(
        finding_row.get("observed_targets")
    )

    if observed:
        possible_targets.update(
            item.strip()
            for item in observed.split(";")
            if item.strip()
        )

    return expected in possible_targets


def matches_reference(
    gt_row: dict,
    finding_row: dict,
) -> bool:

    # 1. Scanner
    expected_scanner = normalize_scanner(
        gt_row.get("expected_scanner")
    )

    detected_scanner = normalize_scanner(
        finding_row.get("scanner")
    )

    if not expected_scanner or expected_scanner != detected_scanner:
        return False

    # Les contrôles manuels ne sont pas des détections automatiques.
    if expected_scanner == "manual":
        return False

    # 2. Catégorie
    if not matches_category(gt_row, finding_row):
        return False

    # 3. Identifiant CVE/GHSA ou règle Semgrep
    expected_id = expected_identifier(gt_row)
    detected_id = detected_identifier(finding_row)

    if not expected_id or expected_id != detected_id:
        return False

    # 4. Composant / package
    component = normalize(gt_row.get("component"))

    detected_package = normalize(
        finding_row.get("package")
    )

    if component and component != detected_package:
        return False

    # 5. Version installée
    version = clean(gt_row.get("installed_version"))

    detected_version = clean(
        finding_row.get("installed_version")
    )

    if version and version != detected_version:
        return False

    # 6. Scope
    scope = normalize(gt_row.get("scope"))

    detected_scope = normalize(
        finding_row.get("scope")
    )

    if scope and scope != detected_scope:
        return False

    # 7. Artifact
    artifact = clean(gt_row.get("artifact"))

    detected_artifact = clean(
        finding_row.get("artifact")
    )

    if artifact and artifact != detected_artifact:
        return False

    # 8. Target
    if not matches_target(gt_row, finding_row):
        return False

    return True


# ============================================================
# CALCUL DES METRIQUES
# ============================================================

def calculate_metrics(
    findings: pd.DataFrame,
    ground_truth: pd.DataFrame | None,
    *,
    ground_truth_complete: bool = False,
) -> dict:
    """
    Compare les détections normalisées au Ground Truth V2.

    CONFIRMED_AFFECTED :
        Détection trouvée     -> TP
        Détection non trouvée -> FN

    CONFIRMED_NOT_AFFECTED :
        Détection trouvée     -> FP
        Détection non trouvée -> aucun FP

    REVIEW_REQUIRED :
        Ignoré dans les métriques.

    IMPORTANT :
        Le Recall et le F1 ne sont calculés que si le Ground
        Truth est déclaré exhaustif pour le périmètre évalué.
    """

    unavailable = {
        "available": False,
        "complete": False,
        "reason": "Ground Truth indépendante absente ou vide.",
        "by_scanner": [],
    }

    if ground_truth is None or ground_truth.empty:
        return unavailable

    required_findings = [
        "scanner",
        "finding_type",
        "finding_id",
        "package",
        "installed_version",
        "target",
        "path",
        "scope",
        "artifact",
    ]

    missing = [
        column
        for column in required_findings
        if column not in findings.columns
    ]

    if missing:
        raise ValueError(
            "Colonnes manquantes dans les détections : "
            + ", ".join(missing)
        )

    gt = ground_truth.copy()
    detected = findings.copy()

    # Normalisation des données de détection.
    for column in required_findings:
        detected[column] = (
            detected[column]
            .fillna("")
            .astype(str)
            .str.strip()
        )

    # Support des données chargées directement par le dashboard.
    for column in GT_COLUMNS:
        if column not in gt.columns:
            gt[column] = ""

        gt[column] = gt[column].apply(clean)

    gt[STATUS_COLUMN] = (
        gt[STATUS_COLUMN]
        .str.upper()
        .str.strip()
    )

    gt.loc[
        gt[STATUS_COLUMN] == "",
        STATUS_COLUMN
    ] = "REVIEW_REQUIRED"

    invalid = sorted(
        set(gt[STATUS_COLUMN]) - VALID_STATUSES
    )

    if invalid:
        raise ValueError(
            f"Statuts Ground Truth invalides : {invalid}"
        )

    # On ne peut pas mesurer les contrôles manuels avec
    # les détections automatiques Semgrep/Trivy.
    measurable_gt = gt[
        gt["expected_scanner"].apply(normalize_scanner)
        != "manual"
    ].copy()

    # Groupement par scanner et catégorie.
    groups = sorted({
        (
            normalize_scanner(row["expected_scanner"]),
            normalize(row["category"]).upper(),
        )
        for _, row in measurable_gt.iterrows()
    })

    output = []

    for scanner, category in groups:

        gt_part = measurable_gt[
            measurable_gt["expected_scanner"].apply(
                normalize_scanner
            ) == scanner
        ]

        gt_part = gt_part[
            gt_part["category"].apply(normalize) == category.lower()
        ]

        det_part = detected[
            detected["scanner"].apply(normalize_scanner)
            == scanner
        ]

        # Seules les références confirmées ou explicitement
        # déclarées négatives participent aux calculs.
        tp = 0
        fp = 0
        fn = 0

        reviewed_positive = 0
        reviewed_negative = 0

        matched_positive = 0
        matched_negative = 0

        for _, gt_series in gt_part.iterrows():

            gt_row = gt_series.to_dict()

            status = normalize(
                gt_row.get(STATUS_COLUMN)
            ).upper()

            if status == "REVIEW_REQUIRED":
                continue

            is_detected = any(
                matches_reference(
                    gt_row,
                    finding_row,
                )
                for finding_row in det_part.to_dict("records")
            )

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

        # La précision est une précision sur l'échantillon
        # explicitement examiné, pas une précision globale.
        precision = (
            tp / (tp + fp)
            if reviewed_negative > 0 and (tp + fp) > 0
            else None
        )

        recall = (
            tp / (tp + fn)
            if ground_truth_complete and (tp + fn) > 0
            else None
        )

        f1 = None

        if (
            precision is not None
            and recall is not None
            and precision + recall > 0
        ):
            f1 = (
                2 * precision * recall
                / (precision + recall)
            )

        output.append({
            "scanner": scanner,
            "category": category,

            "tp": tp,
            "fp": fp,
            "fn": fn,

            "precision_reviewed_sample": precision,
            "recall": recall,
            "f1": f1,

            "reviewed_positive": reviewed_positive,
            "reviewed_negative": reviewed_negative,

            "matched_positive": matched_positive,
            "matched_negative": matched_negative,

            "unreviewed_gt": int(
                (
                    gt_part[STATUS_COLUMN]
                    == "REVIEW_REQUIRED"
                ).sum()
            ),

            "detections_total": int(len(det_part)),

            "ground_truth_complete": bool(
                ground_truth_complete
            ),
        })

    has_reviewed = any(
        item["reviewed_positive"] + item["reviewed_negative"] > 0
        for item in output
    )

    return {
        "available": has_reviewed,
        "complete": bool(ground_truth_complete),

        "reason": (
            ""
            if ground_truth_complete
            else (
                "Résultats partiels : les références non vérifiées "
                "sont ignorées et le Recall/F1 global est désactivé."
            )
        ),

        "by_scanner": output,
    }
