# RideOps

A private platform for recording bike rides, importing GPX files, viewing routes, and tracking progress.

## Current status

The project started from an empty directory. **RO-001 — Define scope and domain rules** is complete at the documentation level. There is no application, installed dependencies, or run commands yet.

- [Product and domain rules](PRODUCT.md)
- [Backlog and branches](docs/BACKLOG.md)

## Planned architecture

- `apps/web`: React, Vite, and TypeScript.
- `apps/api`: NestJS and TypeScript, with a REST API organized by domain.
- `packages/shared`: framework-independent contracts and types.
- PostgreSQL and Prisma for persistence.
- pnpm workspaces, Docker Compose, and GitHub Actions for development and validation.
- A worker, Redis, and BullMQ only during the asynchronous import phase.

These components have not been created yet. The next ticket is **RO-002 — Create the TypeScript monorepo**.

## Workflow

All project content must be in English, including code, comments, documentation, UI text, branch names, and commit messages.

Branches follow `roX/featyyy`: `X` is the ticket number without leading zeros, and `yyy` is a short lowercase description with words separated by hyphens. Example: `ro1/featdefine-scope`.

Suggested commit format: `docs(ro1): define project scope and domain rules`.

Each delivery records its acceptance criteria and completed checks. Once the monorepo exists, lint, typecheck, tests, and build must pass before integration. At this documentation stage, those commands do not exist and have not been run.

## Local development

Requirements: Node.js 24.22.0 and npm 11.x.

Install dependencies from the repository root:

    npm ci

Build the shared package:

    npm run build --workspace=@rideops/shared

Start the applications in separate terminals:

    npm run dev:web
    npm run dev:api

The web development server prints its URL in the terminal.
The API runs at http://localhost:3000 by default.

## Local database setup

Copy `.env.example` to `.env` only when setting up a new environment. Keep an existing `.env` when restarting the project.

Generate a local password with `openssl rand -hex 32`, then paste it into `POSTGRES_PASSWORD` in `.env`. Never put a working password in `.env.example` or commit `.env`. The example password is intentionally empty; Compose refuses to start until a password is provided.

Start PostgreSQL with `docker compose up -d --wait`. Check its status with `docker compose ps`. The default host address is `127.0.0.1:5434`; the container listens on port `5432`.

PostgreSQL stores its data in a named volume. Changing `.env` does not change the password of an already initialized database: rotate the database role password as well, then recreate the container to apply the updated environment. Recreating the container preserves the named volume.

## Verification

Run all configured checks:

    npm run check

Individual commands:

- npm run lint
- npm run typecheck
- npm test
- npm run test:e2e
- npm run build

Tests currently cover the API starter behavior.
The frontend and shared package do not yet have test suites.

## Workspace boundaries

- apps/web: React frontend.
- apps/api: NestJS REST API.
- packages/shared: framework-independent contracts and types.

The shared package must not import either application.
Applications must not import each other's source files.

## API health checks

- GET /health/live returns 200 with {"status":"ok"} while the API can respond.
  It does not query PostgreSQL.
- GET /health/ready runs SELECT 1 against PostgreSQL.
  It returns 200 with {"status":"ok"} on success, or 503 with
  {"status":"unavailable"} on failure.

Readiness recovers after PostgreSQL becomes available without restarting
the API. Connection and query timeouts are configured separately at
2 seconds each.

## API configuration

The API loads the repository-root .env file and validates settings at startup.

- PORT defaults to 3000.
- POSTGRES_HOST defaults to 127.0.0.1.
- POSTGRES_PORT, POSTGRES_USER, POSTGRES_PASSWORD, and POSTGRES_DB are required.
- Ports must be integers between 1 and 65535.
- Configuration errors identify the setting without printing its value.

Global request validation rejects undeclared properties on validated DTOs.

## Health verification

Automated HTTP tests cover readiness success, failure, recovery, and
database-independent liveness using a mocked PostgreSQL driver.

Configuration tests cover defaults, port conversion, invalid ports,
and required settings.

Real PostgreSQL availability, outage, and recovery were checked manually.

## Continuous integration

GitHub Actions runs `npm run check` on every pull request and on pushes
to develop. The checks include lint, typecheck, unit tests, HTTP tests,
and builds.

CI uses disposable configuration without real credentials.
Database behavior in automated health tests uses a mocked driver.

Run `npm run check` locally before opening a pull request.
Local hooks, if added, do not replace CI.

## Database migrations

Prisma defines User and Ride in apps/api/prisma/schema.prisma.

Validate the schema:

    npm run db:validate --workspace=apps/api

Create a draft migration:

    npm run db:migrate --workspace=apps/api -- --name describe_change --create-only

Review the generated SQL before applying it:

    npm run db:migrate --workspace=apps/api

Apply committed migrations to a fresh environment:

    npm exec --workspace=apps/api -- prisma migrate deploy --config prisma.config.ts

Keep migration files in Git. Do not edit migrations already applied.

The initial migration includes ownership and measurement constraints.
Manual database checks verified orphan rejection, negative measurements,
NaN rejection, nullable optional metrics, and owner-deletion restrictions.

Migration replay was verified on a fresh temporary database.
These database checks are not currently part of npm run check.
