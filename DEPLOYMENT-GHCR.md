# Royal67 — GHCR, GitHub Actions, Render, Vercel et Streamlit

Ce document décrit la configuration correspondant aux workflows présents dans `.github/workflows/`.

## 1. Architecture retenue

| Élément | Responsabilité |
|---|---|
| GitHub Actions | CI, analyses de sécurité, évaluation et orchestration CD |
| Jest | Tests backend |
| Vite | Build frontend |
| Semgrep | Analyse SAST |
| Trivy FS | Analyse des fichiers, dépendances, secrets et configurations |
| Docker | Construction des images de référence |
| Trivy Image | Analyse des images Docker |
| GHCR | Conservation de l'image backend analysée, identifiée par SHA |
| Python Evaluator | Normalisation, déduplication, Ground Truth et métriques |
| Streamlit Cloud | Visualisation des résultats d'évaluation |
| Render | Hébergement du backend Express |
| Vercel | Hébergement du frontend React |
| Neon | PostgreSQL de production |

**GHCR n'est pas utilisé pour déployer Render.** Render construit le backend depuis le dépôt GitHub. L'image publiée dans GHCR est une image de référence, scannée par Trivy et conservée pour la traçabilité de l'expérimentation.

Le frontend est déployé par Vercel CLI à partir du commit exact validé par CI. Le backend est déclenché sur Render avec le SHA exact via un Deploy Hook.

## 2. Branche de production

Les workflows CI surveillent :

- `main`
- `devsecops/docker-ci`

Le CD est un workflow réutilisable (`workflow_call`) appelé par le dernier job de `ci.yml`. Les exécutions CI/CD d'une même branche ne s'annulent pas en cours de route : un déploiement déjà commencé n'est pas interrompu par un nouveau push. Il est volontairement limité à :

- événement `push`
- branche `devsecops/docker-ci`
- réussite de tous les jobs CI requis (tests, builds, scanners, évaluateur, données Streamlit et publication GHCR)

Cette configuration correspond à la branche de production utilisée pendant la phase de déploiement actuelle. Si la branche de production change, modifier également la branche dans les déclencheurs de `ci.yml`, `cd.yml` et dans la condition du job `publish-dashboard-data`.

## 3. Configuration GitHub Actions

Dans le dépôt GitHub :

1. Ouvrir **Settings → Actions → General**.
2. Vérifier que les Actions sont autorisées.
3. Dans **Workflow permissions**, choisir **Read and write permissions**, puis enregistrer. Les workflows réduisent ensuite les droits au strict nécessaire au niveau de chaque job :
   - lecture du dépôt : `contents: read`
   - publication GHCR : `packages: write`
   - publication des fichiers du dashboard : `contents: write`

Aucun `GHCR_USERNAME` ou `GHCR_TOKEN` n'est nécessaire pour publier depuis GitHub Actions. Le workflow utilise le `GITHUB_TOKEN` éphémère fourni par GitHub.

### Secrets à créer

Ouvrir **Settings → Secrets and variables → Actions → New repository secret**.

Créer exactement les quatre secrets suivants :

| Nom | Valeur |
|---|---|
| `RENDER_DEPLOY_HOOK_URL` | URL secrète du Deploy Hook Render |
| `VERCEL_TOKEN` | Token Vercel |
| `VERCEL_ORG_ID` | ID de l'équipe / organisation Vercel |
| `VERCEL_PROJECT_ID` | ID du projet frontend Vercel |

Ne pas ajouter `DATABASE_URL`, `DB_PASSWORD`, `GHCR_TOKEN` ou `GHCR_USERNAME` : le workflow ne les utilise pas. Le déploiement Render conserve ses variables d'environnement déjà configurées dans Render.

Créer également l'environnement GitHub **Settings → Environments → New environment → `production`**. Tu peux y ajouter des approbateurs obligatoires si tu souhaites une validation humaine avant le déploiement. Les quatre secrets listés ci-dessus restent des Repository secrets pour être transmis au workflow réutilisable.

## 4. GHCR — configuration pas à pas

### 4.1 Vérifier les permissions

Le job `publish-backend-ghcr` déclare :

```yaml
permissions:
  contents: read
  packages: write
```

Cette permission autorise `GITHUB_TOKEN` à publier le package. Aucun Personal Access Token n'est requis dans GitHub Actions.

Si l'organisation GitHub applique une politique restrictive, vérifier que les workflows sont autorisés à créer et publier des packages.

### 4.2 Ce que publie le pipeline

Le workflow :

1. Construit `server/Dockerfile`.
2. Analyse l'image locale avec Trivy.
3. Sauvegarde exactement cette image dans un artefact GitHub Actions.
4. Exécute l'évaluateur Python.
5. Si les vérifications réussissent, recharge l'image analysée.
6. Publie l'image dans GHCR.

Nom du package :

```text
ghcr.io/rijaniaina-andriamanimby/royal67-restaurant-backend
```

Tags :

```text
<commit-sha>
latest
```

Le tag SHA est publié pour chaque push hors Pull Request. Le tag `latest` est mis à jour uniquement pour `devsecops/docker-ci`.

Le workflow ne publie pas l'image frontend : Vercel construit et héberge le frontend. L'image frontend reste construite et analysée par Trivy dans le CI.

Avant le dépôt des rapports comme artefacts GitHub, `devsecops/scripts/sanitize_scan_reports.py` retire les extraits de code et valeurs de secrets potentiellement présents dans les JSON Semgrep/Trivy. Le parseur Trivy ne copie jamais le contenu d'un secret dans les CSV normalisés. Les rapports bruts non nettoyés ne sont donc pas publiés par ces jobs.

### 4.3 Premier push

Avant le premier commit, supprimer tout ancien fichier d'environnement suivi par Git. Si `server/.env` existe localement ou a été suivi :

```bash
rm -f server/.env
git rm --cached --ignore-unmatch server/.env
```

Puis vérifier les fichiers à committer :

```bash
git status --short
```

Après avoir vérifié qu'aucun secret ni fichier local sensible n'apparaît, ajouter les changements :

```bash
git add -A
git status --short
git commit -m "ci: stabilize DevSecOps pipeline and cloud deployment"
git push origin devsecops/docker-ci
```

Ne pas committer un fichier `.env`. Si des identifiants de Neon ou d'autres secrets ont déjà été poussés dans l'historique Git, les renouveler dans les services concernés : supprimer le fichier du dernier commit ne supprime pas son historique.

Le workflow CI doit ensuite créer le package automatiquement.

### 4.4 Vérifier le package

1. Ouvrir le dépôt GitHub.
2. Aller dans **Packages** (ou dans le profil GitHub → Packages).
3. Ouvrir `royal67-restaurant-backend`.
4. Vérifier les tags SHA et `latest`.
5. Vérifier que le package est associé au dépôt source si GitHub ne l'a pas associé automatiquement.

Le package peut rester **Private** : cela suffit pour l'expérimentation et la traçabilité. Pour autoriser un téléchargement public sans authentification, ouvrir les paramètres du package et changer sa visibilité en Public. Ne rendre le package public que si l'image ne contient aucune donnée confidentielle.

### 4.5 Télécharger manuellement une image privée (facultatif)

Cette opération n'est pas nécessaire pour le CI/CD. Pour un téléchargement manuel depuis un poste local, créer un Personal Access Token (classic) avec `read:packages`, puis :

```bash
docker login ghcr.io -u TON_IDENTIFIANT_GITHUB
docker pull ghcr.io/rijaniaina-andriamanimby/royal67-restaurant-backend:latest
```

Ne jamais utiliser ce PAT dans le workflow : `GITHUB_TOKEN` est préférable pour les actions du dépôt.

## 5. Configuration Render

Dans Render, ouvrir le service `royal67-restaurant` :

1. Aller dans **Settings → Deploy Hook**.
2. Créer un hook, par exemple `github-actions-production`.
3. Copier son URL.
4. Enregistrer l'URL dans GitHub sous le secret `RENDER_DEPLOY_HOOK_URL`.
5. Dans **Settings → Build & Deploy**, désactiver Auto-Deploy pour éviter un déploiement parallèle déclenché directement par le push.
6. Vérifier que le service est connecté au même dépôt et à la branche `devsecops/docker-ci`.
7. Vérifier le Health Check Path `/health`.

Le CD ajoute le SHA validé au Deploy Hook avec le paramètre `ref`. Le backend doit donc être déployé à partir du commit exact testé par le CI. L'endpoint `/health` renvoie aussi `RENDER_GIT_COMMIT` (champ `commit`) ; le CD attend que ce SHA corresponde au commit validé avant de déployer le frontend.

Les variables de production (`DATABASE_URL`, `API`, `NODE_ENV`, etc.) restent configurées dans Render. Ne pas les copier dans GitHub Actions.

## 6. Configuration Vercel

Le workflow réutilisable utilise Vercel CLI pour déployer le SHA exact du commit appelant, transmis par `ci.yml`.

### 6.1 Récupérer les identifiants du projet

Sur le poste local :

```bash
# Depuis la racine du dépôt
npm install --global vercel
vercel login
vercel link
```

Sélectionner l'équipe et le projet frontend existant `royal67-restaurant-client`.

Après le lien, lire les valeurs dans :

```text
.vercel/project.json
```

Ce fichier contient notamment :

- `orgId` → secret GitHub `VERCEL_ORG_ID`
- `projectId` → secret GitHub `VERCEL_PROJECT_ID`

Ne pas committer le dossier `.vercel/`. Il est ignoré par `.gitignore`.

Créer un token depuis les paramètres du compte Vercel et le sauvegarder dans GitHub sous `VERCEL_TOKEN`.

### 6.2 Désactiver les déploiements Git automatiques

Le CD doit être le seul mécanisme qui promeut le code en production après les contrôles CI. Il est appelé par `ci.yml` uniquement lorsque tous les jobs requis ont réussi.

Pour garantir qu'un push ne lance pas un déploiement avant la fin du CI, déconnecter le dépôt Git du projet Vercel dans **Settings → Git → Disconnect**. Le projet Vercel et son domaine ne sont pas supprimés. Le déploiement CLI reste possible sans intégration Git, avec `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` et `VERCEL_TOKEN`. Le CI/CD GitHub devient alors le seul chemin de déploiement.

Le projet Vercel conserve `client` comme **Root Directory** dans ses paramètres. Le workflow exécute les commandes CLI depuis la racine du dépôt (important pour un monorepo) :

```bash
vercel pull --yes --environment=production
vercel build --prod
vercel deploy --prebuilt --prod
```

`vercel pull` récupère la configuration et les variables de production déjà définies dans Vercel. Aucune variable secrète Vercel n'est copiée dans le dépôt.

Vérifier que le Root Directory du projet Vercel est `client` et que le projet utilise la configuration Vite existante.

## 7. Streamlit Cloud — actualisation automatique des données

L'application Streamlit est déjà déployée. Il n'est pas nécessaire de créer une deuxième application.

Dans les paramètres de l'application Streamlit Community Cloud, vérifier :

| Paramètre | Valeur |
|---|---|
| Repository | `rijaniaina-andriamanimby/Royal67-Restaurant` |
| Branch | `devsecops/docker-ci` |
| Main file path | `devsecops/dashboard/app.py` |
| Python dependencies | `devsecops/requirements.txt` |

Le CI publie les fichiers d'évaluation dans :

```text
reports/dashboard-data/
├── summary.json
├── normalized_findings.csv
├── deduplicated_findings.csv
└── severity_summary.csv
```

Le dashboard lit ce dossier en priorité, puis utilise `reports/evaluation/` comme solution de repli pour les exécutions locales.

Les rapports JSON bruts Semgrep/Trivy et les archives d'images Docker ne sont pas copiés dans le dossier public du dashboard. Les résultats agrégés et normalisés sont privilégiés.

Le job `publish-dashboard-data` utilise `GITHUB_TOKEN` avec `contents: write` pour mettre à jour ces fichiers. Les pushs réalisés avec ce token ne déclenchent normalement pas une nouvelle exécution de workflow `push`, ce qui évite une boucle CI. Streamlit, connecté à cette branche, récupère les nouvelles données.

**Important :** si une règle de protection de branche interdit les pushs de GitHub Actions, autoriser le compte GitHub Actions à mettre à jour `reports/dashboard-data/`, ou adapter cette publication à une branche de données distincte.

## 8. Ground Truth et métriques

Le workflow utilise le fichier :

```text
reports/ground-truth/ground-truth.csv
```

Il ne passe pas `--ground-truth-complete`. Les résultats non examinés restent `REVIEW_REQUIRED`.

Ne pas marquer artificiellement la Ground Truth comme exhaustive. Les métriques Recall/F1 ne doivent être activées que si la couverture indépendante du périmètre a été démontrée.

Les rapports historiques dans `reports/local-baseline/` restent des références expérimentales. Le CI évalue uniquement les rapports générés pendant l'exécution courante.

## 9. Exécution et vérification

### Vérifications locales

Depuis la racine du dépôt :

```bash
cd server
npm ci
npm test
cd ../client
npm ci
npm run build
cd ..

python -m pip install -r devsecops/requirements-ci.txt
PYTHONPATH=devsecops python -m pytest devsecops/tests -q
```

Sur PowerShell, définir le chemin Python avant les tests :

```powershell
$env:PYTHONPATH = "devsecops"
python -m pytest devsecops/tests -q
```

### Déclencher le pipeline

```bash
git status
git add .
git commit -m "ci: configure cloud DevSecOps pipeline"
git push origin devsecops/docker-ci
```

Ne pas utiliser `git add .` avant d'avoir vérifié que les fichiers `.env`, clés, tokens et fichiers locaux ne sont pas suivis.

### Vérifier CI

Dans GitHub → **Actions** :

- `backend-tests` : Jest réussi.
- `frontend-build` : build Vite réussi.
- `security-sast` : rapport Semgrep créé.
- `security-trivy` : rapports filesystem et images créés.
- `evaluate-reports` : tests Python et évaluation réussis.
- `publish-dashboard-data` : données actualisées.
- `publish-backend-ghcr` : package publié.

Les findings de sécurité sont des résultats d'analyse et ne font pas automatiquement échouer le pipeline. En revanche, une erreur d'exécution d'un scanner, un rapport absent, un test échoué ou un évaluateur en erreur bloque les étapes dépendantes et donc le CD.

### Vérifier CD et production

Le workflow `Royal67 Cloud CD` ne démarre qu'après la réussite du CI de la branche de production.

Le CD :
1. récupère le SHA exact du commit du workflow CI appelant ;
2. déclenche Render avec ce SHA ;
3. attend que `/health` retourne HTTP 200 ;
4. construit puis déploie le frontend avec Vercel CLI ;
5. vérifie les deux URL publiques.

Tests manuels complémentaires :

```bash
curl -i https://royal67-restaurant.onrender.com/health
curl -I https://royal67-restaurant-client.vercel.app/
```

Tester ensuite les parcours métier depuis le navigateur et vérifier qu'une commande est bien persistée dans Neon.

## 10. Nettoyage de l'ancien déploiement Windows

L'architecture cloud ne nécessite plus le runner Windows auto-hébergé ni les secrets de l'ancien déploiement Compose.

Après vérification qu'aucun autre projet ne les utilise :

- supprimer le runner `royal67-deploy` dans **Settings → Actions → Runners** ;
- arrêter/désinstaller le service runner sur le PC s'il existe ;
- supprimer les anciens secrets `GHCR_USERNAME`, `GHCR_TOKEN`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `PUBLIC_ORIGIN` s'ils ne sont plus utilisés ailleurs ;
- ne plus utiliser `scripts/deploy-production.ps1` ni `docker-compose.prod.yml` pour la production cloud.

Le `docker-compose.yml` de développement local est conservé.
