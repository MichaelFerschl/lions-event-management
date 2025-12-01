import Link from 'next/link';
import { db } from '@/lib/db';
import { getCurrentTenant } from '@/lib/tenant';
import { RecurringRuleList } from './recurring-rule-list';

async function getRecurringRulesWithCategories() {
  const tenant = await getCurrentTenant();

  const [rules, categories] = await Promise.all([
    db.recurringRule.findMany({
      where: { tenantId: tenant.id },
      include: {
        defaultCategory: true,
        _count: {
          select: {
            plannedEvents: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    }),
    db.eventCategory.findMany({
      where: { tenantId: tenant.id },
      orderBy: { sortOrder: 'asc' },
    }),
  ]);

  return { rules, categories };
}

export default async function RecurringRulesPage() {
  const { rules, categories } = await getRecurringRulesWithCategories();

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
            <span className="text-gray-900">Regeltermine</span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900">Regeltermine</h1>
          <p className="text-gray-600 mt-1">
            Regelmäßige Termine wie "Erster Dienstag im Monat"
          </p>
        </div>
        <Link
          href="/planning/recurring-rules/new"
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
          Neuer Regeltermin
        </Link>
      </div>

      {/* Rules List */}
      {rules.length === 0 ? (
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
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Keine Regeltermine vorhanden
          </h3>
          <p className="text-gray-500 mb-4">
            Erstellen Sie Ihren ersten Regeltermin für wiederkehrende Meetings.
          </p>
          <Link
            href="/planning/recurring-rules/new"
            className="inline-flex items-center px-4 py-2 bg-lions-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ersten Regeltermin erstellen
          </Link>
        </div>
      ) : (
        <RecurringRuleList rules={rules} categories={categories} />
      )}
    </div>
  );
}
