import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';

interface PublicHomePageProps {
  params: Promise<{
    slug: string;
    clubNumber: string;
  }>;
}

async function getTenantWithEvents(slug: string, clubNumber: string) {
  const tenant = await db.tenant.findFirst({
    where: {
      slug,
      clubNumber,
      websiteEnabled: true,
    },
  });

  if (!tenant) return null;

  // Get upcoming public events
  const events = await db.event.findMany({
    where: {
      tenantId: tenant.id,
      isPublic: true,
      isPublished: true,
      isCancelled: false,
      startDate: {
        gte: new Date(),
      },
    },
    orderBy: {
      startDate: 'asc',
    },
    take: 3,
    include: {
      category: true,
    },
  });

  return { tenant, events };
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'long',
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

export default async function PublicHomePage({ params }: PublicHomePageProps) {
  const { slug, clubNumber } = await params;
  const data = await getTenantWithEvents(slug, clubNumber);

  if (!data) {
    notFound();
  }

  const { tenant, events } = data;
  const basePath = `/public/${slug}/${clubNumber}`;

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-[#00338D] text-white">
        {tenant.heroImage && (
          <div className="absolute inset-0">
            <Image
              src={tenant.heroImage}
              alt={tenant.name}
              fill
              className="object-cover opacity-30"
              priority
            />
          </div>
        )}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Willkommen beim{' '}
              <span className="text-[#EBB700]">{tenant.name}</span>
            </h1>
            {tenant.heroText && (
              <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
                {tenant.heroText}
              </p>
            )}
            <div className="flex flex-wrap gap-4">
              <Link
                href={`${basePath}/events`}
                className="inline-flex items-center px-6 py-3 bg-[#EBB700] text-[#00338D] font-bold rounded-lg hover:bg-yellow-400 transition-colors"
              >
                Unsere Events
                <svg
                  className="ml-2 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
              <Link
                href={`${basePath}/contact`}
                className="inline-flex items-center px-6 py-3 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-[#00338D] transition-colors"
              >
                Kontakt aufnehmen
              </Link>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* We Serve Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#00338D] mb-4">We Serve</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Als Mitglied von Lions Clubs International setzen wir uns für
              Menschen in Not ein und fördern das Gemeinwohl in unserer Region.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#EBB700] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-[#00338D]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#00338D] mb-2">
                Soziales Engagement
              </h3>
              <p className="text-gray-600">
                Wir unterstützen Menschen in Not und fördern soziale Projekte in
                unserer Gemeinde.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#EBB700] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-[#00338D]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#00338D] mb-2">
                Gemeinschaft
              </h3>
              <p className="text-gray-600">
                Gemeinsam sind wir stark. Unsere Mitglieder verbindet die Freude
                am Helfen.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#EBB700] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-[#00338D]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#00338D] mb-2">
                International
              </h3>
              <p className="text-gray-600">
                Als Teil eines weltweiten Netzwerks helfen wir auch bei
                internationalen Projekten.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      {events.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-[#00338D]">
                Kommende Events
              </h2>
              <Link
                href={`${basePath}/events`}
                className="text-[#00338D] hover:text-[#EBB700] font-medium flex items-center gap-2"
              >
                Alle Events
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {events.map((event) => (
                <article
                  key={event.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    {event.category && (
                      <span
                        className="inline-block px-3 py-1 text-sm font-medium rounded-full mb-3"
                        style={{
                          backgroundColor: `${event.category.color}20`,
                          color: event.category.color,
                        }}
                      >
                        {event.category.name}
                      </span>
                    )}
                    <h3 className="text-xl font-bold text-[#00338D] mb-2">
                      {event.title}
                    </h3>
                    <div className="flex items-center text-gray-600 mb-2">
                      <svg
                        className="w-5 h-5 mr-2 text-[#EBB700]"
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
                    <div className="flex items-center text-gray-600 mb-4">
                      <svg
                        className="w-5 h-5 mr-2 text-[#EBB700]"
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
                      <span className="text-sm">{formatTime(event.startDate)} Uhr</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center text-gray-600">
                        <svg
                          className="w-5 h-5 mr-2 text-[#EBB700]"
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
                        <span className="text-sm">{event.location}</span>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-[#00338D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Interessiert an unserer Arbeit?
          </h2>
          <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
            Erfahren Sie mehr über uns oder nehmen Sie Kontakt mit uns auf. Wir
            freuen uns auf Sie!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={`${basePath}/about`}
              className="inline-flex items-center px-6 py-3 bg-[#EBB700] text-[#00338D] font-bold rounded-lg hover:bg-yellow-400 transition-colors"
            >
              Mehr über uns
            </Link>
            <Link
              href={`${basePath}/contact`}
              className="inline-flex items-center px-6 py-3 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-[#00338D] transition-colors"
            >
              Kontakt
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
