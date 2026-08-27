import { type cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

type CookieStore = Awaited<ReturnType<typeof cookies>>

/**
 * The current app user, resolved from the verified JWT + our `users` row.
 * `role` is OUR application role ('user' | 'seller' | 'admin') — note this is
 * NOT the `role` claim in the JWT (that's the Postgres role, always
 * 'authenticated'), which is why it has to come from the DB.
 */
export interface SessionUser {
  id: string
  email: string | null
  role: string
}

/**
 * Returns the authenticated user's id (the JWT `sub` claim, which mirrors
 * `users.id`), or `null` when there is no valid session.
 *
 * Uses `getClaims()` — it verifies the JWT signature locally via the WebCrypto
 * API with a cached JWKS, so there's no network round-trip to the Auth server.
 * This is the method Supabase recommends for auth checks (see docs/auth.md);
 * `getUser()` would add a network call on every request, and `getSession()`
 * must never be used for authorization because it doesn't re-validate the token.
 */
export async function getSessionUserId(cookieStore: CookieStore): Promise<string | null> {
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase.auth.getClaims()

  if (error) {
    logger.warn({ err: error.message }, 'auth.service: getClaims failed')
    return null
  }

  return data?.claims?.sub ?? null
}

/**
 * Resolves the full app user (including our `role` column) for the current
 * session. Returns `null` if there is no valid session, or if the JWT is valid
 * but no matching `users` row exists (e.g. the row was deleted).
 *
 * Identity is established from the verified JWT via {@link getSessionUserId};
 * only the `role` is read from the DB, since it isn't carried in the token.
 */
export async function getSessionUser(cookieStore: CookieStore): Promise<SessionUser | null> {
  const userId = await getSessionUserId(cookieStore)
  if (!userId) return null

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true },
  })

  if (!dbUser) {
    // Token verified but the user row is gone — treat as unauthenticated.
    logger.warn({ userId }, 'auth.service: valid session but no matching users row')
    return null
  }

  return dbUser
}

/**
 * Ensures a `users` row exists for the current session, creating it from the
 * verified JWT claims when it's missing — e.g. the `auth.users` -> `public.users`
 * trigger never fired for this account (seen with accounts that predate the
 * trigger, or a one-off hiccup). Without this, a perfectly valid Supabase
 * session can get permanently bounced out of protected pages because the DB
 * side never caught up. Uses `upsert` so concurrent calls (e.g. a page
 * re-fetch right after navigation) can't race into a duplicate-key error.
 */
export async function ensureUserRow(cookieStore: CookieStore): Promise<{ id: string } | null> {
  const supabase = createClient(cookieStore)
  const { data, error } = await supabase.auth.getClaims()

  if (error) {
    logger.warn({ err: error.message }, 'auth.service: getClaims failed')
    return null
  }

  const claims = data?.claims
  if (!claims?.sub || !claims.email) return null

  const fullName =
    (claims.user_metadata as { full_name?: string } | undefined)?.full_name ??
    claims.email.split('@')[0]

  await prisma.user.upsert({
    where: { id: claims.sub },
    update: {},
    create: { id: claims.sub, email: claims.email, fullName },
  })

  return { id: claims.sub }
}
