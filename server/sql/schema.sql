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
