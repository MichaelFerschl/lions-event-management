'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface MemberData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  memberNumber: string;
  joinDate: string;
  sponsor: string;
  locale: string;
  emailNotifications: boolean;
  isActive: boolean;
  roleId: string;
  assignedRole: { type: string; name: string } | null;
}

interface Role {
  id: string;
  type: string;
  name: string;
}

interface UserEditFormProps {
  member: MemberData;
  roles: Role[];
  isCurrentUser: boolean;
}

export function UserEditForm({ member, roles, isCurrentUser }: UserEditFormProps) {
  const t = useTranslations('users');
  const tMembers = useTranslations('members');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: member.firstName,
    lastName: member.lastName,
    phone: member.phone,
    memberNumber: member.memberNumber,
    joinDate: member.joinDate,
    sponsor: member.sponsor,
    locale: member.locale,
    emailNotifications: member.emailNotifications,
    isActive: member.isActive,
    roleId: member.roleId,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/members/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || t('edit.saveError'));
        return;
      }

      router.push(`/settings/users/${member.id}`);
      router.refresh();
    } catch {
      setError(t('edit.saveError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Personal Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-semibold text-gray-900 mb-4">{t('edit.personalInfo')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              {t('edit.firstName')} *
            </label>
            <input
              type="text"
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              {t('edit.lastName')} *
            </label>
            <input
              type="text"
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              {tCommon('email')}
            </label>
            <input
              type="email"
              id="email"
              value={member.email}
              disabled
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">{t('edit.emailReadonly')}</p>
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              {tCommon('phone')}
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+49 123 456789"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Lions Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-semibold text-gray-900 mb-4">{t('edit.lionsInfo')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="memberNumber" className="block text-sm font-medium text-gray-700 mb-1">
              {tMembers('memberNumber')}
            </label>
            <input
              type="text"
              id="memberNumber"
              value={formData.memberNumber}
              onChange={(e) => setFormData({ ...formData, memberNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="joinDate" className="block text-sm font-medium text-gray-700 mb-1">
              {tMembers('joinDate')}
            </label>
            <input
              type="date"
              id="joinDate"
              value={formData.joinDate}
              onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="sponsor" className="block text-sm font-medium text-gray-700 mb-1">
              {t('edit.sponsor')}
            </label>
            <input
              type="text"
              id="sponsor"
              value={formData.sponsor}
              onChange={(e) => setFormData({ ...formData, sponsor: e.target.value })}
              placeholder={t('edit.sponsorPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Role & Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-semibold text-gray-900 mb-4">{t('edit.roleAndStatus')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="roleId" className="block text-sm font-medium text-gray-700 mb-1">
              {tMembers('role')}
            </label>
            <select
              id="roleId"
              value={formData.roleId}
              onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
              disabled={isCurrentUser}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            >
              <option value="">{t('edit.selectRole')}</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name} ({tMembers(`roles.${role.type}`)})
                </option>
              ))}
            </select>
            {isCurrentUser && (
              <p className="text-xs text-gray-500 mt-1">{t('edit.cantChangeOwnRole')}</p>
            )}
          </div>
          <div className="flex items-center">
            <div className="flex items-center h-full pt-6">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                disabled={isCurrentUser}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                {t('edit.isActive')}
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-semibold text-gray-900 mb-4">{t('edit.preferences')}</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="locale" className="block text-sm font-medium text-gray-700 mb-1">
              {t('edit.language')}
            </label>
            <select
              id="locale"
              value={formData.locale}
              onChange={(e) => setFormData({ ...formData, locale: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="de">Deutsch</option>
              <option value="en">English</option>
            </select>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="emailNotifications"
              checked={formData.emailNotifications}
              onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="emailNotifications" className="ml-2 text-sm text-gray-700">
              {t('edit.emailNotifications')}
            </label>
          </div>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end gap-3">
        <Link
          href={`/settings/users/${member.id}`}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {tCommon('cancel')}
        </Link>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? t('edit.saving') : tCommon('save')}
        </button>
      </div>
    </form>
  );
}
