import Link from 'next/link';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { getCurrentTenant } from '@/lib/tenant';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EventCard } from '@/components/events/event-card';
import { formatDate, formatTime } from '@/lib/format';

export default async function DashboardPage() {
  const tenant = await getCurrentTenant();
  const headersList = await headers();
  const locale = headersList.get('x-locale') || 'de';

  // Fetch upcoming events
  const upcomingEvents = await db.event.findMany({
    where: {
      tenantId: tenant.id,
      startDate: {
        gte: new Date(),
      },
      isPublished: true,
    },
    include: {
      category: true,
      _count: {
        select: {
          registrations: true,
        },
      },
    },
    orderBy: {
      startDate: 'asc',
    },
    take: 3,
  });

  // Fetch statistics
  const [totalMembers, nextEvent, openRegistrations] = await Promise.all([
    db.member.count({
      where: {
        tenantId: tenant.id,
        status: 'ACTIVE',
      },
    }),
    db.event.findFirst({
      where: {
        tenantId: tenant.id,
        startDate: {
          gte: new Date(),
        },
        isPublished: true,
      },
      orderBy: {
        startDate: 'asc',
      },
    }),
    db.eventRegistration.count({
      where: {
        tenantId: tenant.id,
        status: 'REGISTERED',
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {locale === 'en'
            ? `Welcome to ${tenant.name}`
            : `Willkommen bei ${tenant.name}`}
        </h1>
        <p className="text-gray-600 mt-2">
          {locale === 'en'
            ? 'Here is an overview of your club activities'
            : 'Hier ist eine Übersicht über Ihre Club-Aktivitäten'}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Next Event */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              {locale === 'en' ? 'Next Event' : 'Nächste Veranstaltung'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nextEvent ? (
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {nextEvent.title}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {formatDate(nextEvent.startDate, locale)}
                </div>
                <div className="text-sm text-gray-600">
                  {formatTime(nextEvent.startDate, locale)}
                </div>
              </div>
            ) : (
              <div className="text-gray-500">
                {locale === 'en'
                  ? 'No upcoming events'
                  : 'Keine kommenden Veranstaltungen'}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Total Members */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              {locale === 'en' ? 'Active Members' : 'Aktive Mitglieder'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {totalMembers}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {locale === 'en' ? 'Members' : 'Mitglieder'}
            </div>
          </CardContent>
        </Card>

        {/* Open Registrations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              {locale === 'en'
                ? 'Open Registrations'
                : 'Offene Anmeldungen'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {openRegistrations}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {locale === 'en' ? 'Registrations' : 'Anmeldungen'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {locale === 'en' ? 'Upcoming Events' : 'Kommende Veranstaltungen'}
          </h2>
          <Link href="/events">
            <Button variant="outline" size="sm">
              {locale === 'en' ? 'View All' : 'Alle anzeigen'}
            </Button>
          </Link>
        </div>

        {upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} locale={locale} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              {locale === 'en'
                ? 'No upcoming events. Create your first event!'
                : 'Keine kommenden Veranstaltungen. Erstellen Sie Ihre erste Veranstaltung!'}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {locale === 'en' ? 'Quick Actions' : 'Schnellzugriff'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/events/new">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="py-6 text-center">
                <svg
                  className="w-12 h-12 mx-auto text-lions-gold mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <div className="font-medium text-gray-900">
                  {locale === 'en' ? 'New Event' : 'Neue Veranstaltung'}
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
