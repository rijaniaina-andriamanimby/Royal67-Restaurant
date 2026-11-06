# Royal67 - Production Docker / GHCR / CD

## Production topology

- `frontend`: React static build served by unprivileged Nginx on container port 8080.
- Nginx proxies `/menu`, `/commande`, `/stats`, `/categorie` and `/health` to Express.
- `backend`: Express on the private Compose network; readiness endpoint checks PostgreSQL.
- `db`: PostgreSQL with a persistent named volume. No public database port is exposed.

## Required GitHub configuration

Create repository secrets:

- `GHCR_USERNAME`: GitHub account or organization that can read the packages.
- `GHCR_TOKEN`: a fine-grained/classic token with `read:packages` for the deployment host.
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`: production database credentials.
- `PUBLIC_ORIGIN` (optional): defaults to `http://localhost:8080`.

The CI publisher uses the repository `GITHUB_TOKEN` with `packages: write`.

## Self-hosted Windows runner

Install a GitHub Actions self-hosted runner on the Windows 10 demonstration PC. Configure labels:

- `self-hosted`
- `windows`
- `royal67-deploy`

The runner account must be allowed to access Docker Desktop and execute Docker Compose. Keep Docker Desktop running and use Linux containers. Do not expose the runner to untrusted pull-request workflows.

The deploy job writes the Compose file and database initialization scripts to `C:\royal67-deploy`, while preserving the named PostgreSQL volume and `.last-good-image-tag`. It deploys the immutable commit SHA tag and checks `http://localhost:8080/health`. If the new version fails and a previous successful tag exists, it rolls back to that tag.

## Manual deployment / recovery

Create a local `.env` in the deployment directory with `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `IMAGE_PREFIX`, `PUBLIC_ORIGIN`, and `WEB_PORT`. Log in to GHCR, then run in PowerShell:

```powershell
$env:IMAGE_TAG = '<commit-sha>'
docker compose --env-file .env -f docker-compose.prod.yml pull
docker compose --env-file .env -f docker-compose.prod.yml up -d
Invoke-WebRequest http://localhost:8080/health
```

## Important notes

- The frontend uses `VITE_API_URL=/`; the browser calls the same origin and Nginx proxies API paths to Express. Do not configure a browser-visible `localhost:8000` URL in a production build.
- PostgreSQL data is persisted in the `postgres_data` named volume. The `database/init` scripts run only when the volume is initialized for the first time.
- Keep `.env`, registry credentials, and deployment state out of Git.
- The previous development-image Trivy baseline is not comparable with the new production frontend image. Re-run Trivy on the production Dockerfiles and preserve those reports as a separately identified production baseline.

## Local production smoke test before GHCR

From the repository root (Git Bash):

```bash
docker compose down   # stop the development stack; do NOT add -v

docker build -t royal67-backend:local ./server
docker build --build-arg VITE_API_URL=/ -t royal67-frontend:local ./client

docker tag royal67-backend:local local/royal67-restaurant-backend:local
docker tag royal67-frontend:local local/royal67-restaurant-frontend:local
```

Add these values to the existing local `.env` (keep the existing database credentials):

```dotenv
IMAGE_PREFIX=local/royal67-restaurant
IMAGE_TAG=local
PUBLIC_ORIGIN=http://localhost:8080
WEB_PORT=8080
```

Then run:

```bash
docker compose --env-file .env -f docker-compose.prod.yml config
docker compose --env-file .env -f docker-compose.prod.yml up -d
docker compose --env-file .env -f docker-compose.prod.yml ps
curl -i http://localhost:8080/health
```

The health endpoint should return HTTP 200 and `{"status":"ok","database":"connected"}`. To stop the production stack without deleting PostgreSQL data, run `docker compose --env-file .env -f docker-compose.prod.yml down` (never add `-v` unless you intentionally want to delete the database volume).
