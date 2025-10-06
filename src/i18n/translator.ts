import type { Dictionary } from './get-dictionary';

export type TranslationValues = Record<string, string | number>;

function formatString(template: string, values?: TranslationValues) {
  if (!values) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const replacement = values[key];
    return replacement !== undefined ? String(replacement) : match;
  });
}

export function getFromDictionary<T = unknown>(dictionary: Dictionary, path: string): T {
  const segments = path.split('.');
  let current: any = dictionary;

  for (const segment of segments) {
    if (current && typeof current === 'object' && segment in current) {
      current = current[segment];
    } else {
      throw new Error(`Missing translation key "${path}"`);
    }
  }

  return current as T;
}

export function createTranslator(dictionary: Dictionary) {
  return (path: string, values?: TranslationValues) => {
    const raw = getFromDictionary(dictionary, path);
    if (typeof raw !== 'string') {
      throw new Error(`Translation for "${path}" is not a string.`);
    }
    return formatString(raw, values);
  };
}
