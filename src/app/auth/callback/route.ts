// src/app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    logger.warn('auth/callback: no code received')
    return NextResponse.redirect(`${origin}/`)
  }

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    logger.error({ err: error.message }, 'auth/callback: exchange failed')
    return NextResponse.redirect(`${origin}/`)
  }

  logger.info('auth/callback: session established')
  return NextResponse.redirect(`${origin}/`)
}