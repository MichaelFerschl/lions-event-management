import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { getCurrentTenant } from '@/lib/tenant';
import { CategoryForm } from '../category-form';

interface EditCategoryPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getCategory(id: string) {
  const tenant = await getCurrentTenant();

  const category = await db.eventCategory.findFirst({
    where: {
      id,
      tenantId: tenant.id,
    },
  });

  return category;
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params;
  const category = await getCategory(id);

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <nav className="text-sm text-gray-500 mb-2">
          <Link href="/planning" className="hover:text-lions-blue">
            Jahresplanung
          </Link>
          <span className="mx-2">/</span>
          <Link href="/planning/categories" className="hover:text-lions-blue">
            Terminarten
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{category.name}</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Terminart bearbeiten</h1>
        <p className="text-gray-600 mt-1">Bearbeiten Sie die Terminart "{category.name}"</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <CategoryForm
          category={{
            id: category.id,
            name: category.name,
            color: category.color || '#00338D',
            icon: category.icon || undefined,
            sortOrder: category.sortOrder,
          }}
        />
      </div>
    </div>
  );
}
