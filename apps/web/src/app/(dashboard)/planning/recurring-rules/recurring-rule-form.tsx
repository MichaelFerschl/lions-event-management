'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createRecurringRule, updateRecurringRule } from './actions';

interface Category {
  id: string;
  name: string;
  color: string | null;
}

interface RecurringRuleFormProps {
  rule?: {
    id: string;
    name: string;
    description: string | null;
    frequency: 'WEEKLY' | 'MONTHLY';
    dayOfWeek: number;
    weekOfMonth: number | null;
    defaultCategoryId: string | null;
    defaultTitle: string | null;
    isActive: boolean;
  };
  categories: Category[];
}

const dayOptions = [
  { value: 0, label: 'Sonntag' },
  { value: 1, label: 'Montag' },
  { value: 2, label: 'Dienstag' },
  { value: 3, label: 'Mittwoch' },
  { value: 4, label: 'Donnerstag' },
  { value: 5, label: 'Freitag' },
  { value: 6, label: 'Samstag' },
];

const weekOptions = [
  { value: 1, label: 'Erste Woche' },
  { value: 2, label: 'Zweite Woche' },
  { value: 3, label: 'Dritte Woche' },
  { value: 4, label: 'Vierte Woche' },
  { value: -1, label: 'Letzte Woche' },
];

export function RecurringRuleForm({ rule, categories }: RecurringRuleFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(rule?.name || '');
  const [description, setDescription] = useState(rule?.description || '');
  const [frequency, setFrequency] = useState<'WEEKLY' | 'MONTHLY'>(
    rule?.frequency || 'MONTHLY'
  );
  const [dayOfWeek, setDayOfWeek] = useState(rule?.dayOfWeek ?? 2);
  const [weekOfMonth, setWeekOfMonth] = useState<number | undefined>(
    rule?.weekOfMonth ?? 1
  );
  const [defaultCategoryId, setDefaultCategoryId] = useState(
    rule?.defaultCategoryId || ''
  );
  const [defaultTitle, setDefaultTitle] = useState(rule?.defaultTitle || '');
  const [isActive, setIsActive] = useState(rule?.isActive ?? true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const data = {
      name,
      description: description || undefined,
      frequency,
      dayOfWeek,
      weekOfMonth: frequency === 'MONTHLY' ? weekOfMonth : undefined,
      defaultCategoryId: defaultCategoryId || undefined,
      defaultTitle: defaultTitle || undefined,
      isActive,
    };

    const result = rule
      ? await updateRecurringRule(rule.id, data)
      : await createRecurringRule(data);

    if (result.success) {
      router.push('/planning/recurring-rules');
    } else {
      setError(result.error || 'Ein Fehler ist aufgetreten');
      setIsSubmitting(false);
    }
  };

  // Generate preview text
  const getPreviewText = () => {
    const day = dayOptions.find((d) => d.value === dayOfWeek)?.label || '';

    if (frequency === 'WEEKLY') {
      return `Jeden ${day}`;
    }

    if (weekOfMonth !== undefined) {
      const week = weekOptions.find((w) => w.value === weekOfMonth)?.label || '';
      return `${week.replace(' Woche', 'r')} ${day} im Monat`;
    }

    return `${day} im Monat`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lions-blue focus:border-transparent text-gray-900"
              placeholder="z.B. Erster Dienstag im Monat"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Beschreibung
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lions-blue focus:border-transparent text-gray-900"
              placeholder="Kurze Beschreibung..."
            />
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Häufigkeit *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="MONTHLY"
                  checked={frequency === 'MONTHLY'}
                  onChange={(e) =>
                    setFrequency(e.target.value as 'WEEKLY' | 'MONTHLY')
                  }
                  className="text-lions-blue focus:ring-lions-blue"
                />
                <span>Monatlich</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="WEEKLY"
                  checked={frequency === 'WEEKLY'}
                  onChange={(e) =>
                    setFrequency(e.target.value as 'WEEKLY' | 'MONTHLY')
                  }
                  className="text-lions-blue focus:ring-lions-blue"
                />
                <span>Wöchentlich</span>
              </label>
            </div>
          </div>

          {/* Day of Week */}
          <div>
            <label
              htmlFor="dayOfWeek"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Wochentag *
            </label>
            <select
              id="dayOfWeek"
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lions-blue focus:border-transparent text-gray-900"
            >
              {dayOptions.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>

          {/* Week of Month (only for MONTHLY) */}
          {frequency === 'MONTHLY' && (
            <div>
              <label
                htmlFor="weekOfMonth"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Woche im Monat
              </label>
              <select
                id="weekOfMonth"
                value={weekOfMonth ?? ''}
                onChange={(e) =>
                  setWeekOfMonth(
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lions-blue focus:border-transparent text-gray-900"
              >
                <option value="">Keine spezifische Woche</option>
                {weekOptions.map((week) => (
                  <option key={week.value} value={week.value}>
                    {week.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Active Checkbox */}
          <div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-lions-blue border-gray-300 rounded focus:ring-lions-blue"
              />
              <span className="text-sm font-medium text-gray-700">Aktiv</span>
            </label>
            <p className="text-sm text-gray-500 ml-7">
              Inaktive Regeltermine werden bei der Planung nicht verwendet
            </p>
          </div>
        </div>

        {/* Right Column - Defaults */}
        <div className="space-y-6">
          {/* Default Category */}
          <div>
            <label
              htmlFor="defaultCategoryId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Standard-Terminart
            </label>
            <select
              id="defaultCategoryId"
              value={defaultCategoryId}
              onChange={(e) => setDefaultCategoryId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lions-blue focus:border-transparent text-gray-900"
            >
              <option value="">Keine Standard-Terminart</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Wird bei der automatischen Generierung verwendet
            </p>
          </div>

          {/* Default Title */}
          <div>
            <label
              htmlFor="defaultTitle"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Standard-Titel
            </label>
            <input
              type="text"
              id="defaultTitle"
              value={defaultTitle}
              onChange={(e) => setDefaultTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lions-blue focus:border-transparent text-gray-900"
              placeholder="z.B. Clubabend"
            />
            <p className="mt-1 text-sm text-gray-500">
              Titel für automatisch generierte Termine
            </p>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Vorschau
            </label>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-3 mb-2">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span className="font-medium text-gray-900">{getPreviewText()}</span>
              </div>
              {defaultTitle && (
                <div className="text-sm text-gray-600">
                  Titel: {defaultTitle}
                </div>
              )}
              {defaultCategoryId && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <span>Kategorie:</span>
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        categories.find((c) => c.id === defaultCategoryId)?.color ||
                        '#00338D',
                    }}
                  />
                  <span>
                    {categories.find((c) => c.id === defaultCategoryId)?.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !name}
          className="px-4 py-2 bg-lions-blue text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? 'Speichern...'
            : rule
              ? 'Änderungen speichern'
              : 'Regeltermin erstellen'}
        </button>
      </div>
    </form>
  );
}
