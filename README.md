# Gigmint — Premium Freelance Marketplace

A production-grade, two-sided freelance marketplace with a 1:1 Notion-style interface. Real authentication, real Postgres, escrow-protected milestone payments, and file uploads — built with Next.js 14 and TypeScript strict mode.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router), React Server Components + Server Actions |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + shadcn/ui, Notion design tokens |
| Database | Postgres on [Aiven](https://aiven.io) (pooled `pg` client, Supabase-compatible schema + RLS) |
| Auth | Custom DB-backed sessions — scrypt hashing, httpOnly cookies, rate-limited |
| Storage | Cloudflare R2 (S3-compatible, presigned uploads) |
| Animation | Framer Motion |
| Forms | React Hook Form + Zod (re-validated server-side) |
| Search | Fuse.js + cmdk (⌘K palette) |
| Tests | Vitest (escrow state machine) + DB integrity suite |

## Quick Start

```bash
npm install --legacy-peer-deps
cp .env.example .env.local        # fill in DATABASE_URL (Aiven) + R2 keys
npm run db:migrate                # apply schema (idempotent)
npm run db:seed                   # demo users + projects (idempotent)
npm run dev                       # http://localhost:3000
```

### Demo logins (after seeding)

| Role | Email | Password |
|---|---|---|
| Client | `alex@techcorp.demo` | `Password123` |
| Freelancer | `sarah@freelance.demo` | `Password123` |

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm test` | Escrow state-machine unit tests (vitest) |
| `npm run db:migrate` | Apply pending SQL migrations |
| `npm run db:seed` | Seed/refresh demo data |
| `npm run db:test` | 47-test DB integrity suite (schema, triggers, RLS, escrow) |

## Architecture

```
src/
  app/                    # App Router pages (marketing, auth, client, freelancer, admin)
    api/files/upload/     # R2 multipart upload endpoint (scope allowlist, mime/size checks)
    legal/[slug]/         # Terms / Privacy / Cookies (SSG)
    sitemap.ts robots.ts  # SEO generated from live DB
  components/
    layout/               # Notion shell: sidebar, breadcrumb topbar, ⌘K palette
    bid/ payments/        # Bid dialog, escrow panel
  lib/
    auth/                 # session.ts (scrypt + DB sessions), actions.ts, rate-limit.ts
    db/                   # postgres.ts (pool), queries.ts (read models)
    actions/              # Server actions: projects, bids (Zod-validated)
    payments/escrow.ts    # Milestone state machine — swap mock → Stripe here
    storage/r2.ts         # R2 client: upload, presign, delete
supabase/migrations/      # 001 schema · 002 escrow · 003 sessions
scripts/                  # migrate.ts, seed.ts, db-test.ts
```

### Auth model

Plain-Postgres auth compatible with a future Supabase import: passwords live in `auth.users.encrypted_password` (scrypt), sessions are DB rows keyed by SHA-256 of the cookie token, and `auth.uid()` is simulated via the `app.current_user_id` session variable so the schema's RLS policies work unchanged on Aiven.

### Payments

`src/lib/payments/escrow.ts` enforces the milestone lifecycle (`pending_funding → funded → work_submitted → approved → released`, with `disputed`) and exposes a provider interface. The mock provider is wired for development; implementing Stripe PaymentIntents with manual capture is the documented swap point.

## Environment

See `.env.example` — requires `DATABASE_URL` (Aiven Postgres) and four `R2_*` values for uploads. Never commit `.env.local`.

## License

All rights reserved. Private project.
