'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { saveWebsiteSettings, type WebsiteSettings } from './actions';

interface WebsiteEditorFormProps {
  initialSettings: WebsiteSettings;
  tenantSlug: string;
  clubNumber: string;
}

export function WebsiteEditorForm({
  initialSettings,
  tenantSlug,
  clubNumber,
}: WebsiteEditorFormProps) {
  const [settings, setSettings] = useState<WebsiteSettings>(initialSettings);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const result = await saveWebsiteSettings(settings);
      if (result.success) {
        setMessage({
          type: 'success',
          text: 'Einstellungen erfolgreich gespeichert!',
        });
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Ein Fehler ist aufgetreten',
        });
      }
    });
  };

  const publicUrl = `/public/${tenantSlug}/${clubNumber}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Status Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Preview Link */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-blue-900">Öffentliche Website</h3>
            <p className="text-sm text-blue-700 mt-1">
              {settings.websiteEnabled
                ? 'Ihre Website ist aktiv und öffentlich erreichbar.'
                : 'Aktivieren Sie die Website, um sie öffentlich zu machen.'}
            </p>
          </div>
          <Link
            href={publicUrl}
            target="_blank"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            Vorschau
          </Link>
        </div>
      </div>

      {/* Allgemein Section */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg
            className="w-5 h-5 mr-2 text-[#00338D]"
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
          Allgemein
        </h2>

        <div className="space-y-4">
          {/* Website Enabled Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <label
                htmlFor="websiteEnabled"
                className="font-medium text-gray-900"
              >
                Website aktivieren
              </label>
              <p className="text-sm text-gray-500 mt-1">
                Wenn aktiviert, ist die öffentliche Club-Website erreichbar.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="websiteEnabled"
                name="websiteEnabled"
                checked={settings.websiteEnabled}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00338D]"></div>
            </label>
          </div>

          {/* Website Title */}
          <div>
            <label
              htmlFor="websiteTitle"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Website-Titel
            </label>
            <input
              type="text"
              id="websiteTitle"
              name="websiteTitle"
              value={settings.websiteTitle}
              onChange={handleChange}
              placeholder="z.B. Lions Club Musterstadt"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00338D] focus:border-transparent"
            />
          </div>

          {/* Website Logo */}
          <div>
            <label
              htmlFor="websiteLogo"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Logo URL
            </label>
            <input
              type="text"
              id="websiteLogo"
              name="websiteLogo"
              value={settings.websiteLogo}
              onChange={handleChange}
              placeholder="/images/logo.png oder https://..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00338D] focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              URL zum Club-Logo (relativ oder absolut)
            </p>
          </div>
        </div>
      </section>

      {/* Startseite Section */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg
            className="w-5 h-5 mr-2 text-[#00338D]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          Startseite
        </h2>

        <div className="space-y-4">
          {/* Hero Image */}
          <div>
            <label
              htmlFor="heroImage"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Hero-Bild URL
            </label>
            <input
              type="text"
              id="heroImage"
              name="heroImage"
              value={settings.heroImage}
              onChange={handleChange}
              placeholder="/images/hero.jpg oder https://..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00338D] focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              Hintergrundbild für den Hero-Bereich der Startseite
            </p>
          </div>

          {/* Hero Text */}
          <div>
            <label
              htmlFor="heroText"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Hero-Text
            </label>
            <textarea
              id="heroText"
              name="heroText"
              value={settings.heroText}
              onChange={handleChange}
              rows={3}
              placeholder="Willkommenstext für die Startseite..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00338D] focus:border-transparent resize-none"
            />
            <p className="text-sm text-gray-500 mt-1">
              Dieser Text wird prominent auf der Startseite angezeigt.
            </p>
          </div>
        </div>
      </section>

      {/* Über uns Section */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg
            className="w-5 h-5 mr-2 text-[#00338D]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Über uns
        </h2>

        <div>
          <label
            htmlFor="aboutText"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Über uns Text
          </label>
          <textarea
            id="aboutText"
            name="aboutText"
            value={settings.aboutText}
            onChange={handleChange}
            rows={8}
            placeholder="Beschreiben Sie Ihren Club, seine Geschichte und Aktivitäten..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00338D] focus:border-transparent resize-none"
          />
          <p className="text-sm text-gray-500 mt-1">
            Verwenden Sie doppelte Zeilenumbrüche für Absätze. Aufzählungen mit
            &quot;•&quot; werden automatisch formatiert.
          </p>
        </div>
      </section>

      {/* Kontakt Section */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg
            className="w-5 h-5 mr-2 text-[#00338D]"
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
          Kontakt
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Contact Email */}
          <div>
            <label
              htmlFor="contactEmail"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              E-Mail
            </label>
            <input
              type="email"
              id="contactEmail"
              name="contactEmail"
              value={settings.contactEmail}
              onChange={handleChange}
              placeholder="kontakt@lions-club.de"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00338D] focus:border-transparent"
            />
          </div>

          {/* Contact Phone */}
          <div>
            <label
              htmlFor="contactPhone"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Telefon
            </label>
            <input
              type="tel"
              id="contactPhone"
              name="contactPhone"
              value={settings.contactPhone}
              onChange={handleChange}
              placeholder="+49 123 456789"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00338D] focus:border-transparent"
            />
          </div>

          {/* Contact Address */}
          <div className="md:col-span-2">
            <label
              htmlFor="contactAddress"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Adresse
            </label>
            <textarea
              id="contactAddress"
              name="contactAddress"
              value={settings.contactAddress}
              onChange={handleChange}
              rows={3}
              placeholder="Lions Club Musterstadt&#10;Musterstraße 1&#10;12345 Musterstadt"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00338D] focus:border-transparent resize-none"
            />
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg
            className="w-5 h-5 mr-2 text-[#00338D]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
            />
          </svg>
          Social Media
        </h2>

        <div className="space-y-4">
          {/* Facebook */}
          <div>
            <label
              htmlFor="socialFacebook"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Facebook
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-500">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </span>
              <input
                type="url"
                id="socialFacebook"
                name="socialFacebook"
                value={settings.socialFacebook}
                onChange={handleChange}
                placeholder="https://facebook.com/..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-[#00338D] focus:border-transparent"
              />
            </div>
          </div>

          {/* Instagram */}
          <div>
            <label
              htmlFor="socialInstagram"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Instagram
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-500">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                </svg>
              </span>
              <input
                type="url"
                id="socialInstagram"
                name="socialInstagram"
                value={settings.socialInstagram}
                onChange={handleChange}
                placeholder="https://instagram.com/..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-[#00338D] focus:border-transparent"
              />
            </div>
          </div>

          {/* LinkedIn */}
          <div>
            <label
              htmlFor="socialLinkedin"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              LinkedIn
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-500">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </span>
              <input
                type="url"
                id="socialLinkedin"
                name="socialLinkedin"
                value={settings.socialLinkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/company/..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-[#00338D] focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center px-6 py-3 bg-[#00338D] text-white font-medium rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Speichern...
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Einstellungen speichern
            </>
          )}
        </button>
      </div>
    </form>
  );
}
