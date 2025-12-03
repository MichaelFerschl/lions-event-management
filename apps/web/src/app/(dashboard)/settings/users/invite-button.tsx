'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface SuccessData {
  email: string;
  inviteUrl: string;
  emailSent: boolean;
}

export function InviteUserButton() {
  const t = useTranslations('users.invite');
  const tMembers = useTranslations('members');
  const tCommon = useTranslations('common');
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [roleType, setRoleType] = useState('MEMBER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessData | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, roleType }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t('error'));
        setLoading(false);
        return;
      }

      setSuccess({
        email: data.invitation.email,
        inviteUrl: data.invitation.inviteUrl,
        emailSent: data.emailSent,
      });
    } catch {
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSuccess(null);
    setEmail('');
    setRoleType('MEMBER');
    setError(null);
    router.refresh();
  };

  const handleInviteAnother = () => {
    setSuccess(null);
    setEmail('');
    setRoleType('MEMBER');
    setError(null);
  };

  const roleOptions = [
    { value: 'ADMIN' },
    { value: 'PRESIDENT' },
    { value: 'SECRETARY' },
    { value: 'BOARD' },
    { value: 'MEMBER' },
    { value: 'GUEST' },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        {t('button')}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">{t('title')}</h2>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {success ? (
              <div className="space-y-4">
                <div
                  className={`${success.emailSent ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'} border rounded-lg p-4`}
                >
                  <div
                    className={`flex items-center gap-2 ${success.emailSent ? 'text-green-700' : 'text-yellow-700'} mb-2`}
                  >
                    {success.emailSent ? (
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
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    )}
                    <span className="font-medium">
                      {success.emailSent
                        ? t('success')
                        : t('errorEmailFailed')}
                    </span>
                  </div>
                  <p
                    className={`text-sm ${success.emailSent ? 'text-green-600' : 'text-yellow-600'}`}
                  >
                    {success.emailSent
                      ? t('successMessage', { email: success.email })
                      : t('errorEmailFailed')}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('linkLabel')}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={success.inviteUrl}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-600"
                    />
                    <button
                      onClick={() => copyToClipboard(success.inviteUrl)}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      title={t('copyLink')}
                    >
                      <svg
                        className="w-5 h-5 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('expiresIn')}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleInviteAnother}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {t('inviteAnother')}
                  </button>
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {tCommon('close')}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('email')}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('emailPlaceholder')}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('role')}</label>
                  <select
                    value={roleType}
                    onChange={(e) => setRoleType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {roleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {tMembers(`roles.${option.value}`)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {tCommon('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? t('sending') : t('send')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
