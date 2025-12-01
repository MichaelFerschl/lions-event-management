'use server';

import { db, type Prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCurrentTenant } from '@/lib/tenant';
import type { PlannedEventDraft, MandatoryEventPlacement } from './types';

export interface SaveLionsYearData {
  yearName: string;
  startDate: Date;
  endDate: Date;
  setAsActive: boolean;
  allEvents: PlannedEventDraft[];
  mandatoryPlacements: MandatoryEventPlacement[];
}

export async function saveLionsYear(data: SaveLionsYearData): Promise<{ success: boolean; lionsYearId?: string; error?: string }> {
  try {
    const tenant = await getCurrentTenant();

    // Use a transaction to ensure all or nothing
    const result = await db.$transaction(async (tx: Prisma.TransactionClient) => {
      // If setting as active, first deactivate all other Lions years
      if (data.setAsActive) {
        await tx.lionsYear.updateMany({
          where: {
            tenantId: tenant.id,
            status: 'ACTIVE',
          },
          data: {
            status: 'ARCHIVED',
          },
        });
      }

      // Create the Lions year
      const lionsYear = await tx.lionsYear.create({
        data: {
          tenantId: tenant.id,
          name: data.yearName,
          startDate: data.startDate,
          endDate: data.endDate,
          status: data.setAsActive ? 'ACTIVE' : 'PLANNING',
        },
      });

      // Create all planned events
      // Filter out events without categoryId since it's required
      const eventsWithCategory = data.allEvents.filter((event) => event.categoryId);

      if (eventsWithCategory.length > 0) {
        await tx.plannedEvent.createMany({
          data: eventsWithCategory.map((event) => ({
            lionsYearId: lionsYear.id,
            title: event.title,
            description: event.description || null,
            date: event.date,
            endDate: event.endDate || null,
            categoryId: event.categoryId, // Required field
            templateId: event.templateId || null,
            recurringRuleId: event.recurringRuleId || null,
            status: 'PLANNED' as const,
            isMandatory: event.isMandatory,
            invitationText: event.invitationText || null,
          })),
        });
      }

      return lionsYear;
    });

    // Revalidate the planning pages
    revalidatePath('/planning');
    revalidatePath('/planning/lions-years');

    return { success: true, lionsYearId: result.id };
  } catch (error) {
    console.error('Error saving Lions year:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten',
    };
  }
}

export async function saveLionsYearAndRedirect(data: SaveLionsYearData): Promise<void> {
  const result = await saveLionsYear(data);

  if (result.success) {
    redirect(`/planning?created=${result.lionsYearId}`);
  } else {
    // In a real app, you might want to handle this differently
    // For now, we'll throw to show the error
    throw new Error(result.error || 'Fehler beim Speichern');
  }
}
