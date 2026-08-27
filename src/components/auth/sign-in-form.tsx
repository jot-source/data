// components/auth/sign-in-form.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signInSchema, type SignInInput } from '@/validations/auth.schema'
import { createClient } from '@/lib/supabase/client'
import { useAuthModal } from '@/stores/auth-modal.store'

export function SignInForm() {
  const { open, close } = useAuthModal()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  // One browser Supabase client per mount (not per render). Signing in through
  // THIS client — not a server action — is what makes login feel instant: it
  // updates the browser session synchronously, so the navbar's
  // onAuthStateChange fires and flips to "My profile" immediately, instead of
  // waiting on a server round-trip to re-render with a fresh `initialUser`.
  const [supabase] = useState(() => createClient())

  // React Hook Form owns all field state + validation. Rules and messages come
  // straight from the shared Zod schema via the resolver — nothing is
  // re-declared here. `root` holds the Google/OAuth error.
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({ resolver: zodResolver(signInSchema) })

  async function onSubmit(values: SignInInput) {
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })
    if (error) {
      // Supabase returns a generic "Invalid login credentials" — surface it
      // under the password field, matching the design.
      setError('password', { message: 'Incorrect password. Please try again.' })
      return
    }
    // Session is live on the browser client already (navbar updates instantly
    // via onAuthStateChange). Close the modal — the user stays on the current
    // route — and refresh so server-rendered bits (e.g. the gated price) update.
    close()
    router.refresh()
  }

  async function handleGoogle() {
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (oauthError) setError('root', { message: oauthError.message })
  }

  // Shared input styling — switches to the error look (rgba(255,206,203,.5)
  // fill + #DC2626 border) from the Figma spec.
  const fieldBase =
    'h-12 rounded-lg border px-3 text-sm text-[#111111] outline-none transition-colors placeholder:text-[#A0A0A0]'
  const emailFieldClass = errors.email
    ? `${fieldBase} border-[#DC2626] bg-[rgba(255,206,203,0.5)]`
    : `${fieldBase} border-[#ECECEC] bg-white focus:border-[#2563EB]`
  const passwordWrapClass = errors.password
    ? 'flex h-12 items-center gap-2 rounded-lg border border-[#DC2626] bg-[rgba(255,206,203,0.5)] px-3'
    : 'flex h-12 items-center gap-2 rounded-lg border border-[#ECECEC] bg-white px-3 transition-colors focus-within:border-[#2563EB]'

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold leading-8 text-[#111111]">Welcome back!</h1>
        <p className="text-xs leading-4 text-[#616161]">Access datasets, samples, and downloads.</p>
      </div>

      {/* Continue with Google */}
      <button
        type="button"
        onClick={handleGoogle}
        className="flex h-12 items-center justify-center gap-2 rounded-lg border border-[#DDDDDD] bg-white px-8 text-sm font-medium text-[#181818] transition-colors hover:bg-[#fafafa]"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
          <path fill="#EA4335" d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.97.5 12 .5A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 6.68 9.14 4.75 12 4.75z" />
        </svg>
        Continue with Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[#DDDDDD]" />
        <span className="text-xs text-[#8C8C8C]">Or login with email</span>
        <div className="h-px flex-1 bg-[#DDDDDD]" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="signin-email" className="text-sm font-medium text-[#444444]">
            Email
          </label>
          <input
            id="signin-email"
            type="email"
            {...register('email')}
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            className={emailFieldClass}
          />
          {errors.email && <p className="text-xs font-medium text-[#DC2626]">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="signin-password" className="text-sm font-medium text-[#444444]">
            Password
          </label>
          <div className={passwordWrapClass}>
            <input
              id="signin-password"
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              placeholder="Enter your password"
              aria-invalid={!!errors.password}
              className="min-w-0 flex-1 bg-transparent text-sm text-[#111111] outline-none placeholder:text-[#A0A0A0]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className={errors.password ? 'text-[#DC2626]' : 'text-[#A0A0A0] transition-colors hover:text-[#444444]'}
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.88 9.88a3 3 0 0 0 4.24 4.24" />
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                  <path d="M6.61 6.61A13.5 13.5 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                  <line x1="2" y1="2" x2="22" y2="22" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && <p className="text-xs font-medium text-[#DC2626]">{errors.password.message}</p>}
        </div>

        {/* Forgot password */}
        <button
          type="button"
          onClick={() => open('forgot-password')}
          className="-mt-1 self-stretch text-right text-sm text-[#2563EB] transition-colors hover:text-[#1d4fd7]"
        >
          Forgot password
        </button>

        {errors.root && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
            {errors.root.message}
          </div>
        )}

        {/* Login */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-12 items-center justify-center gap-2 rounded-lg bg-[#2563EB] text-base font-semibold text-white transition-all hover:bg-[#1d4fd7] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {isSubmitting ? 'Signing in…' : 'Login'}
        </button>

        {/* Footer */}
        <p className="text-center text-sm text-[#2B2B2B]">
          Dont have an account?{' '}
          <button
            type="button"
            onClick={() => open('sign-up')}
            className="font-medium text-[#2563EB] transition-colors hover:text-[#1d4fd7]"
          >
            Create account
          </button>
        </p>
      </form>
    </div>
  )
}
