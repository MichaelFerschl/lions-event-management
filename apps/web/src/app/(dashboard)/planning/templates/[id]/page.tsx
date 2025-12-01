import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { getCurrentTenant } from '@/lib/tenant';
import { TemplateForm } from '../template-form';

interface EditTemplatePageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getTemplateWithCategories(id: string) {
  const tenant = await getCurrentTenant();

  const [template, categories] = await Promise.all([
    db.eventTemplate.findFirst({
      where: {
        id,
        tenantId: tenant.id,
      },
    }),
    db.eventCategory.findMany({
      where: { tenantId: tenant.id },
      orderBy: { sortOrder: 'asc' },
    }),
  ]);

  return { template, categories };
}

export default async function EditTemplatePage({ params }: EditTemplatePageProps) {
  const { id } = await params;
  const { template, categories } = await getTemplateWithCategories(id);

  if (!template) {
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
          <Link href="/planning/templates" className="hover:text-lions-blue">
            Terminvorlagen
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{template.name}</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Vorlage bearbeiten</h1>
        <p className="text-gray-600 mt-1">
          Bearbeiten Sie die Terminvorlage "{template.name}"
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <TemplateForm
          template={{
            id: template.id,
            name: template.name,
            categoryId: template.categoryId,
            description: template.description,
            defaultInvitationText: template.defaultInvitationText,
            isMandatory: template.isMandatory,
            defaultMonth: template.defaultMonth,
            defaultDurationMinutes: template.defaultDurationMinutes,
            isActive: template.isActive,
          }}
          categories={categories}
        />
      </div>
    </div>
  );
}
