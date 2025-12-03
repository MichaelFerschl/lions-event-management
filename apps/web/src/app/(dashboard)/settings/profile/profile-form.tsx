'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { AvatarUpload } from '@/components/avatar-upload';

interface MemberData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
  locale: string;
  emailNotifications: boolean;
  memberNumber: string;
  joinDate: string | null;
  sponsor: string;
  role: { type: string; name: string } | null;
  tenantName: string;
}

interface ProfileFormProps {
  member: MemberData;
}

export function ProfileForm({ member }: ProfileFormProps) {
  const t = useTranslations('profile');
  const tMembers = useTranslations('members');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: member.firstName,
    lastName: member.lastName,
    phone: member.phone,
    locale: member.locale,
    emailNotifications: member.emailNotifications,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || t('saveError'));
        return;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      router.refresh();
    } catch {
      setError(t('saveError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Avatar Upload */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h2 className="font-semibold text-gray-900 mb-4 text-center">{t('avatar.title')}</h2>
        <AvatarUpload
          currentAvatarUrl={member.avatarUrl}
          firstName={member.firstName}
          lastName={member.lastName}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Account Info (read-only) */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h2 className="font-semibold text-gray-900 mb-4">{t('accountInfo')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">{tCommon('email')}</label>
              <p className="text-gray-900">{member.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">{t('club')}</label>
              <p className="text-gray-900">{member.tenantName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">{tMembers('role')}</label>
              <p className="text-gray-900">
                {member.role ? tMembers(`roles.${member.role.type}`) : '-'}
              </p>
            </div>
            {member.memberNumber && (
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  {tMembers('memberNumber')}
                </label>
                <p className="text-gray-900">{member.memberNumber}</p>
              </div>
            )}
          </div>
        </div>

      {/* Editable Profile */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h2 className="font-semibold text-gray-900 mb-4">{t('personalInfo')}</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded-lg mb-4">
            {t('saveSuccess')}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              {t('firstName')} *
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
              {t('lastName')} *
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
          <div className="md:col-span-2">
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

      {/* Preferences */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h2 className="font-semibold text-gray-900 mb-4">{t('preferences')}</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="locale" className="block text-sm font-medium text-gray-700 mb-1">
              {t('language')}
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
              {t('emailNotifications')}
            </label>
          </div>
        </div>
      </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? t('saving') : tCommon('save')}
          </button>
        </div>
      </form>
    </div>
  );
}
