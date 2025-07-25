import { defineConfig } from 'drizzle-kit';

const databaseUrl = process.env.DATABASE_URL || '/app/data/solar-finance.db';

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	dialect: 'sqlite',
	dbCredentials: { url: databaseUrl },
	verbose: true,
	strict: true
});
