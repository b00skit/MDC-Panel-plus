import type { Dictionary } from './dictionaries';

export type TranslationValues = Record<string, string | number>;

export function getDictionaryValue(
  dictionary: Dictionary,
  key: string,
): unknown {
  return key.split('.').reduce<unknown>((result, part) => {
    if (Array.isArray(result)) {
      const index = Number(part);
      return Number.isInteger(index) ? result[index] : undefined;
    }

    if (typeof result === 'object' && result !== null && part in (result as Record<string, unknown>)) {
      return (result as Record<string, unknown>)[part];
    }
    return undefined;
  }, dictionary);
}

export function formatMessage(
  message: unknown,
  values?: TranslationValues,
): string {
  if (message == null) {
    return '';
  }

  const text = typeof message === 'string' ? message : String(message);

  if (!values) {
    return text;
  }

  return text.replace(/\{(.*?)\}/g, (match, token) => {
    const value = values[token.trim()];
    return value === undefined ? match : String(value);
  });
}
