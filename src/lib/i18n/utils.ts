import type { Dictionary } from './dictionaries';

export type TranslationValues = Record<string, string | number>;

export function getDictionaryValue(
  dictionary: Dictionary,
  key: string,
): unknown {
  return key.split('.').reduce<unknown>((result, part) => {
    if (Array.isArray(result)) {
      const index = Number(part);
      return Number.isInteger(index) ? result[index] : undefined;
    }

    if (typeof result === 'object' && result !== null && part in (result as Record<string, unknown>)) {
      return (result as Record<string, unknown>)[part];
    }
    return undefined;
  }, dictionary);
}

export function formatMessage(
  message: unknown,
  values?: TranslationValues,
): string {
  if (message == null) {
    return '';
  }

  if (typeof message === 'object' && !Array.isArray(message)) {
    const record = message as Record<string, unknown>;

    if (values && 'count' in values) {
      const count = Number(values.count);

      if (!Number.isNaN(count)) {
        const pluralRules = new Intl.PluralRules();
        const rule = pluralRules.select(count);

        const candidates = [
          rule,
          count === 0 ? 'zero' : undefined,
          count === 1 ? 'one' : undefined,
          count === 2 ? 'two' : undefined,
          'other',
        ].filter((candidate): candidate is string => Boolean(candidate));

        for (const key of candidates) {
          if (key in record) {
            return formatMessage(record[key], values);
          }
        }
      }
    }

    if ('default' in record) {
      return formatMessage(record.default, values);
    }
  }

  const text = typeof message === 'string' ? message : String(message);

  if (!values) {
    return text;
  }

  return text.replace(/\{(.*?)\}/g, (match, token) => {
    const value = values[token.trim()];
    return value === undefined ? match : String(value);
  });
}