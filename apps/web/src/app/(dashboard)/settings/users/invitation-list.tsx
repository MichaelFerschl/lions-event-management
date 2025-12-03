'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { useLocale, useTranslations } from 'next-intl';

interface Invitation {
  id: string;
  email: string;
  token: string;
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

export function InvitationList({ invitations: initialInvitations }: InvitationListProps) {
  const t = useTranslations('users');
  const tMembers = useTranslations('members');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const dateLocale = locale === 'de' ? de : enUS;
  const [invitations, setInvitations] = useState(initialInvitations);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const getInviteUrl = (token: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/invite/${token}`;
  };

  const handleCopyLink = async (invitation: Invitation) => {
    try {
      const url = getInviteUrl(invitation.token);
      await navigator.clipboard.writeText(url);
      setCopiedId(invitation.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setError(t('invitation.copyError'));
    }
  };

  const handleResend = async (invitation: Invitation) => {
    setResendingId(invitation.id);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/invitations/${invitation.token}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t('invitation.resendError'));
        return;
      }

      setSuccess(t('invitation.resendSuccess', { email: invitation.email }));
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError(t('invitation.resendError'));
    } finally {
      setResendingId(null);
    }
  };

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(t('invitation.revokeConfirm', { email }))) {
      return;
    }

    setDeletingId(id);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/invitations/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || t('invitation.revokeError'));
        return;
      }

      // Aus der Liste entfernen
      setInvitations(invitations.filter((inv) => inv.id !== id));
    } catch {
      setError(t('invitation.revokeError'));
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
        {t('pendingCount', { count: invitations.length })}
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-2 rounded mb-3 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-800 hover:underline ml-2">
            {tCommon('close')}
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 p-2 rounded mb-3 text-sm flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="text-green-800 hover:underline ml-2">
            {tCommon('close')}
          </button>
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
              <span className="ml-2 text-sm text-gray-500">
                {tMembers(`roles.${inv.roleType}`)}
              </span>
              <span className="ml-2 text-xs text-gray-400">
                • {t('invitation.invitedBy', { name: `${inv.invitedBy.firstName} ${inv.invitedBy.lastName}` })}
              </span>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <span className="text-sm text-gray-500 whitespace-nowrap">
                {t('invitation.expiresIn', {
                  time: formatDistanceToNow(new Date(inv.expiresAt), { addSuffix: true, locale: dateLocale })
                })}
              </span>

              {/* Copy Link Button */}
              <button
                onClick={() => handleCopyLink(inv)}
                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title={t('invitation.copyLink')}
              >
                {copiedId === inv.id ? (
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                )}
              </button>

              {/* Resend Email Button */}
              <button
                onClick={() => handleResend(inv)}
                disabled={resendingId === inv.id}
                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                title={t('invitation.resend')}
              >
                {resendingId === inv.id ? (
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
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                )}
              </button>

              {/* Delete Button */}
              <button
                onClick={() => handleDelete(inv.id, inv.email)}
                disabled={deletingId === inv.id}
                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                title={t('invitation.revoke')}
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
