import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Providers } from '@/providers';
import './globals.css';

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
  // Get locale from middleware headers
  const headersList = await headers();
  const locale = headersList.get('x-locale') || 'de';

  // Load messages for the locale
  const messages = (await import(`@/i18n/messages/${locale}.json`)).default;

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
