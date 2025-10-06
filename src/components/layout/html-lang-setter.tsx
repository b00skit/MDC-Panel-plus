'use client';

import { useEffect } from 'react';
import { useLocale } from '@/i18n/translation-context';

export function HtmlLangSetter() {
  const locale = useLocale();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
