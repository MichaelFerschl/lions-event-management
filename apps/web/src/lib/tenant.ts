import { getCurrentTenant as getTenantFromAuth } from './auth';
import { db, type Tenant } from '@/lib/db';
import { cache } from 'react';

// Re-export for compatibility
export const getCurrentTenant = cache(async (): Promise<Tenant> => {
  const tenant = await getTenantFromAuth();

  if (!tenant) {
    throw new Error('No tenant found for current user. Please sign in.');
  }

  return tenant;
});

/**
 * Get tenant by slug (for public pages)
 */
export const getTenantBySlug = cache(
  async (slug: string): Promise<Tenant | null> => {
    try {
      return await db.tenant.findUnique({ where: { slug } });
    } catch (error) {
      console.error('Error fetching tenant:', error);
      return null;
    }
  }
);

/**
 * Check if feature is enabled for current tenant
 */
export async function isFeatureEnabled(feature: string): Promise<boolean> {
  try {
    const tenant = await getCurrentTenant();
    return tenant.features.includes(feature);
  } catch {
    return false;
  }
}
