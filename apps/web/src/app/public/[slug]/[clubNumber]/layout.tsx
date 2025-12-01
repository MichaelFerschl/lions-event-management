import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';

interface PublicLayoutProps {
  children: React.ReactNode;
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

export default async function PublicLayout({
  children,
  params,
}: PublicLayoutProps) {
  const { slug, clubNumber } = await params;
  const tenant = await getTenant(slug, clubNumber);

  if (!tenant) {
    notFound();
  }

  const basePath = `/public/${slug}/${clubNumber}`;

  const navigation = [
    { name: 'Startseite', href: basePath },
    { name: 'Events', href: `${basePath}/events` },
    { name: 'Über uns', href: `${basePath}/about` },
    { name: 'Kontakt', href: `${basePath}/contact` },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-[#00338D] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo and Club Name */}
            <Link href={basePath} className="flex items-center gap-4">
              {tenant.websiteLogo ? (
                <div className="relative w-12 h-12">
                  <Image
                    src={tenant.websiteLogo}
                    alt={tenant.name}
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 bg-[#EBB700] rounded-full flex items-center justify-center">
                  <span className="text-[#00338D] font-bold text-xl">L</span>
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold">
                  {tenant.websiteTitle || tenant.name}
                </h1>
                <p className="text-sm text-blue-200">Lions Club International</p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-white hover:text-[#EBB700] transition-colors font-medium"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden p-2 rounded-md hover:bg-blue-800"
              aria-label="Menü öffnen"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation (hidden by default, would need JS to toggle) */}
        <div className="hidden md:hidden border-t border-blue-700">
          <div className="px-4 py-3 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block py-2 text-white hover:text-[#EBB700]"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-[#00338D] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Club Info */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-[#EBB700]">
                {tenant.name}
              </h3>
              <p className="text-blue-200 text-sm">
                Mitglied von Lions Clubs International - We Serve
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-[#EBB700]">
                Quick Links
              </h3>
              <ul className="space-y-2">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-blue-200 hover:text-white transition-colors text-sm"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-[#EBB700]">Kontakt</h3>
              <ul className="space-y-2 text-blue-200 text-sm">
                {tenant.contactEmail && (
                  <li>
                    <a
                      href={`mailto:${tenant.contactEmail}`}
                      className="hover:text-white transition-colors"
                    >
                      {tenant.contactEmail}
                    </a>
                  </li>
                )}
                {tenant.contactPhone && (
                  <li>
                    <a
                      href={`tel:${tenant.contactPhone}`}
                      className="hover:text-white transition-colors"
                    >
                      {tenant.contactPhone}
                    </a>
                  </li>
                )}
              </ul>

              {/* Social Links */}
              <div className="flex gap-4 mt-4">
                {tenant.socialFacebook && (
                  <a
                    href={tenant.socialFacebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-200 hover:text-[#EBB700] transition-colors"
                    aria-label="Facebook"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                )}
                {tenant.socialInstagram && (
                  <a
                    href={tenant.socialInstagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-200 hover:text-[#EBB700] transition-colors"
                    aria-label="Instagram"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                    </svg>
                  </a>
                )}
                {tenant.socialLinkedin && (
                  <a
                    href={tenant.socialLinkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-200 hover:text-[#EBB700] transition-colors"
                    aria-label="LinkedIn"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 pt-8 border-t border-blue-700 text-center text-blue-200 text-sm">
            <p>
              © {new Date().getFullYear()} {tenant.name}. Alle Rechte vorbehalten.
            </p>
            <p className="mt-2">
              Powered by{' '}
              <a
                href="https://lions-hub.de"
                className="text-[#EBB700] hover:underline"
              >
                Lions Event Management Hub
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
