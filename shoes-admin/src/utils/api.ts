const envApiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;

export const API_BASE_URL = envApiBaseUrl || `${window.location.protocol}//${window.location.hostname}:4000/api`;
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

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
