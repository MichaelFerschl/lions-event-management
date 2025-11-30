import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { clerkMiddleware } from '@clerk/nextjs/server';

// Check if Clerk is configured
const isClerkConfigured =
  process.env.CLERK_SECRET_KEY &&
  process.env.CLERK_SECRET_KEY !== 'sk_test_placeholder' &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'pk_test_placeholder';

function getTenantFromHost(host: string): string | null {
  // For production: lauf.lions-hub.de -> "lauf"
  // For localhost: use query param or header
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    return null; // Will check query/header in the request
  }

  const parts = host.split('.');
  if (parts.length >= 3) {
    return parts[0];
  }
  return null;
}

function handleRequest(request: NextRequest): NextResponse {
  const { nextUrl, headers } = request;
  const host = headers.get('host') || 'localhost:3000';

  // Get tenant from subdomain or query parameter
  let tenantSlug = getTenantFromHost(host);
  if (!tenantSlug) {
    tenantSlug = nextUrl.searchParams.get('tenant') || 'lauf'; // Default to 'lauf' for dev
  }

  // Get locale from cookie, header, or default
  const acceptLanguage = headers.get('accept-language') || '';
  const locale = acceptLanguage.startsWith('en') ? 'en' : 'de';

  // Clone the response and set headers for downstream use
  const response = NextResponse.next();
  response.headers.set('x-tenant-slug', tenantSlug);
  response.headers.set('x-locale', locale);

  return response;
}

// Export middleware - use Clerk if configured, otherwise just handle tenant/locale
export default isClerkConfigured
  ? clerkMiddleware((auth, request) => {
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
