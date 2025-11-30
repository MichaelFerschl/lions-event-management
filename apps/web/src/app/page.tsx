import { db } from '@/lib/db';

export default async function HomePage() {
  // Test database connection by fetching the first tenant
  const tenant = await db.tenant.findFirst();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-lions-blue to-lions-purple p-8">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-white mb-4">
            Lions Event Management Hub
          </h1>
          <p className="text-2xl text-lions-gold font-semibold">
            Einer Welt in Not helfen
          </p>
        </div>

        {tenant ? (
          <div className="mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-lg border border-lions-gold/30">
            <p className="text-white text-lg mb-2">
              Datenbankverbindung erfolgreich!
            </p>
            <p className="text-lions-gold text-xl font-bold">
              {tenant.name}
            </p>
            <p className="text-white/80 text-sm mt-2">
              Tenant ID: {tenant.id}
            </p>
          </div>
        ) : (
          <div className="mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-lg border border-white/30">
            <p className="text-white text-lg">
              Keine Tenants in der Datenbank gefunden.
            </p>
            <p className="text-white/80 text-sm mt-2">
              Bitte führe den Seed-Befehl aus: <code>pnpm db:seed</code>
            </p>
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
          <div className="p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/20">
            <h3 className="text-lions-gold font-bold text-lg mb-2">Events</h3>
            <p className="text-white/80 text-sm">
              Verwalte Veranstaltungen und Jahresprogramme
            </p>
          </div>
          <div className="p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/20">
            <h3 className="text-lions-gold font-bold text-lg mb-2">
              Mitglieder
            </h3>
            <p className="text-white/80 text-sm">
              Mitgliederverwaltung und An-/Abmeldungen
            </p>
          </div>
          <div className="p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/20">
            <h3 className="text-lions-gold font-bold text-lg mb-2">
              Protokolle
            </h3>
            <p className="text-white/80 text-sm">
              Digitale Protokollverwaltung
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
