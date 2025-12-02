import { db } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { sendInvitationEmail } from '@/lib/email/send-invitation';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
    }

    // Aktuellen Member laden
    const currentMember = await db.member.findUnique({
      where: { authUserId: user.id },
      include: {
        assignedRole: {
          include: { rolePermissions: { include: { permission: true } } },
        },
        tenant: true,
      },
    });

    if (!currentMember) {
      return NextResponse.json({ error: 'Mitglied nicht gefunden' }, { status: 404 });
    }

    // Berechtigung prüfen
    const permissions =
      currentMember.assignedRole?.rolePermissions.map((rp) => rp.permission.code) || [];
    const canInvite =
      permissions.includes('members.invite') ||
      permissions.includes('admin.users') ||
      permissions.some((p) => p.startsWith('members.') && p !== 'members.read');

    if (!canInvite) {
      return NextResponse.json(
        { error: 'Keine Berechtigung zum Einladen' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, roleType = 'MEMBER' } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'E-Mail-Adresse erforderlich' },
        { status: 400 }
      );
    }

    // Prüfen ob bereits ein aktives Mitglied mit dieser Email existiert
    const existingMember = await db.member.findUnique({
      where: {
        tenantId_email: {
          tenantId: currentMember.tenantId,
          email: email.toLowerCase(),
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'Ein Mitglied mit dieser E-Mail-Adresse existiert bereits' },
        { status: 400 }
      );
    }

    // Prüfen ob bereits eine ausstehende Einladung existiert
    const existingInvitation = await db.invitation.findFirst({
      where: {
        tenantId: currentMember.tenantId,
        email: email.toLowerCase(),
        status: 'PENDING',
      },
    });

    if (existingInvitation) {
      return NextResponse.json(
        {
          error:
            'Es existiert bereits eine ausstehende Einladung für diese E-Mail-Adresse',
        },
        { status: 400 }
      );
    }

    // Alte abgelaufene/widerrufene Einladungen für diese Email löschen
    // Dies vermeidet Unique Constraint Probleme
    await db.invitation.deleteMany({
      where: {
        tenantId: currentMember.tenantId,
        email: email.toLowerCase(),
        status: { in: ['EXPIRED', 'REVOKED'] },
      },
    });

    // Einladung erstellen
    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 Tage gültig

    const invitation = await db.invitation.create({
      data: {
        tenantId: currentMember.tenantId,
        email: email.toLowerCase(),
        token,
        roleType,
        invitedById: currentMember.id,
        expiresAt,
      },
    });

    // Einladungs-URL generieren
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const inviteUrl = `${baseUrl}/invite/${token}`;

    // Rollen-Name ermitteln
    const roleNames: Record<string, string> = {
      ADMIN: 'Administrator',
      PRESIDENT: 'Präsident',
      SECRETARY: 'Sekretär',
      BOARD: 'Vorstand',
      MEMBER: 'Mitglied',
      GUEST: 'Gast',
    };

    // Email senden
    const emailResult = await sendInvitationEmail({
      to: email.toLowerCase(),
      inviteUrl,
      clubName: currentMember.tenant.name,
      roleName: roleNames[roleType] || roleType,
      invitedByName: `${currentMember.firstName} ${currentMember.lastName}`,
      expiresInDays: 7,
    });

    if (!emailResult.success) {
      console.warn(`⚠️ Einladung erstellt aber Email fehlgeschlagen: ${emailResult.error}`);
    }

    return NextResponse.json({
      success: true,
      emailSent: emailResult.success,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        expiresAt: invitation.expiresAt,
        inviteUrl, // Für Development - kann später entfernt werden
      },
    });
  } catch (error) {
    console.error('Error creating invitation:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Einladung' },
      { status: 500 }
    );
  }
}
