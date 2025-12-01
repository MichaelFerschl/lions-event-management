import Link from 'next/link';
import { db } from '@/lib/db';
import { getCurrentTenant } from '@/lib/tenant';
import { TemplateList } from './template-list';

async function getTemplatesWithCategories() {
  const tenant = await getCurrentTenant();

  const [templates, categories] = await Promise.all([
    db.eventTemplate.findMany({
      where: { tenantId: tenant.id },
      include: {
        category: true,
        _count: {
          select: {
            plannedEvents: true,
          },
        },
      },
      orderBy: [{ category: { sortOrder: 'asc' } }, { name: 'asc' }],
    }),
    db.eventCategory.findMany({
      where: { tenantId: tenant.id },
      orderBy: { sortOrder: 'asc' },
    }),
  ]);

  return { templates, categories };
}

const monthNames = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
];

export default async function TemplatesPage() {
  const { templates, categories } = await getTemplatesWithCategories();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <nav className="text-sm text-gray-500 mb-2">
            <Link href="/planning" className="hover:text-lions-blue">
              Jahresplanung
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Terminvorlagen</span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900">Terminvorlagen</h1>
          <p className="text-gray-600 mt-1">
            Wiederverwendbare Vorlagen für wiederkehrende Events
          </p>
        </div>
        <Link
          href="/planning/templates/new"
          className="inline-flex items-center px-4 py-2 bg-lions-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
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
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Neue Vorlage
        </Link>
      </div>

      {/* Templates List */}
      {templates.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Keine Vorlagen vorhanden
          </h3>
          <p className="text-gray-500 mb-4">
            Erstellen Sie Ihre erste Terminvorlage für wiederkehrende Events.
          </p>
          <Link
            href="/planning/templates/new"
            className="inline-flex items-center px-4 py-2 bg-lions-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Erste Vorlage erstellen
          </Link>
        </div>
      ) : (
        <TemplateList
          templates={templates}
          categories={categories}
          monthNames={monthNames}
        />
      )}
    </div>
  );
}
