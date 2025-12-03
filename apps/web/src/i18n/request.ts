import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';
import { defaultLocale, locales, type Locale } from './config';

// Static imports for messages - required for Vercel production
import de from './messages/de.json';
import en from './messages/en.json';

const messagesMap: Record<Locale, typeof de> = {
  de,
  en,
};

export default getRequestConfig(async () => {
  const headersList = await headers();
  const localeHeader = headersList.get('x-locale') || defaultLocale;

  const locale = locales.includes(localeHeader as Locale)
    ? (localeHeader as Locale)
    : defaultLocale;

  return {
    locale,
    messages: messagesMap[locale],
  };
});
