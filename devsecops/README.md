# Royal67 DevSecOps Evaluator

Évaluateur local des rapports JSON Semgrep et Trivy : normalisation, déduplication, statistiques descriptives et comparaison avec un Ground Truth indépendant.

## Prérequis

- Python 3.10+
- `pip install -r devsecops/requirements.txt`
- Rapports JSON complets Semgrep et Trivy

## Exécuter depuis la racine du dépôt

```bash
python -m pip install -r devsecops/requirements.txt
python -m pytest devsecops/tests -q

PYTHONPATH=devsecops python -m evaluator.main \
  --semgrep reports/local-baseline/semgrep/semgrep-report.json \
  --trivy reports/local-baseline/trivy/trivy-fs-report.json \
  --trivy reports/local-baseline/trivy/trivy-backend-image-report.json \
  --trivy reports/local-baseline/trivy/trivy-frontend-image-report.json \
  --ground-truth reports/ground-truth/ground-truth.csv \
  --output-dir reports/evaluation
```

Sous PowerShell, `PYTHONPATH` peut être défini ainsi : `$env:PYTHONPATH="devsecops"` avant la commande Python.

## Résultats générés

- `normalized_findings.csv` : observations normalisées.
- `deduplicated_findings.csv` : observations regroupées selon les clés de déduplication.
- `severity_summary.csv` : répartition par scanner/type/sévérité.
- `summary.json` : volumes, métadonnées d'exécution (commit/branche) et métriques évaluables.

## CI GitHub Actions

Le workflow `ci.yml` produit les rapports Semgrep et Trivy de l'exécution courante, les nettoie des extraits de code ou valeurs de secrets, puis lance cet évaluateur. Les rapports historiques `reports/local-baseline/` ne sont pas utilisés par le CI.

Pour installer aussi les outils de test :

```bash
python -m pip install -r devsecops/requirements-ci.txt
PYTHONPATH=devsecops python -m pytest devsecops/tests -q
```

Le fichier `requirements.txt` reste destiné au dashboard Streamlit Cloud. `requirements-ci.txt` ajoute les dépendances de test Python.

## Règles de calcul et garde-fous

Le CSV Ground Truth doit contenir `verification_status` : `CONFIRMED_AFFECTED`, `CONFIRMED_NOT_AFFECTED` ou `REVIEW_REQUIRED`. Les anciens fichiers sans statut sont chargés comme `REVIEW_REQUIRED` par défaut.

- TP/FN : uniquement pour les références confirmées affectées.
- FP : uniquement pour les candidats confirmés non affectés qui ont effectivement été détectés.
- Les détections non examinées ne sont jamais comptées automatiquement comme FP.
- La précision est présentée comme précision sur l'échantillon examiné et nécessite des cas positifs et négatifs examinés.
- Recall et F1 globaux sont désactivés par défaut.

L'option `--ground-truth-complete` autorise Recall/F1 uniquement si la référence couvre exhaustivement le périmètre expérimental, y compris les vulnérabilités identifiées indépendamment des alertes des scanners. Ne pas utiliser cette option simplement parce que la file de findings détectés est terminée.

## Enrichissement OSV de la file HIGH

Depuis la racine du dépôt :

```bash
python devsecops/scripts/enrich_osv_review.py
```

Le script interroge OSV et produit `high-review-osv-enriched.csv`. Les avis enrichissent la revue, mais aucun statut TP/FP n'est attribué automatiquement.

## Dashboard

```bash
streamlit run devsecops/dashboard/app.py
```

Le dashboard cherche en priorité `reports/dashboard-data` (instantané publié par GitHub Actions), puis utilise `reports/evaluation` comme solution de repli locale. Le Ground Truth reste lu depuis `reports/ground-truth`.
