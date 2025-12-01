import Link from 'next/link';
import { db } from '@/lib/db';
import { getCurrentTenant } from '@/lib/tenant';

async function getPlanningStats() {
  const tenant = await getCurrentTenant();

  const [categoriesCount, templatesCount, recurringRulesCount, lionsYearsCount] =
    await Promise.all([
      db.eventCategory.count({ where: { tenantId: tenant.id } }),
      db.eventTemplate.count({ where: { tenantId: tenant.id } }),
      db.recurringRule.count({ where: { tenantId: tenant.id } }),
      db.lionsYear.count({ where: { tenantId: tenant.id } }),
    ]);

  return {
    categoriesCount,
    templatesCount,
    recurringRulesCount,
    lionsYearsCount,
  };
}

export default async function PlanningPage() {
  const stats = await getPlanningStats();

  const cards = [
    {
      title: 'Terminarten',
      description: 'Kategorien für die Klassifizierung von Terminen',
      count: stats.categoriesCount,
      href: '/planning/categories',
      icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
      color: 'bg-blue-500',
    },
    {
      title: 'Terminvorlagen',
      description: 'Wiederverwendbare Vorlagen für wiederkehrende Events',
      count: stats.templatesCount,
      href: '/planning/templates',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      color: 'bg-purple-500',
    },
    {
      title: 'Regeltermine',
      description: 'Regelmäßige Termine wie "Erster Dienstag im Monat"',
      count: stats.recurringRulesCount,
      href: '/planning/recurring-rules',
      icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
      color: 'bg-green-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jahresplanung</h1>
          <p className="text-gray-600 mt-1">
            Verwalten Sie Stammdaten und planen Sie das Lionsjahr
          </p>
        </div>
        <Link
          href="/planning/wizard"
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
          Neues Lionsjahr planen
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Aktuelle Lionsjahre
        </h2>
        <div className="flex items-center gap-4">
          <div className="text-3xl font-bold text-lions-blue">
            {stats.lionsYearsCount}
          </div>
          <div className="text-gray-600">
            {stats.lionsYearsCount === 1
              ? 'Lionsjahr angelegt'
              : 'Lionsjahre angelegt'}
          </div>
          {stats.lionsYearsCount > 0 && (
            <Link
              href="/planning/years"
              className="ml-auto text-lions-blue hover:underline"
            >
              Alle anzeigen →
            </Link>
          )}
        </div>
      </div>

      {/* Stammdaten Cards */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Stammdaten</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 group"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`${card.color} p-3 rounded-lg text-white group-hover:scale-110 transition-transform`}
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
                      d={card.icon}
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-lions-blue transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{card.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">
                      {card.count}
                    </span>
                    <span className="text-sm text-lions-blue group-hover:translate-x-1 transition-transform">
                      Verwalten →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
