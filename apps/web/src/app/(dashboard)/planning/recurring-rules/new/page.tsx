import Link from 'next/link';
import { db } from '@/lib/db';
import { getCurrentTenant } from '@/lib/tenant';
import { RecurringRuleForm } from '../recurring-rule-form';

async function getCategories() {
  const tenant = await getCurrentTenant();

  return db.eventCategory.findMany({
    where: { tenantId: tenant.id },
    orderBy: { sortOrder: 'asc' },
  });
}

export default async function NewRecurringRulePage() {
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
          <Link href="/planning/recurring-rules" className="hover:text-lions-blue">
            Regeltermine
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Neuer Regeltermin</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Neuer Regeltermin</h1>
        <p className="text-gray-600 mt-1">
          Definieren Sie einen regelmäßigen Termin für die automatische Generierung
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <RecurringRuleForm categories={categories} />
      </div>
    </div>
  );
}
