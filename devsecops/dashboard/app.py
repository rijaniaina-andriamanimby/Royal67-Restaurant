
from __future__ import annotations

import json
from pathlib import Path

import pandas as pd
import streamlit as st


# ============================================================
# CONFIGURATION
# ============================================================

st.set_page_config(
    page_title="Royal67 · DevSecOps",
    page_icon="🛡️",
    layout="wide",
)

st.title("🛡️ Royal67 — DevSecOps Security Evaluation")
st.caption(
    "Évaluation expérimentale des outils de sécurité "
    "Semgrep et Trivy"
)


# ============================================================
# CHEMINS DU PROJET
# ============================================================

def find_project_root() -> Path:
    current = Path(__file__).resolve()

    for parent in current.parents:
        if (parent / "reports").is_dir():
            return parent

    return Path.cwd()


PROJECT_ROOT = find_project_root()

# Streamlit Cloud reads the latest CI-published, sanitized evaluation snapshot.
# Local evaluation output remains the fallback for development.
DASHBOARD_DATA_DIR = PROJECT_ROOT / "reports" / "dashboard-data"
LOCAL_EVALUATION_DIR = PROJECT_ROOT / "reports" / "evaluation"
DEFAULT_EVALUATION_DIR = (
    DASHBOARD_DATA_DIR
    if (DASHBOARD_DATA_DIR / "summary.json").is_file()
    else LOCAL_EVALUATION_DIR
)
DEFAULT_GT_DIR = PROJECT_ROOT / "reports" / "ground-truth"


# ============================================================
# CHARGEMENT DES FICHIERS
# ============================================================

def load_json(path: Path) -> dict:
    if not path.exists():
        return {}

    try:
        return json.loads(path.read_text(encoding="utf-8"))
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
    except (pd.errors.ParserError, OSError, UnicodeError) as exc:
        st.error(f"Impossible de lire {path.name} : {exc}")
        return pd.DataFrame()


# ============================================================
# SIDEBAR
# ============================================================

st.sidebar.header("⚙️ Configuration")

evaluation_dir = Path(
    st.sidebar.text_input(
        "Dossier des évaluations",
        str(DEFAULT_EVALUATION_DIR),
    )
)

gt_dir = Path(
    st.sidebar.text_input(
        "Dossier Ground Truth",
        str(DEFAULT_GT_DIR),
    )
)

summary_path = evaluation_dir / "summary.json"

if st.sidebar.button("🔄 Actualiser les données"):
    st.cache_data.clear()
    st.rerun()


# ============================================================
# RAPPORTS D'ÉVALUATION
# ============================================================

summary = load_json(summary_path)

if not summary:
    st.warning(
        "Rapport summary.json introuvable ou invalide. "
        "Exécute d'abord evaluator.main."
    )

    st.code(
        "python -m evaluator.main --help",
        language="bash",
    )

    st.stop()

run_metadata = summary.get("run_metadata") or {}
if run_metadata:
    commit_sha = run_metadata.get("commit_sha") or "local / non spécifié"
    branch_name = run_metadata.get("branch") or "local"
    generated_at = run_metadata.get("generated_at_utc") or "date inconnue"
    st.caption(
        f"Dernière évaluation CI : {generated_at} UTC · "
        f"branche {branch_name} · commit {str(commit_sha)[:12]}"
    )
else:
    st.caption("Métadonnées d'exécution indisponibles pour ce rapport.")

findings = load_csv(
    evaluation_dir / "normalized_findings.csv"
)

dedup = load_csv(
    evaluation_dir / "deduplicated_findings.csv"
)


# ============================================================
# FICHIERS GROUND TRUTH
# ============================================================

gt = load_csv(gt_dir / "ground-truth.csv")

validation_log = load_csv(
    gt_dir / "validation-log.csv"
)

high_review = load_csv(
    gt_dir / "high-review.csv"
)

high_review_validation = load_csv(
    gt_dir / "high-review-to-validate.csv"
)

candidates = load_csv(
    gt_dir / "trivy-review-candidates.csv"
)

methodology_path = gt_dir / "methodology.md"

methodology = (
    methodology_path.read_text(encoding="utf-8")
    if methodology_path.exists()
    else "Méthodologie non disponible."
)


# ============================================================
# FONCTIONS UTILITAIRES
# ============================================================

def count_values(
    frame: pd.DataFrame,
    column: str,
) -> pd.Series:

    if frame.empty or column not in frame.columns:
        return pd.Series(dtype="int64")

    return frame[column].value_counts()


def show_download(
    frame: pd.DataFrame,
    filename: str,
    label: str,
):
    if frame.empty:
        st.caption(f"{label} : aucune donnée disponible.")
        return

    st.download_button(
        label=label,
        data=frame.to_csv(
            index=False,
            encoding="utf-8-sig",
        ),
        file_name=filename,
        mime="text/csv",
        key=f"download_{filename}",
    )


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


def show_metric(value, label, help_text=None):
    st.metric(
        label=label,
        value=value,
        help=help_text,
    )


# ============================================================
# TABLEAU DE BORD GÉNÉRAL
# ============================================================

st.header("📊 Vue générale")

raw = summary.get("raw", {})
deduplicated = summary.get("deduplicated", {})

metrics = summary.get("ground_truth_metrics", {})

gt_columns = st.columns(4)

with gt_columns[0]:
    show_metric(
        raw.get("observations", 0),
        "Observations brutes",
    )

with gt_columns[1]:
    show_metric(
        deduplicated.get("observations", 0),
        "Après déduplication",
    )

with gt_columns[2]:
    show_metric(
        len(summary.get("scan_metadata", [])),
        "Scanners",
    )

with gt_columns[3]:
    show_metric(
        len(gt),
        "Références Ground Truth",
    )


# ============================================================
# ONGLETS
# ============================================================

tab_overview, tab_gt, tab_review, tab_findings = st.tabs(
    [
        "📊 Vue générale",
        "🎯 Ground Truth",
        "🔍 Validation des vulnérabilités",
        "🛡️ Résultats des scanners",
    ]
)


# ============================================================
# ONGLET 1 : VUE GÉNÉRALE
# ============================================================

with tab_overview:

    st.subheader("Répartition par sévérité")

    if not findings.empty and "severity" in findings.columns:

        severity = (
            findings.groupby("severity")
            .size()
            .sort_values(ascending=False)
        )

        st.bar_chart(severity)

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

        grouped = (
            findings.groupby(group_columns)
            .size()
            .reset_index(name="observations")
        )

        show_dataframe(grouped)


# ============================================================
# ONGLET 2 : GROUND TRUTH
# ============================================================

with tab_gt:

    st.header("🎯 Référentiel Ground Truth")

    st.caption(
        "Référentiel indépendant utilisé pour évaluer "
        "les résultats des scanners."
    )

    # --------------------------------------------------------
    # Statistiques
    # --------------------------------------------------------

    gt_stats = st.columns(4)

    with gt_stats[0]:
        show_metric(len(gt), "Références")

    with gt_stats[1]:
        show_metric(
            len(validation_log),
            "Validations enregistrées",
        )

    with gt_stats[2]:
        show_metric(
            len(high_review_validation),
            "Groupes HIGH",
        )

    with gt_stats[3]:
        show_metric(
            len(candidates),
            "Observations candidates",
        )

    if not gt.empty and "verification_status" in gt.columns:
        st.subheader("État de validation du référentiel")
        status_counts = count_values(gt, "verification_status")
        st.dataframe(status_counts.rename("Nombre").rename_axis("Statut").reset_index(), width="stretch", hide_index=True)
        st.caption("Une entrée REVIEW_REQUIRED n'est jamais utilisée pour calculer TP/FP/FN.")

    # --------------------------------------------------------
    # Répartition des décisions
    # --------------------------------------------------------

    st.subheader("Répartition des décisions")

    if not validation_log.empty and "decision" in validation_log.columns:

        decisions = count_values(
            validation_log,
            "decision",
        )

        col1, col2 = st.columns([2, 1])

        with col1:
            st.bar_chart(decisions)

        with col2:
            st.dataframe(
                decisions.rename("Nombre").rename_axis(
    "Décision"
).reset_index(),
                width="stretch",
                hide_index=True,
            )

    else:
        st.info(
            "Aucune décision de validation disponible."
        )

    # --------------------------------------------------------
    # Références Ground Truth
    # --------------------------------------------------------

    st.divider()

    st.subheader("📋 Références enregistrées")

    if not gt.empty:

        gt_filters = st.columns(3)

        with gt_filters[0]:
            scanners = sorted(gt["scanner"].unique())

            selected_scanner = st.selectbox(
                "Scanner",
                ["Tous"] + scanners,
                key="gt_scanner",
            )

        with gt_filters[1]:
            types = sorted(gt["finding_type"].unique())

            selected_type = st.selectbox(
                "Type",
                ["Tous"] + types,
                key="gt_type",
            )

        with gt_filters[2]:
            scopes = sorted(gt["scope"].unique())

            selected_scope = st.selectbox(
                "Périmètre",
                ["Tous"] + scopes,
                key="gt_scope",
            )

        gt_view = gt.copy()

        if selected_scanner != "Tous":
            gt_view = gt_view[
                gt_view["scanner"] == selected_scanner
            ]

        if selected_type != "Tous":
            gt_view = gt_view[
                gt_view["finding_type"] == selected_type
            ]

        if selected_scope != "Tous":
            gt_view = gt_view[
                gt_view["scope"] == selected_scope
            ]

        st.caption(
            f"{len(gt_view)} référence(s) affichée(s) "
            f"sur {len(gt)}."
        )

        show_dataframe(gt_view)

        show_download(
            gt_view,
            "ground-truth-filtered.csv",
            "⬇️ Télécharger les références",
        )

    else:
        st.warning(
            "Le fichier ground-truth.csv est vide ou absent."
        )

    # --------------------------------------------------------
    # Journal de validation
    # --------------------------------------------------------

    st.divider()

    st.subheader("📝 Journal de validation")

    show_dataframe(validation_log)

    show_download(
        validation_log,
        "validation-log.csv",
        "⬇️ Télécharger le journal",
    )

    # --------------------------------------------------------
    # Méthodologie
    # --------------------------------------------------------

    st.divider()

    with st.expander("📖 Consulter la méthodologie"):

        st.markdown(methodology)


# ============================================================
# ONGLET 3 : VALIDATION DES VULNÉRABILITÉS
# ============================================================

with tab_review:

    st.header("🔍 Validation des vulnérabilités")

    st.caption(
        "Examen des vulnérabilités Trivy et suivi "
        "de leur validation indépendante."
    )

    # --------------------------------------------------------
    # Statistiques HIGH
    # --------------------------------------------------------

    review_stats = st.columns(4)

    with review_stats[0]:
        show_metric(
            len(high_review),
            "Groupes HIGH",
        )

    with review_stats[1]:
        show_metric(
            len(high_review_validation),
            "Groupes à valider",
        )

    with review_stats[2]:
        if (
            not high_review_validation.empty
            and "verification_status" in high_review_validation.columns
        ):
            pending = (
                high_review_validation["verification_status"]
                == "REVIEW_REQUIRED"
            ).sum()
        else:
            pending = 0

        show_metric(
            int(pending),
            "À examiner",
        )

    with review_stats[3]:
        if (
            not high_review_validation.empty
            and "verification_status" in high_review_validation.columns
        ):
            verified = (
                high_review_validation["verification_status"]
                != "REVIEW_REQUIRED"
            ).sum()
        else:
            verified = 0

        show_metric(
            int(verified),
            "Statuts renseignés",
        )

    # --------------------------------------------------------
    # Filtrage des groupes HIGH
    # --------------------------------------------------------

    st.subheader("Groupes HIGH à examiner")

    if not high_review_validation.empty:

        review_view = high_review_validation.copy()

        filter_columns = st.columns(3)

        if "ecosystem" in review_view.columns:

            with filter_columns[0]:

                ecosystem_options = sorted(
                    review_view["ecosystem"].unique()
                )

                selected_ecosystem = st.selectbox(
                    "Écosystème",
                    ["Tous"] + ecosystem_options,
                )

                if selected_ecosystem != "Tous":
                    review_view = review_view[
                        review_view["ecosystem"]
                        == selected_ecosystem
                    ]

        if "verification_status" in review_view.columns:

            with filter_columns[1]:

                status_options = sorted(
                    review_view["verification_status"].unique()
                )

                selected_status = st.selectbox(
                    "Statut",
                    ["Tous"] + status_options,
                )

                if selected_status != "Tous":
                    review_view = review_view[
                        review_view["verification_status"]
                        == selected_status
                    ]

        if "package" in review_view.columns:

            with filter_columns[2]:

                package_options = sorted(
                    review_view["package"].unique()
                )

                selected_package = st.selectbox(
                    "Package",
                    ["Tous"] + package_options,
                )

                if selected_package != "Tous":
                    review_view = review_view[
                        review_view["package"]
                        == selected_package
                    ]

        st.caption(
            f"{len(review_view)} groupe(s) affiché(s)."
        )

        show_dataframe(review_view)

        show_download(
            review_view,
            "high-review-filtered.csv",
            "⬇️ Télécharger les groupes filtrés",
        )

    else:
        st.warning(
            "Le fichier high-review-to-validate.csv "
            "est absent ou vide."
        )

    # --------------------------------------------------------
    # Autres observations Trivy
    # --------------------------------------------------------

    st.divider()

    st.subheader("Autres observations candidates")

    if not candidates.empty:

        st.caption(
            f"{len(candidates)} observations Trivy."
        )

        if "severity" in candidates.columns:

            severity_filter = st.multiselect(
                "Filtrer par sévérité",
                sorted(candidates["severity"].unique()),
                default=sorted(candidates["severity"].unique()),
            )

            candidate_view = candidates[
                candidates["severity"].isin(severity_filter)
            ]

        else:
            candidate_view = candidates

        show_dataframe(candidate_view)

        show_download(
            candidate_view,
            "trivy-review-filtered.csv",
            "⬇️ Télécharger les observations",
        )

    else:
        st.info(
            "Aucune observation candidate disponible."
        )


# ============================================================
# ONGLET 4 : RÉSULTATS DES SCANNERS
# ============================================================

with tab_findings:

    st.header("🛡️ Résultats des scanners")

    st.subheader("Métriques expérimentales")

    if not metrics.get("available"):
        st.warning(metrics.get("reason", "Aucune entrée Ground Truth vérifiée."))
    else:
        if not metrics.get("complete"):
            st.warning(
                "Évaluation partielle : les détections non examinées ne sont pas classées FP. "
                "Le Recall et le F1 globaux restent désactivés tant que l'exhaustivité du périmètre n'est pas démontrée."
            )
        metric_df = pd.DataFrame(metrics.get("by_scanner", []))
        if metric_df.empty:
            st.info("Aucune métrique exploitable.")
        else:
            st.dataframe(metric_df, width="stretch", hide_index=True)
            chart_columns = ["precision_reviewed_sample"]
            if metrics.get("complete"):
                chart_columns.extend(["recall", "f1"])
            chart_df = metric_df.set_index("scanner")[chart_columns].dropna(how="all")
            if not chart_df.empty:
                st.subheader("Mesures sur les références examinées")
                st.bar_chart(chart_df)

    # --------------------------------------------------------
    # Observations normalisées
    # --------------------------------------------------------

    st.divider()

    st.subheader("Observations normalisées")

    if not findings.empty:

        scanner_options = sorted(
            findings["scanner"].unique().tolist()
        )

        selected_scanners = st.multiselect(
            "Filtrer par scanner",
            scanner_options,
            default=scanner_options,
        )

        findings_view = findings[
            findings["scanner"].isin(selected_scanners)
        ]

        show_dataframe(findings_view)

        show_download(
            findings_view,
            "royal67-normalized-findings.csv",
            "⬇️ Télécharger les observations CSV",
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
