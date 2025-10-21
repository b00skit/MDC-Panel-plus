export const defaultLocale = 'en' as const;

function parseLocales(value: string | undefined | null): string[] | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
      return parsed;
    }
  } catch (error) {
    console.warn('Unable to parse NEXT_PUBLIC_I18N_LOCALES, falling back to default locale.', error);
  }

  return null;
}

function ensureDefaultLocale(locales: string[]): string[] {
  if (!locales.includes(defaultLocale)) {
    return [defaultLocale, ...locales];
  }

  return locales;
}

const localesFromEnv = parseLocales(process.env.NEXT_PUBLIC_I18N_LOCALES);

if (!localesFromEnv) {
  console.warn('NEXT_PUBLIC_I18N_LOCALES is not defined, falling back to default locale.');
}

export const locales = Array.from(
  new Set(ensureDefaultLocale(localesFromEnv ?? [defaultLocale])),
);

export type Locale = (typeof locales)[number];

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && locales.includes(value as Locale);
}
