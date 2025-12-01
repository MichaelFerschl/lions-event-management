import type { RecurringRule, PlannedEventDraft } from './types';

/**
 * Generates all dates for a recurring rule within a given date range
 */
export function generateRecurringDates(
  rule: RecurringRule,
  startDate: Date,
  endDate: Date
): Date[] {
  const dates: Date[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (rule.frequency === 'WEEKLY') {
    // Find the first occurrence of the day of week on or after start date
    const current = new Date(start);
    const currentDayOfWeek = current.getDay();
    const targetDayOfWeek = rule.dayOfWeek;

    // Move to the target day of week
    let daysToAdd = targetDayOfWeek - currentDayOfWeek;
    if (daysToAdd < 0) {
      daysToAdd += 7;
    }
    current.setDate(current.getDate() + daysToAdd);

    // Generate all weekly occurrences
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 7);
    }
  } else if (rule.frequency === 'MONTHLY') {
    // Start from the first day of the start month
    const current = new Date(start.getFullYear(), start.getMonth(), 1);

    while (current <= end) {
      const targetDate = findDayInMonth(
        current.getFullYear(),
        current.getMonth(),
        rule.dayOfWeek,
        rule.weekOfMonth
      );

      // Only add if the date is within our range
      if (targetDate && targetDate >= start && targetDate <= end) {
        dates.push(targetDate);
      }

      // Move to next month
      current.setMonth(current.getMonth() + 1);
    }
  }

  return dates;
}

/**
 * Find a specific day of week in a specific week of a month
 * weekOfMonth: 1 = first, 2 = second, 3 = third, 4 = fourth, -1 = last
 */
function findDayInMonth(
  year: number,
  month: number,
  dayOfWeek: number,
  weekOfMonth: number | null
): Date | null {
  if (weekOfMonth === null) {
    // If no week specified, return first occurrence
    weekOfMonth = 1;
  }

  if (weekOfMonth === -1) {
    // Last occurrence of the day in the month
    // Start from the last day of the month and go backwards
    const lastDay = new Date(year, month + 1, 0);
    const current = new Date(lastDay);

    while (current.getMonth() === month) {
      if (current.getDay() === dayOfWeek) {
        return new Date(current);
      }
      current.setDate(current.getDate() - 1);
    }
    return null;
  }

  // Find nth occurrence of the day in the month
  let count = 0;

  for (let day = 1; day <= 31; day++) {
    const current = new Date(year, month, day);
    if (current.getMonth() !== month) break; // Went to next month

    if (current.getDay() === dayOfWeek) {
      count++;
      if (count === weekOfMonth) {
        return current;
      }
    }
  }

  return null;
}

/**
 * Generate planned events from recurring rules
 */
export function generateEventsFromRules(
  rules: RecurringRule[],
  selectedRuleIds: string[],
  startDate: Date,
  endDate: Date
): PlannedEventDraft[] {
  const events: PlannedEventDraft[] = [];

  for (const rule of rules) {
    if (!selectedRuleIds.includes(rule.id)) continue;

    const dates = generateRecurringDates(rule, startDate, endDate);

    for (const date of dates) {
      events.push({
        id: `recurring-${rule.id}-${date.getTime()}`,
        date,
        title: rule.defaultTitle || rule.name,
        categoryId: rule.defaultCategoryId || '',
        category: rule.defaultCategory || undefined,
        recurringRuleId: rule.id,
        isMandatory: false,
        source: 'recurring',
      });
    }
  }

  // Sort by date
  events.sort((a, b) => a.date.getTime() - b.date.getTime());

  return events;
}

/**
 * Format a date for display in German
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

/**
 * Format a date for input[type="date"]
 */
export function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Parse a date string from input[type="date"]
 */
export function parseDateFromInput(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Get the default Lions year name based on a start date
 */
export function getDefaultYearName(startDate: Date): string {
  const startYear = startDate.getFullYear();
  const endYear = startYear + 1;
  return `Lionsjahr ${startYear}/${endYear}`;
}

/**
 * Get the default start date for a new Lions year (July 1st)
 */
export function getDefaultStartDate(): Date {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // If we're past July, use next year's July
  // If we're before July, use this year's July
  const year = currentMonth >= 6 ? currentYear + 1 : currentYear;

  return new Date(year, 6, 1); // July 1st
}

/**
 * Get the default end date for a Lions year (June 30th of next year)
 */
export function getDefaultEndDate(startDate: Date): Date {
  const endYear = startDate.getFullYear() + 1;
  return new Date(endYear, 5, 30); // June 30th
}

/**
 * Get day name in German
 */
export function getDayName(dayOfWeek: number): string {
  const days = [
    'Sonntag',
    'Montag',
    'Dienstag',
    'Mittwoch',
    'Donnerstag',
    'Freitag',
    'Samstag',
  ];
  return days[dayOfWeek];
}

/**
 * Get week description in German
 */
export function getWeekDescription(weekOfMonth: number | null): string {
  if (weekOfMonth === null) return '';
  if (weekOfMonth === -1) return 'Letzter';
  if (weekOfMonth === 1) return 'Erster';
  if (weekOfMonth === 2) return 'Zweiter';
  if (weekOfMonth === 3) return 'Dritter';
  if (weekOfMonth === 4) return 'Vierter';
  return `${weekOfMonth}.`;
}

/**
 * Get month name in German
 */
export function getMonthName(month: number): string {
  const months = [
    'Januar',
    'Februar',
    'März',
    'April',
    'Mai',
    'Juni',
    'Juli',
    'August',
    'September',
    'Oktober',
    'November',
    'Dezember',
  ];
  return months[month];
}

/**
 * Get the first weekday (Mon-Fri) of a given month
 */
export function getFirstWeekdayOfMonth(year: number, month: number): Date {
  const date = new Date(year, month, 1);
  const dayOfWeek = date.getDay();

  // If Saturday (6), move to Monday (+2)
  // If Sunday (0), move to Monday (+1)
  if (dayOfWeek === 0) {
    date.setDate(date.getDate() + 1);
  } else if (dayOfWeek === 6) {
    date.setDate(date.getDate() + 2);
  }

  return date;
}

/**
 * Get suggested date for a mandatory template based on defaultMonth
 */
export function getSuggestedDateForTemplate(
  defaultMonth: number | null,
  startDate: Date,
  endDate: Date
): Date | null {
  if (defaultMonth === null) return null;

  // defaultMonth is 1-12, JavaScript months are 0-11
  const targetMonth = defaultMonth - 1;

  // Determine which year to use based on the Lions year
  // Lions year typically runs July to June
  const startYear = startDate.getFullYear();

  // If target month is >= 7 (July), use start year
  // If target month is < 7 (before July), use start year + 1
  const year = targetMonth >= 6 ? startYear : startYear + 1;

  const suggestedDate = getFirstWeekdayOfMonth(year, targetMonth);

  // Ensure the date is within the Lions year range
  if (suggestedDate >= startDate && suggestedDate <= endDate) {
    return suggestedDate;
  }

  return null;
}

/**
 * Get all months in a date range for calendar display
 */
export function getMonthsInRange(startDate: Date, endDate: Date): { year: number; month: number }[] {
  const months: { year: number; month: number }[] = [];
  const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

  while (current <= end) {
    months.push({
      year: current.getFullYear(),
      month: current.getMonth(),
    });
    current.setMonth(current.getMonth() + 1);
  }

  return months;
}

/**
 * Get all days in a month for calendar grid
 */
export function getDaysInMonth(year: number, month: number): (Date | null)[] {
  const days: (Date | null)[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Add empty slots for days before the first day of the month
  // Monday = 1, Sunday = 0 -> we want Monday as first day
  let startDay = firstDay.getDay();
  if (startDay === 0) startDay = 7; // Sunday becomes 7
  for (let i = 1; i < startDay; i++) {
    days.push(null);
  }

  // Add all days of the month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    days.push(new Date(year, month, day));
  }

  return days;
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Generate a unique ID for a new event
 */
export function generateEventId(): string {
  return `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
