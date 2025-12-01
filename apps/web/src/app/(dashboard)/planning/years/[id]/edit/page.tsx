import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getLionsYear } from '../../actions';
import { db } from '@/lib/db';
import { getCurrentTenant } from '@/lib/tenant';
import { YearEditView } from './year-edit-view';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function YearEditPage({ params }: PageProps) {
  const { id } = await params;
  const year = await getLionsYear(id);

  if (!year) {
    notFound();
  }

  // Redirect if archived
  if (year.status === 'ARCHIVED') {
    redirect(`/planning/years/${id}`);
  }

  // Load categories and templates for the form
  const tenant = await getCurrentTenant();

  const [categories, templates] = await Promise.all([
    db.eventCategory.findMany({
      where: { tenantId: tenant.id },
      orderBy: { sortOrder: 'asc' },
    }),
    db.eventTemplate.findMany({
      where: { tenantId: tenant.id, isActive: true },
      include: {
        category: true,
      },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
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
          <Link href={`/planning/years/${id}`} className="hover:text-lions-blue">
            {year.name}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Bearbeiten</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">
          {year.name} bearbeiten
        </h1>
        <p className="text-gray-500 mt-1">
          Termine hinzufügen, bearbeiten oder löschen
        </p>
      </div>

      {/* Content */}
      <YearEditView
        year={year}
        categories={categories}
        templates={templates}
      />
    </div>
  );
}
