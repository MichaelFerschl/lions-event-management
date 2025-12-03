import { db } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { ProfileForm } from './profile-form';

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Load current member
  const member = await db.member.findUnique({
    where: { authUserId: user.id },
    include: {
      tenant: { select: { name: true } },
      assignedRole: { select: { type: true, name: true } },
    },
  });

  if (!member) {
    redirect('/sign-in');
  }

  const t = await getTranslations('profile');

  const memberForClient = {
    id: member.id,
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email,
    phone: member.phone || '',
    avatarUrl: member.avatarUrl,
    locale: member.locale,
    emailNotifications: member.emailNotifications,
    memberNumber: member.memberNumber || '',
    joinDate: member.joinDate?.toISOString() || null,
    sponsor: member.sponsor || '',
    role: member.assignedRole
      ? { type: member.assignedRole.type, name: member.assignedRole.name }
      : null,
    tenantName: member.tenant.name,
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-600">{t('subtitle')}</p>
      </div>

      <ProfileForm member={memberForClient} />
    </div>
  );
}
