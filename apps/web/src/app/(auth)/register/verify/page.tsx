import Link from 'next/link';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-lions-blue to-lions-blue/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
        <div className="w-16 h-16 bg-lions-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-lions-gold"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          E-Mail bestätigen
        </h1>

        <p className="text-gray-600 mb-6">
          Wir haben Ihnen eine E-Mail mit einem Bestätigungslink gesendet. Bitte
          klicken Sie auf den Link, um Ihre Registrierung abzuschließen.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Hinweis:</strong> Die E-Mail kann einige Minuten dauern.
            Bitte prüfen Sie auch Ihren Spam-Ordner.
          </p>
        </div>

        <Link
          href="/sign-in"
          className="text-lions-blue hover:underline font-medium"
        >
          Zur Anmeldung
        </Link>
      </div>
    </div>
  );
}
