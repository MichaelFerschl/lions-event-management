'use client';

import { useState, useCallback, useMemo } from 'react';
import type {
  EventTemplate,
  MandatoryEventPlacement,
  PlannedEventDraft,
} from '../types';
import {
  formatDate,
  formatDateForInput,
  parseDateFromInput,
  getMonthName,
  getSuggestedDateForTemplate,
} from '../utils';

interface WizardStep3Props {
  templates: EventTemplate[];
  mandatoryPlacements: MandatoryEventPlacement[];
  startDate: Date;
  endDate: Date;
  onChange: (data: {
    mandatoryPlacements: MandatoryEventPlacement[];
    templateEvents: PlannedEventDraft[];
  }) => void;
}

export function WizardStep3({
  templates,
  mandatoryPlacements,
  startDate,
  endDate,
  onChange,
}: WizardStep3Props) {
  const [expandedTemplateId, setExpandedTemplateId] = useState<string | null>(
    null
  );

  // Filter only mandatory templates
  const mandatoryTemplates = useMemo(
    () => templates.filter((t) => t.isMandatory),
    [templates]
  );

  // Initialize placements if empty
  const placements = useMemo(() => {
    if (mandatoryPlacements.length > 0) {
      return mandatoryPlacements;
    }

    return mandatoryTemplates.map((template) => {
      const suggestedDate = getSuggestedDateForTemplate(
        template.defaultMonth,
        startDate,
        endDate
      );

      return {
        templateId: template.id,
        template,
        date: suggestedDate,
        invitationText: template.defaultInvitationText || '',
        isPlaced: suggestedDate !== null,
      };
    });
  }, [mandatoryTemplates, mandatoryPlacements, startDate, endDate]);

  // Count unplaced mandatory events
  const unplacedCount = useMemo(
    () => placements.filter((p) => !p.isPlaced || !p.date).length,
    [placements]
  );

  // Update a single placement
  const updatePlacement = useCallback(
    (templateId: string, updates: Partial<MandatoryEventPlacement>) => {
      const newPlacements = placements.map((p) =>
        p.templateId === templateId ? { ...p, ...updates } : p
      );

      // Generate template events from placements
      const templateEvents: PlannedEventDraft[] = newPlacements
        .filter((p) => p.isPlaced && p.date)
        .map((p) => ({
          id: `template-${p.templateId}-${p.date!.getTime()}`,
          date: p.date!,
          title: p.template.name,
          description: p.template.description || undefined,
          invitationText: p.invitationText || undefined,
          categoryId: p.template.categoryId,
          category: p.template.category,
          templateId: p.templateId,
          isMandatory: true,
          source: 'template' as const,
          durationMinutes: p.template.defaultDurationMinutes,
        }));

      onChange({
        mandatoryPlacements: newPlacements,
        templateEvents,
      });
    },
    [placements, onChange]
  );

  // Handle date change
  const handleDateChange = useCallback(
    (templateId: string, dateString: string) => {
      if (!dateString) {
        updatePlacement(templateId, { date: null, isPlaced: false });
        return;
      }

      const date = parseDateFromInput(dateString);
      updatePlacement(templateId, { date, isPlaced: true });
    },
    [updatePlacement]
  );

  // Handle invitation text change
  const handleInvitationTextChange = useCallback(
    (templateId: string, text: string) => {
      updatePlacement(templateId, { invitationText: text });
    },
    [updatePlacement]
  );

  // Apply suggested date
  const applySuggestedDate = useCallback(
    (templateId: string) => {
      const placement = placements.find((p) => p.templateId === templateId);
      if (!placement) return;

      const suggestedDate = getSuggestedDateForTemplate(
        placement.template.defaultMonth,
        startDate,
        endDate
      );

      if (suggestedDate) {
        updatePlacement(templateId, { date: suggestedDate, isPlaced: true });
      }
    },
    [placements, startDate, endDate, updatePlacement]
  );

  // Toggle expand/collapse
  const toggleExpand = (templateId: string) => {
    setExpandedTemplateId((prev) =>
      prev === templateId ? null : templateId
    );
  };

  if (mandatoryTemplates.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-gray-50 rounded-lg p-8 text-center">
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p className="text-gray-500 mb-2">Keine Pflichttermine vorhanden</p>
          <p className="text-sm text-gray-400">
            Sie können im nächsten Schritt weitere Termine hinzufügen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Warning if unplaced events */}
      {unplacedCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-amber-700">
            <svg
              className="w-5 h-5 flex-shrink-0"
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
            <span className="font-medium">
              {unplacedCount} Pflichttermin{unplacedCount !== 1 ? 'e' : ''} noch
              nicht platziert
            </span>
          </div>
          <p className="text-sm text-amber-600 mt-1 ml-7">
            Bitte wählen Sie für alle Pflichttermine ein Datum aus.
          </p>
        </div>
      )}

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5"
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
          <div>
            <p className="text-sm text-blue-700">
              Pflichttermine sind wichtige, wiederkehrende Events die jedes
              Lionsjahr stattfinden sollten. Für jeden Termin wird ein
              empfohlenes Datum basierend auf dem Standardmonat vorgeschlagen.
            </p>
          </div>
        </div>
      </div>

      {/* Mandatory templates list */}
      <div className="space-y-4">
        {placements.map((placement) => {
          const isExpanded = expandedTemplateId === placement.templateId;
          const suggestedDate = getSuggestedDateForTemplate(
            placement.template.defaultMonth,
            startDate,
            endDate
          );

          return (
            <div
              key={placement.templateId}
              className={`border rounded-lg overflow-hidden transition-colors ${
                placement.isPlaced && placement.date
                  ? 'border-green-300 bg-green-50/50'
                  : 'border-amber-300 bg-amber-50/50'
              }`}
            >
              {/* Header */}
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/50 transition-colors"
                onClick={() => toggleExpand(placement.templateId)}
              >
                {/* Status indicator */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    placement.isPlaced && placement.date
                      ? 'bg-green-500 text-white'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  {placement.isPlaced && placement.date ? (
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
                  ) : (
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
                        d="M12 8v4m0 4h.01"
                      />
                    </svg>
                  )}
                </div>

                {/* Template info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">
                      {placement.template.name}
                    </h3>
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor:
                          placement.template.category?.color || '#00338D',
                      }}
                    />
                    <span className="text-xs text-gray-500">
                      {placement.template.category?.name}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    {placement.template.defaultMonth && (
                      <span>
                        Empfohlen:{' '}
                        {getMonthName(placement.template.defaultMonth - 1)}
                      </span>
                    )}
                    {placement.date && (
                      <span className="ml-3 text-gray-700 font-medium">
                        → {formatDate(placement.date)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Expand/Collapse icon */}
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
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

              {/* Expanded content */}
              {isExpanded && (
                <div className="border-t border-gray-200 bg-white p-4 space-y-4">
                  {/* Description */}
                  {placement.template.description && (
                    <p className="text-sm text-gray-600">
                      {placement.template.description}
                    </p>
                  )}

                  {/* Date picker */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Datum *
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="date"
                        value={
                          placement.date
                            ? formatDateForInput(placement.date)
                            : ''
                        }
                        onChange={(e) =>
                          handleDateChange(
                            placement.templateId,
                            e.target.value
                          )
                        }
                        min={formatDateForInput(startDate)}
                        max={formatDateForInput(endDate)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lions-blue focus:border-transparent text-gray-900"
                      />
                      {suggestedDate && !placement.date && (
                        <button
                          type="button"
                          onClick={() =>
                            applySuggestedDate(placement.templateId)
                          }
                          className="px-3 py-2 text-sm text-lions-blue hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          Vorschlag übernehmen ({formatDate(suggestedDate)})
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Invitation text */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Einladungstext (optional)
                    </label>
                    <textarea
                      value={placement.invitationText}
                      onChange={(e) =>
                        handleInvitationTextChange(
                          placement.templateId,
                          e.target.value
                        )
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lions-blue focus:border-transparent resize-none text-gray-900"
                      placeholder="Optionaler Text für die Einladung..."
                    />
                    {placement.template.defaultInvitationText &&
                      placement.invitationText !==
                        placement.template.defaultInvitationText && (
                        <button
                          type="button"
                          onClick={() =>
                            handleInvitationTextChange(
                              placement.templateId,
                              placement.template.defaultInvitationText || ''
                            )
                          }
                          className="mt-1 text-xs text-gray-500 hover:text-lions-blue"
                        >
                          Standardtext wiederherstellen
                        </button>
                      )}
                  </div>

                  {/* Duration info */}
                  <div className="text-sm text-gray-500">
                    <span>Dauer: </span>
                    <span className="font-medium">
                      {placement.template.defaultDurationMinutes} Minuten
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {placements.length > 0 && (
        <div
          className={`mt-6 p-4 rounded-lg border ${
            unplacedCount === 0
              ? 'bg-green-50 border-green-200'
              : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-600">
                {placements.filter((p) => p.isPlaced && p.date).length} von{' '}
                {placements.length} Pflichtterminen platziert
              </span>
            </div>
            {unplacedCount === 0 && (
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
                <span className="font-medium">Alle Pflichttermine platziert!</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
