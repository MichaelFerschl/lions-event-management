import Link from 'next/link';
import { db } from '@/lib/db';
import { getCurrentTenant } from '@/lib/tenant';
import { CategoryList } from './category-list';

async function getCategories() {
  const tenant = await getCurrentTenant();

  const categories = await db.eventCategory.findMany({
    where: { tenantId: tenant.id },
    include: {
      _count: {
        select: {
          templates: true,
          plannedEvents: true,
        },
      },
    },
    orderBy: { sortOrder: 'asc' },
  });

  return categories;
}

export default async function CategoriesPage() {
  const categories = await getCategories();

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
            <span className="text-gray-900">Terminarten</span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900">Terminarten</h1>
          <p className="text-gray-600 mt-1">
            Verwalten Sie die Kategorien für Ihre Termine
          </p>
        </div>
        <Link
          href="/planning/categories/new"
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
          Neue Terminart
        </Link>
      </div>

      {/* Categories List */}
      {categories.length === 0 ? (
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
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Keine Terminarten vorhanden
          </h3>
          <p className="text-gray-500 mb-4">
            Erstellen Sie Ihre erste Terminart, um Termine zu kategorisieren.
          </p>
          <Link
            href="/planning/categories/new"
            className="inline-flex items-center px-4 py-2 bg-lions-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Erste Terminart erstellen
          </Link>
        </div>
      ) : (
        <CategoryList categories={categories} />
      )}
    </div>
  );
}
