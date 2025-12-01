import Link from 'next/link';
import { db } from '@/lib/db';
import { getCurrentTenant } from '@/lib/tenant';
import { TemplateForm } from '../template-form';

async function getCategories() {
  const tenant = await getCurrentTenant();

  return db.eventCategory.findMany({
    where: { tenantId: tenant.id },
    orderBy: { sortOrder: 'asc' },
  });
}

export default async function NewTemplatePage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <nav className="text-sm text-gray-500 mb-2">
          <Link href="/planning" className="hover:text-lions-blue">
            Jahresplanung
          </Link>
          <span className="mx-2">/</span>
          <Link href="/planning/templates" className="hover:text-lions-blue">
            Terminvorlagen
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Neue Vorlage</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Neue Terminvorlage</h1>
        <p className="text-gray-600 mt-1">
          Erstellen Sie eine neue Vorlage für wiederkehrende Termine
        </p>
      </div>

      {/* Check for categories */}
      {categories.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">
            Keine Terminarten vorhanden
          </h3>
          <p className="text-yellow-700 mb-4">
            Um eine Vorlage zu erstellen, müssen Sie zuerst mindestens eine Terminart
            anlegen.
          </p>
          <Link
            href="/planning/categories/new"
            className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Terminart erstellen
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <TemplateForm categories={categories} />
        </div>
      )}
    </div>
  );
}
