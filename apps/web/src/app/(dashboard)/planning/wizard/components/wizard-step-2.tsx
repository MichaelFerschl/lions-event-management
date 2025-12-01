'use client';

import { useState, useMemo, useCallback } from 'react';
import type { RecurringRule, PlannedEventDraft } from '../types';
import {
  generateEventsFromRules,
  formatDate,
  getDayName,
  getWeekDescription,
} from '../utils';

interface WizardStep2Props {
  recurringRules: RecurringRule[];
  selectedRuleIds: string[];
  generatedEvents: PlannedEventDraft[];
  startDate: Date;
  endDate: Date;
  onChange: (data: {
    selectedRuleIds: string[];
    generatedEvents: PlannedEventDraft[];
  }) => void;
}

export function WizardStep2({
  recurringRules,
  selectedRuleIds,
  generatedEvents,
  startDate,
  endDate,
  onChange,
}: WizardStep2Props) {
  const [isGenerating, setIsGenerating] = useState(false);

  // Toggle rule selection
  const handleToggleRule = useCallback(
    (ruleId: string) => {
      const newSelectedIds = selectedRuleIds.includes(ruleId)
        ? selectedRuleIds.filter((id) => id !== ruleId)
        : [...selectedRuleIds, ruleId];

      onChange({
        selectedRuleIds: newSelectedIds,
        generatedEvents: [], // Clear events when selection changes
      });
    },
    [selectedRuleIds, onChange]
  );

  // Select/Deselect all rules
  const handleSelectAll = useCallback(() => {
    const allSelected = selectedRuleIds.length === recurringRules.length;
    onChange({
      selectedRuleIds: allSelected ? [] : recurringRules.map((r) => r.id),
      generatedEvents: [],
    });
  }, [selectedRuleIds, recurringRules, onChange]);

  // Generate events from selected rules
  const handleGenerate = useCallback(() => {
    setIsGenerating(true);

    // Use setTimeout to allow UI to update
    setTimeout(() => {
      const events = generateEventsFromRules(
        recurringRules,
        selectedRuleIds,
        startDate,
        endDate
      );

      onChange({
        selectedRuleIds,
        generatedEvents: events,
      });

      setIsGenerating(false);
    }, 100);
  }, [recurringRules, selectedRuleIds, startDate, endDate, onChange]);

  // Remove a single event
  const handleRemoveEvent = useCallback(
    (eventId: string) => {
      onChange({
        selectedRuleIds,
        generatedEvents: generatedEvents.filter((e) => e.id !== eventId),
      });
    },
    [selectedRuleIds, generatedEvents, onChange]
  );

  // Calculate preview count
  const previewCount = useMemo(() => {
    if (selectedRuleIds.length === 0) return 0;
    return generateEventsFromRules(
      recurringRules,
      selectedRuleIds,
      startDate,
      endDate
    ).length;
  }, [recurringRules, selectedRuleIds, startDate, endDate]);

  // Format rule description
  const formatRuleDescription = (rule: RecurringRule): string => {
    const day = getDayName(rule.dayOfWeek);
    if (rule.frequency === 'WEEKLY') {
      return `Jeden ${day}`;
    }
    const week = getWeekDescription(rule.weekOfMonth);
    return week ? `${week} ${day} im Monat` : `${day} im Monat`;
  };

  // Group events by month for display
  const eventsByMonth = useMemo(() => {
    const grouped: Record<string, PlannedEventDraft[]> = {};

    for (const event of generatedEvents) {
      const monthKey = `${event.date.getFullYear()}-${String(event.date.getMonth() + 1).padStart(2, '0')}`;

      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(event);
    }

    return Object.entries(grouped).map(([key, events]) => ({
      key,
      label: events[0].date.toLocaleDateString('de-DE', {
        month: 'long',
        year: 'numeric',
      }),
      events,
    }));
  }, [generatedEvents]);

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Rule Selection */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Regeltermine</h3>
            <button
              onClick={handleSelectAll}
              className="text-sm text-lions-blue hover:text-blue-700"
            >
              {selectedRuleIds.length === recurringRules.length
                ? 'Alle abwählen'
                : 'Alle auswählen'}
            </button>
          </div>

          {recurringRules.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <svg
                className="w-12 h-12 text-gray-300 mx-auto mb-3"
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
              <p className="text-gray-500 mb-2">Keine Regeltermine vorhanden</p>
              <a
                href="/planning/recurring-rules/new"
                className="text-sm text-lions-blue hover:underline"
              >
                Regeltermin erstellen →
              </a>
            </div>
          ) : (
            <div className="space-y-2">
              {recurringRules.map((rule) => (
                <label
                  key={rule.id}
                  className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedRuleIds.includes(rule.id)
                      ? 'border-lions-blue bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedRuleIds.includes(rule.id)}
                    onChange={() => handleToggleRule(rule.id)}
                    className="mt-1 w-4 h-4 text-lions-blue border-gray-300 rounded focus:ring-lions-blue"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{rule.name}</div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      {formatRuleDescription(rule)}
                    </div>
                    {rule.defaultCategory && (
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor:
                              rule.defaultCategory.color || '#00338D',
                          }}
                        />
                        <span className="text-xs text-gray-500">
                          {rule.defaultCategory.name}
                        </span>
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* Generate Button */}
          {recurringRules.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">
                  {selectedRuleIds.length} von {recurringRules.length} Regeln
                  ausgewählt
                </span>
                {selectedRuleIds.length > 0 && (
                  <span className="text-sm text-gray-500">
                    ≈ {previewCount} Termine
                  </span>
                )}
              </div>
              <button
                onClick={handleGenerate}
                disabled={selectedRuleIds.length === 0 || isGenerating}
                className="w-full px-4 py-2 bg-lions-blue text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating
                  ? 'Generiere...'
                  : generatedEvents.length > 0
                    ? 'Neu generieren'
                    : 'Termine generieren'}
              </button>
            </div>
          )}
        </div>

        {/* Right: Generated Events */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Generierte Termine
            </h3>
            {generatedEvents.length > 0 && (
              <span className="text-sm text-gray-500">
                {generatedEvents.length} Termine
              </span>
            )}
          </div>

          {generatedEvents.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <svg
                className="w-12 h-12 text-gray-300 mx-auto mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-gray-500">
                Wählen Sie Regeltermine aus und klicken Sie auf "Termine
                generieren"
              </p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg max-h-[500px] overflow-y-auto">
              {eventsByMonth.map((month) => (
                <div key={month.key}>
                  <div className="sticky top-0 bg-gray-100 px-4 py-2 border-b border-gray-200">
                    <span className="font-medium text-gray-700">
                      {month.label}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({month.events.length})
                    </span>
                  </div>
                  {month.events.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 group"
                    >
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: event.category?.color || '#00338D',
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {event.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(event.date)}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveEvent(event.id)}
                        className="p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Entfernen"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          {generatedEvents.length > 0 && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <svg
                  className="w-5 h-5"
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
                <span className="font-medium">
                  {generatedEvents.length} Regeltermine generiert
                </span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                Sie können einzelne Termine entfernen, indem Sie mit der Maus
                darüber fahren und auf das X klicken.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
