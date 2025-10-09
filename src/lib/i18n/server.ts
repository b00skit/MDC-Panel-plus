import { cookies, headers } from 'next/headers';
import Negotiator from 'negotiator';
import { defaultLocale, isLocale, type Locale } from './config';
import { getDictionary } from './dictionaries';
import { formatMessage, getDictionaryValue, type TranslationValues } from './utils';
import configData from '../../../data/config.json';


async function getConfiguredLocale(): Promise<Locale | null> {
  const configuredLang = configData.SITE_LANGUAGE;
  if (isLocale(configuredLang)) {
    return configuredLang;
  }
  return null;
}

export async function resolveRequestLocale(): Promise<Locale> {
  const configuredLocale = await getConfiguredLocale();
  if (configuredLocale) {
    return configuredLocale;
  }

  const cookieLocale = (await cookies()).get('locale')?.value;
  if (isLocale(cookieLocale)) {
    return cookieLocale;
  }

  const acceptLanguage = (await headers()).get('accept-language');
  if (acceptLanguage) {
    const negotiator = new Negotiator({ headers: { 'accept-language': acceptLanguage } });
    const languages = negotiator.languages();
    const matched = languages.find((language : any) => {
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
