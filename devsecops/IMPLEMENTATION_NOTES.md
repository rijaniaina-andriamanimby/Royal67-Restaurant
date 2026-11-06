# Correctifs Ground Truth / Evaluateur — 05 novembre 2026

## Changements

1. `evaluator/metrics.py`
   - ajoute les statuts obligatoires `CONFIRMED_AFFECTED`, `CONFIRMED_NOT_AFFECTED`, `REVIEW_REQUIRED` ;
   - traite les anciens CSV sans statut comme non vérifiés ;
   - ne compte plus les findings non examinés comme faux positifs ;
   - calcule les TP/FN sur les références positives examinées et les FP sur les références négatives examinées ;
   - bloque Recall/F1 global tant que l'exhaustivité n'est pas déclarée.
2. `evaluator/main.py`
   - ajoute `--ground-truth-complete`, à réserver à un périmètre réellement audité de façon exhaustive.
3. `tests/test_metrics.py`
   - couvre TP/FP/FN, la référence incomplète et le verrouillage Recall/F1.
4. `scripts/enrich_osv_review.py`
   - enrichit les 164 candidats HIGH depuis OSV ;
   - n'attribue jamais automatiquement TP/FP.
5. `dashboard/app.py`
   - affiche les statuts de validation et les métriques partielles sans présenter de Recall/F1 non justifiés ;
   - remplace les paramètres Streamlit dépréciés `use_container_width`.
6. `reports/ground-truth/ground-truth.csv`
   - les six lignes déjà consignées TP dans `validation-log.csv` sont annotées `CONFIRMED_AFFECTED` ;
   - leur applicabilité/exploitabilité applicative reste `NOT_DEMONSTRATED`.
7. `high-review-to-validate.csv`
   - les 164 lignes restent explicitement `REVIEW_REQUIRED`.

## Vérifications exécutées

- `python -m compileall -q devsecops/evaluator devsecops/dashboard devsecops/scripts` : OK.
- `cd devsecops && python -m pytest -q` : 6 tests réussis.
- Réexécution de l'évaluateur sur les rapports fournis : 1 436 observations brutes (1 435 Trivy, 1 Semgrep), 6 TP confirmés dans le sous-ensemble documenté ; Precision échantillon, Recall global et F1 restent indisponibles faute de négatifs validés et de référence exhaustive.

## Étape manuelle indispensable

Lancer `python devsecops/scripts/enrich_osv_review.py` depuis la racine du dépôt avec une connexion Internet, puis examiner les preuves OSV et le contexte de chaque finding. L'enrichissement OSV ne remplace pas la revue indépendante.
