import { translations, type LanguageCode } from '../i18n';
import type { Product } from '../types';

const generatedNameTokens = [
  '2026新款',
  '2026 New',
  'Nuevo 2026',
  'Nouveau 2026',
  'Neu 2026',
  'جديد 2026',
  'Новинка 2026',
  '2026新作',
  '2026 신제품',
];

export function getLocalizedCategoryName(categoryId: string, fallback: string, language: LanguageCode, categoryTranslations: Partial<Record<string, string>> = {}) {
  const configuredName = categoryTranslations[language]?.trim();
  if (configuredName) {
    return configuredName;
  }

  const builtInTranslations = translations[language].categories as Record<string, string>;
  return builtInTranslations[categoryId] || fallback || categoryId;
}

function getCategoryAliases(categoryId: string) {
  return Object.values(translations)
    .map((translation) => (translation.categories as Record<string, string>)[categoryId])
    .filter((name): name is string => Boolean(name));
}

function stripGeneratedProductName(name: string, categoryId: string) {
  let result = name.trim();
  let matchedGeneratedToken = false;

  for (const token of generatedNameTokens) {
    if (result.toLocaleLowerCase().startsWith(token.toLocaleLowerCase())) {
      result = result.slice(token.length).trim();
      matchedGeneratedToken = true;
      break;
    }
  }

  const aliases = [categoryId, ...getCategoryAliases(categoryId)];
  for (const alias of aliases) {
    if (result.toLocaleLowerCase().startsWith(alias.toLocaleLowerCase())) {
      result = result.slice(alias.length).trim();
      matchedGeneratedToken = true;
      break;
    }
  }

  return matchedGeneratedToken && result ? result : '';
}

export function getProductTitle(product: Product, categoryName: string, language: LanguageCode) {
  const name = product.name.trim();
  const style = stripGeneratedProductName(name, product.category);
  if (style) {
    const template = translations[language].products.newProduct;
    return template.replace(/{cat}/g, categoryName).replace(/{style}/g, style);
  }
  return name || product.id;
}

export function getProductDescription(product: Product, language?: LanguageCode) {
  const translatedBrief = language ? product.briefTranslations?.[language]?.trim() : '';
  return translatedBrief || product.brief.trim();
}

export function getProductCardImage(product: Product, colorIndex?: number) {
  return getProductCardGalleryImages(product)[colorIndex || 0] || '';
}

export function getProductCardGalleryImages(product: Product) {
  const seen = new Set<string>();
  return [
    ...product.images.map((image) => image.trim()).filter(Boolean),
    ...product.colorOptions.map((color) => color.thumbnail.trim()).filter(Boolean),
  ].filter((image) => !seen.has(image) && seen.add(image));
}

export function formatProductPrice(price: string) {
  const value = price.trim();
  return value.startsWith('$') ? value : `$${value}`;
}
