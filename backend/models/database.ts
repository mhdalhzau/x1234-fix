import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

// For Supabase connection pooling - disable prepared statements and enable SSL
const client = postgres(process.env.DATABASE_URL!, { 
  prepare: false,
  ssl: 'require'
});
export const db = drizzle(client, { schema });