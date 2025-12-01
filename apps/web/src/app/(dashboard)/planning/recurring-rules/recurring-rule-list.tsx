'use client';

import { useState } from 'react';
import Link from 'next/link';
import { deleteRecurringRule } from './actions';

interface Category {
  id: string;
  name: string;
  color: string | null;
}

interface RecurringRule {
  id: string;
  name: string;
  description: string | null;
  frequency: string;
  dayOfWeek: number;
  weekOfMonth: number | null;
  defaultTitle: string | null;
  isActive: boolean;
  defaultCategory: Category | null;
  _count: {
    plannedEvents: number;
  };
}

interface RecurringRuleListProps {
  rules: RecurringRule[];
  categories: Category[];
}

const dayNames = [
  'Sonntag',
  'Montag',
  'Dienstag',
  'Mittwoch',
  'Donnerstag',
  'Freitag',
  'Samstag',
];

const weekNames: Record<number, string> = {
  1: 'Erste',
  2: 'Zweite',
  3: 'Dritte',
  4: 'Vierte',
  [-1]: 'Letzte',
};

function formatRecurrence(rule: RecurringRule): string {
  const day = dayNames[rule.dayOfWeek];

  if (rule.frequency === 'WEEKLY') {
    return `Jeden ${day}`;
  }

  if (rule.weekOfMonth !== null) {
    const week = weekNames[rule.weekOfMonth] || `${rule.weekOfMonth}.`;
    return `${week}r ${day} im Monat`;
  }

  return `${day} im Monat`;
}

export function RecurringRuleList({ rules }: RecurringRuleListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Möchten Sie den Regeltermin "${name}" wirklich löschen?`)) {
      return;
    }

    setDeletingId(id);
    setError(null);

    const result = await deleteRecurringRule(id);

    if (!result.success) {
      setError(result.error || 'Fehler beim Löschen');
    }

    setDeletingId(null);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Wiederholung
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Standard-Kategorie
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Standard-Titel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aktionen
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rules.map((rule) => (
              <tr
                key={rule.id}
                className={`hover:bg-gray-50 ${!rule.isActive ? 'opacity-60' : ''}`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="font-medium text-gray-900">{rule.name}</div>
                    {rule.description && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {rule.description}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-green-500"
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
                    <span className="text-sm text-gray-900">
                      {formatRecurrence(rule)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {rule.defaultCategory ? (
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: rule.defaultCategory.color || '#00338D',
                        }}
                      />
                      <span className="text-sm text-gray-900">
                        {rule.defaultCategory.name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {rule.defaultTitle || '-'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {rule.isActive ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Aktiv
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Inaktiv
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/planning/recurring-rules/${rule.id}`}
                      className="text-lions-blue hover:text-blue-700"
                    >
                      Bearbeiten
                    </Link>
                    <button
                      onClick={() => handleDelete(rule.id, rule.name)}
                      disabled={deletingId === rule.id}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingId === rule.id ? 'Löschen...' : 'Löschen'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
