import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

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

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  // ============================================
  // 1. SUBDOMAIN ROUTING (Public Websites)
  // ============================================
  // Format: {slug}-{clubnummer}.lions-hub.de
  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');
  const isAppSubdomain = hostname.startsWith('app.');
  const isMainDomain = hostname === 'lions-hub.de' || hostname === 'www.lions-hub.de';

  // Wenn es eine Club-Subdomain ist (nicht app., nicht localhost, nicht main)
  if (!isLocalhost && !isAppSubdomain && !isMainDomain && hostname.includes('.')) {
    const subdomain = hostname.split('.')[0];
    const parsed = parsePublicSubdomain(subdomain);

    if (parsed) {
      const { slug, clubNumber } = parsed;
      // Rewrite zu Public Website Route
      const url = request.nextUrl.clone();
      url.pathname = `/public/${slug}/${clubNumber}${pathname === '/' ? '' : pathname}`;

      const response = NextResponse.rewrite(url);
      response.headers.set('x-tenant-slug', slug);
      response.headers.set('x-club-number', clubNumber);
      response.headers.set('x-is-public-site', 'true');
      return response;
    }
  }

  // ============================================
  // 2. SUPABASE AUTH SESSION
  // ============================================
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Session abrufen (wichtig: refresht auch abgelaufene Tokens)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ============================================
  // 3. ROUTE PROTECTION
  // ============================================
  const publicRoutes = [
    '/sign-in',
    '/sign-up',
    '/forgot-password',
    '/reset-password',
    '/auth/callback',
    '/public',
    '/invite',
  ];

  const isPublicRoute =
    publicRoutes.some((route) => pathname.startsWith(route)) || pathname === '/';

  // Nicht eingeloggt und geschützte Route → Redirect zu Sign-In
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/sign-in';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Eingeloggt und auf Auth-Seite → Redirect zu Dashboard
  if (user && (pathname === '/sign-in' || pathname === '/sign-up')) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // ============================================
  // 4. SET TENANT HEADERS FOR APP ROUTES
  // ============================================
  // Get tenant from query parameter for development, default to 'lauf'
  const tenantSlug = request.nextUrl.searchParams.get('tenant') || 'lauf';

  // Get locale: priority is cookie > accept-language header > default 'de'
  const localeCookie = request.cookies.get('locale')?.value;
  const acceptLanguage = request.headers.get('accept-language') || '';
  const browserLocale = acceptLanguage.startsWith('en') ? 'en' : 'de';
  const locale = localeCookie || browserLocale;

  // Set headers for downstream use
  supabaseResponse.headers.set('x-tenant-slug', tenantSlug);
  supabaseResponse.headers.set('x-locale', locale);
  supabaseResponse.headers.set('x-is-public-site', 'false');

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
