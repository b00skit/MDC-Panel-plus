"use client";

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { locales, type Locale } from '@/lib/i18n/config';
import { useI18n } from '@/lib/i18n/client';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function LanguageSwitcher() {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleChange = (value: string) => {
    const nextLocale = locales.find((item) => item === value) as Locale | undefined;
    if (!nextLocale || nextLocale === locale) {
      return;
    }

    document.cookie = `locale=${nextLocale};path=/;max-age=${60 * 60 * 24 * 365}`;
    startTransition(() => {
      router.refresh();
    });
  };

  const getLanguageName = (l: Locale) => {
    switch (l) {
        case 'en': return t('common.language.english');
        case 'es': return t('common.language.spanish');
        case 'sl': return t('common.language.slovenian');
        default: return l;
    }
  }

  return (
    <div className="space-y-1">
      <Label htmlFor="language" className="text-xs font-medium text-muted-foreground">
        {t('common.language.label')}
      </Label>
      <Select value={locale} onValueChange={handleChange} disabled={isPending}>
        <SelectTrigger id="language" className="h-8 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          {locales.map((availableLocale) => (
            <SelectItem key={availableLocale} value={availableLocale}>
              {getLanguageName(availableLocale)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
