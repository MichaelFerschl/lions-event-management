import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { clerkMiddleware } from '@clerk/nextjs/server';

// Check if Clerk is configured
const isClerkConfigured =
  process.env.CLERK_SECRET_KEY &&
  process.env.CLERK_SECRET_KEY !== 'sk_test_placeholder' &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'pk_test_placeholder';

/**
 * Parse subdomain to extract slug and clubNumber
 * Format: {slug}-{clubNumber} (e.g., "lauf-123456")
 * Split at the LAST hyphen to support slugs with hyphens (e.g., "lions-lauf-123456")
 */
function parsePublicSubdomain(
  subdomain: string
): { slug: string; clubNumber: string } | null {
  const lastHyphenIndex = subdomain.lastIndexOf('-');
  if (lastHyphenIndex === -1) {
    return null;
  }

  const slug = subdomain.substring(0, lastHyphenIndex);
  const clubNumber = subdomain.substring(lastHyphenIndex + 1);

  // Validate: slug must not be empty, clubNumber must be numeric
  if (!slug || !clubNumber || !/^\d+$/.test(clubNumber)) {
    return null;
  }

  return { slug, clubNumber };
}

/**
 * Extract subdomain from hostname
 * Returns null for localhost, app subdomain, or root domain
 */
function getSubdomain(host: string): string | null {
  // Handle localhost and development
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    return null;
  }

  const parts = host.split('.');

  // Need at least 3 parts for subdomain (e.g., lauf-123456.lions-hub.de)
  if (parts.length < 3) {
    return null;
  }

  const subdomain = parts[0];

  // "app" subdomain is reserved for the main application
  if (subdomain === 'app' || subdomain === 'www') {
    return null;
  }

  return subdomain;
}

function handleRequest(request: NextRequest): NextResponse {
  const { nextUrl, headers } = request;
  const host = headers.get('host') || 'localhost:3000';

  // Check for public club website subdomain
  const subdomain = getSubdomain(host);

  if (subdomain) {
    const parsed = parsePublicSubdomain(subdomain);

    if (parsed) {
      // Rewrite to /public/[slug]/[clubNumber]/...
      const { slug, clubNumber } = parsed;
      const pathname = nextUrl.pathname;

      // Build the new URL
      const newPathname = `/public/${slug}/${clubNumber}${pathname === '/' ? '' : pathname}`;

      const url = nextUrl.clone();
      url.pathname = newPathname;

      // Rewrite the request (internal redirect, URL stays the same for user)
      const response = NextResponse.rewrite(url);
      response.headers.set('x-tenant-slug', slug);
      response.headers.set('x-club-number', clubNumber);
      response.headers.set('x-is-public-site', 'true');

      return response;
    }
  }

  // Standard app routing (app.lions-hub.de or localhost)
  // Get tenant from query parameter for development
  let tenantSlug = nextUrl.searchParams.get('tenant') || 'lauf'; // Default to 'lauf' for dev

  // Get locale from cookie, header, or default
  const acceptLanguage = headers.get('accept-language') || '';
  const locale = acceptLanguage.startsWith('en') ? 'en' : 'de';

  // Clone the response and set headers for downstream use
  const response = NextResponse.next();
  response.headers.set('x-tenant-slug', tenantSlug);
  response.headers.set('x-locale', locale);
  response.headers.set('x-is-public-site', 'false');

  return response;
}

// Export middleware - use Clerk if configured, otherwise just handle tenant/locale
export default isClerkConfigured
  ? clerkMiddleware((_auth, request) => {
      return handleRequest(request);
    })
  : function middleware(request: NextRequest) {
      return handleRequest(request);
    };

export const config = {
  matcher: [
    // Skip static files and internal Next.js routes
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
