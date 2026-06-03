import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeDatabase, writeDatabase } from './store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sourceFile = process.env.MIGRATION_SOURCE_FILE
  ? path.resolve(process.env.MIGRATION_SOURCE_FILE)
  : path.resolve(__dirname, '../data/db.json');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required to migrate JSON data to PostgreSQL');
}

const raw = await readFile(sourceFile, 'utf-8');
const database = normalizeDatabase(JSON.parse(raw));
await writeDatabase(database);

console.log(`Migrated ${database.categories.length} categories and ${database.products.length} products to PostgreSQL.`);
