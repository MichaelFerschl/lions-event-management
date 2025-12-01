import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLionsYear } from '../actions';
import { YearDetailView } from './year-detail-view';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function YearDetailPage({ params }: PageProps) {
  const { id } = await params;
  const year = await getLionsYear(id);

  if (!year) {
    notFound();
  }

  const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    DRAFT: { label: 'Entwurf', color: 'bg-gray-100 text-gray-700' },
    PLANNING: { label: 'In Planung', color: 'bg-yellow-100 text-yellow-700' },
    ACTIVE: { label: 'Aktiv', color: 'bg-green-100 text-green-700' },
    ARCHIVED: { label: 'Archiviert', color: 'bg-gray-100 text-gray-500' },
  };

  const statusInfo = STATUS_LABELS[year.status];

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <nav className="text-sm text-gray-500 mb-2">
            <Link href="/planning" className="hover:text-lions-blue">
              Jahresplanung
            </Link>
            <span className="mx-2">/</span>
            <Link href="/planning/years" className="hover:text-lions-blue">
              Lionsjahre
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{year.name}</span>
          </nav>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{year.name}</h1>
            <span
              className={`px-2 py-1 text-xs font-medium rounded ${statusInfo.color}`}
            >
              {statusInfo.label}
            </span>
          </div>
          <p className="text-gray-500 mt-1">
            {formatDate(year.startDate)} – {formatDate(year.endDate)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {year.status !== 'ARCHIVED' && (
            <Link
              href={`/planning/years/${id}/edit`}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Bearbeiten
            </Link>
          )}
        </div>
      </div>

      {/* Content */}
      <YearDetailView year={year} />
    </div>
  );
}
