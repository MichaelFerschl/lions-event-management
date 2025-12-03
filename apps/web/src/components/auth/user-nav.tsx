'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';

interface MemberData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  role: {
    type: string;
    name: string;
  } | null;
  tenantName: string;
}

export function UserNav() {
  const [user, setUser] = useState<User | null>(null);
  const [member, setMember] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const router = useRouter();
  const t = useTranslations('nav');
  const tMembers = useTranslations('members');

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    // Listen to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  // Fetch member data when user is available
  useEffect(() => {
    const fetchMember = async () => {
      if (!user) {
        setMember(null);
        return;
      }

      try {
        const response = await fetch('/api/me');
        if (response.ok) {
          const data = await response.json();
          setMember(data);
        }
      } catch (error) {
        console.error('Error fetching member data:', error);
      }
    };

    fetchMember();
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    router.push('/sign-in');
    router.refresh();
  };

  if (!user) return null;

  const displayName = member
    ? `${member.firstName} ${member.lastName}`
    : user.email?.split('@')[0] || '';
  const initials = member
    ? `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`.toUpperCase()
    : user.email?.charAt(0).toUpperCase() || '?';
  const roleDisplay = member?.role ? tMembers(`roles.${member.role.type}`) : null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-3 hover:bg-gray-50 rounded-lg px-2 py-1.5 transition-colors"
      >
        <div className="flex items-center gap-2">
          {member?.avatarUrl ? (
            <Image
              src={member.avatarUrl}
              alt={displayName}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover"
              unoptimized
            />
          ) : (
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm font-medium">{initials}</span>
            </div>
          )}
          <div className="text-left hidden sm:block">
            <div className="text-sm font-medium text-gray-900">{displayName}</div>
            {roleDisplay && (
              <div className="text-xs text-gray-500">{roleDisplay}</div>
            )}
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {/* User info header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{displayName}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
            {roleDisplay && (
              <span className="inline-flex items-center mt-1.5 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                {roleDisplay}
              </span>
            )}
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Link
              href="/settings/profile"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              {t('profile')}
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t border-gray-100 py-1">
            <button
              onClick={handleSignOut}
              disabled={loading}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              {loading ? '...' : t('logout')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
