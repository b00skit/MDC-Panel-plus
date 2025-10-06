import type { Locale } from './config';

type Dictionary = Record<string, unknown>;

type DictionaryLoader = () => Promise<Dictionary>;

const dictionaries: Record<Locale, DictionaryLoader> = {
  en: () => import('./dictionaries/en.json').then((module) => module.default),
  es: () => import('./dictionaries/es.json').then((module) => module.default),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const loader = dictionaries[locale];
  if (!loader) {
    return dictionaries.en();
  }
  return loader();
}

export type { Dictionary };
