import { ref } from 'vue';
import type { Product } from '../types';
import { products as defaultProducts } from '../data';

import { API_BASE_URL } from '../utils/api';
import { getAuthHeaders, logout } from './auth';

const products = ref<Product[]>(defaultProducts.slice(0, 20));
let lastSerialized = JSON.stringify(products.value);
const ADMIN_PRODUCTS_PAGE_SIZE = 100;

function normalize(value: unknown): Product[] {
  if (!Array.isArray(value)) {
    return defaultProducts.slice(0, 20);
  }

  const seen = new Set<string>();
  return value
    .map((item, index) => ({
      id: typeof item?.id === 'string' ? item.id.trim() : '',
      name: typeof item?.name === 'string' ? item.name.trim() : '',
      brief: typeof item?.brief === 'string' ? item.brief.trim() : '',
      briefTranslations: item && typeof item === 'object' && (item as { briefTranslations?: unknown }).briefTranslations && typeof (item as { briefTranslations?: unknown }).briefTranslations === 'object'
        ? Object.fromEntries(Object.entries((item as { briefTranslations: Record<string, unknown> }).briefTranslations)
          .filter((entry): entry is [string, string] => typeof entry[1] === 'string' && Boolean(entry[1].trim()))
          .map(([key, value]) => [key, value.trim()]))
        : undefined,
      price: typeof item?.price === 'string' ? item.price.trim() : '',
      category: typeof item?.category === 'string' ? item.category.trim() : '',
      inStock: Boolean(item?.inStock),
      featured: typeof item?.featured === 'boolean' ? item.featured : index < 20,
      images: Array.isArray(item?.images)
        ? item.images.filter((image: unknown) => typeof image === 'string' && image.trim()).map((image: string) => image.trim())
        : [],
      colorOptions: Array.isArray(item?.colorOptions)
        ? item.colorOptions
          .map((option: unknown, index: number) => ({
            name: typeof (option as { name?: unknown })?.name === 'string' && (option as { name: string }).name.trim() ? (option as { name: string }).name.trim() : `c${index + 1}`,
            thumbnail: typeof (option as { thumbnail?: unknown })?.thumbnail === 'string' ? (option as { thumbnail: string }).thumbnail.trim() : '',
          }))
          .filter((option) => option.name && option.thumbnail)
        : [],
    }))
    .filter((item) => item.id && item.name && item.category && !seen.has(item.id) && seen.add(item.id));
}

function readItems(value: unknown): Product[] {
  if (Array.isArray(value)) {
    return normalize(value);
  }
  if (value && typeof value === 'object' && Array.isArray((value as { items?: unknown }).items)) {
    return normalize((value as { items: unknown }).items);
  }
  return defaultProducts.slice(0, 20);
}

function hasNextPage(value: unknown) {
  return Boolean(value && typeof value === 'object' && (value as { pagination?: { hasNextPage?: boolean } }).pagination?.hasNextPage);
}

async function requestProductsPage(page: number) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(ADMIN_PRODUCTS_PAGE_SIZE),
  });
  const response = await fetch(`${API_BASE_URL}/products?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  const payload = await response.json();
  return {
    items: readItems(payload),
    hasNext: hasNextPage(payload),
  };
}

async function requestAllProducts() {
  const items: Product[] = [];
  for (let page = 1; page <= 1000; page += 1) {
    const result = await requestProductsPage(page);
    items.push(...result.items);
    if (!result.hasNext) {
      break;
    }
  }
  return normalize(items);
}

export async function reloadProducts() {
  try {
    const latest = await requestAllProducts();
    const serialized = JSON.stringify(latest);
    if (serialized !== lastSerialized) {
      products.value = latest;
      lastSerialized = serialized;
    }
  } catch (error) {
    console.warn(error);
  }
}

export async function writeProducts(nextProducts: Product[]) {
  const normalized = normalize(nextProducts);
  products.value = normalized;
  lastSerialized = JSON.stringify(normalized);

  const response = await fetch(`${API_BASE_URL}/products`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(normalized),
  });
  if (response.status === 401) {
    logout();
  }
  if (!response.ok) {
    throw new Error('Failed to save products');
  }
  const saved = normalize(await response.json());
  products.value = saved;
  lastSerialized = JSON.stringify(saved);
}

void reloadProducts();

export function useProducts() {
  return {
    products,
    reloadProducts,
    setProducts: writeProducts,
  };
}
