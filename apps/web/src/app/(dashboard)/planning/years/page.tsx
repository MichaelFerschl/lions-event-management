import Link from 'next/link';
import { getLionsYears } from './actions';
import { YearsList } from './years-list';

export default async function YearsPage() {
  const years = await getLionsYears();

  const activeYears = years.filter((y) => y.status !== 'ARCHIVED');
  const archivedYears = years.filter((y) => y.status === 'ARCHIVED');

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
            <span className="text-gray-900">Lionsjahre</span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900">Lionsjahre</h1>
        </div>
        <Link
          href="/planning/wizard"
          className="px-4 py-2 bg-lions-blue text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Neues Lionsjahr
        </Link>
      </div>

      {/* Content */}
      <YearsList activeYears={activeYears} archivedYears={archivedYears} />
    </div>
  );
}
