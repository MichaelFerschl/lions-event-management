import Link from 'next/link';
import { db } from '@/lib/db';
import { getCurrentTenant } from '@/lib/tenant';
import { getTranslations } from 'next-intl/server';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EventCard } from '@/components/events/event-card';
import { formatDate, formatTime } from '@/lib/format';
import { EventWithCount } from '@/types';
import { UpcomingEventsWidget } from '../planning/components/upcoming-events-widget';
import { headers } from 'next/headers';

export default async function DashboardPage() {
  const t = await getTranslations('dashboard');
  const tPlanning = await getTranslations('planning');

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
          {t('welcome', { name: tenant.name })}
        </h1>
        <p className="text-gray-600 mt-2">
          {t('overview')}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Next Event */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              {t('nextEvent')}
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
                {t('noUpcomingEvents')}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Total Members */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              {t('activeMembers')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {totalMembers}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {t('members')}
            </div>
          </CardContent>
        </Card>

        {/* Open Registrations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              {t('openRegistrations')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {openRegistrations}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {t('registrations')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {t('upcomingEvents')}
          </h2>
          <Link href="/events">
            <Button variant="outline" size="sm">
              {t('viewAll')}
            </Button>
          </Link>
        </div>

        {upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingEvents.map((event: EventWithCount) => (
              <EventCard key={event.id} event={event} locale={locale} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              {t('noEventsYet')}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Planned Events Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingEventsWidget />

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">
              {t('quickActions')}
            </h3>
          </div>
          <div className="p-4 grid grid-cols-2 gap-4">
            <Link href="/events/new">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="py-6 text-center">
                  <svg
                    className="w-10 h-10 mx-auto text-lions-gold mb-2"
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
                  <div className="text-sm font-medium text-gray-900">
                    {t('newEvent')}
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/planning/wizard">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="py-6 text-center">
                  <svg
                    className="w-10 h-10 mx-auto text-lions-blue mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                  <div className="text-sm font-medium text-gray-900">
                    {t('planLionsYear')}
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/planning/years">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="py-6 text-center">
                  <svg
                    className="w-10 h-10 mx-auto text-green-600 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <div className="text-sm font-medium text-gray-900">
                    {tPlanning('lionsYears')}
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/planning">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="py-6 text-center">
                  <svg
                    className="w-10 h-10 mx-auto text-purple-600 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <div className="text-sm font-medium text-gray-900">
                    {t('masterData')}
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
