'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getCurrentTenant } from '@/lib/tenant';

export interface RecurringRuleFormData {
  name: string;
  description?: string;
  frequency: 'WEEKLY' | 'MONTHLY';
  dayOfWeek: number;
  weekOfMonth?: number;
  defaultCategoryId?: string;
  defaultTitle?: string;
  isActive: boolean;
}

export interface ActionResult {
  success: boolean;
  error?: string;
}

export async function createRecurringRule(
  data: RecurringRuleFormData
): Promise<ActionResult> {
  try {
    const tenant = await getCurrentTenant();

    // Check if rule with same name already exists
    const existing = await db.recurringRule.findUnique({
      where: {
        tenantId_name: {
          tenantId: tenant.id,
          name: data.name,
        },
      },
    });

    if (existing) {
      return { success: false, error: 'Ein Regeltermin mit diesem Namen existiert bereits.' };
    }

    // Verify category belongs to tenant if provided
    if (data.defaultCategoryId) {
      const category = await db.eventCategory.findFirst({
        where: { id: data.defaultCategoryId, tenantId: tenant.id },
      });

      if (!category) {
        return { success: false, error: 'Die gewählte Terminart existiert nicht.' };
      }
    }

    await db.recurringRule.create({
      data: {
        tenantId: tenant.id,
        name: data.name,
        description: data.description || null,
        frequency: data.frequency,
        dayOfWeek: data.dayOfWeek,
        weekOfMonth: data.weekOfMonth || null,
        defaultCategoryId: data.defaultCategoryId || null,
        defaultTitle: data.defaultTitle || null,
        isActive: data.isActive,
      },
    });

    revalidatePath('/planning/recurring-rules');
    return { success: true };
  } catch (error) {
    console.error('Error creating recurring rule:', error);
    return { success: false, error: 'Fehler beim Erstellen des Regeltermins.' };
  }
}

export async function updateRecurringRule(
  id: string,
  data: RecurringRuleFormData
): Promise<ActionResult> {
  try {
    const tenant = await getCurrentTenant();

    // Verify rule belongs to tenant
    const rule = await db.recurringRule.findFirst({
      where: { id, tenantId: tenant.id },
    });

    if (!rule) {
      return { success: false, error: 'Regeltermin nicht gefunden.' };
    }

    // Check if another rule with same name exists
    const existing = await db.recurringRule.findFirst({
      where: {
        tenantId: tenant.id,
        name: data.name,
        NOT: { id },
      },
    });

    if (existing) {
      return {
        success: false,
        error: 'Ein anderer Regeltermin mit diesem Namen existiert bereits.',
      };
    }

    // Verify category belongs to tenant if provided
    if (data.defaultCategoryId) {
      const category = await db.eventCategory.findFirst({
        where: { id: data.defaultCategoryId, tenantId: tenant.id },
      });

      if (!category) {
        return { success: false, error: 'Die gewählte Terminart existiert nicht.' };
      }
    }

    await db.recurringRule.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description || null,
        frequency: data.frequency,
        dayOfWeek: data.dayOfWeek,
        weekOfMonth: data.weekOfMonth || null,
        defaultCategoryId: data.defaultCategoryId || null,
        defaultTitle: data.defaultTitle || null,
        isActive: data.isActive,
      },
    });

    revalidatePath('/planning/recurring-rules');
    return { success: true };
  } catch (error) {
    console.error('Error updating recurring rule:', error);
    return { success: false, error: 'Fehler beim Aktualisieren des Regeltermins.' };
  }
}

export async function deleteRecurringRule(id: string): Promise<ActionResult> {
  try {
    const tenant = await getCurrentTenant();

    // Verify rule belongs to tenant
    const rule = await db.recurringRule.findFirst({
      where: { id, tenantId: tenant.id },
      include: {
        _count: {
          select: {
            plannedEvents: true,
          },
        },
      },
    });

    if (!rule) {
      return { success: false, error: 'Regeltermin nicht gefunden.' };
    }

    // Check if rule has associated planned events
    if (rule._count.plannedEvents > 0) {
      return {
        success: false,
        error: `Dieser Regeltermin kann nicht gelöscht werden, da ${rule._count.plannedEvents} geplante(r) Termin(e) zugeordnet sind.`,
      };
    }

    await db.recurringRule.delete({
      where: { id },
    });

    revalidatePath('/planning/recurring-rules');
    return { success: true };
  } catch (error) {
    console.error('Error deleting recurring rule:', error);
    return { success: false, error: 'Fehler beim Löschen des Regeltermins.' };
  }
}
