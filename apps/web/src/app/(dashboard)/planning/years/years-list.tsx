'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { LionsYearWithStats } from './actions';
import { archiveLionsYear, deleteLionsYear, updateLionsYearStatus } from './actions';

interface YearsListProps {
  activeYears: LionsYearWithStats[];
  archivedYears: LionsYearWithStats[];
}

type Tab = 'active' | 'archived';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Entwurf', color: 'bg-gray-100 text-gray-700' },
  PLANNING: { label: 'In Planung', color: 'bg-yellow-100 text-yellow-700' },
  ACTIVE: { label: 'Aktiv', color: 'bg-green-100 text-green-700' },
  ARCHIVED: { label: 'Archiviert', color: 'bg-gray-100 text-gray-500' },
};

export function YearsList({ activeYears, archivedYears }: YearsListProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('active');
  const [isPending, startTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const years = activeTab === 'active' ? activeYears : archivedYears;

  const handleArchive = async (id: string) => {
    setError(null);
    startTransition(async () => {
      const result = await archiveLionsYear(id);
      if (!result.success) {
        setError(result.error || 'Fehler beim Archivieren');
      } else {
        router.refresh();
      }
    });
  };

  const handleActivate = async (id: string) => {
    setError(null);
    startTransition(async () => {
      const result = await updateLionsYearStatus(id, 'ACTIVE');
      if (!result.success) {
        setError(result.error || 'Fehler beim Aktivieren');
      } else {
        router.refresh();
      }
    });
  };

  const handleDelete = async (id: string) => {
    setError(null);
    startTransition(async () => {
      const result = await deleteLionsYear(id);
      if (!result.success) {
        setError(result.error || 'Fehler beim Löschen');
      } else {
        router.refresh();
      }
      setShowDeleteDialog(null);
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <>
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'active'
                  ? 'border-lions-blue text-lions-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Aktiv & In Planung
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100">
                {activeYears.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'archived'
                  ? 'border-lions-blue text-lions-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Archiviert
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100">
                {archivedYears.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Error message */}
        {error && (
          <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-lg">
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

        {/* Years list */}
        <div className="divide-y divide-gray-200">
          {years.length === 0 ? (
            <div className="p-8 text-center">
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
                {activeTab === 'active'
                  ? 'Keine aktiven Lionsjahre vorhanden'
                  : 'Keine archivierten Lionsjahre vorhanden'}
              </p>
              {activeTab === 'active' && (
                <Link
                  href="/planning/wizard"
                  className="inline-block mt-4 text-lions-blue hover:underline"
                >
                  Neues Lionsjahr planen →
                </Link>
              )}
            </div>
          ) : (
            years.map((year) => {
              const statusInfo = STATUS_LABELS[year.status];
              const canEdit = year.status !== 'ARCHIVED';
              const canDelete = year.status === 'DRAFT';
              const canArchive = year.status !== 'ARCHIVED' && year.status !== 'DRAFT';
              const canActivate = year.status === 'ARCHIVED' || year.status === 'PLANNING';

              return (
                <div
                  key={year.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Status indicator */}
                      <div
                        className={`w-3 h-3 rounded-full ${
                          year.status === 'ACTIVE'
                            ? 'bg-green-500'
                            : year.status === 'PLANNING'
                              ? 'bg-yellow-500'
                              : year.status === 'DRAFT'
                                ? 'bg-gray-400'
                                : 'bg-gray-300'
                        }`}
                      />

                      <div>
                        <Link
                          href={`/planning/years/${year.id}`}
                          className="font-medium text-gray-900 hover:text-lions-blue"
                        >
                          {year.name}
                        </Link>
                        <div className="text-sm text-gray-500 mt-0.5">
                          {formatDate(year.startDate)} – {formatDate(year.endDate)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Event count */}
                      <div className="text-sm text-gray-500">
                        {year._count.plannedEvents} Termine
                      </div>

                      {/* Status badge */}
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${statusInfo.color}`}
                      >
                        {statusInfo.label}
                      </span>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/planning/years/${year.id}`}
                          className="p-2 text-gray-400 hover:text-lions-blue transition-colors"
                          title="Anzeigen"
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
                        </Link>

                        {canEdit && (
                          <Link
                            href={`/planning/years/${year.id}/edit`}
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
                          </Link>
                        )}

                        {canActivate && (
                          <button
                            onClick={() => handleActivate(year.id)}
                            disabled={isPending}
                            className="p-2 text-gray-400 hover:text-green-600 transition-colors disabled:opacity-50"
                            title="Als aktiv setzen"
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
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </button>
                        )}

                        {canArchive && (
                          <button
                            onClick={() => handleArchive(year.id)}
                            disabled={isPending}
                            className="p-2 text-gray-400 hover:text-amber-600 transition-colors disabled:opacity-50"
                            title="Archivieren"
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
                                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                              />
                            </svg>
                          </button>
                        )}

                        {canDelete && (
                          <button
                            onClick={() => setShowDeleteDialog(year.id)}
                            disabled={isPending}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
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
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Lionsjahr löschen?
            </h3>
            <p className="text-gray-600 mb-6">
              Möchten Sie dieses Lionsjahr wirklich löschen? Diese Aktion kann
              nicht rückgängig gemacht werden. Alle zugehörigen Termine werden
              ebenfalls gelöscht.
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
