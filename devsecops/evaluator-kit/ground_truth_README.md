# Construire la ground truth

Ne remplissez pas ce fichier en recopiant automatiquement les alertes Semgrep/Trivy.
La référence doit être établie indépendamment, pour un périmètre défini, par revue manuelle
et/ou scénarios de sécurité contrôlés.

Une ligne = un problème réel attendu, avec scanner/type/identifiant/paquet/version/scope.
`target` est facultatif lorsque le problème est défini indépendamment du chemin exact.
Conservez la justification dans `rationale`.

Les mesures precision/recall/F1 restent indisponibles tant que ce fichier est vide.
