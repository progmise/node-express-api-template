# node-express-api-template

Template for **progmise** deployable Node.js APIs — Express 5 backend,
Docker image, and thin callers to the
[reusable-workflows](https://github.com/progmise/reusable-workflows) `app-*`
pipelines. Sibling of `node-react-app-template` (which adds a React/Vite SPA
on top).

## What's inside

| Piece | Notes |
|---|---|
| Express 5 | `src/index.js` — JSON API; example `/api/ping` + `/api/health`, JSON 404 for unknown `/api/*` |
| GitHub OAuth | `/api/auth/*` + `/api/me`, HttpOnly cookie `gh_token`. Optional infra: needs `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET`. `ALLOWED_USERS` (comma-separated logins) restricts who can sign in — empty allows anyone |
| `FRONTEND_URL` | Set when the SPA is a separate service: builds the OAuth `redirect_uri`, the post-login redirect, and CORS origin (`CORS_ORIGIN` overrides). Empty = same-origin deployment |
| Docker | Single-stage `Dockerfile` (prod `npm ci`, npm stripped from the image — its bundled deps carry known CVEs); Vercel builds the same file |
| CI/CD | Thin callers in `.github/workflows` → `reusable-workflows` `app-*` `@v1` |

## Use this template

1. **Use this template** on GitHub → name the repo after the API.
2. Rename `name` in `package.json`.
3. Replace `/api/ping` with real endpoints.
4. Update this README.

## Local development

```bash
cp .env.example .env   # GITHUB_CLIENT_* / ALLOWED_USERS / FRONTEND_URL (optional)
npm ci
npm start              # http://localhost:8080
npm run lint
```

## One-time setup (CI/CD)

Everything is **optional** — CI stays green with zero credentials:

- **Publish Image** (`DOCKER_USERNAME` var + `DOCKER_TOKEN` secret) — skipped when unset
- **Deploy** (`VERCEL_TOKEN` secret + `VERCEL_ORG_ID`/`VERCEL_PROJECT_ID`
  vars) — skipped when unset. The project's **Framework Preset must be
  `Container`** so the root `Dockerfile` is built
- **`DEPLOY_ENVIRONMENTS`** (var, JSON list, default `["pro"]`)
- **Tracing** (`GRAFANA_OTLP_ENDPOINT` var + `GRAFANA_OTLP_AUTH` secret)
- **OAuth** (Vercel project env vars, Production): `GITHUB_CLIENT_ID`,
  `GITHUB_CLIENT_SECRET`, `ALLOWED_USERS`, `FRONTEND_URL` — OAuth App
  callback: `https://<frontend-or-api>/api/auth/callback`

## Release & deploy

- **Release** (manual, `main`): bump `version` in `package.json`, run
  *Actions → Release*. Publishes `:<version>` + `:latest` to Docker Hub and
  creates the GitHub Release/tag. **Never deploys.**
- **Deploy** (manual): deploy any released `version` to one env — or via the
  `deploy-manifest` orchestrator.
- **Integration** (on merge): CI + publishes `:<sha>` + `:edge`/`:latest`,
  deploys to non-pro envs.
- **CI Checks** (on PR): `npm ci` + `npm run build` (syntax check) +
  `npm test --if-present`, SAST, SCA, container scan (CSA).
