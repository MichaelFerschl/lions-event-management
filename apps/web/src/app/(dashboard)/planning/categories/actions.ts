'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getCurrentTenant } from '@/lib/tenant';

export interface CategoryFormData {
  name: string;
  color: string;
  icon?: string;
  sortOrder?: number;
}

export interface ActionResult {
  success: boolean;
  error?: string;
}

export async function createCategory(data: CategoryFormData): Promise<ActionResult> {
  try {
    const tenant = await getCurrentTenant();

    // Check if category with same name already exists
    const existing = await db.eventCategory.findUnique({
      where: {
        tenantId_name: {
          tenantId: tenant.id,
          name: data.name,
        },
      },
    });

    if (existing) {
      return { success: false, error: 'Eine Terminart mit diesem Namen existiert bereits.' };
    }

    // Get max sortOrder for new category
    const maxSortOrder = await db.eventCategory.aggregate({
      where: { tenantId: tenant.id },
      _max: { sortOrder: true },
    });

    await db.eventCategory.create({
      data: {
        tenantId: tenant.id,
        name: data.name,
        color: data.color || '#00338D',
        icon: data.icon,
        sortOrder: data.sortOrder ?? (maxSortOrder._max.sortOrder ?? 0) + 1,
        isDefault: false,
      },
    });

    revalidatePath('/planning/categories');
    return { success: true };
  } catch (error) {
    console.error('Error creating category:', error);
    return { success: false, error: 'Fehler beim Erstellen der Terminart.' };
  }
}

export async function updateCategory(
  id: string,
  data: CategoryFormData
): Promise<ActionResult> {
  try {
    const tenant = await getCurrentTenant();

    // Verify category belongs to tenant
    const category = await db.eventCategory.findFirst({
      where: { id, tenantId: tenant.id },
    });

    if (!category) {
      return { success: false, error: 'Terminart nicht gefunden.' };
    }

    // Check if another category with same name exists
    const existing = await db.eventCategory.findFirst({
      where: {
        tenantId: tenant.id,
        name: data.name,
        NOT: { id },
      },
    });

    if (existing) {
      return { success: false, error: 'Eine andere Terminart mit diesem Namen existiert bereits.' };
    }

    await db.eventCategory.update({
      where: { id },
      data: {
        name: data.name,
        color: data.color,
        icon: data.icon,
        sortOrder: data.sortOrder,
      },
    });

    revalidatePath('/planning/categories');
    return { success: true };
  } catch (error) {
    console.error('Error updating category:', error);
    return { success: false, error: 'Fehler beim Aktualisieren der Terminart.' };
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    const tenant = await getCurrentTenant();

    // Verify category belongs to tenant
    const category = await db.eventCategory.findFirst({
      where: { id, tenantId: tenant.id },
      include: {
        _count: {
          select: {
            templates: true,
            plannedEvents: true,
          },
        },
      },
    });

    if (!category) {
      return { success: false, error: 'Terminart nicht gefunden.' };
    }

    // Check if category has associated templates or planned events
    if (category._count.templates > 0) {
      return {
        success: false,
        error: `Diese Terminart kann nicht gelöscht werden, da ${category._count.templates} Vorlage(n) zugeordnet sind.`,
      };
    }

    if (category._count.plannedEvents > 0) {
      return {
        success: false,
        error: `Diese Terminart kann nicht gelöscht werden, da ${category._count.plannedEvents} geplante(r) Termin(e) zugeordnet sind.`,
      };
    }

    await db.eventCategory.delete({
      where: { id },
    });

    revalidatePath('/planning/categories');
    return { success: true };
  } catch (error) {
    console.error('Error deleting category:', error);
    return { success: false, error: 'Fehler beim Löschen der Terminart.' };
  }
}
