import { NextResponse, type NextRequest } from 'next/server'

// TEMPORARY: demo bypass to share app without login.
const DEMO_AUTH_BYPASS = true

// Public routes that don't require authentication
const PUBLIC_PATHS = ['/', '/auth', '/pricing']
const PUBLIC_PREFIXES = ['/api/webhooks', '/_next', '/favicon', '/outputs']

export function middleware(request: NextRequest) {
  if (DEMO_AUTH_BYPASS) {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl

  // Always allow public paths and static assets
  if (
    PUBLIC_PATHS.includes(pathname) ||
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p)) ||
    pathname.match(/\.(ico|svg|png|jpg|jpeg|webp|css|js|woff2?)$/)
  ) {
    return NextResponse.next()
  }

  // Check for Firebase session token in cookie
  const sessionCookie = request.cookies.get('__session')?.value
  const hasSession = !!sessionCookie

  // Protected app routes
  if (pathname.startsWith('/dashboard') ||
      pathname.startsWith('/generate') ||
      pathname.startsWith('/calendar') ||
      pathname.startsWith('/assets') ||
      pathname.startsWith('/settings') ||
      pathname.startsWith('/onboarding')) {
    if (!hasSession) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
