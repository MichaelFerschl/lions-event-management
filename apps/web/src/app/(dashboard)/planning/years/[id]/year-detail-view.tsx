'use client';

import { useState, useMemo, useTransition } from 'react';
import type { LionsYearWithEvents, PlannedEventWithDetails } from '../actions';
import { exportLionsYearAsICS, publishPlannedEvent } from '../actions';

interface YearDetailViewProps {
  year: LionsYearWithEvents;
}

type ViewMode = 'calendar' | 'list';
type CategoryFilter = string | 'all';

const WEEKDAY_NAMES = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const MONTH_NAMES = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

export function YearDetailView({ year }: YearDetailViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    const start = new Date(year.startDate);
    const end = new Date(year.endDate);

    // If current date is within the year, use current month
    if (now >= start && now <= end) {
      return { year: now.getFullYear(), month: now.getMonth() };
    }
    // Otherwise use start month
    return { year: start.getFullYear(), month: start.getMonth() };
  });
  const [isPending, startTransition] = useTransition();
  const [selectedEvent, setSelectedEvent] = useState<PlannedEventWithDetails | null>(null);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Map<string, { id: string; name: string; color: string | null }>();
    for (const event of year.plannedEvents) {
      if (event.category && !cats.has(event.category.id)) {
        cats.set(event.category.id, event.category);
      }
    }
    return Array.from(cats.values());
  }, [year.plannedEvents]);

  // Filter events
  const filteredEvents = useMemo(() => {
    if (categoryFilter === 'all') {
      return year.plannedEvents;
    }
    return year.plannedEvents.filter((e) => e.category?.id === categoryFilter);
  }, [year.plannedEvents, categoryFilter]);

  // Group events by month for list view
  const eventsByMonth = useMemo(() => {
    const grouped: Record<string, PlannedEventWithDetails[]> = {};

    for (const event of filteredEvents) {
      const date = new Date(event.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`;

      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(event);
    }

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, events]) => {
        const [yearNum, monthNum] = key.split('-').map(Number);
        return {
          key,
          label: `${MONTH_NAMES[monthNum]} ${yearNum}`,
          events,
        };
      });
  }, [filteredEvents]);

  // Get events for current month in calendar view
  const calendarEvents = useMemo(() => {
    return filteredEvents.filter((event) => {
      const date = new Date(event.date);
      return (
        date.getFullYear() === currentMonth.year &&
        date.getMonth() === currentMonth.month
      );
    });
  }, [filteredEvents, currentMonth]);

  // Get calendar days for current month
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

  // Navigation for calendar
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev.year, prev.month + (direction === 'next' ? 1 : -1), 1);
      return { year: newDate.getFullYear(), month: newDate.getMonth() };
    });
  };

  // Export as ICS
  const handleExportICS = async () => {
    startTransition(async () => {
      const result = await exportLionsYearAsICS(year.id);
      if (result.success && result.icsContent) {
        const blob = new Blob([result.icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${year.name.replace(/\s+/g, '_')}.ics`;
        link.click();
        URL.revokeObjectURL(url);
      }
    });
  };

  // Publish event
  const handlePublish = async (eventId: string) => {
    startTransition(async () => {
      const result = await publishPlannedEvent(eventId);
      if (result.success) {
        setSelectedEvent(null);
        // Refresh will happen via revalidatePath
      }
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('de-DE', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
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

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-gray-900">
            {year.plannedEvents.length}
          </div>
          <div className="text-sm text-gray-500">Termine gesamt</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600">
            {year.plannedEvents.filter((e) => e.status === 'CONFIRMED').length}
          </div>
          <div className="text-sm text-gray-500">Bestätigt</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-amber-600">
            {year.plannedEvents.filter((e) => e.isMandatory).length}
          </div>
          <div className="text-sm text-gray-500">Pflichttermine</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-600">
            {year.plannedEvents.filter((e) => e.publishedEventId).length}
          </div>
          <div className="text-sm text-gray-500">Veröffentlicht</div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* View toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Liste
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Kalender
              </button>
            </div>

            {/* Category filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-lions-blue focus:border-transparent"
            >
              <option value="all">Alle Kategorien</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Export button */}
          <button
            onClick={handleExportICS}
            disabled={isPending}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
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
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Als ICS exportieren
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
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
                return <div key={`empty-${index}`} className="h-24 bg-gray-50" />;
              }

              const dayEvents = calendarEvents.filter((e) => isSameDay(e.date, day));
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={day.toISOString()}
                  className={`h-24 border-r border-b border-gray-100 p-1 ${
                    isToday ? 'bg-blue-50' : ''
                  }`}
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
                        onClick={() => setSelectedEvent(event)}
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
                        +{dayEvents.length - 2} weitere
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {eventsByMonth.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {categoryFilter !== 'all'
                ? 'Keine Termine in dieser Kategorie'
                : 'Keine Termine vorhanden'}
            </div>
          ) : (
            <div>
              {eventsByMonth.map(({ key, label, events }) => (
                <div key={key}>
                  <div className="sticky top-0 bg-gray-100 px-4 py-2 border-b border-gray-200">
                    <span className="font-medium text-gray-700">{label}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({events.length})
                    </span>
                  </div>
                  {events.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 text-left"
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
                          {event.status === 'CANCELLED' && (
                            <span className="px-1.5 py-0.5 text-xs bg-red-100 text-red-700 rounded">
                              Abgesagt
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
                      <svg
                        className="w-5 h-5 text-gray-400"
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
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Event detail modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{
                      backgroundColor: selectedEvent.category?.color || '#00338D',
                    }}
                  />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedEvent.title}
                  </h3>
                </div>
                {selectedEvent.category && (
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedEvent.category.name}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Date */}
              <div className="flex items-center gap-3 text-gray-600">
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
                <span>
                  {formatDate(selectedEvent.date)}
                  {selectedEvent.endDate && (
                    <span> – {formatDate(selectedEvent.endDate)}</span>
                  )}
                </span>
              </div>

              {/* Time */}
              <div className="flex items-center gap-3 text-gray-600">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{formatTime(selectedEvent.date)} Uhr</span>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {selectedEvent.isMandatory && (
                  <span className="px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded">
                    Pflichttermin
                  </span>
                )}
                {selectedEvent.publishedEventId && (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                    Veröffentlicht
                  </span>
                )}
                {selectedEvent.status === 'CONFIRMED' && (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                    Bestätigt
                  </span>
                )}
                {selectedEvent.status === 'CANCELLED' && (
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                    Abgesagt
                  </span>
                )}
                {selectedEvent.recurringRule && (
                  <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                    Regeltermin: {selectedEvent.recurringRule.name}
                  </span>
                )}
                {selectedEvent.template && (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                    Vorlage: {selectedEvent.template.name}
                  </span>
                )}
              </div>

              {/* Description */}
              {selectedEvent.description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">
                    Beschreibung
                  </h4>
                  <p className="text-gray-600 text-sm whitespace-pre-wrap">
                    {selectedEvent.description}
                  </p>
                </div>
              )}

              {/* Invitation text */}
              {selectedEvent.invitationText && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">
                    Einladungstext
                  </h4>
                  <p className="text-gray-600 text-sm whitespace-pre-wrap">
                    {selectedEvent.invitationText}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Schließen
              </button>
              {!selectedEvent.publishedEventId && year.status !== 'ARCHIVED' && (
                <button
                  onClick={() => handlePublish(selectedEvent.id)}
                  disabled={isPending}
                  className="px-4 py-2 bg-lions-blue text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
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
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  Als Event veröffentlichen
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
