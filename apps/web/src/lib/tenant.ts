import { headers } from 'next/headers';
import { db, type Tenant } from '@/lib/db';
import { unstable_cache } from 'next/cache';

/**
 * Get tenant slug from request headers (set by middleware)
 * For use in Server Components
 */
export async function getTenantFromHeaders(): Promise<string | null> {
  const headersList = await headers();
  return headersList.get('x-tenant-slug');
}

/**
 * Get tenant by slug from database with caching
 * Cache revalidates every 60 seconds
 */
export const getTenantBySlug = unstable_cache(
  async (slug: string): Promise<Tenant | null> => {
    try {
      const tenant = await db.tenant.findUnique({
        where: { slug },
      });
      return tenant;
    } catch (error) {
      console.error('Error fetching tenant:', error);
      return null;
    }
  },
  ['tenant-by-slug'],
  {
    revalidate: 60, // Cache for 60 seconds
    tags: ['tenant'],
  }
);

/**
 * Validate that a tenant exists and is active
 * Returns the tenant if valid, null otherwise
 */
export async function validateTenant(
  slug: string | null
): Promise<Tenant | null> {
  if (!slug) {
    return null;
  }

  const tenant = await getTenantBySlug(slug);

  if (!tenant) {
    console.warn(`Tenant not found: ${slug}`);
    return null;
  }

  // Check if tenant subscription is active
  if (tenant.planExpiresAt && tenant.planExpiresAt < new Date()) {
    console.warn(`Tenant subscription expired: ${slug}`);
    return null;
  }

  return tenant;
}

/**
 * Get current tenant from request headers and validate
 * Throws error if tenant is invalid
 */
export async function getCurrentTenant(): Promise<Tenant> {
  const slug = await getTenantFromHeaders();
  const tenant = await validateTenant(slug);

  if (!tenant) {
    throw new Error(
      `Invalid or missing tenant. Slug: ${slug || 'not provided'}`
    );
  }

  return tenant;
}

/**
 * Check if a feature is enabled for the current tenant
 */
export async function isFeatureEnabled(feature: string): Promise<boolean> {
  try {
    const tenant = await getCurrentTenant();
    return tenant.features.includes(feature);
  } catch {
    return false;
  }
}
