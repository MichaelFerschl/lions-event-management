import Link from 'next/link';
import { getCurrentTenant } from '@/lib/tenant';
import { createClient } from '@/lib/supabase/server';
import { LanguageSwitcherCompact } from '@/components/language-switcher';
import { UserNav } from '@/components/auth/user-nav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getCurrentTenant();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-lions-blue text-white">
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-6 border-b border-white/10">
            <h1 className="text-xl font-bold">{tenant.name}</h1>
            <p className="text-sm text-white/70 mt-1">Event Management</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            <NavLink href="/dashboard" icon="home">
              Dashboard
            </NavLink>
            <NavLink href="/events" icon="calendar">
              Veranstaltungen
            </NavLink>
            <NavLink href="/planning" icon="clipboard">
              Jahresplanung
            </NavLink>
            <NavLink href="/members" icon="users" disabled>
              Mitglieder
            </NavLink>
            <NavLink href="/protocols" icon="document" disabled>
              Protokolle
            </NavLink>
            <NavLink href="/gallery" icon="photo" disabled>
              Galerie
            </NavLink>
            <NavLink href="/website" icon="globe">
              Website
            </NavLink>
            <NavLink href="/settings/users" icon="users-cog">
              Benutzerverwaltung
            </NavLink>
            <NavLink href="/settings" icon="cog" disabled>
              Einstellungen
            </NavLink>
          </nav>

          {/* Footer with Debug Info */}
          <div className="p-4 border-t border-white/10 space-y-3">
            {/* Tenant Info */}
            <div className="bg-white/5 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-xs font-medium text-white/80">Verbunden</span>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-white/50">Club</div>
                <div className="text-sm font-medium text-white truncate" title={tenant.name}>
                  {tenant.name}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-white/50">Tenant ID</div>
                  <div className="text-white/80 font-mono truncate" title={tenant.id}>
                    {tenant.id.slice(0, 8)}...
                  </div>
                </div>
                <div>
                  <div className="text-white/50">Club Nr.</div>
                  <div className="text-white/80 font-mono">
                    {tenant.clubNumber}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs text-white/50">Datenbank</div>
                <div className="text-xs text-white/80 font-mono">
                  {process.env.NODE_ENV === 'production' ? 'PROD' :
                   process.env.VERCEL_ENV === 'preview' ? 'TEST' :
                   process.env.VERCEL_ENV === 'development' ? 'DEV' : 'LOCAL'}
                </div>
              </div>
            </div>

            <div className="text-xs text-white/30 text-center">
              Lions Event Management Hub
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="pl-64">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">
              {tenant.name}
            </h2>
            <div className="flex items-center space-x-4">
              <LanguageSwitcherCompact />
              {user ? (
                <UserNav />
              ) : (
                <Link
                  href="/sign-in"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Anmelden
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

function NavLink({
  href,
  icon,
  children,
  disabled = false,
}: {
  href: string;
  icon: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const iconPaths: Record<string, string> = {
    home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    calendar:
      'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    users:
      'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    document:
      'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    photo:
      'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    cog: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    'users-cog':
      'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    globe:
      'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9',
    clipboard:
      'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
  };

  if (disabled) {
    return (
      <div className="flex items-center px-4 py-2 text-sm rounded-md text-white/30 cursor-not-allowed">
        <svg
          className="w-5 h-5 mr-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={iconPaths[icon]}
          />
        </svg>
        {children}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="flex items-center px-4 py-2 text-sm rounded-md hover:bg-white/10 transition-colors"
    >
      <svg
        className="w-5 h-5 mr-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={iconPaths[icon]}
        />
      </svg>
      {children}
    </Link>
  );
}
