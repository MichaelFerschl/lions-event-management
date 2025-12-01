'use client';

import { useMemo } from 'react';
import type { Category, PlannedEventDraft, MandatoryEventPlacement } from '../types';
import { formatDate, getMonthName } from '../utils';

interface WizardStep5Props {
  yearName: string;
  startDate: Date;
  endDate: Date;
  categories: Category[];
  mandatoryPlacements: MandatoryEventPlacement[];
  allEvents: PlannedEventDraft[];
  setAsActive: boolean;
  onSetAsActiveChange: (value: boolean) => void;
}

export function WizardStep5({
  yearName,
  startDate,
  endDate,
  categories,
  mandatoryPlacements,
  allEvents,
  setAsActive,
  onSetAsActiveChange,
}: WizardStep5Props) {
  // Statistics by category
  const statsByCategory = useMemo(() => {
    const stats: Record<string, { category: Category; count: number }> = {};

    for (const event of allEvents) {
      const categoryId = event.categoryId;
      if (!stats[categoryId]) {
        const category = categories.find((c) => c.id === categoryId) ||
          event.category || {
            id: categoryId,
            name: 'Unbekannt',
            color: '#888888',
            icon: null,
          };
        stats[categoryId] = { category, count: 0 };
      }
      stats[categoryId].count++;
    }

    return Object.values(stats).sort((a, b) => b.count - a.count);
  }, [allEvents, categories]);

  // Statistics by source
  const statsBySource = useMemo(() => {
    const recurring = allEvents.filter((e) => e.source === 'recurring').length;
    const template = allEvents.filter((e) => e.source === 'template').length;
    const manual = allEvents.filter((e) => e.source === 'manual').length;

    return { recurring, template, manual };
  }, [allEvents]);

  // Check mandatory events
  const mandatoryCheck = useMemo(() => {
    const total = mandatoryPlacements.length;
    const placed = mandatoryPlacements.filter(
      (p) => p.isPlaced && p.date
    ).length;
    const allPlaced = total === placed;

    return { total, placed, allPlaced };
  }, [mandatoryPlacements]);

  // Events by month for chronological display
  const eventsByMonth = useMemo(() => {
    const grouped: Record<string, { month: string; events: PlannedEventDraft[] }> = {};

    const sortedEvents = [...allEvents].sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );

    for (const event of sortedEvents) {
      const monthKey = `${event.date.getFullYear()}-${String(event.date.getMonth()).padStart(2, '0')}`;
      if (!grouped[monthKey]) {
        grouped[monthKey] = {
          month: `${getMonthName(event.date.getMonth())} ${event.date.getFullYear()}`,
          events: [],
        };
      }
      grouped[monthKey].events.push(event);
    }

    return Object.values(grouped);
  }, [allEvents]);

  return (
    <div className="p-6">
      {/* Summary header */}
      <div className="bg-gradient-to-r from-lions-blue to-blue-700 text-white rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-2">{yearName}</h2>
        <p className="text-blue-100">
          {startDate.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })}{' '}
          bis{' '}
          {endDate.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })}
        </p>
        <div className="mt-4 text-3xl font-bold">
          {allEvents.length} Termine geplant
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Statistics by category */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-4">Termine nach Kategorie</h3>
          <div className="space-y-3">
            {statsByCategory.map(({ category, count }) => (
              <div key={category.id} className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: category.color || '#00338D' }}
                />
                <span className="flex-1 text-gray-700">{category.name}</span>
                <span className="font-medium text-gray-900">{count}</span>
              </div>
            ))}
            {statsByCategory.length === 0 && (
              <p className="text-gray-500 italic">Keine Termine</p>
            )}
          </div>
        </div>

        {/* Statistics by source */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-4">Termine nach Quelle</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-purple-500 flex-shrink-0" />
              <span className="flex-1 text-gray-700">Regeltermine</span>
              <span className="font-medium text-gray-900">
                {statsBySource.recurring}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-amber-500 flex-shrink-0" />
              <span className="flex-1 text-gray-700">Pflichttermine</span>
              <span className="font-medium text-gray-900">
                {statsBySource.template}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-green-500 flex-shrink-0" />
              <span className="flex-1 text-gray-700">Zusätzliche Termine</span>
              <span className="font-medium text-gray-900">
                {statsBySource.manual}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory events check */}
      <div
        className={`border rounded-lg p-4 mb-6 ${
          mandatoryCheck.allPlaced
            ? 'bg-green-50 border-green-200'
            : 'bg-amber-50 border-amber-200'
        }`}
      >
        <div className="flex items-center gap-3">
          {mandatoryCheck.allPlaced ? (
            <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          )}
          <div>
            <h3
              className={`font-medium ${
                mandatoryCheck.allPlaced ? 'text-green-800' : 'text-amber-800'
              }`}
            >
              Pflichttermine-Check
            </h3>
            <p
              className={`text-sm ${
                mandatoryCheck.allPlaced ? 'text-green-700' : 'text-amber-700'
              }`}
            >
              {mandatoryCheck.placed} von {mandatoryCheck.total} Pflichtterminen
              platziert
              {mandatoryCheck.allPlaced && ' ✓'}
            </p>
          </div>
        </div>

        {/* List unplaced mandatory events */}
        {!mandatoryCheck.allPlaced && (
          <div className="mt-3 pt-3 border-t border-amber-200">
            <p className="text-sm font-medium text-amber-800 mb-2">
              Noch nicht platziert:
            </p>
            <ul className="space-y-1">
              {mandatoryPlacements
                .filter((p) => !p.isPlaced || !p.date)
                .map((p) => (
                  <li
                    key={p.templateId}
                    className="text-sm text-amber-700 flex items-center gap-2"
                  >
                    <span>•</span>
                    <span>{p.template.name}</span>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>

      {/* Chronological event list */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
        <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
          <h3 className="font-medium text-gray-900">Alle Termine chronologisch</h3>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {eventsByMonth.map(({ month, events }) => (
            <div key={month}>
              <div className="sticky top-0 bg-gray-50 px-4 py-2 border-b border-gray-100">
                <span className="font-medium text-gray-700">{month}</span>
                <span className="text-sm text-gray-500 ml-2">
                  ({events.length})
                </span>
              </div>
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50"
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: event.category?.color || '#00338D',
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 truncate">
                        {event.title}
                      </span>
                      {event.isMandatory && (
                        <span className="px-1.5 py-0.5 text-xs bg-amber-100 text-amber-700 rounded">
                          Pflicht
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(event.date)}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {event.source === 'recurring' && 'Regeltermin'}
                    {event.source === 'template' && 'Vorlage'}
                    {event.source === 'manual' && 'Manuell'}
                  </div>
                </div>
              ))}
            </div>
          ))}
          {eventsByMonth.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              Keine Termine geplant
            </div>
          )}
        </div>
      </div>

      {/* Set as active checkbox */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={setAsActive}
            onChange={(e) => onSetAsActiveChange(e.target.checked)}
            className="mt-1 w-5 h-5 text-lions-blue border-gray-300 rounded focus:ring-lions-blue"
          />
          <div>
            <span className="font-medium text-gray-900">
              Als aktives Lionsjahr setzen
            </span>
            <p className="text-sm text-gray-600 mt-1">
              Wenn aktiviert, wird dieses Lionsjahr als das aktuelle Jahr
              markiert. Nur ein Lionsjahr kann gleichzeitig aktiv sein.
            </p>
          </div>
        </label>
      </div>

      {/* Final info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-sm text-gray-600">
            <p>
              Nach dem Erstellen können Sie das Lionsjahr jederzeit bearbeiten,
              Termine verschieben, hinzufügen oder löschen. Die Planung ist nicht
              endgültig und kann an Ihre Bedürfnisse angepasst werden.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
