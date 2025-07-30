import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Define the shape of your DB configuration in env
interface DbConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl?: boolean;
}

// Pull values from environment variables
const dbConfig: DbConfig = {
  host: process.env.PG_HOST || 'localhost',
  port: process.env.PG_PORT ? parseInt(process.env.PG_PORT, 10) : 5432,
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || '',
  database: process.env.PG_DATABASE || 'mydb',
  ssl: process.env.PG_SSL === 'true',
};

// Create a single shared pool instance
export const pool = new Pool({
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  ssl: dbConfig.ssl,
});

// Optional: log when connected
pool.on('connect', () => {
  console.log(
    `✅ Connected to Postgres: ${dbConfig.user}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`
  );
});

// Optional: handle errors
pool.on('error', (err) => {
  console.error('❌ Unexpected Postgres error', err);
  process.exit(-1);
});

export default pool;
