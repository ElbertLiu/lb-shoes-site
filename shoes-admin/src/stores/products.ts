import { ref } from 'vue';
import type { Product } from '../types';
import { products as defaultProducts } from '../data';

import { API_BASE_URL } from '../utils/api';
import { getAuthHeaders, logout } from './auth';

const products = ref<Product[]>(defaultProducts.slice(0, 20));
let lastSerialized = JSON.stringify(products.value);

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

export async function reloadProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    const latest = normalize(await response.json());
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
