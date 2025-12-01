import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';

interface ContactPageProps {
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

export default async function ContactPage({ params }: ContactPageProps) {
  const { slug, clubNumber } = await params;
  const tenant = await getTenant(slug, clubNumber);

  if (!tenant) {
    notFound();
  }

  const basePath = `/public/${slug}/${clubNumber}`;

  // Format address for display
  const addressLines = tenant.contactAddress?.split('\n') || [];

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
            <span className="text-[#EBB700]">Kontakt</span>
          </nav>
          <h1 className="text-4xl font-bold mb-4">Kontakt</h1>
          <p className="text-xl text-blue-200 max-w-2xl">
            Wir freuen uns, von Ihnen zu hören. Nehmen Sie Kontakt mit uns auf!
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-bold text-[#00338D] mb-6">
              Kontaktinformationen
            </h2>

            <div className="bg-white rounded-xl shadow-md p-8 mb-8">
              <div className="space-y-6">
                {/* Email */}
                {tenant.contactEmail && (
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
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#00338D] mb-1">E-Mail</h3>
                      <a
                        href={`mailto:${tenant.contactEmail}`}
                        className="text-gray-600 hover:text-[#00338D] transition-colors"
                      >
                        {tenant.contactEmail}
                      </a>
                    </div>
                  </div>
                )}

                {/* Phone */}
                {tenant.contactPhone && (
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
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#00338D] mb-1">Telefon</h3>
                      <a
                        href={`tel:${tenant.contactPhone}`}
                        className="text-gray-600 hover:text-[#00338D] transition-colors"
                      >
                        {tenant.contactPhone}
                      </a>
                    </div>
                  </div>
                )}

                {/* Address */}
                {addressLines.length > 0 && (
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
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#00338D] mb-1">Adresse</h3>
                      <address className="text-gray-600 not-italic">
                        {addressLines.map((line, index) => (
                          <span key={index}>
                            {line}
                            {index < addressLines.length - 1 && <br />}
                          </span>
                        ))}
                      </address>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Social Media */}
            {(tenant.socialFacebook ||
              tenant.socialInstagram ||
              tenant.socialLinkedin) && (
              <div className="bg-white rounded-xl shadow-md p-8">
                <h3 className="text-xl font-bold text-[#00338D] mb-6">
                  Folgen Sie uns
                </h3>
                <div className="flex gap-4">
                  {tenant.socialFacebook && (
                    <a
                      href={tenant.socialFacebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-[#1877F2] rounded-full flex items-center justify-center text-white hover:opacity-80 transition-opacity"
                      aria-label="Facebook"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </a>
                  )}
                  {tenant.socialInstagram && (
                    <a
                      href={tenant.socialInstagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] rounded-full flex items-center justify-center text-white hover:opacity-80 transition-opacity"
                      aria-label="Instagram"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                      </svg>
                    </a>
                  )}
                  {tenant.socialLinkedin && (
                    <a
                      href={tenant.socialLinkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-[#0A66C2] rounded-full flex items-center justify-center text-white hover:opacity-80 transition-opacity"
                      aria-label="LinkedIn"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold text-[#00338D] mb-6">
              Nachricht senden
            </h2>

            <div className="bg-white rounded-xl shadow-md p-8">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Vorname *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00338D] focus:border-transparent transition-colors"
                      placeholder="Max"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Nachname *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00338D] focus:border-transparent transition-colors"
                      placeholder="Mustermann"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    E-Mail *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00338D] focus:border-transparent transition-colors"
                    placeholder="max.mustermann@example.de"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Telefon (optional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00338D] focus:border-transparent transition-colors"
                    placeholder="+49 123 456789"
                  />
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Betreff *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00338D] focus:border-transparent transition-colors"
                  >
                    <option value="">Bitte wählen...</option>
                    <option value="general">Allgemeine Anfrage</option>
                    <option value="membership">Mitgliedschaft</option>
                    <option value="event">Veranstaltung</option>
                    <option value="sponsorship">Sponsoring / Spende</option>
                    <option value="other">Sonstiges</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Nachricht *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00338D] focus:border-transparent transition-colors resize-none"
                    placeholder="Ihre Nachricht..."
                  ></textarea>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="privacy"
                    name="privacy"
                    required
                    className="mt-1 h-4 w-4 text-[#00338D] border-gray-300 rounded focus:ring-[#00338D]"
                  />
                  <label
                    htmlFor="privacy"
                    className="ml-3 text-sm text-gray-600"
                  >
                    Ich stimme der Verarbeitung meiner Daten gemäß der
                    Datenschutzerklärung zu. *
                  </label>
                </div>

                <button
                  type="submit"
                  disabled
                  className="w-full px-6 py-3 bg-[#00338D] text-white font-bold rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Nachricht senden
                </button>

                <p className="text-sm text-gray-500 text-center">
                  Das Kontaktformular ist derzeit noch nicht aktiv. Bitte
                  kontaktieren Sie uns per E-Mail oder Telefon.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
