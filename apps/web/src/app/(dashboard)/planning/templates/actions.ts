'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getCurrentTenant } from '@/lib/tenant';

export interface TemplateFormData {
  name: string;
  categoryId: string;
  description?: string;
  defaultInvitationText?: string;
  isMandatory: boolean;
  defaultMonth?: number;
  defaultDurationMinutes: number;
  isActive: boolean;
}

export interface ActionResult {
  success: boolean;
  error?: string;
}

export async function createTemplate(data: TemplateFormData): Promise<ActionResult> {
  try {
    const tenant = await getCurrentTenant();

    // Check if template with same name already exists
    const existing = await db.eventTemplate.findUnique({
      where: {
        tenantId_name: {
          tenantId: tenant.id,
          name: data.name,
        },
      },
    });

    if (existing) {
      return { success: false, error: 'Eine Vorlage mit diesem Namen existiert bereits.' };
    }

    // Verify category belongs to tenant
    const category = await db.eventCategory.findFirst({
      where: { id: data.categoryId, tenantId: tenant.id },
    });

    if (!category) {
      return { success: false, error: 'Die gewählte Terminart existiert nicht.' };
    }

    await db.eventTemplate.create({
      data: {
        tenantId: tenant.id,
        name: data.name,
        categoryId: data.categoryId,
        description: data.description || null,
        defaultInvitationText: data.defaultInvitationText || null,
        isMandatory: data.isMandatory,
        defaultMonth: data.defaultMonth || null,
        defaultDurationMinutes: data.defaultDurationMinutes,
        isActive: data.isActive,
      },
    });

    revalidatePath('/planning/templates');
    return { success: true };
  } catch (error) {
    console.error('Error creating template:', error);
    return { success: false, error: 'Fehler beim Erstellen der Vorlage.' };
  }
}

export async function updateTemplate(
  id: string,
  data: TemplateFormData
): Promise<ActionResult> {
  try {
    const tenant = await getCurrentTenant();

    // Verify template belongs to tenant
    const template = await db.eventTemplate.findFirst({
      where: { id, tenantId: tenant.id },
    });

    if (!template) {
      return { success: false, error: 'Vorlage nicht gefunden.' };
    }

    // Check if another template with same name exists
    const existing = await db.eventTemplate.findFirst({
      where: {
        tenantId: tenant.id,
        name: data.name,
        NOT: { id },
      },
    });

    if (existing) {
      return { success: false, error: 'Eine andere Vorlage mit diesem Namen existiert bereits.' };
    }

    // Verify category belongs to tenant
    const category = await db.eventCategory.findFirst({
      where: { id: data.categoryId, tenantId: tenant.id },
    });

    if (!category) {
      return { success: false, error: 'Die gewählte Terminart existiert nicht.' };
    }

    await db.eventTemplate.update({
      where: { id },
      data: {
        name: data.name,
        categoryId: data.categoryId,
        description: data.description || null,
        defaultInvitationText: data.defaultInvitationText || null,
        isMandatory: data.isMandatory,
        defaultMonth: data.defaultMonth || null,
        defaultDurationMinutes: data.defaultDurationMinutes,
        isActive: data.isActive,
      },
    });

    revalidatePath('/planning/templates');
    revalidatePath(`/planning/templates/${id}`);
    return { success: true };
  } catch (error) {
    console.error('Error updating template:', error);
    return { success: false, error: 'Fehler beim Aktualisieren der Vorlage.' };
  }
}

export async function deleteTemplate(id: string): Promise<ActionResult> {
  try {
    const tenant = await getCurrentTenant();

    // Verify template belongs to tenant
    const template = await db.eventTemplate.findFirst({
      where: { id, tenantId: tenant.id },
      include: {
        _count: {
          select: {
            plannedEvents: true,
          },
        },
      },
    });

    if (!template) {
      return { success: false, error: 'Vorlage nicht gefunden.' };
    }

    // Check if template has associated planned events
    if (template._count.plannedEvents > 0) {
      return {
        success: false,
        error: `Diese Vorlage kann nicht gelöscht werden, da ${template._count.plannedEvents} geplante(r) Termin(e) zugeordnet sind.`,
      };
    }

    await db.eventTemplate.delete({
      where: { id },
    });

    revalidatePath('/planning/templates');
    return { success: true };
  } catch (error) {
    console.error('Error deleting template:', error);
    return { success: false, error: 'Fehler beim Löschen der Vorlage.' };
  }
}
