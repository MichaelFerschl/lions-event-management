import { db } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { InviteUserButton } from './invite-button';
import { InvitationList } from './invitation-list';
import { MemberList } from './member-list';

export default async function UsersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Aktuellen Member laden
  const currentMember = await db.member.findUnique({
    where: { authUserId: user.id },
    include: {
      tenant: true,
      assignedRole: {
        include: { rolePermissions: { include: { permission: true } } },
      },
    },
  });

  if (!currentMember) {
    redirect('/sign-in');
  }

  // Berechtigungen prüfen
  const permissions =
    currentMember.assignedRole?.rolePermissions.map((rp) => rp.permission.code) || [];
  const canManageUsers = permissions.some(
    (p) => p === 'admin.users' || p === 'members.invite' || p.startsWith('members.')
  );
  const canDeleteMembers =
    permissions.includes('admin.users') || permissions.includes('members.delete');

  if (!canManageUsers) {
    redirect('/dashboard');
  }

  // Mitglieder laden
  const members = await db.member.findMany({
    where: { tenantId: currentMember.tenantId },
    include: { assignedRole: true },
    orderBy: [{ createdAt: 'desc' }],
  });

  // Ausstehende Einladungen laden
  const pendingInvitations = await db.invitation.findMany({
    where: {
      tenantId: currentMember.tenantId,
      status: 'PENDING',
    },
    include: { invitedBy: true },
    orderBy: { createdAt: 'desc' },
  });

  // Daten für Client-Komponenten serialisieren
  const invitationsForClient = pendingInvitations.map((inv) => ({
    id: inv.id,
    email: inv.email,
    roleType: inv.roleType,
    invitedBy: {
      firstName: inv.invitedBy.firstName,
      lastName: inv.invitedBy.lastName,
    },
    expiresAt: inv.expiresAt.toISOString(),
  }));

  const membersForClient = members.map((member) => ({
    id: member.id,
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email,
    isActive: member.isActive,
    role: member.assignedRole
      ? {
          type: member.assignedRole.type,
          name: member.assignedRole.name,
        }
      : null,
  }));

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Benutzerverwaltung</h1>
          <p className="text-gray-600">Mitglieder und Einladungen verwalten</p>
        </div>
        <InviteUserButton />
      </div>

      {/* Ausstehende Einladungen (Client Component mit Lösch-Funktion) */}
      <InvitationList invitations={invitationsForClient} />

      {/* Mitgliederliste (Client Component mit Lösch-Funktion) */}
      <MemberList
        members={membersForClient}
        currentMemberId={currentMember.id}
        canDelete={canDeleteMembers}
      />
    </div>
  );
}
