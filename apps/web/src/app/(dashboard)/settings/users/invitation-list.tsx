'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface Invitation {
  id: string;
  email: string;
  roleType: string;
  invitedBy: {
    firstName: string;
    lastName: string;
  };
  expiresAt: string;
}

interface InvitationListProps {
  invitations: Invitation[];
}

const roleLabels: Record<string, string> = {
  ADMIN: 'Administrator',
  PRESIDENT: 'Präsident',
  SECRETARY: 'Sekretär',
  BOARD: 'Vorstand',
  MEMBER: 'Mitglied',
  GUEST: 'Gast',
};

export function InvitationList({ invitations: initialInvitations }: InvitationListProps) {
  const [invitations, setInvitations] = useState(initialInvitations);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Einladung für "${email}" wirklich widerrufen?`)) {
      return;
    }

    setDeletingId(id);
    setError(null);

    try {
      const response = await fetch(`/api/invitations/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Fehler beim Löschen');
        return;
      }

      // Aus der Liste entfernen
      setInvitations(invitations.filter((inv) => inv.id !== id));
    } catch {
      setError('Ein unerwarteter Fehler ist aufgetreten');
    } finally {
      setDeletingId(null);
    }
  };

  if (invitations.length === 0) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <h2 className="font-semibold text-yellow-800 mb-3">
        Ausstehende Einladungen ({invitations.length})
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-2 rounded mb-3 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {invitations.map((inv) => (
          <div
            key={inv.id}
            className="flex items-center justify-between bg-white rounded-lg p-3 border border-yellow-100"
          >
            <div className="flex-1 min-w-0">
              <span className="font-medium text-gray-900">{inv.email}</span>
              <span className="ml-2 text-sm text-gray-500">als {roleLabels[inv.roleType]}</span>
              <span className="ml-2 text-xs text-gray-400">
                • Eingeladen von {inv.invitedBy.firstName} {inv.invitedBy.lastName}
              </span>
            </div>
            <div className="flex items-center gap-3 ml-4">
              <span className="text-sm text-gray-500 whitespace-nowrap">
                Läuft ab{' '}
                {formatDistanceToNow(new Date(inv.expiresAt), { addSuffix: true, locale: de })}
              </span>
              <button
                onClick={() => handleDelete(inv.id, inv.email)}
                disabled={deletingId === inv.id}
                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                title="Einladung widerrufen"
              >
                {deletingId === inv.id ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
