import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { db, type Member, type Tenant } from '@/lib/db';
import { cache } from 'react';

/**
 * Get current Supabase user (cached per request)
 */
export const getCurrentSupabaseUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
});

/**
 * Get current member with tenant (cached per request)
 * This is the main function to get user context
 */
export const getCurrentMember = cache(
  async (): Promise<(Member & { tenant: Tenant }) | null> => {
    const user = await getCurrentSupabaseUser();

    if (!user) {
      return null;
    }

    try {
      const member = await db.member.findFirst({
        where: { authUserId: user.id },
        include: { tenant: true, assignedRole: true },
      });

      return member as (Member & { tenant: Tenant }) | null;
    } catch (error) {
      console.error('Error fetching member:', error);
      return null;
    }
  }
);

/**
 * Get current tenant from the logged-in user
 */
export const getCurrentTenant = cache(async (): Promise<Tenant | null> => {
  const member = await getCurrentMember();
  return member?.tenant || null;
});

/**
 * Require authentication - redirect to sign-in if not authenticated
 */
export async function requireAuth() {
  const member = await getCurrentMember();

  if (!member) {
    redirect('/sign-in');
  }

  return member;
}

/**
 * Require specific role - redirect if insufficient permissions
 */
export async function requireRole(allowedRoleTypes: string[]) {
  const member = await requireAuth();

  if (
    !member.assignedRole ||
    !allowedRoleTypes.includes(member.assignedRole.type)
  ) {
    throw new Error('Forbidden: Insufficient permissions');
  }

  return member;
}

/**
 * Check if current user has admin role
 */
export async function isAdmin(): Promise<boolean> {
  const member = await getCurrentMember();
  return member?.assignedRole?.type === 'ADMIN';
}
