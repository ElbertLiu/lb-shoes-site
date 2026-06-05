const supportedLanguageNames: Record<string, string> = {
  zh: 'Chinese',
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  ar: 'Arabic',
  ru: 'Russian',
  ja: 'Japanese',
  ko: 'Korean',
};

export function isSupportedTranslationLanguage(value: string) {
  return Object.prototype.hasOwnProperty.call(supportedLanguageNames, value);
}

function readTranslatedText(payload: unknown) {
  if (!payload || typeof payload !== 'object') {
    return '';
  }

  const value = payload as {
    translatedText?: unknown;
    translation?: unknown;
    text?: unknown;
    output_text?: unknown;
    output?: Array<{ content?: Array<{ text?: unknown }> }>;
  };
  const direct = value.translatedText || value.translation || value.text || value.output_text;
  if (typeof direct === 'string') {
    return direct.trim();
  }

  const outputText = value.output
    ?.flatMap((item) => item.content || [])
    .map((item) => item.text)
    .find((text): text is string => typeof text === 'string' && Boolean(text.trim()));
  return outputText?.trim() || '';
}

async function translateWithOpenAI(text: string, source: string, target: string) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return '';
  }

  const targetName = supportedLanguageNames[target] || target;
  const sourceName = supportedLanguageNames[source] || source;
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_TRANSLATION_MODEL?.trim() || 'gpt-4o-mini',
      instructions: [
        'Translate ecommerce shoe category names and product descriptions.',
        `Translate from ${sourceName} to ${targetName}.`,
        'Return only the translated text. Do not add explanations, quotes, labels, or markdown.',
      ].join(' '),
      input: text,
    }),
  });
  if (!response.ok) {
    throw Object.assign(new Error(`OpenAI translation failed: ${response.status}`), { status: response.status });
  }

  return readTranslatedText(await response.json());
}

async function translateWithConfiguredService(text: string, source: string, target: string) {
  const endpoint = process.env.TRANSLATION_API_URL?.trim();
  if (!endpoint) {
    return '';
  }

  const apiKey = process.env.TRANSLATION_API_KEY?.trim();
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({
      text,
      q: text,
      source,
      target,
      format: 'text',
      api_key: apiKey || undefined,
    }),
  });
  if (!response.ok) {
    throw Object.assign(new Error(`Translation service failed: ${response.status}`), { status: response.status });
  }

  return readTranslatedText(await response.json());
}

export async function translateText(text: string, target: string, source = 'zh') {
  const sourceText = text.trim();
  const targetLanguage = target.trim().toLowerCase();
  const sourceLanguage = source.trim().toLowerCase() || 'zh';

  if (!sourceText || !isSupportedTranslationLanguage(targetLanguage)) {
    return '';
  }

  const translated = await translateWithOpenAI(sourceText, sourceLanguage, targetLanguage)
    || await translateWithConfiguredService(sourceText, sourceLanguage, targetLanguage);
  return translated.trim();
}
