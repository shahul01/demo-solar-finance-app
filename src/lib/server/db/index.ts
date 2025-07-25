import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

let db: ReturnType<typeof drizzle> | null = null;

function getDb() {
	if (!db) {
		if (!env.DATABASE_URL) {
			throw new Error('DATABASE_URL is not set');
		}
		const sql = neon(env.DATABASE_URL);
		db = drizzle(sql, { schema });
	}
	return db;
}

export { getDb as db };
