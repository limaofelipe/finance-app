# Finance App

Personal/small-business finance manager. React + Express + PostgreSQL.

## Dev setup

1. `docker compose up -d` — starts PostgreSQL on port 5432
2. `cd server && npm install && npm run prisma:migrate && npm run dev` — API on :4000
3. `cd client && npm install && npm run dev` — UI on :5173
