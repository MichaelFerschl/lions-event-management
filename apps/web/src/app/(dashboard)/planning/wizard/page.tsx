import { db } from '@/lib/db';
import { getCurrentTenant } from '@/lib/tenant';
import { WizardContainer } from './wizard-container';

async function getWizardData() {
  const tenant = await getCurrentTenant();

  const [categories, recurringRules, templates] = await Promise.all([
    db.eventCategory.findMany({
      where: { tenantId: tenant.id },
      orderBy: { sortOrder: 'asc' },
    }),
    db.recurringRule.findMany({
      where: { tenantId: tenant.id, isActive: true },
      include: {
        defaultCategory: true,
      },
      orderBy: { name: 'asc' },
    }),
    db.eventTemplate.findMany({
      where: { tenantId: tenant.id, isActive: true },
      include: {
        category: true,
      },
      orderBy: [{ isMandatory: 'desc' }, { name: 'asc' }],
    }),
  ]);

  return {
    tenantId: tenant.id,
    categories,
    recurringRules,
    templates,
  };
}

export default async function PlanningWizardPage() {
  const data = await getWizardData();

  return <WizardContainer initialData={data} />;
}
