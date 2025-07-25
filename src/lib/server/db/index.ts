import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

const databaseUrl = env.DATABASE_URL || 'local.db';

const client = new Database(databaseUrl);

export const db = drizzle(client, { schema });
