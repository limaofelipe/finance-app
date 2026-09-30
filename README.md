# Finance App

Personal/small-business finance manager. React + Express + PostgreSQL.

## Dev setup

1. Create a `server/.env` (copy `server/.env.example`) with a `DATABASE_URL`.
   This project uses a [Supabase](https://supabase.com) Postgres instance
   in development (Docker was originally planned but unavailable on the
   dev machine — see `docs/superpowers/plans/2026-09-28-finance-app-mvp.md`
   Task 2 ledger notes). Any Postgres connection string works.
2. `cd server && npm install && npm run prisma:migrate && npm run dev` — API on :4000
3. `cd client && npm install && npm run dev` — UI on :5173
