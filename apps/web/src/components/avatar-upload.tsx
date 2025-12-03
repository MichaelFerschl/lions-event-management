'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

interface AvatarUploadProps {
  currentAvatarUrl: string | null;
  firstName: string;
  lastName: string;
  onAvatarChange?: (newUrl: string | null) => void;
}

export function AvatarUpload({
  currentAvatarUrl,
  firstName,
  lastName,
  onAvatarChange,
}: AvatarUploadProps) {
  const t = useTranslations('profile');
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate on client side
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError(t('avatar.invalidType'));
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError(t('avatar.tooLarge'));
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/me/avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t('avatar.uploadError'));
        return;
      }

      // Add cache buster to force image refresh
      const newUrl = `${data.avatarUrl}?t=${Date.now()}`;
      setAvatarUrl(newUrl);
      onAvatarChange?.(newUrl);
    } catch {
      setError(t('avatar.uploadError'));
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    if (!avatarUrl) return;

    if (!confirm(t('avatar.deleteConfirm'))) {
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const response = await fetch('/api/me/avatar', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || t('avatar.deleteError'));
        return;
      }

      setAvatarUrl(null);
      onAvatarChange?.(null);
    } catch {
      setError(t('avatar.deleteError'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar Display */}
      <div className="relative group">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={`${firstName} ${lastName}`}
            width={120}
            height={120}
            className="w-30 h-30 rounded-full object-cover border-4 border-white shadow-lg"
            unoptimized // For external URLs
          />
        ) : (
          <div className="w-30 h-30 rounded-full bg-lions-blue flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-lg"
               style={{ width: 120, height: 120 }}>
            {initials}
          </div>
        )}

        {/* Hover overlay */}
        <div
          className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>

        {/* Loading spinner */}
        {uploading && (
          <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-50 transition-colors"
        >
          {avatarUrl ? t('avatar.change') : t('avatar.upload')}
        </button>
        {avatarUrl && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={uploading}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
          >
            {t('avatar.delete')}
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Help text */}
      <p className="text-xs text-gray-500 text-center">
        {t('avatar.helpText')}
      </p>
    </div>
  );
}
