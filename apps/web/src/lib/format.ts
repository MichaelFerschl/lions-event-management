/**
 * Format a date as "Mi, 15. Jan 2025"
 */
export function formatDate(date: Date | string, locale: string = 'de'): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (locale === 'en') {
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  return d.toLocaleDateString('de-DE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format a time as "19:00 Uhr" (de) or "7:00 PM" (en)
 */
export function formatTime(date: Date | string, locale: string = 'de'): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (locale === 'en') {
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  return d.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  }) + ' Uhr';
}

/**
 * Format date and time combined
 */
export function formatDateTime(
  date: Date | string,
  locale: string = 'de'
): string {
  return `${formatDate(date, locale)}, ${formatTime(date, locale)}`;
}

/**
 * Format currency as "5,00 €"
 */
export function formatCurrency(amount: number, locale: string = 'de'): string {
  if (locale === 'en') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  }

  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

/**
 * Get relative time string (e.g., "in 3 days", "vor 2 Stunden")
 */
export function getRelativeTime(
  date: Date | string,
  locale: string = 'de'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (locale === 'en') {
    if (diffDays > 0) return `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    if (diffDays < 0) return `${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    if (diffHours < 0) return `${Math.abs(diffHours)} hour${Math.abs(diffHours) > 1 ? 's' : ''} ago`;
    return 'now';
  }

  if (diffDays > 0) return `in ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`;
  if (diffDays < 0) return `vor ${Math.abs(diffDays)} Tag${Math.abs(diffDays) > 1 ? 'en' : ''}`;
  if (diffHours > 0) return `in ${diffHours} Stunde${diffHours > 1 ? 'n' : ''}`;
  if (diffHours < 0) return `vor ${Math.abs(diffHours)} Stunde${Math.abs(diffHours) > 1 ? 'n' : ''}`;
  return 'jetzt';
}
