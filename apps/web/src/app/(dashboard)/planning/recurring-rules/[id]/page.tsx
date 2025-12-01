import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { getCurrentTenant } from '@/lib/tenant';
import { RecurringRuleForm } from '../recurring-rule-form';
import type { RecurringFrequency } from '@prisma/client';

interface EditRecurringRulePageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getRuleWithCategories(id: string) {
  const tenant = await getCurrentTenant();

  const [rule, categories] = await Promise.all([
    db.recurringRule.findFirst({
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

  return { rule, categories };
}

export default async function EditRecurringRulePage({
  params,
}: EditRecurringRulePageProps) {
  const { id } = await params;
  const { rule, categories } = await getRuleWithCategories(id);

  if (!rule) {
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
          <Link href="/planning/recurring-rules" className="hover:text-lions-blue">
            Regeltermine
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{rule.name}</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Regeltermin bearbeiten</h1>
        <p className="text-gray-600 mt-1">
          Bearbeiten Sie den Regeltermin "{rule.name}"
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <RecurringRuleForm
          rule={{
            id: rule.id,
            name: rule.name,
            description: rule.description,
            frequency: rule.frequency as RecurringFrequency,
            dayOfWeek: rule.dayOfWeek,
            weekOfMonth: rule.weekOfMonth,
            defaultCategoryId: rule.defaultCategoryId,
            defaultTitle: rule.defaultTitle,
            isActive: rule.isActive,
          }}
          categories={categories}
        />
      </div>
    </div>
  );
}
