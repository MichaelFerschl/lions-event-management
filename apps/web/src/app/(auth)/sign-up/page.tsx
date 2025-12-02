import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="max-w-md w-full mx-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">L</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Registrierung nur auf Einladung
        </h1>

        <div className="text-gray-600 space-y-4 mb-6">
          <p>Lions Hub ist ein geschlossenes Portal für Lions Club Mitglieder.</p>
          <p>
            Um Zugang zu erhalten, müssen Sie von einem Administrator oder Präsidenten
            Ihres Lions Clubs eingeladen werden.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Sie haben eine Einladung erhalten?</strong>
            <br />
            Klicken Sie auf den Link in der E-Mail, um sich zu registrieren.
          </p>
        </div>

        <div className="text-sm text-gray-500">
          <p>Bei Fragen wenden Sie sich an:</p>
          <p className="font-medium">den Präsidenten oder Sekretär Ihres Clubs</p>
        </div>
      </div>

      <p className="mt-6 text-center text-white/80 text-sm">
        Bereits registriert?{' '}
        <Link href="/sign-in" className="text-white font-medium hover:underline">
          Jetzt anmelden
        </Link>
      </p>
    </div>
  );
}
