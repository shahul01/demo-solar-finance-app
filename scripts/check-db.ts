import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { config } from 'dotenv';
import { sql } from 'drizzle-orm';

// Load environment variables
config();

const dbPath = process.env.DATABASE_URL || 'solar-finance.db';
console.log('Connecting to database at:', dbPath);

const client = new Database(dbPath);
const db = drizzle(client);

type Tables = {
	name: string;
}[];
try {
	// Check if tables exist
	console.log('\n=== Checking database tables ===');
	const tables: Tables = db.all(sql`SELECT name FROM sqlite_master WHERE type='table'`);
	console.log(
		'Existing tables:',
		tables.map((t) => t.name)
	);

	if (tables.length === 0) {
		console.log('\n❌ No tables found! You need to run: pnpm run db:push');
	} else {
		console.log('\n✅ Tables exist. Checking row counts...');
		for (const table of tables) {
			// Type assertion for table object from sqlite_master query
			const tableRecord = table as { name: string };

			if (tableRecord.name !== 'sqlite_sequence') {
				const count = (await db.get(
					sql.raw(`SELECT COUNT(*) as count FROM ${tableRecord.name}`)
				)) as { count: number };
				console.log(`${tableRecord.name}: ${count.count} rows`);
			}
		}
	}
} catch (error) {
	console.error('Error checking database:', error);
} finally {
	client.close();
}
