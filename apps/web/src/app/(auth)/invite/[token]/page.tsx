'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface InvitationData {
  id: string;
  email: string;
  tenantName: string;
  roleName: string;
  invitedByName: string;
  expiresAt: string;
}

export default function InviteAcceptPage() {
  const t = useTranslations('auth');
  const tInvite = useTranslations('auth.invite');
  const tErrors = useTranslations('errors');
  const tCommon = useTranslations('common');
  const tMembers = useTranslations('members');

  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const params = useParams();
  const token = params.token as string;
  const supabase = createClient();

  // Einladung laden
  useEffect(() => {
    async function loadInvitation() {
      try {
        const response = await fetch(`/api/invitations/${token}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || tInvite('notFound'));
        } else {
          setInvitation(data);
        }
      } catch {
        setError(tErrors('general'));
      } finally {
        setLoading(false);
      }
    }

    loadInvitation();
  }, [token, tInvite, tErrors]);

  const handleAcceptInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Validierung
    if (password !== confirmPassword) {
      setError(tErrors('passwordsDoNotMatch'));
      setSubmitting(false);
      return;
    }

    if (password.length < 8) {
      setError(tErrors('passwordTooShort'));
      setSubmitting(false);
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      setError(tInvite('nameRequired'));
      setSubmitting(false);
      return;
    }

    try {
      // 1. Supabase User erstellen
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invitation!.email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError(tInvite('alreadyRegistered'));
        } else {
          setError(authError.message);
        }
        setSubmitting(false);
        return;
      }

      // 2. Einladung akzeptieren (Member aktivieren)
      const response = await fetch(`/api/invitations/${token}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authUserId: authData.user?.id,
          firstName,
          lastName,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || tInvite('acceptError'));
        setSubmitting(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError(tErrors('general'));
      setSubmitting(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">{tCommon('loading')}</p>
        </div>
      </div>
    );
  }

  // Fehler State (ungültige/abgelaufene Einladung)
  if (error && !invitation) {
    return (
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
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
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{tInvite('invalid')}</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500 mb-4">
            {tInvite('invalidReasons')}
          </p>
          <Link href="/sign-in" className="text-blue-600 hover:underline">
            {t('signIn')}
          </Link>
        </div>
      </div>
    );
  }

  // Erfolg State
  if (success) {
    return (
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
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
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {tInvite('welcomeToLionsHub')}
          </h2>
          <p className="text-gray-600 mb-4">
            {tInvite('accountCreated')}
          </p>
          <Link
            href="/sign-in"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('signIn')}
          </Link>
        </div>
      </div>
    );
  }

  // Registrierungs-Formular
  return (
    <div className="max-w-md w-full mx-4">
      <div className="bg-white rounded-xl shadow-2xl p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">L</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
          {tInvite('acceptInvitation')}
        </h1>

        {/* Einladungs-Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-2">
            {tInvite('youAreInvited')}
          </p>
          <p className="font-semibold text-gray-900">{invitation?.tenantName}</p>
          <p className="text-sm text-gray-500 mt-1">
            {tMembers('role')}: {invitation?.roleName} • {tInvite('invitedBy')}: {invitation?.invitedByName}
          </p>
        </div>

        <form onSubmit={handleAcceptInvitation} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Email (nur Anzeige) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('email')}
            </label>
            <input
              type="email"
              value={invitation?.email || ''}
              disabled
              className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
            />
          </div>

          {/* Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('firstName')}
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('firstNamePlaceholder')}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('lastName')}
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('lastNamePlaceholder')}
                required
              />
            </div>
          </div>

          {/* Passwort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('passwordPlaceholder')}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('confirmPassword')}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('confirmPasswordPlaceholder')}
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
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
                {tCommon('loading')}
              </span>
            ) : (
              tInvite('registerAndAccept')
            )}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-white/80 text-sm">
        {tInvite('alreadyRegisteredQuestion')}{' '}
        <Link href="/sign-in" className="text-white font-medium hover:underline">
          {t('signIn')}
        </Link>
      </p>
    </div>
  );
}
