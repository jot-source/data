// proxy.ts (root of project)
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          // Write to the request too, not just the response. Otherwise a
          // token refreshed here is only visible to the browser on the NEXT
          // request — Server Components rendered as part of *this* request
          // still read the stale cookie via cookies() and can fail an auth
          // check immediately after a legitimate refresh just happened.
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getClaims() verifies the JWT locally via WebCrypto (no network call) and,
  // like getUser(), refreshes the session cookie when the token is near expiry —
  // so the cookie-refresh side effect of this middleware is preserved.
  const { data } = await supabase.auth.getClaims()
  const isAuthenticated = !!data?.claims

  const isProtected =
    request.nextUrl.pathname.startsWith('/account') ||
    request.nextUrl.pathname.startsWith('/admin') ||
    request.nextUrl.pathname.startsWith('/profile')

  if (isProtected && !isAuthenticated) {
    const url = request.nextUrl.clone()
    // /profile has no dedicated login route — auth is a modal over the home
    // page, so send unauthenticated visits there instead of a nonexistent /login.
    if (request.nextUrl.pathname.startsWith('/profile')) {
      url.pathname = '/'
    } else {
      url.pathname = '/login'
      url.searchParams.set('next', request.nextUrl.pathname)
    }
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  // Runs on nearly every route (not just the protected ones) so the session
  // cookie gets refreshed proactively as the user browses. Without this, a
  // token can go stale on public pages and then fail the very first
  // protected-route check, with no earlier chance to refresh it.
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}