import { getCurrentTenant } from '@/lib/tenant';
import { WebsiteEditorForm } from './website-editor-form';
import type { WebsiteSettings } from './actions';

export default async function WebsiteEditorPage() {
  const tenant = await getCurrentTenant();

  const initialSettings: WebsiteSettings = {
    websiteEnabled: tenant.websiteEnabled,
    websiteTitle: tenant.websiteTitle || '',
    websiteLogo: tenant.websiteLogo || '',
    heroImage: tenant.heroImage || '',
    heroText: tenant.heroText || '',
    aboutText: tenant.aboutText || '',
    contactEmail: tenant.contactEmail || '',
    contactPhone: tenant.contactPhone || '',
    contactAddress: tenant.contactAddress || '',
    socialFacebook: tenant.socialFacebook || '',
    socialInstagram: tenant.socialInstagram || '',
    socialLinkedin: tenant.socialLinkedin || '',
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Website-Einstellungen</h1>
        <p className="text-gray-600 mt-2">
          Verwalten Sie die öffentliche Website Ihres Lions Clubs.
        </p>
      </div>

      {/* Editor Form */}
      <WebsiteEditorForm
        initialSettings={initialSettings}
        tenantSlug={tenant.slug}
        clubNumber={tenant.clubNumber}
      />
    </div>
  );
}
