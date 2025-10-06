import { cookies, headers } from 'next/headers';
import Negotiator from 'negotiator';
import path from 'path';
import { promises as fs } from 'fs';
import { defaultLocale, isLocale, type Locale } from './config';
import { getDictionary } from './dictionaries';
import { formatMessage, getDictionaryValue, type TranslationValues } from './utils';

let cachedConfigLocale: Locale | null | undefined;

async function getConfiguredLocale(): Promise<Locale | null> {
  if (cachedConfigLocale !== undefined) {
    return cachedConfigLocale;
  }

  try {
    const file = await fs.readFile(
      path.join(process.cwd(), 'data/config.json'),
      'utf8'
    );
    const config = JSON.parse(file) as { SITE_LANGUAGE?: string };
    if (isLocale(config.SITE_LANGUAGE)) {
      cachedConfigLocale = config.SITE_LANGUAGE;
      return cachedConfigLocale;
    }
  } catch (error) {
    // Ignore errors and fall back to existing locale resolution
  }

  cachedConfigLocale = null;
  return cachedConfigLocale;
}

export async function resolveRequestLocale(): Promise<Locale> {
  const configuredLocale = await getConfiguredLocale();
  if (configuredLocale) {
    return configuredLocale;
  }

  const cookieLocale = cookies().get('locale')?.value;
  if (isLocale(cookieLocale)) {
    return cookieLocale;
  }

  const acceptLanguage = headers().get('accept-language');
  if (acceptLanguage) {
    const negotiator = new Negotiator({ headers: { 'accept-language': acceptLanguage } });
    const languages = negotiator.languages();
    const matched = languages.find((language) => {
      const code = language.split('-')[0];
      return isLocale(code);
    });
    if (matched) {
      const code = matched.split('-')[0];
      if (isLocale(code)) {
        return code;
      }
    }
  }

  return defaultLocale;
}

export async function getTranslations(namespace?: string) {
  const locale = await resolveRequestLocale();
  const dictionary = await getDictionary(locale);

  const translate = (
    key: string,
    values?: TranslationValues,
    fallback?: string,
  ): string => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    const message = getDictionaryValue(dictionary, fullKey);
    if (message === undefined) {
      return fallback ?? key;
    }
    return formatMessage(message, values);
  };

  return { locale, t: translate, dictionary };
}

export async function getScopedDictionary(namespace?: string) {
  const { dictionary } = await getTranslations(namespace);
  return dictionary;
}
