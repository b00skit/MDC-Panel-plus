import type { Locale } from './config';

const dictionaries = {
  en: () => import('./dictionaries/en').then((module) => module.default),
  es: () => import('./dictionaries/es').then((module) => module.default),
};

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)[Locale]>>;

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const loader = dictionaries[locale];
  if (!loader) {
    throw new Error(`No dictionary found for locale "${locale}"`);
  }
  return loader();
}
