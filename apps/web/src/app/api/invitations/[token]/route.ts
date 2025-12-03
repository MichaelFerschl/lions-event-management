import { db } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import { sendInvitationEmail } from '@/lib/email/send-invitation';
import { NextResponse } from 'next/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Suche nach Token oder ID (für Kompatibilität)
    const invitation = await db.invitation.findFirst({
      where: {
        OR: [{ token }, { id: token }],
      },
      include: {
        tenant: { select: { name: true } },
        invitedBy: { select: { firstName: true, lastName: true } },
      },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Einladung nicht gefunden' }, { status: 404 });
    }

    if (invitation.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Diese Einladung wurde bereits verwendet oder zurückgezogen' },
        { status: 400 }
      );
    }

    if (new Date() > invitation.expiresAt) {
      // Einladung als abgelaufen markieren
      await db.invitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' },
      });

      return NextResponse.json(
        { error: 'Diese Einladung ist abgelaufen' },
        { status: 400 }
      );
    }

    // Rollen-Name ermitteln
    const roleNames: Record<string, string> = {
      ADMIN: 'Administrator',
      PRESIDENT: 'Präsident',
      SECRETARY: 'Sekretär',
      BOARD: 'Vorstand',
      MEMBER: 'Mitglied',
      GUEST: 'Gast',
    };

    return NextResponse.json({
      id: invitation.id,
      email: invitation.email,
      tenantName: invitation.tenant.name,
      roleName: roleNames[invitation.roleType] || invitation.roleType,
      invitedByName: `${invitation.invitedBy.firstName} ${invitation.invitedBy.lastName}`,
      expiresAt: invitation.expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Error loading invitation:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Einladung' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

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
      },
    });

    if (!currentMember) {
      return NextResponse.json({ error: 'Mitglied nicht gefunden' }, { status: 404 });
    }

    // Berechtigung prüfen
    const permissions =
      currentMember.assignedRole?.rolePermissions.map((rp) => rp.permission.code) || [];
    const canManageInvitations =
      permissions.includes('members.invite') ||
      permissions.includes('admin.users') ||
      permissions.some((p) => p.startsWith('members.') && p !== 'members.read');

    if (!canManageInvitations) {
      return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 });
    }

    // Einladung laden (suche nach Token oder ID)
    const invitation = await db.invitation.findFirst({
      where: {
        OR: [{ token }, { id: token }],
      },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Einladung nicht gefunden' }, { status: 404 });
    }

    if (invitation.tenantId !== currentMember.tenantId) {
      return NextResponse.json(
        { error: 'Keine Berechtigung für diese Einladung' },
        { status: 403 }
      );
    }

    if (invitation.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Nur ausstehende Einladungen können gelöscht werden' },
        { status: 400 }
      );
    }

    // Einladung komplett löschen (nicht nur Status ändern)
    // Dies vermeidet Unique Constraint Probleme bei erneuten Einladungen
    await db.invitation.delete({
      where: { id: invitation.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting invitation:', error);
    return NextResponse.json({ error: 'Fehler beim Löschen der Einladung' }, { status: 500 });
  }
}

// Resend invitation email
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

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
    const canManageInvitations =
      permissions.includes('members.invite') ||
      permissions.includes('admin.users') ||
      permissions.some((p) => p.startsWith('members.') && p !== 'members.read');

    if (!canManageInvitations) {
      return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 });
    }

    // Einladung laden (suche nach Token oder ID)
    const invitation = await db.invitation.findFirst({
      where: {
        OR: [{ token }, { id: token }],
      },
      include: {
        invitedBy: { select: { firstName: true, lastName: true } },
      },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Einladung nicht gefunden' }, { status: 404 });
    }

    if (invitation.tenantId !== currentMember.tenantId) {
      return NextResponse.json(
        { error: 'Keine Berechtigung für diese Einladung' },
        { status: 403 }
      );
    }

    if (invitation.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Nur ausstehende Einladungen können erneut gesendet werden' },
        { status: 400 }
      );
    }

    if (new Date() > invitation.expiresAt) {
      return NextResponse.json(
        { error: 'Diese Einladung ist abgelaufen' },
        { status: 400 }
      );
    }

    // Einladungs-URL generieren
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const inviteUrl = `${baseUrl}/invite/${invitation.token}`;

    // Rollen-Name ermitteln
    const roleNames: Record<string, string> = {
      ADMIN: 'Administrator',
      PRESIDENT: 'Präsident',
      SECRETARY: 'Sekretär',
      BOARD: 'Vorstand',
      MEMBER: 'Mitglied',
      GUEST: 'Gast',
    };

    // Berechne verbleibende Tage bis Ablauf
    const daysUntilExpiry = Math.ceil(
      (invitation.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    // Email erneut senden
    const emailResult = await sendInvitationEmail({
      to: invitation.email,
      inviteUrl,
      clubName: currentMember.tenant.name,
      roleName: roleNames[invitation.roleType] || invitation.roleType,
      invitedByName: `${currentMember.firstName} ${currentMember.lastName}`,
      expiresInDays: daysUntilExpiry,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Fehler beim Senden der E-Mail', details: emailResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, emailSent: true });
  } catch (error) {
    console.error('Error resending invitation:', error);
    return NextResponse.json(
      { error: 'Fehler beim erneuten Senden der Einladung' },
      { status: 500 }
    );
  }
}
