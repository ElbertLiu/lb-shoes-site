import { ref } from 'vue';
import type { Category } from '../types';
import { categories as defaultCategories } from '../data';

import { API_BASE_URL } from '../utils/api';
import { getAuthHeaders, logout } from './auth';

const categories = ref<Category[]>([...defaultCategories]);
let lastSerialized = JSON.stringify(categories.value);

function normalize(value: unknown): Category[] {
  if (!Array.isArray(value)) {
    return [...defaultCategories];
  }

  const seen = new Set<string>();
  return value
    .map((item) => ({
      id: typeof item?.id === 'string' ? item.id.trim() : '',
      name: typeof item?.name === 'string' ? item.name.trim() : '',
      translations: item && typeof item === 'object' && (item as { translations?: unknown }).translations && typeof (item as { translations?: unknown }).translations === 'object'
        ? Object.fromEntries(Object.entries((item as { translations: Record<string, unknown> }).translations)
          .filter((entry): entry is [string, string] => typeof entry[1] === 'string' && Boolean(entry[1].trim()))
          .map(([key, value]) => [key, value.trim()]))
        : undefined,
    }))
    .filter((item) => item.id && item.name && !seen.has(item.id) && seen.add(item.id));
}

export async function reloadCategories() {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`);
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    const latest = normalize(await response.json());
    const serialized = JSON.stringify(latest);
    if (serialized !== lastSerialized) {
      categories.value = latest;
      lastSerialized = serialized;
    }
  } catch (error) {
    console.warn(error);
  }
}

export async function writeCategories(nextCategories: Category[]) {
  const normalized = normalize(nextCategories);
  categories.value = normalized;
  lastSerialized = JSON.stringify(normalized);

  const response = await fetch(`${API_BASE_URL}/categories`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(normalized),
  });
  if (response.status === 401) {
    logout();
  }
  if (!response.ok) {
    throw new Error('Failed to save categories');
  }
  const saved = normalize(await response.json());
  categories.value = saved;
  lastSerialized = JSON.stringify(saved);
}

void reloadCategories();

export function getCategoryName(categoryId: string) {
  return categories.value.find((category) => category.id === categoryId)?.name || categoryId;
}

export function useCategories() {
  return {
    categories,
    getCategoryName,
    reloadCategories,
    setCategories: writeCategories,
  };
}
