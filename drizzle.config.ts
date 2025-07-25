import { defineConfig } from 'drizzle-kit';

const databaseUrl = process.env.DATABASE_URL || 'local.db';

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	dialect: 'sqlite',
	dbCredentials: { url: databaseUrl },
	verbose: true,
	strict: true
});
