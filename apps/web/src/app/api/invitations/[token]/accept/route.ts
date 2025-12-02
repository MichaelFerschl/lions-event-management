import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();
    const { authUserId, firstName, lastName } = body;

    if (!authUserId || !firstName || !lastName) {
      return NextResponse.json({ error: 'Fehlende Daten' }, { status: 400 });
    }

    // Einladung laden
    const invitation = await db.invitation.findUnique({
      where: { token },
      include: { tenant: true },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Einladung nicht gefunden' }, { status: 404 });
    }

    if (invitation.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Diese Einladung ist nicht mehr gültig' },
        { status: 400 }
      );
    }

    if (new Date() > invitation.expiresAt) {
      return NextResponse.json(
        { error: 'Diese Einladung ist abgelaufen' },
        { status: 400 }
      );
    }

    // Rolle für den Tenant finden
    const role = await db.role.findUnique({
      where: {
        tenantId_type: {
          tenantId: invitation.tenantId,
          type: invitation.roleType,
        },
      },
    });

    if (!role) {
      return NextResponse.json({ error: 'Rolle nicht gefunden' }, { status: 500 });
    }

    // Transaktion: Member erstellen und Einladung aktualisieren
    await db.$transaction(async (tx) => {
      // Member erstellen
      await tx.member.create({
        data: {
          tenantId: invitation.tenantId,
          authUserId,
          email: invitation.email,
          firstName,
          lastName,
          roleId: role.id,
          role: invitation.roleType,
          status: 'ACTIVE',
          isActive: true,
        },
      });

      // Einladung als akzeptiert markieren
      await tx.invitation.update({
        where: { id: invitation.id },
        data: {
          status: 'ACCEPTED',
          acceptedAt: new Date(),
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error accepting invitation:', error);

    // Prüfen ob es ein Unique-Constraint Fehler ist
    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json(
        { error: 'Ein Mitglied mit dieser E-Mail existiert bereits' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Fehler beim Akzeptieren der Einladung' },
      { status: 500 }
    );
  }
}
