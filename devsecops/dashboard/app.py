from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd
import streamlit as st


# ============================================================
# 1. CONFIGURATION
# ============================================================

st.set_page_config(
    page_title="Royal67 · DevSecOps",
    page_icon="🛡️",
    layout="wide",
)

st.title("🛡️ Royal67 — DevSecOps")
st.caption(
    "Plateforme d'analyse et d'évaluation expérimentale "
    "des outils de sécurité Semgrep et Trivy."
)


# ============================================================
# 2. SCHÉMA GROUND TRUTH V2
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

VALID_STATUSES = [
    "REVIEW_REQUIRED",
    "CONFIRMED_AFFECTED",
    "CONFIRMED_NOT_AFFECTED",
]

VALIDATED_STATUSES = {
    "CONFIRMED_AFFECTED",
    "CONFIRMED_NOT_AFFECTED",
}


# ============================================================
# 3. CHEMINS DU PROJET
# ============================================================

def find_project_root() -> Path:

    current = Path(__file__).resolve()

    for parent in current.parents:

        if (parent / "reports").is_dir():
            return parent

    return Path.cwd()


PROJECT_ROOT = find_project_root()

REPORTS_DIR = PROJECT_ROOT / "reports"

DASHBOARD_DATA_DIR = (
    REPORTS_DIR / "dashboard-data"
)

LOCAL_EVALUATION_DIR = (
    REPORTS_DIR / "evaluation"
)

GROUND_TRUTH_DIR = (
    REPORTS_DIR / "ground-truth"
)

DEFAULT_EVALUATION_DIR = (
    DASHBOARD_DATA_DIR
    if (DASHBOARD_DATA_DIR / "summary.json").exists()
    else LOCAL_EVALUATION_DIR
)


# ============================================================
# 4. FONCTIONS DE CHARGEMENT
# ============================================================

def load_json(path: Path) -> dict:

    if not path.exists():
        return {}

    try:

        return json.loads(
            path.read_text(encoding="utf-8")
        )

    except (json.JSONDecodeError, OSError):

        return {}


def load_csv(path: Path) -> pd.DataFrame:

    if not path.exists():
        return pd.DataFrame()

    try:

        return pd.read_csv(
            path,
            dtype=str,
            keep_default_na=False,
            encoding="utf-8-sig",
        )

    except (
        pd.errors.ParserError,
        OSError,
        UnicodeError,
    ) as exc:

        st.error(
            f"Impossible de lire {path.name} : {exc}"
        )

        return pd.DataFrame()


# ============================================================
# 5. NORMALISATION DU GROUND TRUTH
# ============================================================

def normalize_ground_truth(
    frame: pd.DataFrame,
) -> pd.DataFrame:

    if frame.empty:

        return pd.DataFrame(
            columns=GT_COLUMNS
        )

    frame = frame.copy()

    # --------------------------------------------------------
    # Compatibilité avec les anciens noms de colonnes
    # --------------------------------------------------------

    aliases = {
        "scanner": "expected_scanner",
        "package": "component",
        "finding_id": "advisory_id",
        "rationale": "notes",
        "rule_id": "expected_rule_id",
    }

    for old, new in aliases.items():

        if old in frame.columns and new not in frame.columns:

            frame = frame.rename(
                columns={old: new}
            )

    # --------------------------------------------------------
    # Conversion des anciennes catégories
    # --------------------------------------------------------

    if "category" not in frame.columns:

        def infer_category(row):

            finding_type = str(
                row.get("finding_type", "")
            ).lower()

            scanner = str(
                row.get("expected_scanner", "")
            ).lower()

            if finding_type == "vulnerability":
                return "SCA"

            if "semgrep" in scanner:
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

    # --------------------------------------------------------
    # Génération des identifiants manquants
    # --------------------------------------------------------

    if "gt_id" not in frame.columns:

        frame["gt_id"] = [
            f"GT-{index:04d}"
            for index in range(1, len(frame) + 1)
        ]

    else:

        for index in frame.index:

            if not str(frame.at[index, "gt_id"]).strip():

                frame.at[index, "gt_id"] = (
                    f"GT-{index + 1:04d}"
                )

    # --------------------------------------------------------
    # Ajouter les colonnes V2 manquantes
    # --------------------------------------------------------

    for column in GT_COLUMNS:

        if column not in frame.columns:
            frame[column] = ""

    frame = frame[GT_COLUMNS].copy()

    # --------------------------------------------------------
    # Nettoyage
    # --------------------------------------------------------

    for column in GT_COLUMNS:

        frame[column] = (
            frame[column]
            .fillna("")
            .astype(str)
            .str.strip()
        )

    # Un statut absent ne signifie jamais validé.
    frame["verification_status"] = (
        frame["verification_status"]
        .str.upper()
    )

    frame.loc[
        ~frame["verification_status"].isin(
            VALID_STATUSES
        ),
        "verification_status",
    ] = "REVIEW_REQUIRED"

    return frame


# ============================================================
# 6. SAUVEGARDE DU GROUND TRUTH
# ============================================================

def save_ground_truth(
    frame: pd.DataFrame,
    path: Path,
) -> None:

    path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    missing = [
        column
        for column in GT_COLUMNS
        if column not in frame.columns
    ]

    if missing:

        raise ValueError(
            f"Colonnes V2 manquantes : {missing}"
        )

    output = frame[GT_COLUMNS].copy()

    temporary_path = path.with_name(
        path.name + ".tmp"
    )

    output.to_csv(
        temporary_path,
        index=False,
        encoding="utf-8-sig",
    )

    # Remplacement atomique du fichier.
    os.replace(
        temporary_path,
        path,
    )


# ============================================================
# 7. JOURNAL DE VALIDATION
# ============================================================

LOG_COLUMNS = [
    "timestamp_utc",
    "gt_id",
    "component",
    "advisory_id",
    "previous_status",
    "decision",
    "reviewer",
    "evidence_reference",
    "notes",
]


def append_validation_log(
    record: dict,
    path: Path,
) -> None:

    path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    log = load_csv(path)

    for column in LOG_COLUMNS:

        if column not in log.columns:
            log[column] = ""

    new_record = {
        column: str(record.get(column, ""))
        for column in LOG_COLUMNS
    }

    log = pd.concat(
        [
            log[LOG_COLUMNS],
            pd.DataFrame([new_record]),
        ],
        ignore_index=True,
    )

    temporary_path = path.with_name(
        path.name + ".tmp"
    )

    log.to_csv(
        temporary_path,
        index=False,
        encoding="utf-8-sig",
    )

    os.replace(
        temporary_path,
        path,
    )


# ============================================================
# 8. STATISTIQUES
# ============================================================

def count_validations(
    frame: pd.DataFrame,
) -> int:

    if frame.empty:
        return 0

    return int(
        frame["verification_status"]
        .isin(VALIDATED_STATUSES)
        .sum()
    )


def count_pending(
    frame: pd.DataFrame,
) -> int:

    if frame.empty:
        return 0

    return int(
        (
            frame["verification_status"]
            == "REVIEW_REQUIRED"
        ).sum()
    )


def count_values(
    frame: pd.DataFrame,
    column: str,
) -> pd.Series:

    if frame.empty or column not in frame.columns:

        return pd.Series(dtype="int64")

    return frame[column].value_counts()


def show_dataframe(
    frame: pd.DataFrame,
    message: str = "Aucune donnée disponible.",
):

    if frame.empty:

        st.info(message)

    else:

        st.dataframe(
            frame,
            width="stretch",
            hide_index=True,
        )


def show_download(
    frame: pd.DataFrame,
    filename: str,
    label: str,
):

    if frame.empty:
        return

    st.download_button(
        label=label,
        data=frame.to_csv(
            index=False,
            encoding="utf-8-sig",
        ),
        file_name=filename,
        mime="text/csv",
    )


def metric_card(
    column,
    label: str,
    value,
    help_text=None,
):

    with column:

        st.metric(
            label,
            value,
            help=help_text,
        )


# ============================================================
# 9. SIDEBAR
# ============================================================

st.sidebar.title("⚙️ Configuration")

evaluation_dir = Path(
    st.sidebar.text_input(
        "Dossier des évaluations",
        str(DEFAULT_EVALUATION_DIR),
    )
)

gt_dir = Path(
    st.sidebar.text_input(
        "Dossier Ground Truth",
        str(GROUND_TRUTH_DIR),
    )
)

summary_path = evaluation_dir / "summary.json"

gt_path = gt_dir / "ground-truth-v2.csv"

log_path = gt_dir / "validation-log.csv"

if st.sidebar.button(
    "🔄 Actualiser les données",
    use_container_width=True,
):

    st.rerun()


st.sidebar.divider()

st.sidebar.caption(
    f"Projet : {PROJECT_ROOT}"
)


# ============================================================
# 10. CHARGEMENT DES DONNÉES
# ============================================================

summary = load_json(summary_path)

if not summary:

    st.error(
        "Rapport summary.json introuvable."
    )

    st.code(
        "python -m evaluator.main",
        language="bash",
    )

    st.stop()


findings = load_csv(
    evaluation_dir / "normalized_findings.csv"
)

dedup = load_csv(
    evaluation_dir / "deduplicated_findings.csv"
)

gt = normalize_ground_truth(
    load_csv(gt_path)
)

validation_log = load_csv(log_path)

high_review = load_csv(
    gt_dir / "high-review.csv"
)

high_review_validation = load_csv(
    gt_dir / "high-review-to-validate.csv"
)

candidates = load_csv(
    gt_dir / "trivy-review-candidates.csv"
)

metrics = summary.get(
    "ground_truth_metrics",
    {},
)

run_metadata = summary.get(
    "run_metadata",
    {},
)


# ============================================================
# 11. INFORMATIONS SUR L'EXÉCUTION
# ============================================================

if run_metadata:

    commit = (
        run_metadata.get("commit_sha")
        or "local"
    )

    branch = (
        run_metadata.get("branch")
        or "non spécifiée"
    )

    generated = (
        run_metadata.get("generated_at_utc")
        or "date inconnue"
    )

    st.caption(
        f"Évaluation : {generated} UTC · "
        f"Branche : {branch} · "
        f"Commit : {str(commit)[:12]}"
    )


# ============================================================
# 12. VUE GÉNÉRALE
# ============================================================

st.header("📊 Vue générale")

raw = summary.get("raw", {})

deduplicated = summary.get(
    "deduplicated",
    {},
)

scanner_count = (
    findings["scanner"].nunique()
    if not findings.empty and "scanner" in findings.columns
    else 0
)

overview = st.columns(4)

metric_card(
    overview[0],
    "Observations brutes",
    raw.get("observations", 0),
)

metric_card(
    overview[1],
    "Après déduplication",
    deduplicated.get("observations", 0),
)

metric_card(
    overview[2],
    "Scanners",
    scanner_count,
)

metric_card(
    overview[3],
    "Références Ground Truth",
    len(gt),
)


# ============================================================
# 13. ONGLETS
# ============================================================

tab_overview, tab_gt, tab_validation, tab_scanners = st.tabs(
    [
        "📊 Vue générale",
        "🎯 Ground Truth",
        "✍️ Validation",
        "🛡️ Scanners",
    ]
)


# ============================================================
# ONGLET 1 : VUE GÉNÉRALE
# ============================================================

with tab_overview:

    st.subheader("Répartition par sévérité")

    if not findings.empty and "severity" in findings.columns:

        severity_counts = (
            findings["severity"]
            .value_counts()
        )

        st.bar_chart(severity_counts)

    else:

        st.info(
            "Aucune donnée de sévérité."
        )

    left, right = st.columns(2)

    with left:

        st.subheader("Détections par scanner")

        scanner_counts = count_values(
            findings,
            "scanner",
        )

        if not scanner_counts.empty:
            st.bar_chart(scanner_counts)
        else:
            st.info("Aucune donnée.")

    with right:

        st.subheader("Détections par type")

        type_counts = count_values(
            findings,
            "finding_type",
        )

        if not type_counts.empty:
            st.bar_chart(type_counts)
        else:
            st.info("Aucune donnée.")

    st.divider()

    st.subheader("Résultats par cible")

    if not findings.empty:

        group_columns = [
            column
            for column in [
                "scanner",
                "scope",
                "target",
                "finding_type",
                "severity",
            ]
            if column in findings.columns
        ]

        if group_columns:

            grouped = (
                findings.groupby(
                    group_columns,
                    dropna=False,
                )
                .size()
                .reset_index(
                    name="observations"
                )
            )

            show_dataframe(grouped)


# ============================================================
# ONGLET 2 : GROUND TRUTH
# ============================================================

with tab_gt:

    st.header("🎯 Référentiel Ground Truth")

    st.caption(
        "Référentiel indépendant servant de base "
        "à l'évaluation des outils de sécurité."
    )

    # --------------------------------------------------------
    # Statistiques
    # --------------------------------------------------------

    validated_count = count_validations(gt)

    pending_count = count_pending(gt)

    gt_stats = st.columns(4)

    metric_card(
        gt_stats[0],
        "Références",
        len(gt),
    )

    metric_card(
        gt_stats[1],
        "Validations enregistrées",
        validated_count,
        "Nombre de références ayant un statut confirmé.",
    )

    metric_card(
        gt_stats[2],
        "À examiner",
        pending_count,
    )

    metric_card(
        gt_stats[3],
        "Entrées dans le journal",
        len(validation_log),
        "Nombre d'événements de validation, pas le nombre de références validées.",
    )

    # --------------------------------------------------------
    # État du référentiel
    # --------------------------------------------------------

    st.divider()

    st.subheader("État de validation")

    if not gt.empty:

        status_counts = count_values(
            gt,
            "verification_status",
        )

        st.bar_chart(status_counts)

        status_table = (
            status_counts
            .rename("Nombre")
            .rename_axis("Statut")
            .reset_index()
        )

        show_dataframe(status_table)

    # --------------------------------------------------------
    # Filtres
    # --------------------------------------------------------

    st.divider()

    st.subheader("📋 Références enregistrées")

    if not gt.empty:

        filters = st.columns(4)

        scanner_options = sorted(
            gt["expected_scanner"]
            .replace("", "Non spécifié")
            .unique()
        )

        category_options = sorted(
            gt["category"]
            .replace("", "Non spécifiée")
            .unique()
        )

        status_options = sorted(
            gt["verification_status"]
            .unique()
        )

        scope_options = sorted(
            gt["scope"]
            .replace("", "Non spécifié")
            .unique()
        )

        with filters[0]:

            selected_scanner = st.selectbox(
                "Scanner",
                ["Tous"] + scanner_options,
                key="filter_gt_scanner",
            )

        with filters[1]:

            selected_category = st.selectbox(
                "Catégorie",
                ["Toutes"] + category_options,
                key="filter_gt_category",
            )

        with filters[2]:

            selected_status = st.selectbox(
                "Statut",
                ["Tous"] + status_options,
                key="filter_gt_status",
            )

        with filters[3]:

            selected_scope = st.selectbox(
                "Périmètre",
                ["Tous"] + scope_options,
                key="filter_gt_scope",
            )

        gt_view = gt.copy()

        if selected_scanner != "Tous":

            gt_view = gt_view[
                gt_view["expected_scanner"].replace(
                    "", "Non spécifié"
                ) == selected_scanner
            ]

        if selected_category != "Toutes":

            gt_view = gt_view[
                gt_view["category"].replace(
                    "", "Non spécifiée"
                ) == selected_category
            ]

        if selected_status != "Tous":

            gt_view = gt_view[
                gt_view["verification_status"]
                == selected_status
            ]

        if selected_scope != "Tous":

            gt_view = gt_view[
                gt_view["scope"].replace(
                    "", "Non spécifié"
                ) == selected_scope
            ]

        st.caption(
            f"{len(gt_view)} référence(s) affichée(s) "
            f"sur {len(gt)}."
        )

        display_columns = [
            "gt_id",
            "category",
            "subcategory",
            "expected_scanner",
            "component",
            "installed_version",
            "advisory_id",
            "expected_rule_id",
            "verification_status",
            "application_applicability",
        ]

        show_dataframe(
            gt_view[display_columns]
        )

        show_download(
            gt_view,
            "ground-truth-filtered.csv",
            "⬇️ Télécharger les références",
        )

    else:

        st.warning(
            "Le fichier Ground Truth est vide ou absent."
        )

    # --------------------------------------------------------
    # Journal
    # --------------------------------------------------------

    st.divider()

    st.subheader("📝 Historique des validations")

    show_dataframe(
        validation_log,
        "Aucune validation enregistrée.",
    )

    show_download(
        validation_log,
        "validation-log.csv",
        "⬇️ Télécharger le journal",
    )

    # --------------------------------------------------------
    # Méthodologie
    # --------------------------------------------------------

    methodology_path = gt_dir / "methodology.md"

    with st.expander("📖 Méthodologie"):

        if methodology_path.exists():

            st.markdown(
                methodology_path.read_text(
                    encoding="utf-8"
                )
            )

        else:

            st.info(
                "Fichier methodology.md indisponible."
            )


# ============================================================
# ONGLET 3 : VALIDATION
# ============================================================

with tab_validation:

    st.header("✍️ Validation des références")

    st.caption(
        "Examine une référence, puis enregistre "
        "une décision indépendante."
    )

    st.info(
        "Une référence ne doit être confirmée que si "
        "sa décision repose sur des éléments vérifiables. "
        "Une détection d'un scanner ne constitue pas, "
        "à elle seule, une preuve de vulnérabilité."
    )

    if gt.empty:

        st.warning(
            "Aucune référence disponible pour validation."
        )

    else:

        # ----------------------------------------------------
        # Sélection de la référence
        # ----------------------------------------------------

        gt_records = gt.to_dict(
            orient="records"
        )

        gt_by_id = {
            row["gt_id"]: row
            for row in gt_records
        }

        def format_gt_option(gt_id):

            row = gt_by_id[gt_id]

            component = (
                row["component"]
                or "Composant inconnu"
            )

            advisory = (
                row["advisory_id"]
                or row["expected_rule_id"]
                or "Sans identifiant"
            )

            status = row["verification_status"]

            return (
                f"{gt_id} · {component} · "
                f"{advisory} · {status}"
            )

        selected_gt_id = st.selectbox(
            "Référence à examiner",
            list(gt_by_id.keys()),
            format_func=format_gt_option,
            key="selected_gt_id",
        )

        selected_row = gt_by_id[
            selected_gt_id
        ]

        # ----------------------------------------------------
        # Informations sur la référence
        # ----------------------------------------------------

        st.divider()

        st.subheader("Informations de la référence")

        info1, info2, info3 = st.columns(3)

        with info1:

            st.write("**Identifiant**")

            st.write(
                selected_row["gt_id"]
            )

            st.write("**Catégorie**")

            st.write(
                selected_row["category"]
            )

        with info2:

            st.write("**Scanner attendu**")

            st.write(
                selected_row["expected_scanner"]
            )

            st.write("**Composant**")

            st.write(
                selected_row["component"]
            )

        with info3:

            st.write("**Advisory / règle**")

            st.write(
                selected_row["advisory_id"]
                or selected_row["expected_rule_id"]
                or "Non renseigné"
            )

            st.write("**Version installée**")

            st.write(
                selected_row["installed_version"]
            )

        with st.expander("Détails supplémentaires"):

            st.write(
                "**Description :**",
                selected_row["expected_finding"],
            )

            st.write(
                "**Cible :**",
                selected_row["target"],
            )

            st.write(
                "**Scope :**",
                selected_row["scope"],
            )

            st.write(
                "**Artifact :**",
                selected_row["artifact"],
            )

            st.write(
                "**Applicabilité :**",
                selected_row["application_applicability"],
            )

        # ----------------------------------------------------
        # Formulaire de validation
        # ----------------------------------------------------

        st.divider()

        st.subheader("Décision de validation")

        current_status = selected_row[
            "verification_status"
        ]

        with st.form(
            key=f"validation_form_{selected_gt_id}"
        ):

            decision = st.selectbox(
                "Nouveau statut",
                VALID_STATUSES,
                index=VALID_STATUSES.index(
                    current_status
                ),
                format_func=lambda value: {
                    "REVIEW_REQUIRED": "À examiner",
                    "CONFIRMED_AFFECTED": "Vulnérabilité confirmée",
                    "CONFIRMED_NOT_AFFECTED": "Non affecté / faux positif confirmé",
                }[value],
            )

            evidence = st.text_input(
                "Référence de preuve",
                value=selected_row["evidence_reference"],
                placeholder="URL, rapport, commit, documentation...",
                help=(
                    "Indique la source qui justifie "
                    "ta décision."
                ),
            )

            notes = st.text_area(
                "Notes de validation",
                value=selected_row["notes"],
                placeholder="Explique brièvement la décision...",
            )

            reviewer = st.text_input(
                "Validateur",
                placeholder="Nom ou identifiant du validateur",
            )

            submitted = st.form_submit_button(
                "💾 Enregistrer la validation",
                use_container_width=True,
            )

        if submitted:

            if decision in VALIDATED_STATUSES and not evidence.strip():

                st.error(
                    "Une référence de preuve est obligatoire "
                    "pour confirmer une décision."
                )

            else:

                previous_status = current_status

                # --------------------------------------------
                # Modifier le Ground Truth
                # --------------------------------------------

                row_index = gt.index[
                    gt["gt_id"] == selected_gt_id
                ][0]

                gt.loc[
                    row_index,
                    "verification_status",
                ] = decision

                gt.loc[
                    row_index,
                    "evidence_reference",
                ] = evidence.strip()

                gt.loc[
                    row_index,
                    "notes",
                ] = notes.strip()

                try:

                    # ----------------------------------------
                    # Sauvegarder le CSV V2
                    # ----------------------------------------

                    save_ground_truth(
                        gt,
                        gt_path,
                    )

                    # ----------------------------------------
                    # Ajouter une entrée au journal
                    # ----------------------------------------

                    append_validation_log(
                        {
                            "timestamp_utc": datetime.now(
                                timezone.utc
                            ).isoformat(),

                            "gt_id": selected_gt_id,

                            "component": selected_row["component"],

                            "advisory_id": (
                                selected_row["advisory_id"]
                            ),

                            "previous_status": previous_status,

                            "decision": decision,

                            "reviewer": reviewer.strip(),

                            "evidence_reference": evidence.strip(),

                            "notes": notes.strip(),
                        },
                        log_path,
                    )

                    st.success(
                        "Validation enregistrée dans le Ground Truth V2."
                    )

                    st.rerun()

                except (OSError, ValueError) as exc:

                    st.error(
                        f"Erreur pendant la sauvegarde : {exc}"
                    )

    # --------------------------------------------------------
    # Résumé de validation
    # --------------------------------------------------------

    st.divider()

    st.subheader("Progression des validations")

    progress_columns = st.columns(3)

    total = len(gt)

    validated = count_validations(gt)

    pending = count_pending(gt)

    metric_card(
        progress_columns[0],
        "Total",
        total,
    )

    metric_card(
        progress_columns[1],
        "Confirmées",
        validated,
    )

    metric_card(
        progress_columns[2],
        "À examiner",
        pending,
    )

    if total > 0:

        st.progress(
            validated / total,
            text=(
                f"{validated} référence(s) validée(s) "
                f"sur {total} ({validated / total:.1%})"
            ),
        )


# ============================================================
# ONGLET 4 : RÉSULTATS DES SCANNERS
# ============================================================

with tab_scanners:

    st.header("🛡️ Résultats des scanners")

    # --------------------------------------------------------
    # Métriques expérimentales
    # --------------------------------------------------------

    st.subheader("Métriques expérimentales")

    if not metrics.get("available"):

        st.warning(
            metrics.get(
                "reason",
                "Aucune référence Ground Truth vérifiée.",
            )
        )

    else:

        if not metrics.get("complete"):

            st.warning(
                "Évaluation partielle : le Recall et le F1 "
                "ne sont pas calculés tant que l'exhaustivité "
                "du Ground Truth n'est pas justifiée."
            )

        metric_df = pd.DataFrame(
            metrics.get("by_scanner", [])
        )

        if metric_df.empty:

            st.info(
                "Aucune métrique disponible."
            )

        else:

            show_dataframe(metric_df)

            chart_columns = [
                "precision_reviewed_sample"
            ]

            if metrics.get("complete"):

                chart_columns.extend([
                    "recall",
                    "f1",
                ])

            available_columns = [
                column
                for column in chart_columns
                if column in metric_df.columns
            ]

            if available_columns:

                chart_df = metric_df.set_index(
                    "scanner"
                )[available_columns]

                if not chart_df.empty:

                    st.subheader(
                        "Mesures expérimentales"
                    )

                    st.bar_chart(chart_df)

    # --------------------------------------------------------
    # Observations normalisées
    # --------------------------------------------------------

    st.divider()

    st.subheader("Observations normalisées")

    if not findings.empty and "scanner" in findings.columns:

        scanner_options = sorted(
            findings["scanner"]
            .dropna()
            .unique()
            .tolist()
        )

        selected_scanners = st.multiselect(
            "Filtrer par scanner",
            scanner_options,
            default=scanner_options,
        )

        findings_view = findings[
            findings["scanner"].isin(
                selected_scanners
            )
        ]

        st.caption(
            f"{len(findings_view)} observation(s) affichée(s)."
        )

        show_dataframe(findings_view)

        show_download(
            findings_view,
            "royal67-normalized-findings.csv",
            "⬇️ Télécharger les observations",
        )

    else:

        st.info(
            "Aucune observation normalisée disponible."
        )

    # --------------------------------------------------------
    # Observations dédupliquées
    # --------------------------------------------------------

    st.divider()

    st.subheader("Observations après déduplication")

    show_dataframe(dedup)