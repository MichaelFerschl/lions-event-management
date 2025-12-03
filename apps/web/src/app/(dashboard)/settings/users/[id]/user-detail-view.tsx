'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';

interface Permission {
  code: string;
  name: string;
  category: string;
}

interface AssignedRole {
  id: string;
  name: string;
  type: string;
  permissions: Permission[];
}

interface EventRegistration {
  id: string;
  status: string;
  guestCount: number;
  createdAt: string;
  event: {
    id: string;
    title: string;
    startDate: string;
  };
}

interface SentInvitation {
  id: string;
  email: string;
  status: string;
  createdAt: string;
}

interface MemberData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  memberNumber: string | null;
  joinDate: string | null;
  sponsor: string | null;
  role: string;
  status: string;
  isActive: boolean;
  lastLoginAt: string | null;
  locale: string | null;
  emailNotifications: boolean;
  createdAt: string;
  updatedAt: string;
  assignedRole: AssignedRole | null;
  recentRegistrations: EventRegistration[];
  sentInvitations: SentInvitation[];
  authUserId: string | null;
}

interface AuthUserData {
  id: string;
  email: string | null;
  emailConfirmedAt: string | null;
  phone: string | null;
  phoneConfirmedAt: string | null;
  createdAt: string;
  lastSignInAt: string | null;
  provider: string;
  providers: string[];
}

interface UserDetailViewProps {
  member: MemberData;
  authUser: AuthUserData | null;
  isCurrentUser: boolean;
  canEdit: boolean;
}

export function UserDetailView({ member, authUser, isCurrentUser, canEdit }: UserDetailViewProps) {
  const t = useTranslations('users');
  const tMembers = useTranslations('members');
  const tCommon = useTranslations('common');
  const tEvents = useTranslations('events');
  const tSettings = useTranslations('settings');

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRegistrationStatusColor = (status: string) => {
    switch (status) {
      case 'REGISTERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'MAYBE':
        return 'bg-yellow-100 text-yellow-800';
      case 'WAITLIST':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInvitationStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800';
      case 'REVOKED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Avatar and Basic Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {member.avatarUrl ? (
              <Image
                src={member.avatarUrl}
                alt={`${member.firstName} ${member.lastName}`}
                width={96}
                height={96}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-lions-blue flex items-center justify-center text-white text-3xl font-bold">
                {member.firstName.charAt(0)}
                {member.lastName.charAt(0)}
              </div>
            )}
          </div>

          {/* Name and Status */}
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {member.firstName} {member.lastName}
              </h1>
              {isCurrentUser && (
                <span className="px-2 py-1 text-xs font-medium bg-lions-blue text-white rounded">
                  {tMembers('you')}
                </span>
              )}
              <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(member.status)}`}>
                {tMembers(`statuses.${member.status.toLowerCase()}`)}
              </span>
            </div>

            <div className="mt-2 text-gray-600">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href={`mailto:${member.email}`} className="hover:text-lions-blue">
                  {member.email}
                </a>
              </div>
              {member.phone && (
                <div className="flex items-center gap-2 mt-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href={`tel:${member.phone}`} className="hover:text-lions-blue">
                    {member.phone}
                  </a>
                </div>
              )}
            </div>

            {/* Role Badge */}
            {member.assignedRole && (
              <div className="mt-3">
                <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-purple-100 text-purple-800 rounded-full">
                  {member.assignedRole.name}
                </span>
              </div>
            )}
          </div>

          {/* Edit Button */}
          {canEdit && (
            <Link
              href={`/settings/users/${member.id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {tCommon('edit')}
            </Link>
          )}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lions Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('detail.lionsInfo')}</h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-gray-500">{tMembers('memberNumber')}</dt>
              <dd className="text-gray-900 font-medium">{member.memberNumber || '-'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">{tMembers('joinDate')}</dt>
              <dd className="text-gray-900 font-medium">{formatDate(member.joinDate)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">{t('detail.sponsor')}</dt>
              <dd className="text-gray-900 font-medium">{member.sponsor || '-'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">{tMembers('role')}</dt>
              <dd className="text-gray-900 font-medium">{tMembers(`roles.${member.role}`)}</dd>
            </div>
          </dl>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('detail.account')}</h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-gray-500">{tMembers('status')}</dt>
              <dd>
                <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(member.status)}`}>
                  {tMembers(`statuses.${member.status.toLowerCase()}`)}
                </span>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">{t('detail.active')}</dt>
              <dd className="text-gray-900 font-medium">
                {member.isActive ? (
                  <span className="text-green-600">✓ {t('detail.yes')}</span>
                ) : (
                  <span className="text-gray-500">✗ {t('detail.no')}</span>
                )}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">{t('detail.lastLogin')}</dt>
              <dd className="text-gray-900 font-medium">{formatDateTime(member.lastLoginAt)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">{t('detail.createdAt')}</dt>
              <dd className="text-gray-900 font-medium">{formatDateTime(member.createdAt)}</dd>
            </div>
          </dl>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{tSettings('title')}</h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-gray-500">{tSettings('language')}</dt>
              <dd className="text-gray-900 font-medium">
                {member.locale === 'de' ? 'Deutsch' : member.locale === 'en' ? 'English' : member.locale || '-'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">{tSettings('notifications')}</dt>
              <dd className="text-gray-900 font-medium">
                {member.emailNotifications ? (
                  <span className="text-green-600">✓ {t('detail.enabled')}</span>
                ) : (
                  <span className="text-gray-500">✗ {t('detail.disabled')}</span>
                )}
              </dd>
            </div>
          </dl>
        </div>

        {/* Role and Permissions */}
        {member.assignedRole && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('detail.roleAndPermissions')}</h2>
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-purple-100 text-purple-800 rounded-full">
                {member.assignedRole.name}
              </span>
              <span className="ml-2 text-sm text-gray-500">({member.assignedRole.type})</span>
            </div>
            {member.assignedRole.permissions.length > 0 && (
              <div className="mt-3">
                <h3 className="text-sm font-medium text-gray-700 mb-2">{t('detail.permissions')}:</h3>
                <div className="flex flex-wrap gap-2">
                  {member.assignedRole.permissions.map((perm) => (
                    <span
                      key={perm.code}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                      title={perm.name}
                    >
                      {perm.code}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Supabase Auth Information */}
      {authUser && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('detail.authInfo')}</h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-gray-500">{t('detail.authId')}</dt>
              <dd className="text-sm font-mono text-gray-900 mt-1 break-all">{authUser.id}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">{t('detail.authProvider')}</dt>
              <dd className="text-gray-900 mt-1">
                <div className="flex flex-wrap gap-1">
                  {authUser.providers.map((provider) => (
                    <span
                      key={provider}
                      className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                    >
                      {provider}
                    </span>
                  ))}
                </div>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">{t('detail.emailVerified')}</dt>
              <dd className="text-gray-900 mt-1">
                {authUser.emailConfirmedAt ? (
                  <span className="text-green-600">✓ {formatDateTime(authUser.emailConfirmedAt)}</span>
                ) : (
                  <span className="text-amber-600">✗ {t('detail.notVerified')}</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">{t('detail.authCreatedAt')}</dt>
              <dd className="text-gray-900 mt-1">{formatDateTime(authUser.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">{t('detail.lastSignIn')}</dt>
              <dd className="text-gray-900 mt-1">{formatDateTime(authUser.lastSignInAt)}</dd>
            </div>
            {authUser.phone && (
              <div>
                <dt className="text-sm text-gray-500">{t('detail.authPhone')}</dt>
                <dd className="text-gray-900 mt-1">
                  {authUser.phone}
                  {authUser.phoneConfirmedAt && (
                    <span className="ml-2 text-green-600 text-sm">✓</span>
                  )}
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* No Auth User Warning */}
      {!authUser && member.authUserId && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-amber-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-medium">{t('detail.authDataUnavailable')}</span>
          </div>
        </div>
      )}

      {/* No Auth Account */}
      {!member.authUserId && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{t('detail.noAuthAccount')}</span>
          </div>
        </div>
      )}

      {/* Recent Event Registrations */}
      {member.recentRegistrations.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">{t('detail.recentRegistrations')}</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {member.recentRegistrations.map((reg) => (
              <div key={reg.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <Link
                    href={`/events/${reg.event.id}`}
                    className="font-medium text-gray-900 hover:text-lions-blue"
                  >
                    {reg.event.title}
                  </Link>
                  <div className="text-sm text-gray-500">
                    {formatDate(reg.event.startDate)}
                    {reg.guestCount > 0 && ` • ${reg.guestCount} ${tEvents('guests')}`}
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${getRegistrationStatusColor(reg.status)}`}>
                  {tEvents(`status.${reg.status.toLowerCase()}`)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sent Invitations */}
      {member.sentInvitations.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">{t('detail.sentInvitations')}</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {member.sentInvitations.map((inv) => (
              <div key={inv.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <div className="font-medium text-gray-900">{inv.email}</div>
                  <div className="text-sm text-gray-500">
                    {formatDateTime(inv.createdAt)}
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${getInvitationStatusColor(inv.status)}`}>
                  {inv.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
