import pg from 'pg';
const { Pool } = pg;

// DATABASE_URL is useful for Railway/Neon. Local PostgreSQL may use the DB_* variables instead.
const localConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
};
const useUrl = Boolean(process.env.DATABASE_URL);
export const pool = new Pool(useUrl
  ? { connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_URL.includes('railway') ? { rejectUnauthorized: false } : false }
  : localConfig
);
export const query = (text, params) => pool.query(text, params);
