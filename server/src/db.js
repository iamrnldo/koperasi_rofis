import pg from 'pg';
const { Pool } = pg;

// DATABASE_URL is used by Railway/Neon; local PostgreSQL may use DB_* variables.
const localConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
};
const useUrl = Boolean(process.env.DATABASE_URL);
const ssl = process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false;
export const pool = new Pool(useUrl ? { connectionString: process.env.DATABASE_URL, ssl } : { ...localConfig, ssl });
export const query = (text, params) => pool.query(text, params);
