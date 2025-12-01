'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getCurrentTenant } from '@/lib/tenant';

export interface LionsYearWithStats {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: 'DRAFT' | 'PLANNING' | 'ACTIVE' | 'ARCHIVED';
  createdAt: Date;
  updatedAt: Date;
  _count: {
    plannedEvents: number;
  };
}

export interface PlannedEventWithDetails {
  id: string;
  title: string;
  description: string | null;
  date: Date;
  endDate: Date | null;
  status: 'PLANNED' | 'CONFIRMED' | 'CANCELLED';
  isMandatory: boolean;
  invitationText: string | null;
  publishedEventId: string | null;
  category: {
    id: string;
    name: string;
    color: string | null;
  } | null;
  template: {
    id: string;
    name: string;
  } | null;
  recurringRule: {
    id: string;
    name: string;
  } | null;
}

export interface LionsYearWithEvents {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: 'DRAFT' | 'PLANNING' | 'ACTIVE' | 'ARCHIVED';
  createdAt: Date;
  updatedAt: Date;
  plannedEvents: PlannedEventWithDetails[];
}

/**
 * Get all Lions years for the current tenant
 */
export async function getLionsYears(): Promise<LionsYearWithStats[]> {
  const tenant = await getCurrentTenant();

  const years = await db.lionsYear.findMany({
    where: {
      tenantId: tenant.id,
    },
    include: {
      _count: {
        select: {
          plannedEvents: true,
        },
      },
    },
    orderBy: {
      startDate: 'desc',
    },
  });

  return years as LionsYearWithStats[];
}

/**
 * Get a single Lions year with all events
 */
export async function getLionsYear(id: string): Promise<LionsYearWithEvents | null> {
  const tenant = await getCurrentTenant();

  const year = await db.lionsYear.findFirst({
    where: {
      id,
      tenantId: tenant.id,
    },
    include: {
      plannedEvents: {
        include: {
          category: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
          template: {
            select: {
              id: true,
              name: true,
            },
          },
          recurringRule: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          date: 'asc',
        },
      },
    },
  });

  return year as LionsYearWithEvents | null;
}

/**
 * Update Lions year status
 */
export async function updateLionsYearStatus(
  id: string,
  status: 'DRAFT' | 'PLANNING' | 'ACTIVE' | 'ARCHIVED'
): Promise<{ success: boolean; error?: string }> {
  try {
    const tenant = await getCurrentTenant();

    // If setting to ACTIVE, first deactivate all other years
    if (status === 'ACTIVE') {
      await db.lionsYear.updateMany({
        where: {
          tenantId: tenant.id,
          status: 'ACTIVE',
          id: { not: id },
        },
        data: {
          status: 'ARCHIVED',
        },
      });
    }

    await db.lionsYear.update({
      where: {
        id,
        tenantId: tenant.id,
      },
      data: {
        status,
      },
    });

    revalidatePath('/planning/years');
    revalidatePath(`/planning/years/${id}`);

    return { success: true };
  } catch (error) {
    console.error('Error updating Lions year status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Fehler beim Aktualisieren',
    };
  }
}

/**
 * Archive a Lions year
 */
export async function archiveLionsYear(id: string): Promise<{ success: boolean; error?: string }> {
  return updateLionsYearStatus(id, 'ARCHIVED');
}

/**
 * Delete a Lions year (only if DRAFT)
 */
export async function deleteLionsYear(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const tenant = await getCurrentTenant();

    // Check if the year is in DRAFT status
    const year = await db.lionsYear.findFirst({
      where: {
        id,
        tenantId: tenant.id,
      },
    });

    if (!year) {
      return { success: false, error: 'Lionsjahr nicht gefunden' };
    }

    if (year.status !== 'DRAFT') {
      return {
        success: false,
        error: 'Nur Lionsjahre im Entwurf-Status können gelöscht werden',
      };
    }

    // Delete all planned events first (cascade should handle this, but being explicit)
    await db.plannedEvent.deleteMany({
      where: {
        lionsYearId: id,
      },
    });

    // Delete the Lions year
    await db.lionsYear.delete({
      where: {
        id,
      },
    });

    revalidatePath('/planning/years');

    return { success: true };
  } catch (error) {
    console.error('Error deleting Lions year:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Fehler beim Löschen',
    };
  }
}

/**
 * Add a planned event to a Lions year
 */
export async function addPlannedEvent(
  lionsYearId: string,
  data: {
    title: string;
    description?: string;
    date: Date;
    endDate?: Date;
    categoryId: string;
    templateId?: string;
    isMandatory?: boolean;
    invitationText?: string;
  }
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  try {
    const tenant = await getCurrentTenant();

    // Verify the Lions year exists and belongs to tenant
    const year = await db.lionsYear.findFirst({
      where: {
        id: lionsYearId,
        tenantId: tenant.id,
      },
    });

    if (!year) {
      return { success: false, error: 'Lionsjahr nicht gefunden' };
    }

    if (year.status === 'ARCHIVED') {
      return { success: false, error: 'Archivierte Lionsjahre können nicht bearbeitet werden' };
    }

    const event = await db.plannedEvent.create({
      data: {
        lionsYearId,
        title: data.title,
        description: data.description || null,
        date: data.date,
        endDate: data.endDate || null,
        categoryId: data.categoryId,
        templateId: data.templateId || null,
        isMandatory: data.isMandatory || false,
        invitationText: data.invitationText || null,
        status: 'PLANNED',
      },
    });

    revalidatePath(`/planning/years/${lionsYearId}`);

    return { success: true, eventId: event.id };
  } catch (error) {
    console.error('Error adding planned event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Fehler beim Hinzufügen',
    };
  }
}

/**
 * Update a planned event
 */
export async function updatePlannedEvent(
  eventId: string,
  data: {
    title?: string;
    description?: string;
    date?: Date;
    endDate?: Date;
    categoryId?: string;
    status?: 'PLANNED' | 'CONFIRMED' | 'CANCELLED';
    isMandatory?: boolean;
    invitationText?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const tenant = await getCurrentTenant();

    // Verify the event exists and belongs to tenant's Lions year
    const event = await db.plannedEvent.findFirst({
      where: {
        id: eventId,
      },
      include: {
        lionsYear: true,
      },
    });

    if (!event || event.lionsYear.tenantId !== tenant.id) {
      return { success: false, error: 'Termin nicht gefunden' };
    }

    if (event.lionsYear.status === 'ARCHIVED') {
      return { success: false, error: 'Termine in archivierten Lionsjahren können nicht bearbeitet werden' };
    }

    await db.plannedEvent.update({
      where: { id: eventId },
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        endDate: data.endDate,
        categoryId: data.categoryId,
        status: data.status,
        isMandatory: data.isMandatory,
        invitationText: data.invitationText,
      },
    });

    revalidatePath(`/planning/years/${event.lionsYearId}`);

    return { success: true };
  } catch (error) {
    console.error('Error updating planned event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Fehler beim Aktualisieren',
    };
  }
}

/**
 * Delete a planned event
 */
export async function deletePlannedEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const tenant = await getCurrentTenant();

    // Verify the event exists and belongs to tenant's Lions year
    const event = await db.plannedEvent.findFirst({
      where: {
        id: eventId,
      },
      include: {
        lionsYear: true,
      },
    });

    if (!event || event.lionsYear.tenantId !== tenant.id) {
      return { success: false, error: 'Termin nicht gefunden' };
    }

    if (event.lionsYear.status === 'ARCHIVED') {
      return { success: false, error: 'Termine in archivierten Lionsjahren können nicht gelöscht werden' };
    }

    await db.plannedEvent.delete({
      where: { id: eventId },
    });

    revalidatePath(`/planning/years/${event.lionsYearId}`);

    return { success: true };
  } catch (error) {
    console.error('Error deleting planned event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Fehler beim Löschen',
    };
  }
}

/**
 * Publish a planned event as a real Event
 */
export async function publishPlannedEvent(eventId: string): Promise<{ success: boolean; publishedEventId?: string; error?: string }> {
  try {
    const tenant = await getCurrentTenant();

    // Get the planned event
    const plannedEvent = await db.plannedEvent.findFirst({
      where: {
        id: eventId,
      },
      include: {
        lionsYear: true,
        category: true,
      },
    });

    if (!plannedEvent || plannedEvent.lionsYear.tenantId !== tenant.id) {
      return { success: false, error: 'Termin nicht gefunden' };
    }

    if (plannedEvent.publishedEventId) {
      return { success: false, error: 'Termin wurde bereits veröffentlicht' };
    }

    // Get the first member as creator (in real app, use logged-in user)
    const firstMember = await db.member.findFirst({
      where: { tenantId: tenant.id },
    });

    if (!firstMember) {
      return { success: false, error: 'Kein Mitglied gefunden um Event zu erstellen' };
    }

    // Create the real Event
    const event = await db.event.create({
      data: {
        tenantId: tenant.id,
        title: plannedEvent.title,
        description: plannedEvent.description || '',
        startDate: plannedEvent.date,
        endDate: plannedEvent.endDate,
        type: 'ACTIVITY',
        isPublished: false,
        createdById: firstMember.id,
      },
    });

    // Update the planned event with the published event ID
    await db.plannedEvent.update({
      where: { id: eventId },
      data: {
        publishedEventId: event.id,
        status: 'CONFIRMED',
      },
    });

    revalidatePath(`/planning/years/${plannedEvent.lionsYearId}`);
    revalidatePath('/events');

    return { success: true, publishedEventId: event.id };
  } catch (error) {
    console.error('Error publishing planned event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Fehler beim Veröffentlichen',
    };
  }
}

/**
 * Export Lions year as ICS calendar file
 */
export async function exportLionsYearAsICS(id: string): Promise<{ success: boolean; icsContent?: string; error?: string }> {
  try {
    const tenant = await getCurrentTenant();

    const year = await db.lionsYear.findFirst({
      where: {
        id,
        tenantId: tenant.id,
      },
      include: {
        plannedEvents: {
          where: {
            status: { not: 'CANCELLED' },
          },
          include: {
            category: true,
          },
          orderBy: {
            date: 'asc',
          },
        },
      },
    });

    if (!year) {
      return { success: false, error: 'Lionsjahr nicht gefunden' };
    }

    // Generate ICS content
    const icsLines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Lions Club//Event Management//DE',
      `X-WR-CALNAME:${year.name}`,
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];

    for (const event of year.plannedEvents) {
      const dtStart = formatDateForICS(event.date);
      const dtEnd = event.endDate
        ? formatDateForICS(event.endDate)
        : formatDateForICS(new Date(event.date.getTime() + 2 * 60 * 60 * 1000)); // Default 2 hours

      icsLines.push('BEGIN:VEVENT');
      icsLines.push(`UID:${event.id}@lions-club`);
      icsLines.push(`DTSTAMP:${formatDateForICS(new Date())}`);
      icsLines.push(`DTSTART:${dtStart}`);
      icsLines.push(`DTEND:${dtEnd}`);
      icsLines.push(`SUMMARY:${escapeICSText(event.title)}`);

      if (event.description) {
        icsLines.push(`DESCRIPTION:${escapeICSText(event.description)}`);
      }

      if (event.category) {
        icsLines.push(`CATEGORIES:${escapeICSText(event.category.name)}`);
      }

      icsLines.push('END:VEVENT');
    }

    icsLines.push('END:VCALENDAR');

    return { success: true, icsContent: icsLines.join('\r\n') };
  } catch (error) {
    console.error('Error exporting Lions year as ICS:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Fehler beim Exportieren',
    };
  }
}

/**
 * Get upcoming events for dashboard widget
 */
export async function getUpcomingPlannedEvents(limit: number = 3): Promise<PlannedEventWithDetails[]> {
  const tenant = await getCurrentTenant();
  const now = new Date();

  const events = await db.plannedEvent.findMany({
    where: {
      lionsYear: {
        tenantId: tenant.id,
        status: 'ACTIVE',
      },
      date: {
        gte: now,
      },
      status: { not: 'CANCELLED' },
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
      template: {
        select: {
          id: true,
          name: true,
        },
      },
      recurringRule: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      date: 'asc',
    },
    take: limit,
  });

  return events as PlannedEventWithDetails[];
}

// Helper functions for ICS export
function formatDateForICS(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
}

function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}
