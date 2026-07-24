import { pool } from './db.js';

// Idempotent migrations: safe to run every time the API starts.
export async function migrateDatabase() {
  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
    DO $$ BEGIN
      CREATE TYPE user_role AS ENUM ('admin','petugas');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      CREATE TYPE movement_type AS ENUM ('masuk','keluar');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(120) NOT NULL,
      email VARCHAR(160) UNIQUE NOT NULL, password_hash TEXT NOT NULL,
      role user_role NOT NULL DEFAULT 'petugas', created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS categories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(100) UNIQUE NOT NULL,
      description TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS suppliers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(120) NOT NULL,
      phone VARCHAR(40), address TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(), code VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(160) NOT NULL, category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
      supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL, unit VARCHAR(30) NOT NULL DEFAULT 'pcs',
      stock INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0), min_stock INTEGER NOT NULL DEFAULT 0 CHECK(min_stock >= 0),
      price NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK(price >= 0), created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS stock_movements (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(), item_id UUID NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
      type movement_type NOT NULL, quantity INTEGER NOT NULL CHECK(quantity > 0), note TEXT,
      created_by UUID REFERENCES users(id) ON DELETE SET NULL, created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_items_category ON items(category_id);
    CREATE INDEX IF NOT EXISTS idx_movements_item_created ON stock_movements(item_id, created_at DESC);

    -- Additive upgrades for databases created by older versions of this app.
    ALTER TABLE items ADD COLUMN IF NOT EXISTS min_stock INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
  `);

  // The account is inserted once only; existing passwords/accounts are never overwritten.
  await pool.query(`INSERT INTO users(name,email,password_hash,role)
    VALUES ('Administrator','admin@rofis.local','$2a$10$rlfS5YqV.bXueScTe1HJCeVAYzw630nautx1oTJiTJP2yOsX5s862','admin')
    ON CONFLICT (email) DO NOTHING`);
  await pool.query(`INSERT INTO categories(name,description) VALUES
    ('Sembako','Kebutuhan pokok'),('ATK','Alat tulis kantor') ON CONFLICT (name) DO NOTHING`);
}
