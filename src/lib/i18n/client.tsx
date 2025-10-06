'use client';

import { createContext, useContext, useMemo } from 'react';
import type { Locale } from './config';
import type { Dictionary } from './dictionaries';
import { formatMessage, getDictionaryValue, type TranslationValues } from './utils';

type TranslateFn = (key: string, values?: TranslationValues, fallback?: string) => string;

type I18nContextValue = {
  locale: Locale;
  messages: Dictionary;
  t: TranslateFn;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  children,
  locale,
  messages,
}: {
  children: React.ReactNode;
  locale: Locale;
  messages: Dictionary;
}) {
  const value = useMemo<I18nContextValue>(() => {
    const translate: TranslateFn = (key, values, fallback) => {
      const message = getDictionaryValue(messages, key);
      if (message === undefined) {
        return fallback ?? key;
      }
      return formatMessage(message, values);
    };

    return { locale, messages, t: translate };
  }, [locale, messages]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

export function useScopedI18n(namespace: string) {
  const { t } = useI18n();
  return (key: string, values?: TranslationValues, fallback?: string) =>
    t(`${namespace}.${key}`, values, fallback);
}
