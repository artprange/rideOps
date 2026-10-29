# Engineering backlog

Source: RideOps_Backlog_Engenharia.pdf, dated October 29, 2026. Local identifiers RO-001 through RO-040 correspond to tickets RIDE-001 through RIDE-040 in the source document, preserving their numbering, dependencies, and acceptance criteria.

## Branch convention

`roX/featyyy`: the ticket number without leading zeros, followed by a short feature description in lowercase English with hyphens. Examples: RO-001 → `ro1/featdefine-scope`; RO-002 → `ro2/featcreate-monorepo`.

All project content, including commit messages, must be in English. Example commit message: `docs(ro1): define project scope and domain rules`.

## Progress

RO-001 is complete following documentation review in PRODUCT.md. RO-002 is next. All other tickets are pending. Documentation completion does not mean the MVP is implemented.

## Tickets

### RO-001 — Define scope and domain rules

Priority: P0 · Size: S · Dependencies (RO numbers): -

Write the vision, domain terms, unit conventions, timezone rules, and MVP boundaries.

- [x] README/PRODUCT.md describes the MVP, exclusions, and three main flows.
- [x] Distance is stored in meters, duration in seconds, and instants in UTC.
- [x] There is an explicit decision for missing metrics and manual rides.

### RO-002 — Create the TypeScript monorepo

Priority: P0 · Size: M · Dependencies (RO numbers): 001

Set up apps/web, apps/api, and packages/shared with pnpm workspaces and common scripts.

- [ ] Web and API start in development mode without obscure manual adjustments.
- [ ] Workspace commands for lint, typecheck, and tests are documented.
- [ ] TypeScript configuration and aliases do not create circular dependencies.

### RO-003 — Local infrastructure with Docker Compose

Priority: P0 · Size: S · Dependencies (RO numbers): 002

Provision PostgreSQL with a healthcheck and persistent volumes; no Redis at this stage.

- [ ] docker compose up -d starts the database and reports its health status.
- [ ] Example credentials are provided in .env.example; real credentials are never committed to Git.
- [ ] Database migration and reset procedures are documented.

### RO-004 — NestJS skeleton and health endpoints

Priority: P0 · Size: S · Dependencies (RO numbers): 002,003

Create the API with global validation, typed configuration, and liveness/readiness endpoints.

- [ ] GET /health/live returns 200 when the process is healthy.
- [ ] GET /health/ready fails correctly when the database is unavailable.
- [ ] An integration test covers both cases.

### RO-005 — CI pipeline and standardization

Priority: P1 · Size: S · Dependencies (RO numbers): 002,004

Configure GitHub Actions for lint, typecheck, tests, and build without real secrets.

- [ ] A broken PR fails automated checks.
- [ ] README documents the required checks.
- [ ] Commit hooks, if used, do not replace CI.

### RO-006 — Model User and Ride in PostgreSQL

Priority: P0 · Size: M · Dependencies (RO numbers): 003,004

Create initial migrations and entities with Prisma, including id, userId, source, title, start time, distance, duration, optional elevation gain, notes, and timestamps.

- [ ] The Ride.userId foreign key prevents orphaned rides.
- [ ] Numeric fields reject negative and inconsistent values.
- [ ] Migrations can be applied reproducibly to a clean database using the documented workflow.

### RO-007 — Authentication and sessions

Priority: P0 · Size: L · Dependencies (RO numbers): 006

Implement registration, login, logout, and GET /auth/me with password hashing and secure sessions.

- [ ] Passwords are never stored as plaintext or written to logs.
- [ ] Session cookies use HttpOnly, Secure in production, and a compatible SameSite policy.
- [ ] Unauthenticated users receive 401 on protected routes.

### RO-008 — Ownership authorization

Priority: P0 · Size: S · Dependencies (RO numbers): 007

Ensure data isolation for reads, writes, deletions, and aggregate queries.

- [ ] User A cannot read, modify, or delete user B's rides.
- [ ] An automated test covers attempted access using an arbitrary ID.
- [ ] Responses do not leak private data or reveal other users' resources.

### RO-009 — Manual ride REST CRUD

Priority: P0 · Size: M · Dependencies (RO numbers): 006,007,008

Create POST/GET/PATCH/DELETE /rides and GET /rides/:id with DTOs, basic filters, and pagination.

- [ ] Entering a title, date, kilometers, and duration produces normalized units in the database.
- [ ] GET /rides supports page/limit and returns a stable order by date + id.
- [ ] PATCH and DELETE validate authorization; invalid payloads return 400.

### RO-010 — Authentication screens and application shell

Priority: P0 · Size: M · Dependencies (RO numbers): 007

Configure React, Vite, a router, and TanStack Query; create login, registration, and a responsive layout.

- [ ] Authenticated users can access private routes; unauthenticated users are redirected.
- [ ] API errors have readable feedback, and loading/empty states are provided.
- [ ] Core pages have no horizontal overflow on mobile.

### RO-011 — Create, list, view, and edit rides

Priority: P0 · Size: L · Dependencies (RO numbers): 009,010

Implement ride forms and lists, reusing typed contracts.

- [ ] Forms validate dates, distance, and duration.
- [ ] After creating or editing a ride, the UI updates without a full reload.
- [ ] Deletion requires confirmation and handles server failures.

### RO-012 — Demo data and a basic E2E test

Priority: P1 · Size: M · Dependencies (RO numbers): 011

Create a deterministic seed and a Playwright navigation scenario.

- [ ] The seed creates a development user and 10 rides on different dates without real personal data.
- [ ] The E2E test logs in, creates a ride, views it, and edits it.
- [ ] The suite runs in a disposable environment, never against production.

### RO-013 — Model Track, TrackPoint, and Import

Priority: P0 · Size: M · Dependencies (RO numbers): 006

Add Track, TrackPoint, and ImportRecord; store segments, sequence, checksum, and status.

- [ ] Coordinates are stored as lat/lon with an explicit sequence, without relying on implicit database ordering.
- [ ] Separate GPX segments are not artificially connected.
- [ ] The checksum is unique per user for completed imports.

### RO-014 — Secure GPX upload endpoint

Priority: P0 · Size: M · Dependencies (RO numbers): 013

Accept multipart GPX uploads with an initial 5 MB limit and a configurable point limit.

- [ ] Incompatible extensions/MIME types and malformed XML are rejected with a friendly error.
- [ ] The implementation blocks external entities/XXE and handles oversized files.
- [ ] Temporary files are removed on both success and failure.

### RO-015 — GPX parser independent of the API

Priority: P0 · Size: L · Dependencies (RO numbers): 014

Create a pure service to read trk/trkseg/trkpt, lat, lon, ele, and time; support valid GPX with optional fields.

- [ ] GPX files with and without elevation are accepted; missing timestamps produce null duration.
- [ ] Coordinates outside [-90,90] and [-180,180] are discarded or rejected.
- [ ] Tests use small fixtures, including empty segments, invalid timestamps, and multiple segments.

### RO-016 — GPS metric calculations

Priority: P0 · Size: L · Dependencies (RO numbers): 015

Calculate cumulative distance with Haversine, elapsed time, and basic statistics; do not invent moving time at this stage.

- [ ] Distance calculations do not connect gaps between segments.
- [ ] Elapsed time uses valid timestamps; insufficient timestamps produce null.
- [ ] Missing elevation remains null; gain is displayed only when a noise-handling rule is documented.

### RO-017 — Persist imports and prevent duplicates

Priority: P0 · Size: M · Dependencies (RO numbers): 013,015,016

Perform transactional ingestion: record the import, track, points, and ride; record errors without leaving partial data.

- [ ] Uploading the same file again as the same user does not duplicate the ride.
- [ ] Persistence failures do not leave partially imported rides.
- [ ] The v1 response is documented: 201 {importId, rideId, status: COMPLETED}.

### RO-018 — Upload UI and import states

Priority: P0 · Size: M · Dependencies (RO numbers): 014,017

Create a screen to drag or select a GPX file, follow processing, and navigate to the created ride.

- [ ] The upload UI shows accepted formats and size limits before submission.
- [ ] Duplicates, invalid data, and server errors have distinct messages.
- [ ] Success leads to the imported ride's details.

### RO-019 — Display tracks on a map

Priority: P0 · Size: L · Dependencies (RO numbers): 013,017,018

Add MapLibre/tiles with correct attribution; draw segments and fit the bounding box.

- [ ] The route and start/end points appear correctly for a test GPX file.
- [ ] An empty route does not break the map.
- [ ] The tile provider, limits, and attribution are documented; public servers are not abused.

### RO-020 — Detail screen with metrics and route

Priority: P0 · Size: M · Dependencies (RO numbers): 016,019

Display duration, distance, average speed when calculable, elevation gain, and a map.

- [ ] UI units are km/h, km, and m; the API keeps SI units.
- [ ] Missing fields display “not available”, never an invented zero.
- [ ] The activity summary is consistent with backend results.

### RO-021 — GPX regression suite

Priority: P1 · Size: M · Dependencies (RO numbers): 015,016,017,020

Create fixtures with a short track, gaps, invalid coordinates, missing elevation, and duplicates.

- [ ] A test references a known approximate distance and an explicit tolerance.
- [ ] Malicious, oversized, and repeated files fail safely.
- [ ] An E2E test imports a fixture and finds the route in the detail view.

### RO-022 — Aggregates by period

Priority: P0 · Size: M · Dependencies (RO numbers): 009,017

Create GET /stats/summary?from=&to= with kilometers, hours, activity count, and total known elevation gain.

- [ ] Aggregation always filters by user and a documented inclusive/exclusive interval.
- [ ] Missing data is not summed as if it were a real measurement.
- [ ] Tests cover empty periods and month boundaries.

### RO-023 — Responsive dashboard

Priority: P0 · Size: M · Dependencies (RO numbers): 022

Create cards with monthly totals, recent activities, and a weekly/monthly chart.

- [ ] The dashboard uses real API data and provides loading/empty/error states.
- [ ] Charts have labels and units and are readable on mobile.
- [ ] The selected period matches the actual query.

### RO-024 — Ride filters and search

Priority: P1 · Size: M · Dependencies (RO numbers): 009,023

Support title search, source filters (manual/GPX), and date ranges.

- [ ] Filters work together and are applied on the backend before pagination.
- [ ] The URL preserves filters when reloading or sharing within the account.
- [ ] Queries with no results show a clear indication.

### RO-025 — Basic personal records

Priority: P1 · Size: M · Dependencies (RO numbers): 022

List the longest ride, greatest duration, and greatest distance in a month.

- [ ] Ties use a stable tiebreaker.
- [ ] Activities without duration do not compete for duration records.
- [ ] Each record links to the corresponding ride.

### RO-026 — API tests and authorization coverage

Priority: P0 · Size: M · Dependencies (RO numbers): 008,017,022

Expand the integration suite to cover authentication, ownership, filters, uploads, and aggregation.

- [ ] Tests run with an isolated test database and real migrations.
- [ ] 400/401/403 or 404 responses are predictable and documented.
- [ ] A clean run passes without depending on test order.

### RO-027 — Privacy and security policy

Priority: P0 · Size: M · Dependencies (RO numbers): 017,026

All rides are private by default; review logs, uploads, CSRF, rate limiting, and location leaks.

- [ ] No public route returns a user's track or coordinates.
- [ ] Tokens, passwords, GPX contents, and coordinates do not appear in normal logs.
- [ ] Login and upload requests are rate-limited; the repository includes a short threat model.

### RO-028 — Indexes, pagination, and measurements

Priority: P1 · Size: M · Dependencies (RO numbers): 024,026

Measure listing and aggregate queries; add indexes with demonstrated value.

- [ ] EXPLAIN output or query logs support the optimization.
- [ ] Lists do not return all GPS points by default.
- [ ] A test with a large synthetic dataset identifies bottlenecks.

### RO-029 — Structured logs and consistent errors

Priority: P1 · Size: M · Dependencies (RO numbers): 026

Add requestId, stable error codes, and redacted logging.

- [ ] Import failures log requestId/importId without exposing sensitive data.
- [ ] The frontend maps known errors to clear messages.
- [ ] Health status does not reveal secrets or stack traces.

### RO-030 — Accessibility and edge states

Priority: P1 · Size: M · Dependencies (RO numbers): 023,026

Audit keyboard navigation, contrast, slow loading, missing data, and large tables.

- [ ] Inputs have accessible labels and errors; the deletion modal manages focus.
- [ ] The UI does not crash with zero activities or unknown duration.
- [ ] The map has an alternative text summary of route metrics.

### RO-031 — Add Redis, BullMQ, and a separate worker

Priority: P1 · Size: L · Dependencies (RO numbers): 017,029

Extract GPX parsing into a worker; the API receives the file and creates a pending ImportRecord.

- [ ] POST /imports/gpx now returns 202 {importId, status: QUEUED}.
- [ ] The worker can start and stop independently of the API.
- [ ] The frontend continues to work with asynchronous status updates.

### RO-032 — Import state machine

Priority: P1 · Size: M · Dependencies (RO numbers): 031

Define QUEUED, PROCESSING, COMPLETED, FAILED, and GET /imports/:id; add simple UI polling.

- [ ] State advances only through valid transitions.
- [ ] Polling stops after success/failure or component unmount.
- [ ] A failed job displays a sanitized, traceable message.

### RO-033 — Job idempotency and retries

Priority: P1 · Size: L · Dependencies (RO numbers): 031,032

Configure retries with backoff, checksum deduplication, and atomic persistence.

- [ ] Repeating the same file/job does not create two Ride records.
- [ ] Transient errors are retried; invalid GPX fails without pointless retries.
- [ ] Killing the worker during a job does not leave inconsistent data.

### RO-034 — Terminal failures and reprocessing

Priority: P1 · Size: M · Dependencies (RO numbers): 032,033

Record attempts and terminal errors, define appropriate retention, and support safe manual reprocessing.

- [ ] Users can view status and resubmit failed imports without duplicates.
- [ ] Admins/developers have a documented way to inspect dead jobs.
- [ ] Retries are never infinite.

### RO-035 — Concurrency and load limits

Priority: P2 · Size: M · Dependencies (RO numbers): 031,033

Benchmark large GPX files with configurable concurrency and per-user restrictions.

- [ ] Controlled load does not bring down the CRUD API.
- [ ] Maximum point count, file size, and processing time are explicit and tested.
- [ ] A short report documents throughput and the observed bottleneck.

### RO-036 — Deployment and production environment

Priority: P1 · Size: L · Dependencies (RO numbers): 027,029,031

Deploy the web app, API, worker, and database to compatible services with HTTPS and externally managed secrets.

- [ ] Pipelines run migrations in a controlled manner.
- [ ] Health endpoints reflect essential dependencies.
- [ ] Importing GPX and viewing the map work in the remote environment.

### RO-037 — Backup, restoration, and documentation

Priority: P1 · Size: M · Dependencies (RO numbers): 036

Document architecture, runbooks, ADRs, and a PostgreSQL restoration test.

- [ ] Another developer can start the project using only README and .env.example.
- [ ] A test backup is restored and validated in an isolated environment.
- [ ] A component diagram and decision records exist.

### RO-038 — Elevation chart and moving time

Priority: P2 · Size: L · Dependencies (RO numbers): 020,021

Add an elevation profile and a documented moving-time algorithm, including gap and noise handling.

- [ ] The algorithm has explicit thresholds and does not invent missing time.
- [ ] The chart lets users identify the approximate point along the route.
- [ ] A fixture with a pause and noise produces a result within tolerance.

### RO-039 — Goals and weekly progress

Priority: P2 · Size: M · Dependencies (RO numbers): 023,025

Define a monthly distance goal, progress, and visual history.

- [ ] Goals belong to individual users and do not alter activity metrics.
- [ ] Changing a goal updates progress without recalculating GPS data.
- [ ] Without a goal, the dashboard does not fabricate data.

### RO-040 — Export and portability

Priority: P2 · Size: M · Dependencies (RO numbers): 024,027

Export the user's activities as CSV and imported tracks as GPX when supported.

- [ ] CSV preserves documented headers, units, and timezone.
- [ ] Export requires authentication and ownership.
- [ ] Exports exclude other users' data and enforce volume limits.
