import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
const g = globalThis as unknown as { _pool?: Pool };
export const hasDb = !!process.env.DATABASE_URL;
export const db = () => {
  g._pool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 10 });
  return drizzle(g._pool, { schema });
};
