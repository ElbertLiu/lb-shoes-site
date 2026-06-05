import { ref } from 'vue';
import type { Product } from '../types';
import { products as defaultProducts } from '../data';

import { API_BASE_URL } from '../utils/api';

const products = ref<Product[]>(defaultProducts.slice(0, 20));
let lastSerialized = JSON.stringify(products.value);

interface ProductsPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}

export interface ProductsPage {
  items: Product[];
  pagination: ProductsPagination;
}

export interface ProductsQuery {
  category?: string;
  search?: string;
  featured?: boolean;
  inStock?: boolean;
  page?: number;
  pageSize?: number;
}

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

function readPagination(value: unknown, items: Product[], query: ProductsQuery): ProductsPagination {
  const fallback = {
    page: query.page || 1,
    pageSize: query.pageSize || items.length || 20,
    total: items.length,
    totalPages: items.length ? 1 : 0,
    hasPrevPage: false,
    hasNextPage: false,
  };
  if (!value || typeof value !== 'object') {
    return fallback;
  }
  const pagination = (value as { pagination?: Partial<ProductsPagination> }).pagination;
  if (!pagination) {
    return fallback;
  }
  return {
    page: typeof pagination.page === 'number' ? pagination.page : fallback.page,
    pageSize: typeof pagination.pageSize === 'number' ? pagination.pageSize : fallback.pageSize,
    total: typeof pagination.total === 'number' ? pagination.total : fallback.total,
    totalPages: typeof pagination.totalPages === 'number' ? pagination.totalPages : fallback.totalPages,
    hasPrevPage: Boolean(pagination.hasPrevPage),
    hasNextPage: Boolean(pagination.hasNextPage),
  };
}

function cacheProducts(nextItems: Product[]) {
  const byId = new Map(products.value.map((product) => [product.id, product]));
  nextItems.forEach((product) => byId.set(product.id, product));
  const latest = Array.from(byId.values());
  const serialized = JSON.stringify(latest);
  if (serialized !== lastSerialized) {
    products.value = latest;
    lastSerialized = serialized;
  }
}

function buildProductsUrl(query: ProductsQuery = {}) {
  const params = new URLSearchParams();
  if (query.category) {
    params.set('category', query.category);
  }
  if (query.search) {
    params.set('search', query.search);
  }
  if (typeof query.featured === 'boolean') {
    params.set('featured', String(query.featured));
  }
  if (typeof query.inStock === 'boolean') {
    params.set('inStock', String(query.inStock));
  }
  if (query.page) {
    params.set('page', String(query.page));
  }
  if (query.pageSize) {
    params.set('pageSize', String(query.pageSize));
  }
  const suffix = params.toString();
  return `${API_BASE_URL}/products${suffix ? `?${suffix}` : ''}`;
}

export async function fetchProductsPage(query: ProductsQuery = {}): Promise<ProductsPage> {
  const response = await fetch(buildProductsUrl(query));
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  const payload = await response.json();
  const items = readItems(payload);
  cacheProducts(items);
  return {
    items,
    pagination: readPagination(payload, items, query),
  };
}

export async function fetchProductById(id: string): Promise<Product | undefined> {
  const cached = products.value.find((product) => product.id === id);
  if (cached) {
    return cached;
  }
  const response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(id)}`);
  if (!response.ok) {
    return undefined;
  }
  const [product] = normalize([await response.json()]);
  if (product) {
    cacheProducts([product]);
  }
  return product;
}

async function requestProducts() {
  return (await fetchProductsPage({ page: 1, pageSize: 20 })).items;
}

export async function reloadProducts() {
  try {
    const latest = await requestProducts();
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(normalized),
  });
  if (!response.ok) {
    throw new Error('Failed to save products');
  }
  const saved = normalize(await response.json());
  products.value = saved;
  lastSerialized = JSON.stringify(saved);
}

export function loadProducts() {
  void reloadProducts();
}

export function useProducts() {
  return {
    products,
    reloadProducts,
    setProducts: writeProducts,
    loadProducts,
    fetchProductsPage,
    fetchProductById,
  };
}
