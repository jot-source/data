import { NextResponse, type NextRequest } from 'next/server'

const PRIMARY_PRODUCTION_HOST = 'macgence-jot-8685.vercel.app'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''
  const { pathname, searchParams } = request.nextUrl
  const code = searchParams.get('code')

  // Case 1: An auth code was received via redirect (OAuth or email confirmation)
  // but landed on root '/' or another non-callback path, or landed on a secondary/preview domain
  if (code && pathname !== '/auth/callback') {
    const targetOrigin = host.includes('localhost')
      ? request.nextUrl.origin
      : `https://${PRIMARY_PRODUCTION_HOST}`

    return NextResponse.redirect(`${targetOrigin}/auth/callback?code=${encodeURIComponent(code)}`)
  }

  // Case 2: User landed on an old/preview Vercel deployment URL (like data-3yz6-...)
  if (host.includes('data-3yz6') && !host.includes('localhost')) {
    const url = request.nextUrl.clone()
    url.host = PRIMARY_PRODUCTION_HOST
    url.protocol = 'https:'
    url.port = ''
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes
     * - _next/static (static assets)
     * - _next/image (image optimization files)
     * - favicon.ico and static file extensions
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?|ico)$).*)',
  ],
}
