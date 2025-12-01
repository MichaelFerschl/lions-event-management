'use client';

import { useState, useCallback, useMemo } from 'react';
import type {
  Category,
  EventTemplate,
  PlannedEventDraft,
} from '../types';
import {
  formatDateForInput,
  parseDateFromInput,
  getMonthName,
  getMonthsInRange,
  getDaysInMonth,
  isSameDay,
  generateEventId,
} from '../utils';

interface WizardStep4Props {
  categories: Category[];
  templates: EventTemplate[];
  startDate: Date;
  endDate: Date;
  existingEvents: PlannedEventDraft[]; // Events from steps 2 and 3
  additionalEvents: PlannedEventDraft[];
  onChange: (additionalEvents: PlannedEventDraft[]) => void;
}

interface AddEventModalData {
  isOpen: boolean;
  selectedDate: Date | null;
  editingEventId: string | null;
}

type ViewMode = 'calendar' | 'list';

const WEEKDAY_NAMES = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

export function WizardStep4({
  categories,
  templates,
  startDate,
  endDate,
  existingEvents,
  additionalEvents,
  onChange,
}: WizardStep4Props) {
  const [modalData, setModalData] = useState<AddEventModalData>({
    isOpen: false,
    selectedDate: null,
    editingEventId: null,
  });

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  // Form state for the modal
  const [formData, setFormData] = useState({
    templateId: '',
    title: '',
    description: '',
    categoryId: '',
    date: '',
  });

  // All events combined for display
  const allEvents = useMemo(
    () => [...existingEvents, ...additionalEvents],
    [existingEvents, additionalEvents]
  );

  // Months in the Lions year
  const months = useMemo(
    () => getMonthsInRange(startDate, endDate),
    [startDate, endDate]
  );

  // Filtered months based on selection
  const filteredMonths = useMemo(() => {
    if (selectedMonth === 'all') return months;
    const [yearStr, monthStr] = selectedMonth.split('-');
    return months.filter(
      (m) => m.year === parseInt(yearStr) && m.month === parseInt(monthStr)
    );
  }, [months, selectedMonth]);

  // Group events by month for list view
  const eventsByMonth = useMemo(() => {
    const groups = new Map<string, PlannedEventDraft[]>();

    for (const event of allEvents) {
      const date = new Date(event.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(event);
    }

    // Sort events within each group by date
    groups.forEach((events) => {
      events.sort((a, b) => a.date.getTime() - b.date.getTime());
    });

    return groups;
  }, [allEvents]);

  // Get events for a specific date
  const getEventsForDate = useCallback(
    (date: Date) => {
      return allEvents.filter((e) => isSameDay(e.date, date));
    },
    [allEvents]
  );

  // Open modal to add event
  const openAddModal = useCallback((date?: Date) => {
    setFormData({
      templateId: '',
      title: '',
      description: '',
      categoryId: '',
      date: date ? formatDateForInput(date) : '',
    });
    setModalData({
      isOpen: true,
      selectedDate: date || null,
      editingEventId: null,
    });
  }, []);

  // Open modal to edit event
  const openEditModal = useCallback(
    (eventId: string) => {
      const event = additionalEvents.find((e) => e.id === eventId);
      if (!event) return;

      setFormData({
        templateId: event.templateId || '',
        title: event.title,
        description: event.description || '',
        categoryId: event.categoryId,
        date: formatDateForInput(event.date),
      });
      setModalData({
        isOpen: true,
        selectedDate: event.date,
        editingEventId: eventId,
      });
    },
    [additionalEvents]
  );

  // Close modal
  const closeModal = useCallback(() => {
    setModalData({
      isOpen: false,
      selectedDate: null,
      editingEventId: null,
    });
  }, []);

  // Handle template selection
  const handleTemplateChange = useCallback(
    (templateId: string) => {
      if (!templateId) {
        setFormData((prev) => ({
          ...prev,
          templateId: '',
        }));
        return;
      }

      const template = templates.find((t) => t.id === templateId);
      if (template) {
        setFormData((prev) => ({
          ...prev,
          templateId,
          title: template.name,
          description: template.description || '',
          categoryId: template.categoryId,
        }));
      }
    },
    [templates]
  );

  // Save event
  const handleSaveEvent = useCallback(() => {
    if (!formData.title.trim() || !formData.date || !formData.categoryId) {
      return;
    }

    const date = parseDateFromInput(formData.date);
    const category = categories.find((c) => c.id === formData.categoryId);
    const template = formData.templateId
      ? templates.find((t) => t.id === formData.templateId)
      : undefined;

    const newEvent: PlannedEventDraft = {
      id: modalData.editingEventId || generateEventId(),
      date,
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      categoryId: formData.categoryId,
      category: category || undefined,
      templateId: formData.templateId || undefined,
      isMandatory: false,
      source: formData.templateId ? 'template' : 'manual',
      durationMinutes: template?.defaultDurationMinutes,
    };

    if (modalData.editingEventId) {
      // Update existing event
      onChange(
        additionalEvents.map((e) =>
          e.id === modalData.editingEventId ? newEvent : e
        )
      );
    } else {
      // Add new event
      onChange([...additionalEvents, newEvent]);
    }

    closeModal();
  }, [
    formData,
    modalData.editingEventId,
    categories,
    templates,
    additionalEvents,
    onChange,
    closeModal,
  ]);

  // Delete event
  const handleDeleteEvent = useCallback(
    (eventId: string) => {
      // Only allow deleting additional events (not from steps 2/3)
      onChange(additionalEvents.filter((e) => e.id !== eventId));
    },
    [additionalEvents, onChange]
  );

  // Non-mandatory templates for dropdown
  const selectableTemplates = useMemo(
    () => templates.filter((t) => !t.isMandatory),
    [templates]
  );

  // Check if an event is editable (only additional events from this step)
  const isEventEditable = useCallback(
    (eventId: string) => {
      return additionalEvents.some((e) => e.id === eventId);
    },
    [additionalEvents]
  );

  return (
    <div className="p-6">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Terminübersicht</h3>
          <p className="text-sm text-gray-500 mt-1">
            {viewMode === 'calendar'
              ? 'Klicken Sie auf einen Tag um einen Termin hinzuzufügen.'
              : 'Termine nach Monat gruppiert anzeigen.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Month filter */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lions-blue focus:border-transparent text-gray-900 text-sm"
          >
            <option value="all">Alle Monate</option>
            {months.map(({ year, month }) => (
              <option key={`${year}-${month}`} value={`${year}-${month}`}>
                {getMonthName(month)} {year}
              </option>
            ))}
          </select>

          {/* View toggle */}
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-lions-blue text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-lions-blue text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
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
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* Add button */}
          <button
            onClick={() => openAddModal()}
            className="px-4 py-2 bg-lions-blue text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="hidden sm:inline">Termin hinzufügen</span>
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 p-3 bg-gray-50 rounded-lg">
        {categories.map((category) => (
          <div key={category.id} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: category.color || '#00338D' }}
            />
            <span className="text-sm text-gray-600">{category.name}</span>
          </div>
        ))}
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredMonths.map(({ year, month }) => {
            const days = getDaysInMonth(year, month);

            return (
              <div
                key={`${year}-${month}`}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                {/* Month header */}
                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                  <h4 className="font-medium text-gray-900">
                    {getMonthName(month)} {year}
                  </h4>
                </div>

                {/* Weekday headers */}
                <div className="grid grid-cols-7 border-b border-gray-200">
                  {WEEKDAY_NAMES.map((name) => (
                    <div
                      key={name}
                      className="text-center text-xs font-medium text-gray-500 py-2"
                    >
                      {name}
                    </div>
                  ))}
                </div>

                {/* Days grid */}
                <div className="grid grid-cols-7">
                  {days.map((day, index) => {
                    if (!day) {
                      return (
                        <div
                          key={`empty-${index}`}
                          className="h-20 bg-gray-50"
                        />
                      );
                    }

                    const dayEvents = getEventsForDate(day);
                    const isInRange = day >= startDate && day <= endDate;
                    const isToday = isSameDay(day, new Date());

                    return (
                      <div
                        key={day.toISOString()}
                        className={`h-20 border-r border-b border-gray-100 p-1 ${
                          isInRange
                            ? 'hover:bg-blue-50 cursor-pointer'
                            : 'bg-gray-50 opacity-50'
                        } ${isToday ? 'bg-blue-50' : ''}`}
                        onClick={() => isInRange && openAddModal(day)}
                      >
                        <div
                          className={`text-xs font-medium mb-1 ${
                            isToday ? 'text-lions-blue' : 'text-gray-700'
                          }`}
                        >
                          {day.getDate()}
                        </div>
                        <div className="space-y-0.5 overflow-hidden">
                          {dayEvents.slice(0, 2).map((event) => (
                            <div
                              key={event.id}
                              className="text-xs truncate px-1 py-0.5 rounded cursor-pointer"
                              style={{
                                backgroundColor: event.category?.color
                                  ? `${event.category.color}20`
                                  : '#00338D20',
                                color: event.category?.color || '#00338D',
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isEventEditable(event.id)) {
                                  openEditModal(event.id);
                                }
                              }}
                              title={event.title}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-gray-500 px-1">
                              +{dayEvents.length - 2} weitere
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          {filteredMonths.map(({ year, month }) => {
            const key = `${year}-${month}`;
            const monthEvents = eventsByMonth.get(key) || [];

            if (monthEvents.length === 0) {
              return (
                <div
                  key={key}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                    <h4 className="font-medium text-gray-900">
                      {getMonthName(month)} {year}
                    </h4>
                  </div>
                  <div className="p-6 text-center text-gray-500">
                    Keine Termine in diesem Monat
                  </div>
                </div>
              );
            }

            return (
              <div
                key={key}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">
                    {getMonthName(month)} {year}
                  </h4>
                  <span className="text-sm text-gray-500">
                    {monthEvents.length} Termin{monthEvents.length !== 1 ? 'e' : ''}
                  </span>
                </div>
                <div className="divide-y divide-gray-100">
                  {monthEvents.map((event) => {
                    const isEditable = isEventEditable(event.id);
                    return (
                      <div
                        key={event.id}
                        className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50"
                      >
                        {/* Date */}
                        <div className="flex-shrink-0 w-16 text-center">
                          <div
                            className="w-12 h-12 mx-auto rounded-lg flex flex-col items-center justify-center"
                            style={{
                              backgroundColor: event.category?.color
                                ? `${event.category.color}15`
                                : '#00338D15',
                            }}
                          >
                            <span
                              className="text-lg font-bold"
                              style={{
                                color: event.category?.color || '#00338D',
                              }}
                            >
                              {new Date(event.date).getDate()}
                            </span>
                            <span
                              className="text-xs uppercase"
                              style={{
                                color: event.category?.color || '#00338D',
                              }}
                            >
                              {new Date(event.date).toLocaleDateString('de-DE', {
                                weekday: 'short',
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Event info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 truncate">
                              {event.title}
                            </span>
                            {event.isMandatory && (
                              <span className="flex-shrink-0 px-1.5 py-0.5 text-xs bg-amber-100 text-amber-700 rounded">
                                Pflicht
                              </span>
                            )}
                            {!isEditable && (
                              <span className="flex-shrink-0 px-1.5 py-0.5 text-xs bg-gray-100 text-gray-500 rounded">
                                Aus Vorlage
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                            <div
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{
                                backgroundColor: event.category?.color || '#00338D',
                              }}
                            />
                            <span>{event.category?.name || 'Keine Kategorie'}</span>
                            {event.description && (
                              <>
                                <span>•</span>
                                <span className="truncate">{event.description}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        {isEditable && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEditModal(event.id)}
                              className="p-2 text-gray-400 hover:text-lions-blue rounded-lg hover:bg-gray-100 transition-colors"
                              title="Bearbeiten"
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
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 transition-colors"
                              title="Löschen"
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
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Additional events count */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{additionalEvents.length}</span> zusätzliche Termine in diesem Schritt hinzugefügt
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">{allEvents.length}</span> Termine gesamt
          </div>
        </div>
      </div>

      {/* Add/Edit Event Modal */}
      {modalData.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {modalData.editingEventId
                ? 'Termin bearbeiten'
                : 'Termin hinzufügen'}
            </h3>

            <div className="space-y-4">
              {/* Template selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vorlage (optional)
                </label>
                <select
                  value={formData.templateId}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lions-blue focus:border-transparent text-gray-900"
                >
                  <option value="">-- Freier Termin --</option>
                  {selectableTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Datum *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                  min={formatDateForInput(startDate)}
                  max={formatDateForInput(endDate)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lions-blue focus:border-transparent text-gray-900"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titel *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lions-blue focus:border-transparent text-gray-900"
                  placeholder="Name des Termins"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategorie *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      categoryId: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lions-blue focus:border-transparent text-gray-900"
                >
                  <option value="">-- Kategorie wählen --</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Beschreibung (optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lions-blue focus:border-transparent resize-none text-gray-900"
                  placeholder="Optionale Beschreibung..."
                />
              </div>
            </div>

            {/* Modal buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleSaveEvent}
                disabled={
                  !formData.title.trim() ||
                  !formData.date ||
                  !formData.categoryId
                }
                className="px-4 py-2 bg-lions-blue text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {modalData.editingEventId ? 'Speichern' : 'Hinzufügen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
