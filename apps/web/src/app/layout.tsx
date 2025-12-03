import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Providers } from '@/providers';
import { locales, defaultLocale, type Locale } from '@/i18n/config';
import './globals.css';

// Static imports for messages - required for Vercel production
import de from '@/i18n/messages/de.json';
import en from '@/i18n/messages/en.json';

const messagesMap: Record<Locale, typeof de> = {
  de,
  en,
};

export const metadata: Metadata = {
  title: 'Lions Event Management Hub',
  description:
    'Event Management System für Lions Clubs - Einer Welt in Not helfen',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const localeHeader = headersList.get('x-locale') || defaultLocale;

  const locale = locales.includes(localeHeader as Locale)
    ? (localeHeader as Locale)
    : defaultLocale;

  const messages = messagesMap[locale];

  return (
    <html lang={locale}>
      <body className="antialiased">
        <Providers locale={locale} messages={messages}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
