'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerClub } from './actions';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await registerClub(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push('/register/verify');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lions-blue to-lions-blue/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Club registrieren</h1>
          <p className="text-gray-600 mt-2">
            Registrieren Sie Ihren Lions Club kostenlos auf der Plattform
          </p>
        </div>

        <form action={handleSubmit} className="space-y-6">
          {/* Club Informationen */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Club-Informationen
            </h2>

            <div>
              <label htmlFor="clubName" className="block text-sm font-medium text-gray-700 mb-1">
                Club-Name *
              </label>
              <input
                id="clubName"
                name="clubName"
                type="text"
                required
                placeholder="z.B. Lions Club Frankfurt Römer"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lions-blue focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="clubNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Club-Nummer (Lions International) *
              </label>
              <input
                id="clubNumber"
                name="clubNumber"
                type="text"
                required
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="z.B. 123456"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lions-blue focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">6-stellige Nummer von Lions International</p>
            </div>

            <div>
              <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                Distrikt (optional)
              </label>
              <input
                id="district"
                name="district"
                type="text"
                placeholder="z.B. 111-NB"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lions-blue focus:border-transparent"
              />
            </div>
          </div>

          {/* Admin Benutzer */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Administrator-Konto
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  Vorname *
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lions-blue focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nachname *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lions-blue focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-Mail-Adresse *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lions-blue focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Passwort *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lions-blue focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Mindestens 8 Zeichen</p>
            </div>

            <div>
              <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 mb-1">
                Passwort bestätigen *
              </label>
              <input
                id="passwordConfirm"
                name="passwordConfirm"
                type="password"
                required
                minLength={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lions-blue focus:border-transparent"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-lions-gold hover:bg-yellow-500 text-gray-900 font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Wird registriert...' : 'Club registrieren'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Bereits registriert?{' '}
          <Link href="/sign-in" className="text-lions-blue hover:underline font-medium">
            Anmelden
          </Link>
        </p>
      </div>
    </div>
  );
}
