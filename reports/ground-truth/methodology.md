# Méthodologie du Ground Truth — Royal67 Restaurant

## 1. Objectif et périmètre

Construire une référence indépendante pour évaluer les résultats Semgrep et Trivy sur un commit, des fichiers et des images Docker identifiés. Les rapports des scanners servent à constituer une file de candidats à examiner, mais ne constituent pas à eux seuls la preuve de leur exactitude.

## 2. Unité d'évaluation

Une entrée représente un finding attendu ou examiné pour un scanner, un type, un identifiant, un package, une version, un scope, un artefact et éventuellement une cible précise. Les scopes `filesystem`, `image` et `source` restent distincts. Deux images différentes ne sont pas fusionnées.

## 3. Statuts obligatoires

- `CONFIRMED_AFFECTED` : avis fiable et plage de versions confirment que le composant installé est affecté dans l'artefact examiné.
- `CONFIRMED_NOT_AFFECTED` : la revue indépendante établit que le composant/version/artefact ne correspond pas à la vulnérabilité annoncée.
- `REVIEW_REQUIRED` : preuves insuffisantes ou vérification inachevée. Cette ligne est exclue des calculs TP/FP/FN.

L'applicabilité à l'application doit être renseignée séparément (`application_applicability`). La présence d'une dépendance vulnérable, son utilisation effective et son exploitabilité ne sont pas équivalentes.

## 4. Calcul des métriques

- TP : référence `CONFIRMED_AFFECTED` retrouvée par le scanner.
- FN : référence `CONFIRMED_AFFECTED` non retrouvée.
- FP : candidat `CONFIRMED_NOT_AFFECTED` néanmoins signalé par le scanner.
- Les détections sans revue indépendante ne sont pas automatiquement des FP.
- Precision sur l'échantillon examiné = TP / (TP + FP), uniquement si des cas positifs et négatifs ont été examinés.
- Recall = TP / (TP + FN), uniquement lorsque la Ground Truth est déclarée exhaustive pour le périmètre expérimental.
- F1 est affiché uniquement lorsque Precision et Recall sont tous deux interprétables.

L'option `--ground-truth-complete` est une déclaration méthodologique explicite. Elle ne doit être utilisée qu'après revue indépendante du code, des dépendances et des configurations afin d'identifier aussi les vulnérabilités absentes des rapports des scanners.

## 5. Sources de validation

Privilégier les avis des mainteneurs, GitHub Security Advisories, OSV, Go Vulnerability Database et NVD. Conserver les URL et les éléments de preuve dans `validation-log.csv`. Une absence de résultat OSV ne prouve pas qu'un composant est sain.

## 6. État initial de la référence

Les six entrées historiques du fichier `ground-truth.csv` sont reprises comme `CONFIRMED_AFFECTED` parce qu'elles disposent d'une décision TP consignée dans `validation-log.csv`. Leur exploitabilité dans le contexte métier n'est pas démontrée. Les 164 groupes HIGH de `high-review-to-validate.csv` restent `REVIEW_REQUIRED` et ne sont pas promus automatiquement.

## 7. Limites

Une référence composée uniquement de findings remontés par Trivy ne permet pas de mesurer le Recall global : elle ne couvre pas les problèmes que les scanners n'ont pas signalés. Les résultats partiels doivent être présentés comme tels. La détection d'une dépendance vulnérable ne prouve pas qu'une attaque est réalisable contre l'application.
