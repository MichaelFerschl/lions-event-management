'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { deDE } from '@clerk/localizations';
import { NextIntlClientProvider } from 'next-intl';
import { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
  locale: string;
  messages: any;
}

// Check if Clerk is configured (client-side check)
const isClerkConfigured =
  typeof window !== 'undefined'
    ? Boolean(
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
          process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'pk_test_placeholder'
      )
    : Boolean(
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
          process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'pk_test_placeholder'
      );

export function Providers({ children, locale, messages }: ProvidersProps) {
  const content = (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );

  // Skip ClerkProvider if not configured
  if (!isClerkConfigured) {
    return content;
  }

  return (
    <ClerkProvider localization={deDE as any}>{content}</ClerkProvider>
  );
}
