# Finance App MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the finance app MVP — dashboard, transaction CRUD, category
CRUD, filterable history — as a React + Express + PostgreSQL app with JWT
auth, delivered in the 4 phases the user approved (folders → SQL → API →
React UI), pausing for user confirmation between phases.

**Architecture:** Monorepo (`client/` React+Vite+Tailwind, `server/`
Node+Express+Prisma). PostgreSQL via Docker Compose. JWT auth middleware
scopes every `categories`/`transactions` query to `req.userId`.

**Tech Stack:** React 18, Vite, Tailwind CSS, React Router, Node.js,
Express, Prisma, PostgreSQL 16, bcrypt, jsonwebtoken.

**Spec:** [docs/superpowers/specs/2026-09-28-finance-app-design.md](../specs/2026-09-28-finance-app-design.md)

## Global Constraints

- Dark mode only (no light/dark toggle in MVP). Background `#0d0d0d`/`#171717`,
  text `#e5e5e5`, accent gold/amber `#d4af37`/`#f0c987` for primary buttons,
  highlight borders, success states.
- Every `categories`/`transactions` DB query is filtered by `user_id` server-side.
- No automated test suite in MVP (per spec) — verification steps use manual
  `curl`/browser checks instead of unit tests.
- Node.js v24.13.0 already installed. Docker Desktop required starting Task 2.
- Prisma schema must mirror the hand-written SQL in Task 2 exactly (same
  table/column names, types, FKs, indexes).

---

## Phase 1 — Project structure

### Task 1: Monorepo scaffolding

**Files:**
- Create: `finance-app/.gitignore`
- Create: `finance-app/README.md`
- Create: `finance-app/docker-compose.yml`
- Create: `finance-app/server/package.json`
- Create: `finance-app/server/.env.example`
- Create: `finance-app/server/.env` (git-ignored, copy of `.env.example`)
- Create: `finance-app/client/` (via `npm create vite@latest`)

**Interfaces:**
- Produces: `docker-compose.yml` exposes Postgres on `localhost:5432`, db
  name `finance_app`, user `finance`, password `finance_dev_pw`.
- Produces: `server/.env` provides `DATABASE_URL` and `JWT_SECRET` consumed
  by every later server task.

- [ ] **Step 1: Create `.gitignore`**

```
node_modules/
.env
dist/
build/
*.log
```

- [ ] **Step 2: Create `docker-compose.yml`**

```yaml
services:
  db:
    image: postgres:16
    restart: unless-stopped
    environment:
      POSTGRES_DB: finance_app
      POSTGRES_USER: finance
      POSTGRES_PASSWORD: finance_dev_pw
    ports:
      - "5432:5432"
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:
```

- [ ] **Step 3: Verify Docker is available**

Run: `docker --version && docker compose version`
Expected: both print version numbers. If this fails, stop and tell the user
to finish installing Docker Desktop before continuing.

- [ ] **Step 4: Start the database**

Run (from `finance-app/`): `docker compose up -d`
Then: `docker compose ps`
Expected: service `db` shows state `running`/`healthy`.

- [ ] **Step 5: Scaffold the server package**

Run (from `finance-app/`): `mkdir server && cd server && npm init -y`

Then edit `server/package.json` so it reads exactly:

```json
{
  "name": "finance-app-server",
  "version": "1.0.0",
  "private": true,
  "type": "commonjs",
  "main": "src/index.js",
  "scripts": {
    "dev": "node --watch src/index.js",
    "start": "node src/index.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev"
  },
  "dependencies": {
    "@prisma/client": "^5.20.0",
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.21.0",
    "jsonwebtoken": "^9.0.2"
  },
  "devDependencies": {
    "prisma": "^5.20.0"
  }
}
```

Run: `npm install`
Expected: installs without errors, creates `server/node_modules`.

- [ ] **Step 6: Create server env files**

Create `server/.env.example`:

```
DATABASE_URL="postgresql://finance:finance_dev_pw@localhost:5432/finance_app"
JWT_SECRET="change_me_in_production"
PORT=4000
```

Copy it to `server/.env` (same content — this file is git-ignored).

- [ ] **Step 7: Scaffold the client package**

Run (from `finance-app/`):
`npm create vite@latest client -- --template react`
Then: `cd client && npm install`
Expected: `client/` contains a working Vite React app, `npm install`
completes without errors.

- [ ] **Step 8: Install Tailwind and React Router in client**

Run (from `finance-app/client`):
`npm install -D tailwindcss postcss autoprefixer`
`npx tailwindcss init -p`
`npm install react-router-dom`

- [ ] **Step 9: Configure Tailwind**

Edit `client/tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#0d0d0d",
        panel: "#171717",
        gold: "#d4af37",
        "gold-light": "#f0c987",
      },
    },
  },
  plugins: [],
};
```

Replace `client/src/index.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-surface text-neutral-200;
}
```

- [ ] **Step 10: Create root README**

Create `finance-app/README.md`:

```markdown
# Finance App

Personal/small-business finance manager. React + Express + PostgreSQL.

## Dev setup

1. `docker compose up -d` — starts PostgreSQL on port 5432
2. `cd server && npm install && npm run prisma:migrate && npm run dev` — API on :4000
3. `cd client && npm install && npm run dev` — UI on :5173
```

- [ ] **Step 11: Verify the client dev server boots**

Run (from `finance-app/client`): `npm run dev`
Expected: Vite prints a `http://localhost:5173` URL with no errors. Stop
the server (Ctrl+C) once confirmed.

- [ ] **Step 12: Commit**

```bash
cd finance-app
git add .gitignore README.md docker-compose.yml server/package.json server/package-lock.json server/.env.example client
git commit -m "Scaffold monorepo: client (Vite+React+Tailwind) and server (Express) package setup"
```

**PHASE 1 CHECKPOINT — stop and show the user the folder structure. Wait for
explicit confirmation before starting Phase 2.**

---

## Phase 2 — Database schema

### Task 2: SQL schema + Prisma mirror

**Files:**
- Create: `finance-app/server/sql/schema.sql`
- Create: `finance-app/server/prisma/schema.prisma`
- Create (generated by Prisma): `finance-app/server/prisma/migrations/**`

**Interfaces:**
- Produces: Prisma Client models `User`, `Category`, `Transaction` with
  fields exactly as named below — every later server task imports
  `PrismaClient` and uses these model/field names.

- [ ] **Step 1: Write the hand-authored SQL schema (source of truth)**

Create `server/sql/schema.sql`:

```sql
CREATE TYPE transaction_type AS ENUM ('income', 'expense');

CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE categories (
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name       VARCHAR(100) NOT NULL,
    type       transaction_type NOT NULL,
    color      VARCHAR(7) NOT NULL DEFAULT '#d4af37',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_categories_user_id ON categories(user_id);

CREATE TABLE transactions (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    title       VARCHAR(255) NOT NULL,
    amount      DECIMAL(12,2) NOT NULL,
    date        DATE NOT NULL,
    type        transaction_type NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
```

- [ ] **Step 2: Write the Prisma schema mirroring it exactly**

Create `server/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum TransactionType {
  income
  expense

  @@map("transaction_type")
}

model User {
  id           Int      @id @default(autoincrement())
  name         String   @db.VarChar(255)
  email        String   @unique @db.VarChar(255)
  passwordHash String   @map("password_hash") @db.VarChar(255)
  createdAt    DateTime @default(now()) @map("created_at")

  categories   Category[]
  transactions Transaction[]

  @@map("users")
}

model Category {
  id        Int              @id @default(autoincrement())
  userId    Int              @map("user_id")
  name      String           @db.VarChar(100)
  type      TransactionType
  color     String           @default("#d4af37") @db.VarChar(7)
  createdAt DateTime         @default(now()) @map("created_at")

  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]

  @@index([userId])
  @@map("categories")
}

model Transaction {
  id         Int              @id @default(autoincrement())
  userId     Int              @map("user_id")
  categoryId Int              @map("category_id")
  title      String           @db.VarChar(255)
  amount     Decimal          @db.Decimal(12, 2)
  date       DateTime         @db.Date
  type       TransactionType
  createdAt  DateTime         @default(now()) @map("created_at")

  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  category Category @relation(fields: [categoryId], references: [id], onDelete: Restrict)

  @@index([userId])
  @@index([date])
  @@map("transactions")
}
```

- [ ] **Step 3: Run the Prisma migration**

Run (from `finance-app/server`): `npx prisma migrate dev --name init`
Expected: creates `server/prisma/migrations/<timestamp>_init/migration.sql`,
applies it to the `finance_app` database, prints "Your database is now in
sync with your schema."

- [ ] **Step 4: Verify the migration SQL matches the hand-written schema**

Run: open `server/prisma/migrations/<timestamp>_init/migration.sql` and
confirm it creates the same 3 tables/enum/indexes as `sql/schema.sql`
(column names/types may be ordered differently by Prisma, but must be
equivalent).

- [ ] **Step 5: Verify with Prisma Studio**

Run: `npx prisma studio`
Expected: opens a browser UI at `localhost:5555` showing empty `User`,
`Category`, `Transaction` tables. Close it (Ctrl+C) once confirmed.

- [ ] **Step 6: Commit**

```bash
cd finance-app
git add server/sql/schema.sql server/prisma
git commit -m "Add SQL schema and matching Prisma models for users/categories/transactions"
```

**PHASE 2 CHECKPOINT — stop and show the user `sql/schema.sql`. Wait for
explicit confirmation before starting Phase 3.**

---

## Phase 3 — Backend API

### Task 3: Express bootstrap + auth (register/login) + auth middleware

**Files:**
- Create: `finance-app/server/src/index.js`
- Create: `finance-app/server/src/prismaClient.js`
- Create: `finance-app/server/src/middleware/auth.js`
- Create: `finance-app/server/src/routes/auth.js`

**Interfaces:**
- Produces: `prismaClient.js` exports a singleton `PrismaClient` instance
  as `module.exports = prisma`, imported by every subsequent route file.
- Produces: `middleware/auth.js` exports `authMiddleware(req, res, next)`
  which sets `req.userId` (number) or responds `401`.
- Produces: `routes/auth.js` exports an Express `Router` mounted at
  `/api/auth` with `POST /register` and `POST /login`, both returning
  `{ token, user: { id, name, email } }` on success.

- [ ] **Step 1: Create the Prisma client singleton**

Create `server/src/prismaClient.js`:

```js
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = prisma;
```

- [ ] **Step 2: Create the auth middleware**

Create `server/src/middleware/auth.js`:

```js
const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = authMiddleware;
```

- [ ] **Step 3: Create the auth routes**

Create `server/src/routes/auth.js`:

```js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../prismaClient");

const router = express.Router();

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "name, email and password are required" });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, passwordHash },
  });

  const token = signToken(user.id);
  res.status(201).json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = signToken(user.id);
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
});

module.exports = router;
```

- [ ] **Step 4: Create the Express entrypoint**

Create `server/src/index.js`:

```js
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
```

- [ ] **Step 5: Verify the server boots**

Run (from `finance-app/server`): `npm run dev`
Expected: prints `Server listening on http://localhost:4000` with no
errors. Leave it running for the next steps.

- [ ] **Step 6: Verify health endpoint**

Run: `curl http://localhost:4000/api/health`
Expected: `{"ok":true}`

- [ ] **Step 7: Verify register**

Run:
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"secret123"}'
```
Expected: `201` with JSON body containing `token` and `user.email ==
"test@example.com"`.

- [ ] **Step 8: Verify login**

Run:
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"secret123"}'
```
Expected: `200` with a `token`. Save this token for the next task's checks.

- [ ] **Step 9: Commit**

```bash
cd finance-app
git add server/src
git commit -m "Add Express server bootstrap, JWT auth middleware, and register/login routes"
```

### Task 4: Categories CRUD routes

**Files:**
- Create: `finance-app/server/src/routes/categories.js`
- Modify: `finance-app/server/src/index.js`

**Interfaces:**
- Consumes: `authMiddleware` from `middleware/auth.js` (Task 3), `prisma`
  from `prismaClient.js` (Task 3).
- Produces: Router mounted at `/api/categories` — `GET /`, `POST /`,
  `PUT /:id`, `DELETE /:id`, all requiring auth, all scoped to
  `req.userId`.

- [ ] **Step 1: Create the categories routes**

Create `server/src/routes/categories.js`:

```js
const express = require("express");
const prisma = require("../prismaClient");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
router.use(authMiddleware);

router.get("/", async (req, res) => {
  const categories = await prisma.category.findMany({
    where: { userId: req.userId },
    orderBy: { name: "asc" },
  });
  res.json(categories);
});

router.post("/", async (req, res) => {
  const { name, type, color } = req.body;
  if (!name || !type) {
    return res.status(400).json({ error: "name and type are required" });
  }
  if (type !== "income" && type !== "expense") {
    return res.status(400).json({ error: "type must be 'income' or 'expense'" });
  }

  const category = await prisma.category.create({
    data: { userId: req.userId, name, type, color: color || "#d4af37" },
  });
  res.status(201).json(category);
});

router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.category.findFirst({ where: { id, userId: req.userId } });
  if (!existing) {
    return res.status(404).json({ error: "Category not found" });
  }

  const { name, type, color } = req.body;
  const updated = await prisma.category.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(type !== undefined ? { type } : {}),
      ...(color !== undefined ? { color } : {}),
    },
  });
  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.category.findFirst({ where: { id, userId: req.userId } });
  if (!existing) {
    return res.status(404).json({ error: "Category not found" });
  }

  await prisma.category.delete({ where: { id } });
  res.status(204).send();
});

module.exports = router;
```

- [ ] **Step 2: Mount the router**

In `server/src/index.js`, add near the other route import:

```js
const categoriesRoutes = require("./routes/categories");
```

And after `app.use("/api/auth", authRoutes);`:

```js
app.use("/api/categories", categoriesRoutes);
```

- [ ] **Step 3: Restart the server and verify create**

The `npm run dev` process auto-reloads (`node --watch`). Run (replace
`$TOKEN` with the token from Task 3 Step 8):

```bash
curl -X POST http://localhost:4000/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Salary","type":"income","color":"#d4af37"}'
```
Expected: `201` with the created category, `userId` matching the logged-in
user.

- [ ] **Step 4: Verify list and auth enforcement**

Run: `curl http://localhost:4000/api/categories -H "Authorization: Bearer $TOKEN"`
Expected: `200` with an array containing the "Salary" category.

Run: `curl http://localhost:4000/api/categories`
Expected: `401` (no Authorization header).

- [ ] **Step 5: Commit**

```bash
cd finance-app
git add server/src
git commit -m "Add categories CRUD routes scoped to authenticated user"
```

### Task 5: Transactions CRUD routes with filters

**Files:**
- Create: `finance-app/server/src/routes/transactions.js`
- Modify: `finance-app/server/src/index.js`

**Interfaces:**
- Consumes: `authMiddleware`, `prisma` (Task 3).
- Produces: Router mounted at `/api/transactions` — `GET /` (accepts
  `date_from`, `date_to`, `type`, `category_id` query params), `POST /`,
  `PUT /:id`, `DELETE /:id`.

- [ ] **Step 1: Create the transactions routes**

Create `server/src/routes/transactions.js`:

```js
const express = require("express");
const prisma = require("../prismaClient");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
router.use(authMiddleware);

router.get("/", async (req, res) => {
  const { date_from, date_to, type, category_id } = req.query;

  const where = { userId: req.userId };
  if (type) where.type = type;
  if (category_id) where.categoryId = Number(category_id);
  if (date_from || date_to) {
    where.date = {};
    if (date_from) where.date.gte = new Date(date_from);
    if (date_to) where.date.lte = new Date(date_to);
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: { category: true },
    orderBy: { date: "desc" },
  });
  res.json(transactions);
});

router.post("/", async (req, res) => {
  const { title, amount, date, type, categoryId } = req.body;
  if (!title || amount === undefined || !date || !type || !categoryId) {
    return res.status(400).json({ error: "title, amount, date, type and categoryId are required" });
  }
  if (type !== "income" && type !== "expense") {
    return res.status(400).json({ error: "type must be 'income' or 'expense'" });
  }

  const category = await prisma.category.findFirst({
    where: { id: Number(categoryId), userId: req.userId },
  });
  if (!category) {
    return res.status(400).json({ error: "categoryId does not belong to this user" });
  }

  const transaction = await prisma.transaction.create({
    data: {
      userId: req.userId,
      categoryId: Number(categoryId),
      title,
      amount,
      date: new Date(date),
      type,
    },
  });
  res.status(201).json(transaction);
});

router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.transaction.findFirst({ where: { id, userId: req.userId } });
  if (!existing) {
    return res.status(404).json({ error: "Transaction not found" });
  }

  const { title, amount, date, type, categoryId } = req.body;
  const updated = await prisma.transaction.update({
    where: { id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(amount !== undefined ? { amount } : {}),
      ...(date !== undefined ? { date: new Date(date) } : {}),
      ...(type !== undefined ? { type } : {}),
      ...(categoryId !== undefined ? { categoryId: Number(categoryId) } : {}),
    },
  });
  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.transaction.findFirst({ where: { id, userId: req.userId } });
  if (!existing) {
    return res.status(404).json({ error: "Transaction not found" });
  }

  await prisma.transaction.delete({ where: { id } });
  res.status(204).send();
});

module.exports = router;
```

- [ ] **Step 2: Mount the router**

In `server/src/index.js`, add:

```js
const transactionsRoutes = require("./routes/transactions");
```

and after the categories mount:

```js
app.use("/api/transactions", transactionsRoutes);
```

- [ ] **Step 3: Verify create (use the category id from Task 4 Step 3's response)**

```bash
curl -X POST http://localhost:4000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Paycheck","amount":"2500.00","date":"2026-09-01","type":"income","categoryId":1}'
```
Expected: `201` with the created transaction including `category` object.

- [ ] **Step 4: Verify filters**

```bash
curl "http://localhost:4000/api/transactions?type=income&date_from=2026-09-01&date_to=2026-09-30" \
  -H "Authorization: Bearer $TOKEN"
```
Expected: `200` with an array containing the "Paycheck" transaction.

- [ ] **Step 5: Commit**

```bash
cd finance-app
git add server/src
git commit -m "Add transactions CRUD routes with date/type/category filters"
```

### Task 6: Dashboard summary route

**Files:**
- Create: `finance-app/server/src/routes/dashboard.js`
- Modify: `finance-app/server/src/index.js`

**Interfaces:**
- Consumes: `authMiddleware`, `prisma` (Task 3).
- Produces: `GET /api/dashboard/summary` returning
  `{ balance: number, totalIncome: number, totalExpense: number }` for the
  current calendar month.

- [ ] **Step 1: Create the dashboard route**

Create `server/src/routes/dashboard.js`:

```js
const express = require("express");
const prisma = require("../prismaClient");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
router.use(authMiddleware);

router.get("/summary", async (req, res) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: req.userId,
      date: { gte: monthStart, lte: monthEnd },
    },
  });

  let totalIncome = 0;
  let totalExpense = 0;
  for (const t of transactions) {
    const amount = Number(t.amount);
    if (t.type === "income") totalIncome += amount;
    else totalExpense += amount;
  }

  res.json({
    balance: totalIncome - totalExpense,
    totalIncome,
    totalExpense,
  });
});

module.exports = router;
```

- [ ] **Step 2: Mount the router**

In `server/src/index.js`, add:

```js
const dashboardRoutes = require("./routes/dashboard");
```

and after the transactions mount:

```js
app.use("/api/dashboard", dashboardRoutes);
```

- [ ] **Step 3: Verify**

```bash
curl http://localhost:4000/api/dashboard/summary -H "Authorization: Bearer $TOKEN"
```
Expected: `200` with `{"balance":2500,"totalIncome":2500,"totalExpense":0}`
(assuming today's date falls in September 2026, matching Task 5's seeded
transaction — if the current month differs, the numbers will be 0/0/0,
which is also correct).

- [ ] **Step 4: Commit**

```bash
cd finance-app
git add server/src
git commit -m "Add dashboard summary route for current-month balance/income/expense"
```

**PHASE 3 CHECKPOINT — stop and show the user the API routes and curl
verifications. Wait for explicit confirmation before starting Phase 4.**

---

## Phase 4 — Front-end (React + Tailwind), starting with the Dashboard

### Task 7: API client + AuthContext + routing shell

**Files:**
- Create: `finance-app/client/src/services/api.js`
- Create: `finance-app/client/src/context/AuthContext.jsx`
- Create: `finance-app/client/src/pages/Login.jsx`
- Create: `finance-app/client/src/pages/Register.jsx`
- Create: `finance-app/client/src/components/ProtectedRoute.jsx`
- Modify: `finance-app/client/src/App.jsx`

**Interfaces:**
- Produces: `services/api.js` exports `apiFetch(path, options)` which
  prefixes `http://localhost:4000`, attaches the JWT from
  `localStorage.getItem("token")`, and throws on non-2xx responses.
- Produces: `AuthContext` exports `AuthProvider` and `useAuth()` returning
  `{ user, token, login(email, password), register(name, email, password),
  logout() }`.
- Produces: `ProtectedRoute` wraps children, redirects to `/login` when
  `useAuth().token` is falsy.

- [ ] **Step 1: Create the API client**

Create `client/src/services/api.js`:

```js
const BASE_URL = "http://localhost:4000";

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with status ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}
```

- [ ] **Step 2: Create AuthContext**

Create `client/src/context/AuthContext.jsx`:

```jsx
import { createContext, useContext, useState } from "react";
import { apiFetch } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user") || "null")
  );

  function persist(data) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }

  async function login(email, password) {
    const data = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    persist(data);
  }

  async function register(name, email, password) {
    const data = await apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    persist(data);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```

- [ ] **Step 3: Create ProtectedRoute**

Create `client/src/components/ProtectedRoute.jsx`:

```jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}
```

- [ ] **Step 4: Create the Login page**

Create `client/src/pages/Login.jsx`:

```jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-panel border border-gold/20 rounded-lg p-8 w-full max-w-sm space-y-4"
      >
        <h1 className="text-xl font-semibold text-gold-light">Entrar</h1>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-surface border border-neutral-700 rounded px-3 py-2 text-sm focus:border-gold outline-none"
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-surface border border-neutral-700 rounded px-3 py-2 text-sm focus:border-gold outline-none"
          required
        />
        <button
          type="submit"
          className="w-full bg-gold text-surface font-medium rounded py-2 hover:bg-gold-light transition"
        >
          Entrar
        </button>
        <p className="text-sm text-neutral-400">
          Não tem conta? <Link to="/register" className="text-gold-light">Cadastre-se</Link>
        </p>
      </form>
    </div>
  );
}
```

- [ ] **Step 5: Create the Register page**

Create `client/src/pages/Register.jsx`:

```jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await register(name, email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-panel border border-gold/20 rounded-lg p-8 w-full max-w-sm space-y-4"
      >
        <h1 className="text-xl font-semibold text-gold-light">Criar conta</h1>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <input
          type="text"
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-surface border border-neutral-700 rounded px-3 py-2 text-sm focus:border-gold outline-none"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-surface border border-neutral-700 rounded px-3 py-2 text-sm focus:border-gold outline-none"
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-surface border border-neutral-700 rounded px-3 py-2 text-sm focus:border-gold outline-none"
          required
        />
        <button
          type="submit"
          className="w-full bg-gold text-surface font-medium rounded py-2 hover:bg-gold-light transition"
        >
          Cadastrar
        </button>
        <p className="text-sm text-neutral-400">
          Já tem conta? <Link to="/login" className="text-gold-light">Entrar</Link>
        </p>
      </form>
    </div>
  );
}
```

- [ ] **Step 6: Wire routing shell in App.jsx**

Replace `client/src/App.jsx`:

```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

Note: `Dashboard` is created in Task 8 — this task will not compile/run
standalone until Task 8 lands. That is expected; verification happens at
the end of Task 8.

- [ ] **Step 7: Commit**

```bash
cd finance-app
git add client/src
git commit -m "Add API client, AuthContext, Login/Register pages, and routing shell"
```

### Task 8: Dashboard page

**Files:**
- Create: `finance-app/client/src/components/SummaryCard.jsx`
- Create: `finance-app/client/src/pages/Dashboard.jsx`

**Interfaces:**
- Consumes: `apiFetch` (Task 7), `useAuth` (Task 7).
- Produces: `Dashboard` default export, referenced by `App.jsx` (Task 7
  Step 6).

- [ ] **Step 1: Create the SummaryCard component**

Create `client/src/components/SummaryCard.jsx`:

```jsx
export default function SummaryCard({ label, value, accent }) {
  const formatted = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

  return (
    <div
      className={`bg-panel rounded-lg p-6 border ${
        accent ? "border-gold" : "border-neutral-800"
      }`}
    >
      <p className="text-sm text-neutral-400">{label}</p>
      <p
        className={`text-2xl font-semibold mt-2 ${
          accent ? "text-gold-light" : "text-neutral-100"
        }`}
      >
        {formatted}
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Create the Dashboard page**

Create `client/src/pages/Dashboard.jsx`:

```jsx
import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import { useAuth } from "../context/AuthContext";
import SummaryCard from "../components/SummaryCard";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/api/dashboard/summary")
      .then(setSummary)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-semibold text-gold-light">
          Olá, {user?.name}
        </h1>
        <button
          onClick={logout}
          className="text-sm text-neutral-400 hover:text-gold-light"
        >
          Sair
        </button>
      </header>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryCard label="Saldo atual" value={summary.balance} accent />
          <SummaryCard label="Receitas (mês)" value={summary.totalIncome} />
          <SummaryCard label="Despesas (mês)" value={summary.totalExpense} />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify end-to-end in the browser**

Run (from `finance-app/server`, separate terminal): `npm run dev`
Run (from `finance-app/client`, separate terminal): `npm run dev`
Open `http://localhost:5173/register`, create an account.
Expected: redirected to `/`, dashboard shows 3 gold-accented dark cards
with "Saldo atual", "Receitas (mês)", "Despesas (mês)", all `R$ 0,00`
(new user has no transactions yet). Click "Sair", confirm redirect back to
`/login` on next visit to `/`.

- [ ] **Step 4: Commit**

```bash
cd finance-app
git add client/src
git commit -m "Add Dashboard page with month summary cards"
```

**PHASE 4 CHECKPOINT (Dashboard delivered) — stop and show the user the
running dashboard. Transactions page, Categories page, and history filters
are follow-up work beyond this plan's explicit scope (steps 1-4 the user
asked for); confirm with the user whether to continue into a follow-up
plan for those screens.**

---

## Self-Review Notes

- Spec coverage: folder structure (Task 1), SQL schema (Task 2), API CRUD
  for auth/categories/transactions/dashboard (Tasks 3-6), React dashboard
  (Tasks 7-8) — matches the 4 phases in the spec's "Ordem de entrega".
  Transactions/Categories *pages* (front-end) are intentionally deferred
  to a follow-up plan since the spec's phase 4 says "começando pelo
  Dashboard" (starting with the Dashboard), not the full front-end.
- No placeholders: every step has literal file contents or literal
  commands.
- Type/name consistency checked: `req.userId` (auth.js) →
  `prisma.category.findFirst({ where: { userId: req.userId } })` etc.;
  `TransactionType` enum values `income`/`expense` used consistently in
  SQL, Prisma, and route validation; `apiFetch` return shape matches what
  `AuthContext`/`Dashboard` consume.
