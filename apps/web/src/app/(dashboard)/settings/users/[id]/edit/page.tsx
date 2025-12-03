import { db } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { UserEditForm } from './user-edit-form';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function UserEditPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Load current member for permission check
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

  // Check permissions
  const permissions =
    currentMember.assignedRole?.rolePermissions.map((rp) => rp.permission.code) || [];
  const canEdit = permissions.includes('admin.users') || permissions.includes('members.edit');

  if (!canEdit) {
    redirect('/settings/users');
  }

  const t = await getTranslations('users');

  // Load member to edit
  const member = await db.member.findFirst({
    where: {
      id,
      tenantId: currentMember.tenantId,
    },
    include: {
      assignedRole: { select: { id: true, type: true, name: true } },
    },
  });

  if (!member) {
    notFound();
  }

  // Load available roles for the tenant
  const roles = await db.role.findMany({
    where: { tenantId: currentMember.tenantId },
    orderBy: { name: 'asc' },
  });

  const memberForClient = {
    id: member.id,
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email,
    phone: member.phone || '',
    memberNumber: member.memberNumber || '',
    joinDate: member.joinDate?.toISOString().split('T')[0] || '',
    sponsor: member.sponsor || '',
    locale: member.locale,
    emailNotifications: member.emailNotifications,
    isActive: member.isActive,
    roleId: member.roleId || '',
    assignedRole: member.assignedRole
      ? { type: member.assignedRole.type, name: member.assignedRole.name }
      : null,
  };

  const rolesForClient = roles.map((role) => ({
    id: role.id,
    type: role.type,
    name: role.name,
  }));

  const isCurrentUser = member.id === currentMember.id;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center space-x-2 text-sm text-gray-500">
          <li>
            <Link href="/settings/users" className="hover:text-gray-700">
              {t('title')}
            </Link>
          </li>
          <li>›</li>
          <li>
            <Link href={`/settings/users/${id}`} className="hover:text-gray-700">
              {member.firstName} {member.lastName}
            </Link>
          </li>
          <li>›</li>
          <li className="text-gray-900 font-medium">{t('edit.title')}</li>
        </ol>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('edit.title')}</h1>
        <p className="text-gray-600">{t('edit.subtitle')}</p>
      </div>

      <UserEditForm
        member={memberForClient}
        roles={rolesForClient}
        isCurrentUser={isCurrentUser}
      />
    </div>
  );
}
