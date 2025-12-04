import Link from 'next/link';

export default function RegistrationSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-lions-blue to-lions-blue/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
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

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Registrierung erfolgreich!
        </h1>

        <p className="text-gray-600 mb-6">
          Ihr Lions Club wurde erfolgreich registriert. Sie können sich jetzt
          anmelden und mit der Einrichtung beginnen.
        </p>

        <Link
          href="/sign-in"
          className="inline-block w-full bg-lions-gold hover:bg-yellow-500 text-gray-900 font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          Jetzt anmelden
        </Link>
      </div>
    </div>
  );
}
