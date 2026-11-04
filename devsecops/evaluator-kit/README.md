# Royal67 DevSecOps Evaluator

Évaluateur local des rapports JSON Semgrep et Trivy. Il conserve les observations originales,
normalise les résultats, calcule des statistiques descriptives et permet une déduplication
contrôlée des observations d'images.

## Prérequis

- Python 3.10+
- Les rapports JSON générés par Semgrep et Trivy
- Git Bash ou PowerShell sous Windows

## Installation depuis la racine de Royal67-Restaurant

Décompresser ce dossier dans `devsecops/evaluator-kit`, puis :

```bash
cd devsecops/evaluator-kit
python -m venv .venv
source .venv/Scripts/activate
# PowerShell : .venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

## Placer les rapports

Exemple d'organisation (adapter les noms aux fichiers téléchargés) :

```text
reports/
  local-baseline/
    semgrep/semgrep-report.json
    trivy/trivy-fs-report.json
    trivy/trivy-backend-image-report.json
    trivy/trivy-frontend-image-report.json
```

Le fichier Semgrep fourni doit être le JSON complet (objet contenant `version`, `results`,
`errors`, `paths` et `time`), pas une capture d'écran.

## Exécuter l'évaluation

Depuis `devsecops/evaluator-kit` :

```bash
python -m evaluator.main \
  --semgrep ../../reports/local-baseline/semgrep/semgrep-report.json \
  --trivy ../../reports/local-baseline/trivy/trivy-fs-report.json \
  --trivy ../../reports/local-baseline/trivy/trivy-backend-image-report.json \
  --trivy ../../reports/local-baseline/trivy/trivy-frontend-image-report.json \
  --output-dir ../../reports/evaluation
```

Les fichiers produits :
- `normalized_findings.csv` : une ligne par observation brute normalisée ;
- `deduplicated_findings.csv` : regroupement prudent des observations d'image ;
- `summary.json` : statistiques descriptives et métadonnées des scans ;
- `severity_summary.csv` : volumes par scanner/type/sévérité.

Les rapports JSON d'origine ne sont jamais modifiés.

## Dashboard

Toujours depuis `devsecops/evaluator-kit` :

```bash
streamlit run dashboard/app.py
```

Le dashboard cherche par défaut `reports/evaluation/summary.json` à la racine du dépôt.
On peut aussi saisir un autre chemin dans la barre latérale.

## Ground truth : condition pour calculer Precision / Recall / F1

Le fichier `ground_truth_template.csv` est un modèle vide. Il ne faut pas le remplir en
copiant aveuglément les alertes des scanners. Il doit être établi par une revue indépendante
du périmètre étudié (revue de code, validation manuelle, tests de sécurité, avis expert,
ou cas de test contrôlés).

Colonnes :
- `scanner` : `semgrep` ou `trivy` ;
- `finding_type` : `sast`, `vulnerability`, `misconfiguration` ou `secret` ;
- `finding_id` : identifiant de règle Semgrep, CVE Trivy ou identifiant de misconfiguration ;
- `package` : nom de paquet pour Trivy ; vide pour Semgrep ;
- `installed_version` : version concernée pour Trivy ;
- `target` : fichier / cible, facultatif si la référence est indépendante du chemin ;
- `scope` : `filesystem` ou `image` pour Trivy, `source` pour Semgrep ;
- `rationale` : justification de la vérité terrain.

Une ligne décrit un problème réel attendu dans le périmètre. La métrique est calculée séparément
pour chaque scanner et chaque type de détection. Si le fichier est vide, les métriques sont
affichées comme indisponibles et non comme zéro.

Attention : le rappel est interprétable uniquement si le jeu de référence couvre réellement
tous les problèmes du périmètre défini. Une ground truth incomplète fausse les FN et le recall.

## Définitions

- TP : référence indépendante retrouvée par le scanner.
- FP : observation du scanner absente de la référence.
- FN : référence indépendante non détectée.
- Precision = TP / (TP + FP)
- Recall = TP / (TP + FN)
- F1 = 2 × Precision × Recall / (Precision + Recall)

Le programme ne prétend pas que chaque CVE est exploitable dans l'application. Les résultats
Trivy sont des correspondances avec sa base de vulnérabilités ; l'exploitabilité dépend du
contexte, de la version, de la configuration et de l'exposition effective.

## Limites connues des rapports fournis

- Le rapport Trivy filesystem est un scan de dépôt et de fichiers lock.
- Les rapports Trivy backend/frontend sont des scans d'images conteneur.
- Les mêmes vulnérabilités peuvent apparaître dans plusieurs cibles/binaires d'une image.
  Le CSV brut les conserve ; le CSV dédupliqué les regroupe avec un compteur d'occurrences.
- Le rapport Semgrep fourni contient une alerte CSRF INFO et zéro erreur d'analyse.
- Les temps Semgrep proviennent du champ `time.total_time`. Les JSON Trivy fournis ne donnent
  pas une durée murale fiable du scan ; le programme ne l'invente donc pas.
- La version des scanners, les règles, les images et les commits doivent être consignés
  pour chaque campagne expérimentale.
