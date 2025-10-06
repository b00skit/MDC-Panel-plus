'use client';

import { createContext, useContext, useMemo } from 'react';
import type { Locale } from './config';
import type { Dictionary } from './get-dictionary';
import { createTranslator, type TranslationValues } from './translator';

export type Translator = ReturnType<typeof createTranslator>;

type TranslationContextValue = {
  locale: Locale;
  dictionary: Dictionary;
  t: Translator;
};

const TranslationContext = createContext<TranslationContextValue | null>(null);

export function TranslationProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: React.ReactNode;
}) {
  const value = useMemo<TranslationContextValue>(() => ({
    locale,
    dictionary,
    t: createTranslator(dictionary),
  }), [locale, dictionary]);

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslationContext() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslations must be used within a TranslationProvider.');
  }
  return context;
}

export function useTranslations(namespace?: string) {
  const { t } = useTranslationContext();

  if (!namespace) {
    return t;
  }

  return (key: string, values?: TranslationValues) => t(`${namespace}.${key}`, values);
}

export function useLocale() {
  return useTranslationContext().locale;
}
