'use client';

import { useState } from 'react';

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  role: {
    type: string;
    name: string;
  } | null;
}

interface MemberListProps {
  members: Member[];
  currentMemberId: string;
  canDelete: boolean;
}

export function MemberList({
  members: initialMembers,
  currentMemberId,
  canDelete,
}: MemberListProps) {
  const [members, setMembers] = useState(initialMembers);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (member: Member) => {
    const confirmMessage = `Möchten Sie "${member.firstName} ${member.lastName}" (${member.email}) wirklich löschen?\n\nDiese Aktion kann nicht rückgängig gemacht werden. Der Benutzer wird auch aus dem Authentifizierungssystem entfernt.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    setDeletingId(member.id);
    setError(null);

    try {
      const response = await fetch(`/api/members/${member.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Fehler beim Löschen');
        return;
      }

      // Aus der Liste entfernen
      setMembers(members.filter((m) => m.id !== member.id));
    } catch {
      setError('Ein unerwarteter Fehler ist aufgetreten');
    } finally {
      setDeletingId(null);
    }
  };

  const adminCount = members.filter((m) => m.role?.type === 'ADMIN' && m.isActive).length;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">Mitglieder ({members.length})</h2>
      </div>

      {error && (
        <div className="mx-4 mt-4 bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-2 text-red-800 hover:underline">
            Schließen
          </button>
        </div>
      )}

      <div className="divide-y divide-gray-200">
        {members.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            Noch keine Mitglieder vorhanden
          </div>
        ) : (
          members.map((member) => {
            const isCurrentUser = member.id === currentMemberId;
            const isAdmin = member.role?.type === 'ADMIN';
            const isLastAdmin = isAdmin && adminCount <= 1;

            return (
              <div
                key={member.id}
                className="px-4 py-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
                      {member.firstName[0]}
                      {member.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {member.firstName} {member.lastName}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                          Du
                        </span>
                      )}
                      {isLastAdmin && (
                        <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                          Letzter Admin
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{member.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`text-sm px-2 py-1 rounded ${
                      member.role?.type === 'ADMIN'
                        ? 'bg-purple-100 text-purple-700'
                        : member.role?.type === 'PRESIDENT'
                          ? 'bg-yellow-100 text-yellow-700'
                          : member.role?.type === 'SECRETARY'
                            ? 'bg-blue-100 text-blue-700'
                            : member.role?.type === 'GUEST'
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {member.role?.name || 'Keine Rolle'}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${member.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                    title={member.isActive ? 'Aktiv' : 'Inaktiv'}
                  />

                  {/* Löschen-Button */}
                  {canDelete && !isCurrentUser && (
                    <button
                      onClick={() => handleDelete(member)}
                      disabled={deletingId === member.id || isLastAdmin}
                      className={`p-1.5 rounded transition-colors ${
                        isLastAdmin
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                      } disabled:opacity-50`}
                      title={
                        isLastAdmin
                          ? 'Letzter Administrator kann nicht gelöscht werden'
                          : 'Mitglied löschen'
                      }
                    >
                      {deletingId === member.id ? (
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
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
