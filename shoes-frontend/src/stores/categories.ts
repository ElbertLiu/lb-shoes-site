import { ref } from 'vue';
import type { Category } from '../types';
import { categories as defaultCategories } from '../data';

import { API_BASE_URL } from '../utils/api';

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
    }))
    .filter((item) => item.id && item.name && !seen.has(item.id) && seen.add(item.id));
}

async function requestCategories() {
  const response = await fetch(`${API_BASE_URL}/categories`);
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }
  return normalize(await response.json());
}

export async function reloadCategories() {
  try {
    const latest = await requestCategories();
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(normalized),
  });
  if (!response.ok) {
    throw new Error('Failed to save categories');
  }
  const saved = normalize(await response.json());
  categories.value = saved;
  lastSerialized = JSON.stringify(saved);
}

export function loadCategories() {
  void reloadCategories();
}

export function getCategoryName(categoryId: string) {
  return categories.value.find((category) => category.id === categoryId)?.name || categoryId;
}

export function useCategories() {
  return {
    categories,
    getCategoryName,
    reloadCategories,
    setCategories: writeCategories,
    loadCategories,
  };
}
