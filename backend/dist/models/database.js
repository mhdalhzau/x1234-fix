import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';
if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
}
// Determine SSL requirement from URL or environment
const url = process.env.DATABASE_URL;
const requireSSL = url.includes('sslmode=require') || process.env.NODE_ENV === 'production';
const client = postgres(url, {
    prepare: false,
    ssl: requireSSL ? 'require' : false
});
export const db = drizzle(client, { schema });
