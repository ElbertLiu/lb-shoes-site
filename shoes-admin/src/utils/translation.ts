import { type LanguageCode } from '../i18n';
import { API_BASE_URL } from './api';
import { getAuthHeaders } from '../stores/auth';

export function cleanTranslations(value?: Partial<Record<string, string>>) {
  return Object.fromEntries(Object.entries(value || {})
    .filter((entry): entry is [string, string] => typeof entry[1] === 'string' && Boolean(entry[1].trim()))
    .map(([code, text]) => [code, text.trim()]));
}

export async function translateText(text: string, target: LanguageCode) {
  const response = await fetch(`${API_BASE_URL}/translations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ text, source: 'zh', target }),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(payload.error || 'Translation request failed');
  }
  const payload = await response.json() as { translatedText?: unknown };
  const translated = payload.translatedText;
  return typeof translated === 'string' ? translated.trim() : '';
}
