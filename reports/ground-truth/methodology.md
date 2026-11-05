# Méthodologie du Ground Truth — Royal67 Restaurant

## 1. Objectif

Construire une référence indépendante pour évaluer les résultats de Semgrep et Trivy.
Les alertes des scanners ne constituent pas, à elles seules, une preuve de vérité terrain.

## 2. Unité d'évaluation

Une entrée représente une détection attendue pour un scanner, un type de finding,
un identifiant, un package, une version, un périmètre et un artefact donnés.

Les périmètres sont évalués séparément :
- filesystem : analyse du système de fichiers du projet ;
- image : analyse d'une image Docker déterminée ;
- source : analyse statique du code source.

Deux images différentes ne sont pas fusionnées.

## 3. Critères de validation

Une vulnérabilité de dépendance est considérée comme confirmée lorsque :
1. le composant est présent dans l'artefact ;
2. sa version installée est dans la plage affectée d'un avis fiable ;
3. l'identifiant de vulnérabilité correspond à cet avis.

Pour l'objectif de détection des composants vulnérables, une dépendance de développement
peut être un vrai positif même si son exploitabilité dans l'application n'est pas démontrée.

La présence du composant, son utilisation par l'application et son exploitabilité sont
donc documentées séparément.

## 4. Classification

- TP : composant et version confirmés comme affectés dans l'artefact.
- FP : composant absent, version non affectée ou règle incorrectement appliquée.
- FN : élément confirmé par l'analyse indépendante mais non détecté par le scanner.

Un finding non encore vérifié reste en attente ; il ne doit pas être arbitrairement classé TP ou FP.

## 5. Sources de validation

Privilégier les avis des mainteneurs, GitHub Security Advisories, OSV, Go Vulnerability
Database et NVD. Conserver l'URL de l'avis dans validation-log.csv.

## 6. Limites

La détection d'une dépendance vulnérable ne prouve pas qu'une attaque est réalisable
contre l'application. L'exploitabilité et l'exposition réelle font l'objet d'une analyse
contextuelle distincte.

Le Ground Truth doit aussi intégrer les vulnérabilités manquées par les scanners,
identifiées par une revue indépendante du code, des dépendances et de la configuration.
