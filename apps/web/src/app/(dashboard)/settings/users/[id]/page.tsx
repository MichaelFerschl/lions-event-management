import { db } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAuthUser } from '@/lib/supabase/admin';
import { getTranslations } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { UserDetailView } from './user-detail-view';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function UserDetailPage({ params }: Props) {
  const { id } = await params;
  const t = await getTranslations('users');

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Aktuellen Member laden und Berechtigungen prüfen
  const currentMember = await db.member.findUnique({
    where: { authUserId: user.id },
    include: {
      assignedRole: {
        include: { rolePermissions: { include: { permission: true } } },
      },
    },
  });

  if (!currentMember) {
    redirect('/sign-in');
  }

  const permissions =
    currentMember.assignedRole?.rolePermissions.map((rp) => rp.permission.code) || [];

  const canManageUsers = permissions.some(
    (p) => p === 'admin.users' || p === 'members.view' || p.startsWith('members.')
  );

  if (!canManageUsers) {
    redirect('/dashboard');
  }

  // Benutzer laden
  const member = await db.member.findFirst({
    where: {
      id,
      tenantId: currentMember.tenantId,
    },
    include: {
      assignedRole: {
        include: { rolePermissions: { include: { permission: true } } },
      },
      eventRegistrations: {
        include: {
          event: {
            select: {
              id: true,
              title: true,
              startDate: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      sentInvitations: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });

  if (!member) {
    notFound();
  }

  // Supabase Auth-Daten laden (falls authUserId vorhanden)
  let authUserData = null;
  if (member.authUserId) {
    try {
      const supabaseAuthUser = await getSupabaseAuthUser(member.authUserId);
      if (supabaseAuthUser) {
        authUserData = {
          id: supabaseAuthUser.id,
          email: supabaseAuthUser.email || null,
          emailConfirmedAt: supabaseAuthUser.email_confirmed_at || null,
          phone: supabaseAuthUser.phone || null,
          phoneConfirmedAt: supabaseAuthUser.phone_confirmed_at || null,
          createdAt: supabaseAuthUser.created_at,
          lastSignInAt: supabaseAuthUser.last_sign_in_at || null,
          provider: supabaseAuthUser.app_metadata?.provider || 'email',
          providers: supabaseAuthUser.app_metadata?.providers || ['email'],
        };
      }
    } catch (error) {
      console.error('Error fetching Supabase auth user:', error);
    }
  }

  // Serialisieren für Client-Komponente
  const memberData = {
    id: member.id,
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email,
    phone: member.phone,
    avatarUrl: member.avatarUrl,
    memberNumber: member.memberNumber,
    joinDate: member.joinDate?.toISOString() || null,
    sponsor: member.sponsor,
    role: member.role,
    status: member.status,
    isActive: member.isActive,
    lastLoginAt: member.lastLoginAt?.toISOString() || null,
    locale: member.locale,
    emailNotifications: member.emailNotifications,
    createdAt: member.createdAt.toISOString(),
    updatedAt: member.updatedAt.toISOString(),
    assignedRole: member.assignedRole
      ? {
          id: member.assignedRole.id,
          name: member.assignedRole.name,
          type: member.assignedRole.type,
          permissions: member.assignedRole.rolePermissions.map((rp) => ({
            code: rp.permission.code,
            name: rp.permission.name,
            category: rp.permission.category,
          })),
        }
      : null,
    recentRegistrations: member.eventRegistrations.map((reg) => ({
      id: reg.id,
      status: reg.status,
      guestCount: reg.guestCount,
      createdAt: reg.createdAt.toISOString(),
      event: {
        id: reg.event.id,
        title: reg.event.title,
        startDate: reg.event.startDate.toISOString(),
      },
    })),
    sentInvitations: member.sentInvitations.map((inv) => ({
      id: inv.id,
      email: inv.email,
      status: inv.status,
      createdAt: inv.createdAt.toISOString(),
    })),
    authUserId: member.authUserId,
  };

  const isCurrentUser = member.id === currentMember.id;
  const canEdit = permissions.includes('admin.users') || permissions.includes('members.edit');

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center space-x-2 text-sm text-gray-500">
          <li>
            <Link href="/settings/users" className="hover:text-gray-700">
              {t('title')}
            </Link>
          </li>
          <li>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </li>
          <li className="text-gray-900 font-medium">
            {member.firstName} {member.lastName}
          </li>
        </ol>
      </nav>

      <UserDetailView
        member={memberData}
        authUser={authUserData}
        isCurrentUser={isCurrentUser}
        canEdit={canEdit}
      />
    </div>
  );
}
