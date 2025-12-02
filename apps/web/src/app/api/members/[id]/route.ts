import { db } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Admin Client für User-Löschung (benötigt Service Role Key)
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase Admin credentials not configured');
  }

  return createAdminClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Berechtigung prüfen (nur Admin darf löschen)
    const permissions =
      currentMember.assignedRole?.rolePermissions.map((rp) => rp.permission.code) || [];
    const canDeleteMembers =
      permissions.includes('admin.users') || permissions.includes('members.delete');

    if (!canDeleteMembers) {
      return NextResponse.json(
        { error: 'Keine Berechtigung zum Löschen von Mitgliedern' },
        { status: 403 }
      );
    }

    // Zu löschendes Mitglied laden
    const memberToDelete = await db.member.findUnique({
      where: { id },
      include: { assignedRole: true },
    });

    if (!memberToDelete) {
      return NextResponse.json({ error: 'Mitglied nicht gefunden' }, { status: 404 });
    }

    // Prüfen ob gleiches Tenant
    if (memberToDelete.tenantId !== currentMember.tenantId) {
      return NextResponse.json(
        { error: 'Keine Berechtigung für dieses Mitglied' },
        { status: 403 }
      );
    }

    // Selbstlöschung verhindern
    if (memberToDelete.id === currentMember.id) {
      return NextResponse.json(
        { error: 'Sie können sich nicht selbst löschen' },
        { status: 400 }
      );
    }

    // Prüfen ob letzter Admin
    if (memberToDelete.assignedRole?.type === 'ADMIN') {
      const adminCount = await db.member.count({
        where: {
          tenantId: currentMember.tenantId,
          isActive: true,
          assignedRole: { type: 'ADMIN' },
        },
      });

      if (adminCount <= 1) {
        return NextResponse.json(
          {
            error:
              'Der letzte Administrator kann nicht gelöscht werden. Ernennen Sie zuerst einen anderen Administrator.',
          },
          { status: 400 }
        );
      }
    }

    // Supabase Auth User löschen (falls vorhanden)
    if (memberToDelete.authUserId) {
      try {
        const supabaseAdmin = getSupabaseAdmin();
        const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(
          memberToDelete.authUserId
        );

        if (deleteAuthError) {
          console.error('Error deleting Supabase auth user:', deleteAuthError);
          // Wir fahren trotzdem fort - der Member wird gelöscht
        } else {
          console.log(`✅ Supabase Auth User gelöscht: ${memberToDelete.authUserId}`);
        }
      } catch (authError) {
        console.error('Error accessing Supabase Admin:', authError);
        // Wir fahren trotzdem fort
      }
    }

    // Zuerst alle Einladungen löschen, die von diesem Member erstellt wurden
    // (Foreign Key Constraint: invitations.invitedById -> members.id)
    await db.invitation.deleteMany({
      where: { invitedById: id },
    });

    // Events, die von diesem Member erstellt wurden, auf den aktuellen User übertragen
    // (Foreign Key Constraint: events.createdById -> members.id)
    await db.event.updateMany({
      where: { createdById: id },
      data: { createdById: currentMember.id },
    });

    // EventParticipants werden durch onDelete: Cascade automatisch gelöscht

    // Member aus Datenbank löschen
    await db.member.delete({
      where: { id },
    });

    console.log(`✅ Mitglied gelöscht: ${memberToDelete.email}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting member:', error);
    return NextResponse.json({ error: 'Fehler beim Löschen des Mitglieds' }, { status: 500 });
  }
}
