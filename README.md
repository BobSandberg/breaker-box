# Breaker Box

A centralized web app for mapping a house electrical system: panels, breaker positions, circuits, rooms, electrical points, verification history, and advisory load planning.

The project is intentionally relational. The spreadsheet is reference material, not the source of truth.

## Stack

- Next.js responsive web app / PWA
- TypeScript
- Tailwind CSS
- Supabase local development stack
- Planned hosted deployment: Vercel + Supabase

## Local app development

Install dependencies:

```sh
pnpm install
```

Start the Next.js dev server:

```sh
pnpm dev
```

Open:

```text
http://localhost:3000
```

## Local Supabase development

Requires Docker.

Start Supabase locally:

```sh
pnpm dlx supabase start
```

Show local URLs, keys, and database connection info:

```sh
pnpm dlx supabase status
```

Stop local services:

```sh
pnpm dlx supabase stop
```

Reset the local database and rerun migrations/seeds:

```sh
pnpm dlx supabase db reset
```

Local defaults:

```text
Studio: http://127.0.0.1:54323
API:    http://127.0.0.1:54321
DB:     postgresql://postgres:postgres@127.0.0.1:54322/postgres
Mailpit http://127.0.0.1:54324
```

## Validation

Run before handoff:

```sh
pnpm lint
pnpm build
```

## Planning docs

- `docs/PLAN.md` — product scope, workflows, and implementation phases
- `docs/DATA_MODEL.md` — relational model, constraints, and derived summaries

## Safety boundary

This app is advisory only. Always verify that a circuit is de-energized before working on electrical wiring.
