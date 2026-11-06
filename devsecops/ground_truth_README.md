# Construire et valider le Ground Truth

Ne copiez pas automatiquement les alertes des scanners dans le Ground Truth en les déclarant vraies. Les rapports peuvent alimenter une file de candidats, mais chaque décision doit être étayée indépendamment.

## Statuts

- `CONFIRMED_AFFECTED` : avis fiable + version affectée + présence dans l'artefact confirmés.
- `CONFIRMED_NOT_AFFECTED` : la revue prouve que le finding ne s'applique pas au composant/version/artefact.
- `REVIEW_REQUIRED` : preuve insuffisante ou analyse non terminée.

L'applicabilité dans le contexte applicatif doit être notée séparément. `NOT_DEMONSTRATED` ne veut pas dire que le composant est absent ou non vulnérable ; cela signifie que l'exploitabilité n'a pas été démontrée.

## File HIGH

`reports/ground-truth/high-review-to-validate.csv` contient les 164 groupes HIGH à examiner. Pour enrichir les lignes avec les avis OSV :

```bash
cd devsecops
python scripts/enrich_osv_review.py
```

Le résultat est écrit dans `reports/ground-truth/high-review-osv-enriched.csv`. Le script ne classe automatiquement aucun finding en TP/FP : un résultat OSV doit être interprété et confirmé dans l'artefact et le contexte de l'application.

## Fichiers

- `ground-truth.csv` : références validées et statuts.
- `validation-log.csv` : journal de preuves et décisions.
- `high-review-to-validate.csv` : file de revue HIGH.
- `trivy-review-candidates.csv` : observations candidates initiales.
- `methodology.md` : protocole et limites expérimentales.

Les entrées `REVIEW_REQUIRED` sont exclues des métriques. Les détections sans revue ne sont pas classées automatiquement comme faux positifs. Le Recall et le F1 globaux restent indisponibles tant que l'exhaustivité du Ground Truth n'a pas été démontrée.
