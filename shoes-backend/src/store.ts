import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { seedDatabase } from './seed.js';
import type { Category, Database, Product } from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '../data');
const dataFile = path.join(dataDir, 'db.json');

let writeQueue = Promise.resolve();

function normalizeCategory(item: unknown): Category | null {
  const value = item as Partial<Category>;
  const id = typeof value.id === 'string' ? value.id.trim() : '';
  const name = typeof value.name === 'string' ? value.name.trim() : '';
  return id && name ? { id, name } : null;
}

function normalizeProduct(item: unknown): Product | null {
  const value = item as Partial<Product>;
  const id = typeof value.id === 'string' ? value.id.trim() : '';
  const name = typeof value.name === 'string' ? value.name.trim() : '';
  const brief = typeof value.brief === 'string' ? value.brief.trim() : '';
  const price = typeof value.price === 'string' ? value.price.trim() : '';
  const category = typeof value.category === 'string' ? value.category.trim() : '';
  const images = Array.isArray(value.images)
    ? value.images.filter((image): image is string => typeof image === 'string' && Boolean(image.trim())).map((image) => image.trim())
    : [];

  if (!id || !name || !category) {
    return null;
  }

  return {
    id,
    name,
    brief,
    price,
    category,
    inStock: Boolean(value.inStock),
    featured: Boolean(value.featured),
    images,
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

export async function readDatabase(): Promise<Database> {
  try {
    const raw = await readFile(dataFile, 'utf-8');
    return normalizeDatabase(JSON.parse(raw));
  } catch {
    await writeDatabase(seedDatabase);
    return seedDatabase;
  }
}

export async function writeDatabase(database: Database): Promise<void> {
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
