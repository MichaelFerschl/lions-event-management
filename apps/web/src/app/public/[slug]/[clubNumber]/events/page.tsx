import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';

interface EventsPageProps {
  params: Promise<{
    slug: string;
    clubNumber: string;
  }>;
}

async function getTenantWithAllEvents(slug: string, clubNumber: string) {
  const tenant = await db.tenant.findFirst({
    where: {
      slug,
      clubNumber,
      websiteEnabled: true,
    },
  });

  if (!tenant) return null;

  // Get all public events (upcoming and past)
  const now = new Date();

  const upcomingEvents = await db.event.findMany({
    where: {
      tenantId: tenant.id,
      isPublic: true,
      isPublished: true,
      isCancelled: false,
      startDate: {
        gte: now,
      },
    },
    orderBy: {
      startDate: 'asc',
    },
    include: {
      category: true,
    },
  });

  const pastEvents = await db.event.findMany({
    where: {
      tenantId: tenant.id,
      isPublic: true,
      isPublished: true,
      startDate: {
        lt: now,
      },
    },
    orderBy: {
      startDate: 'desc',
    },
    take: 10,
    include: {
      category: true,
    },
  });

  return { tenant, upcomingEvents, pastEvents };
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date | null;
    location: string | null;
    locationUrl: string | null;
    isOnline: boolean;
    isCancelled: boolean;
    category: {
      id: string;
      name: string;
      color: string;
    } | null;
  };
  isPast?: boolean;
}

function EventCard({ event, isPast = false }: EventCardProps) {
  return (
    <article
      className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
        isPast ? 'opacity-75' : ''
      }`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          {event.category && (
            <span
              className="inline-block px-3 py-1 text-sm font-medium rounded-full"
              style={{
                backgroundColor: `${event.category.color}20`,
                color: event.category.color,
              }}
            >
              {event.category.name}
            </span>
          )}
          {event.isCancelled && (
            <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-600">
              Abgesagt
            </span>
          )}
          {isPast && !event.isCancelled && (
            <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-600">
              Vergangen
            </span>
          )}
        </div>

        <h3 className="text-xl font-bold text-[#00338D] mb-3">{event.title}</h3>

        <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>

        <div className="space-y-2">
          <div className="flex items-center text-gray-600">
            <svg
              className="w-5 h-5 mr-3 text-[#EBB700] flex-shrink-0"
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
            <span className="text-sm">{formatDate(event.startDate)}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <svg
              className="w-5 h-5 mr-3 text-[#EBB700] flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm">
              {formatTime(event.startDate)} Uhr
              {event.endDate && ` - ${formatTime(event.endDate)} Uhr`}
            </span>
          </div>

          {event.location && (
            <div className="flex items-center text-gray-600">
              <svg
                className="w-5 h-5 mr-3 text-[#EBB700] flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {event.locationUrl ? (
                <a
                  href={event.locationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#00338D] hover:underline"
                >
                  {event.location}
                </a>
              ) : (
                <span className="text-sm">{event.location}</span>
              )}
            </div>
          )}

          {event.isOnline && (
            <div className="flex items-center text-gray-600">
              <svg
                className="w-5 h-5 mr-3 text-[#EBB700] flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm">Online-Veranstaltung</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default async function EventsPage({ params }: EventsPageProps) {
  const { slug, clubNumber } = await params;
  const data = await getTenantWithAllEvents(slug, clubNumber);

  if (!data) {
    notFound();
  }

  const { upcomingEvents, pastEvents } = data;
  const basePath = `/public/${slug}/${clubNumber}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-[#00338D] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm mb-4">
            <Link href={basePath} className="text-blue-200 hover:text-white">
              Startseite
            </Link>
            <span className="mx-2 text-blue-300">/</span>
            <span className="text-[#EBB700]">Events</span>
          </nav>
          <h1 className="text-4xl font-bold mb-4">Unsere Events</h1>
          <p className="text-xl text-blue-200 max-w-2xl">
            Entdecken Sie unsere Veranstaltungen und Aktivitäten. Wir freuen uns
            auf Ihre Teilnahme!
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Upcoming Events */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-[#00338D] mb-6 flex items-center">
            <span className="w-3 h-3 bg-[#EBB700] rounded-full mr-3"></span>
            Kommende Events
          </h2>

          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <svg
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
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
                Derzeit sind keine kommenden Events geplant.
              </p>
              <p className="text-gray-400 mt-2">
                Schauen Sie bald wieder vorbei!
              </p>
            </div>
          )}
        </section>

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-[#00338D] mb-6 flex items-center">
              <span className="w-3 h-3 bg-gray-400 rounded-full mr-3"></span>
              Vergangene Events
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map((event) => (
                <EventCard key={event.id} event={event} isPast />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
