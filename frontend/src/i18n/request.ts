// src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import { isLocale } from './utils';
import type { Locale } from './locales';

// Static imports for translation messages
import enMessages from '@/messages/en.json';
import frMessages from '@/messages/fr.json';

const messagesMap: Record<Locale, Record<string, any>> = {
  en: enMessages,
  fr: frMessages,
  // Add other locales here as needed
};

export default getRequestConfig(async ({ requestLocale }) => {
  let locale: Locale;

  const resolvedLocale = await requestLocale;

  // Use the type guard to ensure requestLocale is a valid Locale
  if (typeof resolvedLocale === 'string' && isLocale(resolvedLocale)) {
    locale = resolvedLocale;
  } else {
    locale = routing.defaultLocale;
  }

  // const messages = messagesMap[locale];

  return {
    locale,
    // messages,
  };
});
