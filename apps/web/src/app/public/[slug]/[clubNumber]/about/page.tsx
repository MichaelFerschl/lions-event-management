import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';

interface AboutPageProps {
  params: Promise<{
    slug: string;
    clubNumber: string;
  }>;
}

async function getTenant(slug: string, clubNumber: string) {
  const tenant = await db.tenant.findFirst({
    where: {
      slug,
      clubNumber,
      websiteEnabled: true,
    },
  });

  return tenant;
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { slug, clubNumber } = await params;
  const tenant = await getTenant(slug, clubNumber);

  if (!tenant) {
    notFound();
  }

  const basePath = `/public/${slug}/${clubNumber}`;

  // Split aboutText into paragraphs for better rendering
  const paragraphs = tenant.aboutText?.split('\n\n') || [];

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
            <span className="text-[#EBB700]">Über uns</span>
          </nav>
          <h1 className="text-4xl font-bold mb-4">Über uns</h1>
          <p className="text-xl text-blue-200 max-w-2xl">
            Erfahren Sie mehr über den {tenant.name} und unsere Mission.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* About Text */}
            <div className="bg-white rounded-xl shadow-md p-8 mb-8">
              <h2 className="text-2xl font-bold text-[#00338D] mb-6">
                {tenant.name}
              </h2>

              {paragraphs.length > 0 ? (
                <div className="prose prose-lg max-w-none">
                  {paragraphs.map((paragraph, index) => {
                    // Check if paragraph contains bullet points
                    if (paragraph.includes('•')) {
                      const lines = paragraph.split('\n');
                      return (
                        <div key={index} className="mb-4">
                          {lines.map((line, lineIndex) => {
                            if (line.startsWith('•')) {
                              return (
                                <div
                                  key={lineIndex}
                                  className="flex items-start mb-2"
                                >
                                  <span className="text-[#EBB700] mr-3 mt-1">
                                    •
                                  </span>
                                  <span className="text-gray-700">
                                    {line.substring(1).trim()}
                                  </span>
                                </div>
                              );
                            }
                            return (
                              <p key={lineIndex} className="text-gray-700 mb-2">
                                {line}
                              </p>
                            );
                          })}
                        </div>
                      );
                    }
                    return (
                      <p key={index} className="text-gray-700 mb-4 leading-relaxed">
                        {paragraph}
                      </p>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-600">
                  Willkommen beim {tenant.name}. Als Mitglied von Lions Clubs
                  International setzen wir uns für Menschen in Not ein und
                  fördern das Gemeinwohl in unserer Region.
                </p>
              )}
            </div>

            {/* Lions Values */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-[#00338D] mb-6">
                Unsere Werte
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-[#EBB700] rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                    <svg
                      className="w-6 h-6 text-[#00338D]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#00338D] mb-1">Integrität</h3>
                    <p className="text-gray-600 text-sm">
                      Wir handeln ehrlich und transparent in allem, was wir tun.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-[#EBB700] rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                    <svg
                      className="w-6 h-6 text-[#00338D]"
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
                  <div>
                    <h3 className="font-bold text-[#00338D] mb-1">Teamwork</h3>
                    <p className="text-gray-600 text-sm">
                      Gemeinsam erreichen wir mehr als allein.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-[#EBB700] rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                    <svg
                      className="w-6 h-6 text-[#00338D]"
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
                  <div>
                    <h3 className="font-bold text-[#00338D] mb-1">Service</h3>
                    <p className="text-gray-600 text-sm">
                      We Serve - Wir dienen der Gemeinschaft.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-[#EBB700] rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                    <svg
                      className="w-6 h-6 text-[#00338D]"
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
                  <div>
                    <h3 className="font-bold text-[#00338D] mb-1">
                      Vielfalt & Inklusion
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Wir schätzen Vielfalt und heißen jeden willkommen.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Lions International Info */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="text-center mb-4">
                <div className="w-20 h-20 bg-[#00338D] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-[#EBB700] font-bold text-3xl">L</span>
                </div>
                <h3 className="font-bold text-[#00338D]">
                  Lions Clubs International
                </h3>
              </div>
              <p className="text-gray-600 text-sm text-center mb-4">
                Mit über 1,4 Millionen Mitgliedern in mehr als 200 Ländern sind
                wir die größte Service-Organisation der Welt.
              </p>
              <a
                href="https://www.lionsclubs.org"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-[#00338D] hover:text-[#EBB700] text-sm font-medium"
              >
                Mehr erfahren →
              </a>
            </div>

            {/* Club Info */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h3 className="font-bold text-[#00338D] mb-4">Club-Daten</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between">
                  <span className="text-gray-500">Club-Nummer:</span>
                  <span className="font-medium text-gray-900">
                    {tenant.clubNumber}
                  </span>
                </li>
                {tenant.website && (
                  <li className="flex justify-between">
                    <span className="text-gray-500">Website:</span>
                    <a
                      href={tenant.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-[#00338D] hover:underline"
                    >
                      Besuchen
                    </a>
                  </li>
                )}
              </ul>
            </div>

            {/* Board Members Placeholder */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-bold text-[#00338D] mb-4">Vorstand</h3>
              <p className="text-gray-500 text-sm italic">
                Die Vorstandsmitglieder werden hier demnächst angezeigt.
              </p>
              {/* Placeholder for future board members feature */}
              <div className="mt-4 space-y-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
                  <div className="ml-3">
                    <div className="h-3 w-24 bg-gray-200 rounded"></div>
                    <div className="h-2 w-16 bg-gray-100 rounded mt-1"></div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
                  <div className="ml-3">
                    <div className="h-3 w-20 bg-gray-200 rounded"></div>
                    <div className="h-2 w-14 bg-gray-100 rounded mt-1"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 bg-[#00338D] rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Haben Sie Fragen?
          </h2>
          <p className="text-blue-200 mb-6">
            Wir freuen uns, von Ihnen zu hören. Nehmen Sie Kontakt mit uns auf!
          </p>
          <Link
            href={`${basePath}/contact`}
            className="inline-flex items-center px-6 py-3 bg-[#EBB700] text-[#00338D] font-bold rounded-lg hover:bg-yellow-400 transition-colors"
          >
            Kontakt aufnehmen
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
        </div>
      </div>
    </div>
  );
}
