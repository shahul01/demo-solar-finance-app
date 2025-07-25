import { mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';

// Ensure database directory exists
const dbPath = process.env.DATABASE_URL || 'solar-finance.db';
const dbDir = dirname(dbPath);

if (dbDir !== '.' && !existsSync(dbDir)) {
	console.log(`Creating database directory: ${dbDir}`);
	mkdirSync(dbDir, { recursive: true });
}

console.log(`Database will be created at: ${dbPath}`);
