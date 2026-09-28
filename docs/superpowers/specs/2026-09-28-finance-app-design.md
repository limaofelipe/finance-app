# Finance App — Design Spec

Data: 2026-09-28

## Objetivo

Aplicativo web responsivo para gerenciamento de finanças pessoais/pequenas
empresas. MVP com dashboard, CRUD de transações, categorias personalizadas e
histórico filtrável. Multi-usuário com autenticação.

## Stack

- **Front-end:** React.js (Vite) + Tailwind CSS + React Router + Context API
  (auth state)
- **Back-end:** Node.js + Express
- **Banco de dados:** PostgreSQL (via Docker Compose em dev)
- **ORM:** Prisma (migrations + type-safety); o SQL de criação das tabelas é
  gerado manualmente primeiro e o schema Prisma espelha esse SQL
- **Autenticação:** JWT (access token via header `Authorization: Bearer`),
  senha com hash (bcrypt)

## Estrutura de pastas (monorepo)

```
finance-app/
├── docker-compose.yml
├── client/                 # React + Vite + Tailwind
│   └── src/
│       ├── components/
│       ├── pages/          # Login, Register, Dashboard, Transactions, Categories
│       ├── context/        # AuthContext
│       ├── services/       # api client (fetch/axios wrapper)
│       └── App.jsx
└── server/                 # Node + Express + Prisma
    ├── prisma/
    │   ├── schema.prisma
    │   └── migrations/
    └── src/
        ├── routes/          # auth, transactions, categories, dashboard
        ├── middleware/      # auth (JWT verify)
        ├── controllers/
        └── index.js
```

## Modelo de dados

### `users`
| coluna | tipo | notas |
|---|---|---|
| id | serial PK | |
| name | varchar | |
| email | varchar unique | índice único |
| password_hash | varchar | |
| created_at | timestamp | default now() |

### `categories`
| coluna | tipo | notas |
|---|---|---|
| id | serial PK | |
| user_id | int FK → users.id | índice |
| name | varchar | |
| type | enum('income','expense') | |
| color | varchar | hex, para UI |
| created_at | timestamp | default now() |

### `transactions`
| coluna | tipo | notas |
|---|---|---|
| id | serial PK | |
| user_id | int FK → users.id | índice |
| category_id | int FK → categories.id | |
| title | varchar | |
| amount | decimal(12,2) | |
| date | date | índice |
| type | enum('income','expense') | |
| created_at | timestamp | default now() |

Todas as queries de `categories` e `transactions` são filtradas por
`user_id` no back-end — isolamento multi-usuário garantido na API.

## API (Express)

- `POST /api/auth/register` — cria usuário, retorna JWT
- `POST /api/auth/login` — valida credenciais, retorna JWT
- `GET/POST/PUT/DELETE /api/categories` — CRUD de categorias do usuário logado
- `GET/POST/PUT/DELETE /api/transactions` — CRUD de transações do usuário
  logado; `GET` aceita query params `date_from`, `date_to`, `type`,
  `category_id` para os filtros do histórico
- `GET /api/dashboard/summary` — retorna `{ balance, totalIncome,
  totalExpense }` do mês corrente, calculado no back-end

Middleware `authMiddleware` valida o JWT em todas as rotas exceto
`/api/auth/*` e injeta `req.userId`.

## Front-end

- Tema único dark mode. Paleta: fundo `#0d0d0d`/`#171717`, texto claro
  (`#e5e5e5`), acentos dourado/âmbar (`#d4af37`/`#f0c987`) em botões
  primários, bordas de destaque e indicadores de sucesso — estética Kintsugi
  (traços finos dourados sobre fundo escuro).
- Páginas: `Login`, `Register`, `Dashboard` (cards de resumo), `Transactions`
  (tabela + filtros + modal add/edit), `Categories` (gerenciamento simples).
- `AuthContext` guarda o JWT (localStorage) e o usuário logado; rotas
  protegidas redirecionam para `/login` se não autenticado.

## Testing

MVP sem suíte de testes automatizados — fora do escopo das 4 etapas
solicitadas. Pode ser adicionado como fase seguinte (Vitest no client, Jest
ou supertest no server).

## Ordem de entrega (confirmada com o usuário)

1. Estrutura de pastas do projeto
2. Script SQL de criação do banco de dados
3. API do back-end (rotas CRUD essenciais)
4. Componentes visuais do front-end em React + Tailwind, começando pelo
   Dashboard

Cada etapa aguarda confirmação do usuário antes de avançar para a próxima.

## Pré-requisitos de ambiente

- Node.js (já instalado: v24.13.0)
- Docker Desktop (**pendente de instalação pelo usuário** antes da etapa de
  subir o banco de dados)
