'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { db } from '@/lib/db';
import { getCurrentTenant } from '@/lib/tenant';

export interface WebsiteSettings {
  websiteEnabled: boolean;
  websiteTitle: string;
  websiteLogo: string;
  heroImage: string;
  heroText: string;
  aboutText: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  socialFacebook: string;
  socialInstagram: string;
  socialLinkedin: string;
}

export interface ActionResult {
  success: boolean;
  error?: string;
}

function validateUrl(url: string, fieldName: string): string | null {
  if (!url) return null;

  // Allow relative paths for internal assets
  if (url.startsWith('/')) return null;

  try {
    new URL(url);
    return null;
  } catch {
    return `${fieldName} muss eine gültige URL sein`;
  }
}

function validateEmail(email: string): string | null {
  if (!email) return null;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Ungültige E-Mail-Adresse';
  }
  return null;
}

export async function saveWebsiteSettings(
  settings: WebsiteSettings
): Promise<ActionResult> {
  try {
    const tenant = await getCurrentTenant();

    // Validate URLs
    const urlErrors = [
      validateUrl(settings.websiteLogo, 'Website-Logo'),
      validateUrl(settings.heroImage, 'Hero-Bild'),
      validateUrl(settings.socialFacebook, 'Facebook-URL'),
      validateUrl(settings.socialInstagram, 'Instagram-URL'),
      validateUrl(settings.socialLinkedin, 'LinkedIn-URL'),
    ].filter(Boolean);

    if (urlErrors.length > 0) {
      return { success: false, error: urlErrors[0]! };
    }

    // Validate email
    const emailError = validateEmail(settings.contactEmail);
    if (emailError) {
      return { success: false, error: emailError };
    }

    // Validate required fields when website is enabled
    if (settings.websiteEnabled) {
      if (!settings.websiteTitle?.trim()) {
        return {
          success: false,
          error: 'Website-Titel ist erforderlich wenn die Website aktiviert ist',
        };
      }
    }

    // Update tenant in database
    await db.tenant.update({
      where: { id: tenant.id },
      data: {
        websiteEnabled: settings.websiteEnabled,
        websiteTitle: settings.websiteTitle || null,
        websiteLogo: settings.websiteLogo || null,
        heroImage: settings.heroImage || null,
        heroText: settings.heroText || null,
        aboutText: settings.aboutText || null,
        contactEmail: settings.contactEmail || null,
        contactPhone: settings.contactPhone || null,
        contactAddress: settings.contactAddress || null,
        socialFacebook: settings.socialFacebook || null,
        socialInstagram: settings.socialInstagram || null,
        socialLinkedin: settings.socialLinkedin || null,
      },
    });

    // Revalidate caches
    revalidateTag('tenant');
    revalidatePath('/website');
    revalidatePath(`/public/${tenant.slug}/${tenant.clubNumber}`);

    return { success: true };
  } catch (error) {
    console.error('Error saving website settings:', error);
    return {
      success: false,
      error: 'Fehler beim Speichern der Einstellungen. Bitte versuchen Sie es erneut.',
    };
  }
}
