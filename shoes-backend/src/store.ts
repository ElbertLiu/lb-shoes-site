import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { seedDatabase } from './seed.js';
import type { Category, Database, Product } from './types.js';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '../data');
const dataFile = path.join(dataDir, 'db.json');
const databaseUrl = process.env.DATABASE_URL?.trim();
const pool = databaseUrl
  ? new Pool({
    connectionString: databaseUrl,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  })
  : null;

let writeQueue = Promise.resolve();
let schemaReady: Promise<void> | undefined;

function normalizeCategory(item: unknown): Category | null {
  const value = item as Partial<Category>;
  const id = typeof value.id === 'string' ? value.id.trim() : '';
  const name = typeof value.name === 'string' ? value.name.trim() : '';
  const translations = value.translations && typeof value.translations === 'object'
    ? Object.fromEntries(Object.entries(value.translations)
      .filter((entry): entry is [string, string] => typeof entry[1] === 'string' && Boolean(entry[1].trim()))
      .map(([key, translation]) => [key, translation.trim()]))
    : undefined;
  return id && name ? { id, name, ...(translations && Object.keys(translations).length ? { translations } : {}) } : null;
}

function normalizeProduct(item: unknown): Product | null {
  const value = item as Partial<Product>;
  const id = typeof value.id === 'string' ? value.id.trim() : '';
  const name = typeof value.name === 'string' ? value.name.trim() : '';
  const brief = typeof value.brief === 'string' ? value.brief.trim() : '';
  const briefTranslations = value.briefTranslations && typeof value.briefTranslations === 'object'
    ? Object.fromEntries(Object.entries(value.briefTranslations)
      .filter((entry): entry is [string, string] => typeof entry[1] === 'string' && Boolean(entry[1].trim()))
      .map(([key, translation]) => [key, translation.trim()]))
    : undefined;
  const price = typeof value.price === 'string' ? value.price.trim() : '';
  const category = typeof value.category === 'string' ? value.category.trim() : '';
  const images = Array.isArray(value.images)
    ? value.images.filter((image): image is string => typeof image === 'string' && Boolean(image.trim())).map((image) => image.trim())
    : [];
  const colorOptions = Array.isArray(value.colorOptions)
    ? value.colorOptions
      .map((option, index) => ({
        name: typeof option?.name === 'string' && option.name.trim() ? option.name.trim() : `c${index + 1}`,
        thumbnail: typeof option?.thumbnail === 'string' ? option.thumbnail.trim() : '',
      }))
      .filter((option) => option.name && option.thumbnail)
    : [];

  if (!id || !name || !category) {
    return null;
  }

  return {
    id,
    name,
    brief,
    ...(briefTranslations && Object.keys(briefTranslations).length ? { briefTranslations } : {}),
    price,
    category,
    inStock: Boolean(value.inStock),
    featured: Boolean(value.featured),
    images,
    colorOptions,
  };
}

export function normalizeDatabase(input: unknown): Database {
  const value = input as Partial<Database>;
  const categoryIds = new Set<string>();
  const productIds = new Set<string>();
  const categories = Array.isArray(value.categories)
    ? value.categories
      .map(normalizeCategory)
      .filter((item): item is Category => Boolean(item && !categoryIds.has(item.id) && categoryIds.add(item.id)))
    : [];
  const products = Array.isArray(value.products)
    ? value.products
      .map(normalizeProduct)
      .filter((item): item is Product => Boolean(item && !productIds.has(item.id) && productIds.add(item.id)))
    : [];

  return {
    categories: categories.length ? categories : [...seedDatabase.categories],
    products,
  };
}

async function ensureSchema() {
  if (!pool) {
    return;
  }
  schemaReady ??= (async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        translations JSONB NOT NULL DEFAULT '{}'::jsonb,
        sort_order INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        brief TEXT NOT NULL DEFAULT '',
        brief_translations JSONB NOT NULL DEFAULT '{}'::jsonb,
        price TEXT NOT NULL DEFAULT '',
        category TEXT NOT NULL,
        in_stock BOOLEAN NOT NULL DEFAULT true,
        featured BOOLEAN NOT NULL DEFAULT false,
        images JSONB NOT NULL DEFAULT '[]'::jsonb,
        color_options JSONB NOT NULL DEFAULT '[]'::jsonb,
        sort_order INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    await pool.query("ALTER TABLE categories ADD COLUMN IF NOT EXISTS translations JSONB NOT NULL DEFAULT '{}'::jsonb");
    await pool.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS brief_translations JSONB NOT NULL DEFAULT '{}'::jsonb");
    await pool.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS color_options JSONB NOT NULL DEFAULT '[]'::jsonb");
  })();
  await schemaReady;
}

async function readPostgresDatabase(): Promise<Database> {
  if (!pool) {
    throw new Error('PostgreSQL pool is not configured');
  }
  await ensureSchema();

  const [categoriesResult, productsResult] = await Promise.all([
    pool.query('SELECT id, name, translations FROM categories ORDER BY sort_order ASC, id ASC'),
    pool.query(`
      SELECT id, name, brief, brief_translations, price, category, in_stock, featured, images, color_options
      FROM products
      ORDER BY sort_order ASC, id ASC
    `),
  ]);

  const database = normalizeDatabase({
    categories: categoriesResult.rows.map((row) => ({
      id: row.id,
      name: row.name,
      translations: row.translations,
    })),
    products: productsResult.rows.map((row) => ({
      id: row.id,
      name: row.name,
      brief: row.brief,
      briefTranslations: row.brief_translations,
      price: row.price,
      category: row.category,
      inStock: row.in_stock,
      featured: row.featured,
      images: row.images,
      colorOptions: row.color_options,
    })),
  });

  if (!categoriesResult.rowCount && !productsResult.rowCount) {
    await writePostgresDatabase(seedDatabase);
    return seedDatabase;
  }

  return database;
}

async function writePostgresDatabase(database: Database): Promise<void> {
  if (!pool) {
    throw new Error('PostgreSQL pool is not configured');
  }
  await ensureSchema();

  const normalized = normalizeDatabase(database);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('TRUNCATE products, categories');

    for (const [index, category] of normalized.categories.entries()) {
      await client.query(
        'INSERT INTO categories (id, name, translations, sort_order) VALUES ($1, $2, $3::jsonb, $4)',
        [category.id, category.name, JSON.stringify(category.translations || {}), index],
      );
    }

    for (const [index, product] of normalized.products.entries()) {
      await client.query(
        `INSERT INTO products
          (id, name, brief, brief_translations, price, category, in_stock, featured, images, color_options, sort_order)
         VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8, $9::jsonb, $10::jsonb, $11)`,
        [
          product.id,
          product.name,
          product.brief,
          JSON.stringify(product.briefTranslations || {}),
          product.price,
          product.category,
          product.inStock,
          product.featured,
          JSON.stringify(product.images),
          JSON.stringify(product.colorOptions),
          index,
        ],
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function readDatabase(): Promise<Database> {
  if (pool) {
    return readPostgresDatabase();
  }

  try {
    const raw = await readFile(dataFile, 'utf-8');
    return normalizeDatabase(JSON.parse(raw));
  } catch {
    await writeDatabase(seedDatabase);
    return seedDatabase;
  }
}

export async function writeDatabase(database: Database): Promise<void> {
  if (pool) {
    writeQueue = writeQueue.then(() => writePostgresDatabase(database));
    await writeQueue;
    return;
  }

  const normalized = normalizeDatabase(database);
  writeQueue = writeQueue.then(async () => {
    await mkdir(dataDir, { recursive: true });
    await writeFile(dataFile, `${JSON.stringify(normalized, null, 2)}\n`, 'utf-8');
  });
  await writeQueue;
}

export async function updateDatabase(updater: (database: Database) => Database | Promise<Database>) {
  const current = await readDatabase();
  const next = await updater(current);
  await writeDatabase(next);
  return normalizeDatabase(next);
}
