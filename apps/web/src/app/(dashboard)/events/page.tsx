import Link from 'next/link';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { getCurrentTenant } from '@/lib/tenant';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EventCard } from '@/components/events/event-card';
import { EventWithCount } from '@/types';

export default async function EventsPage({
  searchParams,
}: {
  searchParams: { filter?: string };
}) {
  const tenant = await getCurrentTenant();
  const headersList = await headers();
  const locale = headersList.get('x-locale') || 'de';
  const filter = searchParams.filter || 'upcoming';

  // Build query based on filter
  const now = new Date();
  const whereClause: any = {
    tenantId: tenant.id,
    isPublished: true,
  };

  if (filter === 'upcoming') {
    whereClause.startDate = { gte: now };
  } else if (filter === 'past') {
    whereClause.startDate = { lt: now };
  }

  // Fetch events
  const events = await db.event.findMany({
    where: whereClause,
    include: {
      category: true,
      _count: {
        select: {
          registrations: true,
        },
      },
    },
    orderBy: {
      startDate: filter === 'past' ? 'desc' : 'asc',
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {locale === 'en' ? 'Events' : 'Veranstaltungen'}
        </h1>
        <Link href="/events/new">
          <Button variant="primary">
            {locale === 'en' ? 'New Event' : 'Neue Veranstaltung'}
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <FilterTab
            href="/events?filter=upcoming"
            active={filter === 'upcoming'}
          >
            {locale === 'en' ? 'Upcoming' : 'Kommende'}
          </FilterTab>
          <FilterTab
            href="/events?filter=past"
            active={filter === 'past'}
          >
            {locale === 'en' ? 'Past' : 'Vergangene'}
          </FilterTab>
          <FilterTab
            href="/events?filter=all"
            active={filter === 'all'}
          >
            {locale === 'en' ? 'All' : 'Alle'}
          </FilterTab>
        </nav>
      </div>

      {/* Events Grid */}
      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event: EventWithCount) => (
            <EventCard key={event.id} event={event} locale={locale} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 mb-4"
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
            <p className="text-gray-500 text-lg">
              {locale === 'en'
                ? `No ${filter} events found.`
                : `Keine ${filter === 'upcoming' ? 'kommenden' : filter === 'past' ? 'vergangenen' : ''} Veranstaltungen gefunden.`}
            </p>
            <Link href="/events/new">
              <Button variant="primary" className="mt-4">
                {locale === 'en' ? 'Create First Event' : 'Erste Veranstaltung erstellen'}
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function FilterTab({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`
        border-b-2 py-4 px-1 text-sm font-medium transition-colors
        ${
          active
            ? 'border-lions-gold text-lions-blue'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }
      `}
    >
      {children}
    </Link>
  );
}
