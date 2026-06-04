const envApiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;

export const API_BASE_URL = envApiBaseUrl || `${window.location.protocol}//${window.location.hostname}:4000/api`;
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');
export const PRODUCT_IMAGE_FALLBACK = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80';

export function resolveMediaUrl(url?: string) {
  const value = url?.trim() || '';
  if (!value) {
    return '';
  }
  if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:')) {
    return value;
  }
  if (value.startsWith('/')) {
    return `${API_ORIGIN}${value}`;
  }
  return value;
}

export function resolveProductImage(images?: string[], index = 0) {
  const cleanImages = Array.isArray(images)
    ? images.map((image) => image.trim()).filter(Boolean)
    : [];
  const image = cleanImages[index] || cleanImages[0] || PRODUCT_IMAGE_FALLBACK;
  return resolveMediaUrl(image);
}
