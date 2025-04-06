import { defineConfig } from 'drizzle-kit';
import { resolve } from 'node:path';

const dbPath = resolve(__dirname, './ntfy.db');

export default defineConfig({
  schema: './db/schema/*.ts',
  out: './assets/drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: `file:${dbPath}`, // Unused in production, only for migration generation
  },
  verbose: true,
  strict: true,
  schemaFilter: ['ntfy'],
  tablesFilter: ['ntfy_*'],
});
