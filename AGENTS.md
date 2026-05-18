<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Runbook

## App commands

```sh
pnpm install      # Install dependencies
pnpm dev          # Start Next.js dev server
pnpm lint         # Run ESLint
pnpm build        # Build production app
pnpm start        # Start production server after build
```

## Supabase local development

Requires Docker.

```sh
pnpm dlx supabase start     # Start local Supabase stack
pnpm dlx supabase status    # Show local URLs, DB URL, and keys
pnpm dlx supabase stop      # Stop local Supabase stack
pnpm dlx supabase db reset  # Reset local DB, rerun migrations and seed
```

Local defaults:

```text
Studio: http://127.0.0.1:54323
API:    http://127.0.0.1:54321
DB:     postgresql://postgres:postgres@127.0.0.1:54322/postgres
Mailpit http://127.0.0.1:54324
```

## Supabase cloud workflow

Use only after a hosted Supabase project exists.

```sh
pnpm dlx supabase login
pnpm dlx supabase link --project-ref <project-ref>
pnpm dlx supabase db push
```
