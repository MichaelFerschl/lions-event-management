'use client';

import { useState, useMemo, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { LionsYearWithEvents, PlannedEventWithDetails } from '../../actions';
import {
  addPlannedEvent,
  updatePlannedEvent,
  deletePlannedEvent,
} from '../../actions';

interface Category {
  id: string;
  name: string;
  color: string | null;
}

interface Template {
  id: string;
  name: string;
  description: string | null;
  categoryId: string;
  isMandatory: boolean;
  defaultDurationMinutes: number;
  defaultInvitationText: string | null;
  category: Category;
}

interface YearEditViewProps {
  year: LionsYearWithEvents;
  categories: Category[];
  templates: Template[];
}

interface EventFormData {
  title: string;
  description: string;
  date: string;
  categoryId: string;
  templateId: string;
  isMandatory: boolean;
  invitationText: string;
}

const MONTH_NAMES = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

const WEEKDAY_NAMES = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

export function YearEditView({ year, categories, templates }: YearEditViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<PlannedEventWithDetails | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    date: '',
    categoryId: '',
    templateId: '',
    isMandatory: false,
    invitationText: '',
  });

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(() => {
    const start = new Date(year.startDate);
    return { year: start.getFullYear(), month: start.getMonth() };
  });

  // Events by date for calendar display
  const eventsByDate = useMemo(() => {
    const map = new Map<string, PlannedEventWithDetails[]>();
    for (const event of year.plannedEvents) {
      const date = new Date(event.date);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(event);
    }
    return map;
  }, [year.plannedEvents]);

  // Calendar days
  const calendarDays = useMemo(() => {
    const days: (Date | null)[] = [];
    const firstDay = new Date(currentMonth.year, currentMonth.month, 1);
    const lastDay = new Date(currentMonth.year, currentMonth.month + 1, 0);

    let startDay = firstDay.getDay();
    if (startDay === 0) startDay = 7;
    for (let i = 1; i < startDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(currentMonth.year, currentMonth.month, day));
    }

    return days;
  }, [currentMonth]);

  const formatDateForInput = (date: Date) => {
    return new Date(date).toISOString().split('T')[0];
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev.year, prev.month + (direction === 'next' ? 1 : -1), 1);
      return { year: newDate.getFullYear(), month: newDate.getMonth() };
    });
  };

  // Open add modal
  const openAddModal = useCallback((date?: Date) => {
    setFormData({
      title: '',
      description: '',
      date: date ? formatDateForInput(date) : '',
      categoryId: '',
      templateId: '',
      isMandatory: false,
      invitationText: '',
    });
    setEditingEvent(null);
    setShowAddModal(true);
  }, []);

  // Open edit modal
  const openEditModal = useCallback((event: PlannedEventWithDetails) => {
    setFormData({
      title: event.title,
      description: event.description || '',
      date: formatDateForInput(event.date),
      categoryId: event.category?.id || '',
      templateId: '',
      isMandatory: event.isMandatory,
      invitationText: event.invitationText || '',
    });
    setEditingEvent(event);
    setShowAddModal(true);
  }, []);

  // Close modal
  const closeModal = () => {
    setShowAddModal(false);
    setEditingEvent(null);
    setError(null);
  };

  // Handle template selection
  const handleTemplateChange = (templateId: string) => {
    if (!templateId) {
      setFormData((prev) => ({ ...prev, templateId: '' }));
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
        isMandatory: template.isMandatory,
        invitationText: template.defaultInvitationText || '',
      }));
    }
  };

  // Save event
  const handleSave = async () => {
    if (!formData.title.trim() || !formData.date || !formData.categoryId) {
      setError('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }

    setError(null);

    startTransition(async () => {
      if (editingEvent) {
        // Update existing event
        const result = await updatePlannedEvent(editingEvent.id, {
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          date: new Date(formData.date),
          categoryId: formData.categoryId,
          isMandatory: formData.isMandatory,
          invitationText: formData.invitationText.trim() || undefined,
        });

        if (!result.success) {
          setError(result.error || 'Fehler beim Speichern');
          return;
        }
      } else {
        // Add new event
        const result = await addPlannedEvent(year.id, {
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          date: new Date(formData.date),
          categoryId: formData.categoryId,
          templateId: formData.templateId || undefined,
          isMandatory: formData.isMandatory,
          invitationText: formData.invitationText.trim() || undefined,
        });

        if (!result.success) {
          setError(result.error || 'Fehler beim Hinzufügen');
          return;
        }
      }

      closeModal();
      router.refresh();
    });
  };

  // Delete event
  const handleDelete = async (eventId: string) => {
    setError(null);

    startTransition(async () => {
      const result = await deletePlannedEvent(eventId);
      if (!result.success) {
        setError(result.error || 'Fehler beim Löschen');
      } else {
        router.refresh();
      }
      setShowDeleteDialog(null);
    });
  };

  const isSameDay = (date1: Date, date2: Date) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('de-DE', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <>
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700">
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
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Calendar and controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
          {/* Month navigation */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h3 className="text-lg font-medium text-gray-900">
              {MONTH_NAMES[currentMonth.month]} {currentMonth.year}
            </h3>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-gray-200">
            {WEEKDAY_NAMES.map((name) => (
              <div
                key={name}
                className="text-center text-sm font-medium text-gray-500 py-3"
              >
                {name}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="h-28 bg-gray-50" />;
              }

              const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
              const dayEvents = eventsByDate.get(key) || [];
              const isToday = isSameDay(day, new Date());
              const start = new Date(year.startDate);
              const end = new Date(year.endDate);
              const isInRange = day >= start && day <= end;

              return (
                <div
                  key={day.toISOString()}
                  className={`h-28 border-r border-b border-gray-100 p-1 ${
                    isToday ? 'bg-blue-50' : ''
                  } ${isInRange ? 'cursor-pointer hover:bg-gray-50' : 'bg-gray-100 opacity-50'}`}
                  onClick={() => isInRange && openAddModal(day)}
                >
                  <div
                    className={`text-sm font-medium mb-1 ${
                      isToday ? 'text-lions-blue' : 'text-gray-700'
                    }`}
                  >
                    {day.getDate()}
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    {dayEvents.slice(0, 2).map((event) => (
                      <button
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(event);
                        }}
                        className="w-full text-left text-xs truncate px-1 py-0.5 rounded hover:opacity-80"
                        style={{
                          backgroundColor: event.category?.color
                            ? `${event.category.color}20`
                            : '#00338D20',
                          color: event.category?.color || '#00338D',
                        }}
                      >
                        {event.title}
                      </button>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-500 px-1">
                        +{dayEvents.length - 2}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Add button */}
          <button
            onClick={() => openAddModal()}
            className="w-full px-4 py-3 bg-lions-blue text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
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
            Termin hinzufügen
          </button>

          {/* Legend */}
          <div className="bg-white rounded-lg shadow p-4">
            <h4 className="font-medium text-gray-900 mb-3">Kategorien</h4>
            <div className="space-y-2">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cat.color || '#00338D' }}
                  />
                  <span className="text-sm text-gray-600">{cat.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-lg shadow p-4">
            <h4 className="font-medium text-gray-900 mb-3">Übersicht</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Termine gesamt</span>
                <span className="font-medium">{year.plannedEvents.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Pflichttermine</span>
                <span className="font-medium">
                  {year.plannedEvents.filter((e) => e.isMandatory).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Veröffentlicht</span>
                <span className="font-medium">
                  {year.plannedEvents.filter((e) => e.publishedEventId).length}
                </span>
              </div>
            </div>
          </div>

          {/* Back link */}
          <Link
            href={`/planning/years/${year.id}`}
            className="block text-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Zurück zur Übersicht
          </Link>
        </div>
      </div>

      {/* Events list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="font-medium text-gray-900">
            Alle Termine ({year.plannedEvents.length})
          </h3>
        </div>
        <div className="divide-y divide-gray-100">
          {year.plannedEvents.map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
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
                  {event.publishedEventId && (
                    <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                      Veröffentlicht
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {formatDate(event.date)}
                  {event.category && (
                    <span className="ml-2">• {event.category.name}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(event)}
                  className="p-2 text-gray-400 hover:text-lions-blue transition-colors"
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
                  onClick={() => setShowDeleteDialog(event.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
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
            </div>
          ))}
          {year.plannedEvents.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              Keine Termine vorhanden. Klicken Sie auf einen Tag im Kalender oder
              auf "Termin hinzufügen".
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingEvent ? 'Termin bearbeiten' : 'Termin hinzufügen'}
            </h3>

            <div className="space-y-4">
              {/* Template selection (only for new events) */}
              {!editingEvent && (
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
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

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
                  min={formatDateForInput(new Date(year.startDate))}
                  max={formatDateForInput(new Date(year.endDate))}
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
                  Beschreibung
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lions-blue focus:border-transparent resize-none text-gray-900"
                />
              </div>

              {/* Mandatory checkbox */}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isMandatory}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isMandatory: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-lions-blue border-gray-300 rounded focus:ring-lions-blue"
                />
                <span className="text-sm text-gray-700">Pflichttermin</span>
              </label>

              {/* Invitation text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Einladungstext
                </label>
                <textarea
                  value={formData.invitationText}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      invitationText: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lions-blue focus:border-transparent resize-none text-gray-900"
                  placeholder="Text für die Einladung..."
                />
              </div>
            </div>

            {/* Modal error */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Modal buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeModal}
                disabled={isPending}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Abbrechen
              </button>
              <button
                onClick={handleSave}
                disabled={isPending}
                className="px-4 py-2 bg-lions-blue text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isPending ? 'Speichern...' : editingEvent ? 'Speichern' : 'Hinzufügen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Termin löschen?
            </h3>
            <p className="text-gray-600 mb-6">
              Möchten Sie diesen Termin wirklich löschen? Diese Aktion kann nicht
              rückgängig gemacht werden.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteDialog(null)}
                disabled={isPending}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Abbrechen
              </button>
              <button
                onClick={() => handleDelete(showDeleteDialog)}
                disabled={isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isPending ? 'Wird gelöscht...' : 'Löschen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
