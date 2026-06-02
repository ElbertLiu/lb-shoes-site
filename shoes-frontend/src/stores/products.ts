import { ref } from 'vue';
import type { Product } from '../types';
import { products as defaultProducts } from '../data';

import { API_BASE_URL } from '../utils/api';

const products = ref<Product[]>(defaultProducts.slice(0, 20));
let lastSerialized = JSON.stringify(products.value);
let syncTimer: number | undefined;

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
      price: typeof item?.price === 'string' ? item.price.trim() : '',
      category: typeof item?.category === 'string' ? item.category.trim() : '',
      inStock: Boolean(item?.inStock),
      featured: typeof item?.featured === 'boolean' ? item.featured : index < 20,
      images: Array.isArray(item?.images)
        ? item.images.filter((image: unknown) => typeof image === 'string' && image.trim()).map((image: string) => image.trim())
        : [],
    }))
    .filter((item) => item.id && item.name && item.category && !seen.has(item.id) && seen.add(item.id));
}

async function requestProducts() {
  const response = await fetch(`${API_BASE_URL}/products`);
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  return normalize(await response.json());
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

export function startProductSync(interval = 1200) {
  if (syncTimer || typeof window === 'undefined') {
    return;
  }
  void reloadProducts();
  syncTimer = window.setInterval(() => void reloadProducts(), interval);
  window.addEventListener('focus', () => void reloadProducts());
  document.addEventListener('visibilitychange', () => void reloadProducts());
}

export function useProducts() {
  return {
    products,
    reloadProducts,
    setProducts: writeProducts,
    startProductSync,
  };
}
