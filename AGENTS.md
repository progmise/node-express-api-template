# AGENTS.md

Guide for working on APIs generated from **node-express-api-template** —
progmise Express backend services.

## Architecture

Hexagonal (ports & adapters), mirroring `java-maven-api-template` but with
idiomatic JS (functions + duck-typed ports, no class ceremony):

```
src/
  index.js                  composition root — env → adapters → usecases → app
  app.js                    express wiring — middleware + routers
  config/env.js             every process.env read lives here
  domain/                   pure rules, zero framework/fetch imports
  application/
    ports/output/           contracts as JSDoc typedefs (e.g. IdentityProvider)
    usecases/               one factory per use case: (deps) => (input) => result
  infrastructure/
    adapters/input/rest/    routers + middleware — HTTP <-> use cases only
    adapters/output/        implementations (githubIdentity, db clients, ...)
```

Rules:
- Dependencies point inward: routes never touch `fetch`/env; use cases never
  import express; domain never imports anything.
- Pure JSON API — never serve HTML/assets (that's `node-react-app-template`
  or a separate frontend repo). Unknown `/api/*` → JSON 404.
- No secrets in responses or logs; `GITHUB_CLIENT_SECRET` stays server-side;
  the user token rides in an HttpOnly cookie.
- Config via env vars only — read them in `config/env.js`, and document each
  in `.env.example` (no values); `PORT` is set by Vercel at runtime.
- `FRONTEND_URL` = the SPA origin when it is a separate service (OAuth
  redirect_uri + post-login redirect + CORS). Empty = same-origin.
- `ALLOWED_USERS` (comma-separated logins) gates sign-in; empty = open to
  any GitHub account.

## Conventions

- ESM everywhere (`"type": "module"`); Express 5 (wildcards use named
  splats — `/api/gh/{*splat}`, not `/api/gh/*`).
- No build step — `"build": "node --check src/index.js"` exists because CI
  requires a build script.
- `oxlint` for lint (`npm run lint`); tests via `npm test --if-present`.
- Single root `Dockerfile` — CSA scans it and Vercel builds it too
  (project preset `Container`); runtime strips npm.

## CI/CD

All logic lives in `progmise/reusable-workflows` (`@v1`, `secrets: inherit`).
Callers here are thin — keep them that way. Version lives in
`package.json` (`validate-release.py --kind app` reads it).
Pipeline: `Setup → Build artifact → Build image → SAST ‖ SCA ‖ CSA →
Tracing → Summary`; release adds `Validate → CI → Publish Image → Release`
— **never deploys**; deploys run via Deploy (manual) or the orchestrator.
Every stage is optional-credential friendly (Publish/Deploy skip when
`DOCKER_USERNAME`/`VERCEL_PROJECT_ID` are unset).

## Verify before done

```bash
npm ci && npm run build
PORT=8123 node src/index.js &   # /api/health → 200, /api/me → 401
docker build -t api:dev .       # when touching Dockerfile/runtime config
```

## Branches

`main` (releases) + `development` (integration). Work lands on
`<type>/<snake_description>` → PR to `development` → PR to `main`.
Types: `feature/`, `fix/`, `chore/`, `docs/`, `refactor/`.
