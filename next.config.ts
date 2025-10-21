import { readdirSync } from 'node:fs';
import path from 'node:path';
import type { NextConfig } from 'next';

const defaultLocale = 'en';

function resolveLocales(): string[] {
  try {
    const localesDirectory = path.join(process.cwd(), 'data', 'i18n');
    const localeFiles = readdirSync(localesDirectory, { withFileTypes: true });
    const locales = localeFiles
      .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
      .map((entry) => entry.name.replace(/\.json$/u, ''));

    const withDefault = locales.includes(defaultLocale)
      ? locales
      : [defaultLocale, ...locales];

    return Array.from(new Set(withDefault));
  } catch (error) {
    console.warn('Unable to resolve locales for Next.js configuration, falling back to default locale.', error);
    return [defaultLocale];
  }
}

const locales = resolveLocales();

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    NEXT_PUBLIC_I18N_LOCALES: JSON.stringify(locales),
  },
  i18n: {
    locales,
    defaultLocale,
  },
};

export default nextConfig;
