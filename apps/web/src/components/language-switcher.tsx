'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { locales, localeNames, type Locale } from '@/i18n/config';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = (newLocale: Locale) => {
    // Set cookie for locale preference
    document.cookie = `locale=${newLocale};path=/;max-age=31536000;samesite=lax`;

    // Refresh to apply new locale
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="relative inline-flex items-center">
      <select
        value={locale}
        onChange={(e) => handleLocaleChange(e.target.value as Locale)}
        disabled={isPending}
        className="appearance-none bg-transparent text-sm text-gray-600 hover:text-gray-900 cursor-pointer pr-6 py-1 focus:outline-none disabled:opacity-50"
        aria-label="Select language"
      >
        {locales.map((loc) => (
          <option key={loc} value={loc}>
            {localeNames[loc]}
          </option>
        ))}
      </select>
      <svg
        className="absolute right-0 w-4 h-4 text-gray-400 pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </div>
  );
}

export function LanguageSwitcherCompact() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const toggleLocale = () => {
    const newLocale = locale === 'de' ? 'en' : 'de';
    document.cookie = `locale=${newLocale};path=/;max-age=31536000;samesite=lax`;

    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <button
      onClick={toggleLocale}
      disabled={isPending}
      className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100 transition-colors disabled:opacity-50"
      aria-label="Toggle language"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
        />
      </svg>
      <span className="font-medium">{locale.toUpperCase()}</span>
    </button>
  );
}
