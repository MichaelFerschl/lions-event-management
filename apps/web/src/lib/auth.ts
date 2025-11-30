import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db, type Member, MemberRole } from '@/lib/db';
import { getCurrentTenant } from './tenant';

/**
 * Get the current authenticated user from Clerk
 * Returns null if not authenticated
 */
export async function getCurrentClerkUser() {
  try {
    const user = await currentUser();
    return user;
  } catch {
    return null;
  }
}

/**
 * Get the authenticated member from the database
 * Combines Clerk user with Member record
 */
export async function getCurrentUser(): Promise<{
  clerkUser: Awaited<ReturnType<typeof currentUser>>;
  member: Member | null;
} | null> {
  const clerkUser = await getCurrentClerkUser();

  if (!clerkUser) {
    return null;
  }

  try {
    const tenant = await getCurrentTenant();
    const member = await db.member.findUnique({
      where: {
        tenantId_clerkUserId: {
          tenantId: tenant.id,
          clerkUserId: clerkUser.id,
        },
      },
    });

    return {
      clerkUser,
      member,
    };
  } catch (error) {
    console.error('Error fetching member:', error);
    return {
      clerkUser,
      member: null,
    };
  }
}

/**
 * Require authentication - redirect to sign-in if not authenticated
 * Returns the authenticated user
 */
export async function requireAuth() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  return user;
}

/**
 * Require specific role(s) - throws error if user doesn't have required role
 * Returns 403 Forbidden error
 */
export async function requireRole(allowedRoles: MemberRole[]) {
  const user = await requireAuth();

  if (!user.member) {
    throw new Error('Member profile not found');
  }

  if (!allowedRoles.includes(user.member.role)) {
    throw new Error('Forbidden: Insufficient permissions');
  }

  return user;
}

/**
 * Get authenticated member for a specific tenant
 * Returns null if not found
 */
export async function getAuthenticatedMember(
  tenantId: string
): Promise<Member | null> {
  const clerkUser = await getCurrentClerkUser();

  if (!clerkUser) {
    return null;
  }

  try {
    const member = await db.member.findUnique({
      where: {
        tenantId_clerkUserId: {
          tenantId,
          clerkUserId: clerkUser.id,
        },
      },
    });

    return member;
  } catch (error) {
    console.error('Error fetching authenticated member:', error);
    return null;
  }
}

/**
 * Check if current user has a specific role
 */
export async function hasRole(role: MemberRole): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    return user?.member?.role === role;
  } catch {
    return false;
  }
}

/**
 * Check if current user has any of the specified roles
 */
export async function hasAnyRole(roles: MemberRole[]): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    return user?.member ? roles.includes(user.member.role) : false;
  } catch {
    return false;
  }
}

/**
 * Check if current user is admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole('ADMIN');
}

/**
 * Check if current user is admin or board member
 */
export async function isAdminOrBoard(): Promise<boolean> {
  return hasAnyRole(['ADMIN', 'BOARD']);
}
