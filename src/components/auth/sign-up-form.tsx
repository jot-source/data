// components/auth/sign-up-form.tsx
// Three-step sign-up, rendered inside the shared light auth card:
//   1. credentials → 2. email OTP verification → 3. (skippable) profile setup
'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signUp, syncSignupName, updateProfile, checkEmailExists } from '@/actions/auth.actions'
import { signUpSchema, profileSchema, type SignUpInput, type ProfileInput } from '@/validations/auth.schema'
import { createClient } from '@/lib/supabase/client'
import { useAuthModal } from '@/stores/auth-modal.store'

type Step = 'credentials' | 'otp' | 'profile'

const fieldBase =
  'h-12 rounded-lg border px-3 text-sm text-[#111111] outline-none transition-colors placeholder:text-[#A0A0A0]'

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
      <path fill="#EA4335" d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.97.5 12 .5A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 6.68 9.14 4.75 12 4.75z" />
    </svg>
  )
}

export function SignUpForm() {
  const { open, close } = useAuthModal()
  const router = useRouter()
  const [step, setStep] = useState<Step>('credentials')
  const [email, setEmail] = useState('')

  if (step === 'otp') {
    return <OtpStep email={email} onVerified={() => setStep('profile')} onBack={() => setStep('credentials')} />
  }
  if (step === 'profile') {
    return <ProfileStep onDone={() => { close(); router.refresh() }} />
  }
  return (
    <CredentialsStep
      onSignUp={value => { setEmail(value); setStep('otp') }}
      onLogin={() => open('sign-in')}
    />
  )
}

// ─── Step 1: credentials ──────────────────────────────────────────────
function CredentialsStep({ onSignUp, onLogin }: { onSignUp: (email: string) => void; onLogin: () => void }) {
  const [showPassword, setShowPassword] = useState(false)
  const [emailTaken, setEmailTaken] = useState(false)
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({ resolver: zodResolver(signUpSchema) })

  const emailValue = watch('email') || ''
  const passwordValue = watch('password') || ''
  const passwordStrong = passwordValue.length >= 8 && /[0-9]/.test(passwordValue)

  // Debounced email-exists check (500ms). UX pre-check only — the signUp
  // action's identities-length guard is still the authoritative duplicate check.
  useEffect(() => {
    // Only check when the email looks valid (basic sanity: has @ and a dot).
    const trimmed = emailValue.trim().toLowerCase()
    if (!trimmed || !trimmed.includes('@') || !trimmed.includes('.')) {
      setEmailTaken(false)
      return
    }

    const timer = setTimeout(async () => {
      try {
        const res = await checkEmailExists(trimmed)
        setEmailTaken(res.exists)
      } catch {
        // Network failure — don't block signup, just clear the flag.
        setEmailTaken(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [emailValue])

  async function onSubmit(values: SignUpInput) {
    try {
      const res = await signUp(values.email, values.password)
      if (res?.error) {
        // If the server says this email is already registered, surface it
        // via the inline emailTaken hint (under the email field) instead of
        // showing a second root-level error banner.
        if (res.error.toLowerCase().includes('already exists')) {
          setEmailTaken(true)
          return
        }
        setError('root', { message: res.error })
        return
      }
      onSignUp(values.email)
    } catch {
      setError('root', { message: 'Something went wrong. Please try again.' })
    }
  }

  async function handleGoogle() {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) setError('root', { message: error.message })
  }

  const emailClass = (errors.email || emailTaken)
    ? `${fieldBase} border-[#DC2626] bg-[rgba(255,206,203,0.5)]`
    : `${fieldBase} border-[#ECECEC] bg-white focus:border-[#2563EB]`
  const passwordWrap = errors.password
    ? 'flex h-12 items-center gap-2 rounded-lg border border-[#DC2626] bg-[rgba(255,206,203,0.5)] px-3'
    : 'flex h-12 items-center gap-2 rounded-lg border border-[#ECECEC] bg-white px-3 transition-colors focus-within:border-[#2563EB]'

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold leading-8 text-[#111111]">Create account</h1>
        <p className="text-xs leading-4 text-[#616161]">Access datasets, samples, and downloads.</p>
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        className="flex h-12 items-center justify-center gap-2 rounded-lg border border-[#DDDDDD] bg-white px-8 text-sm font-medium text-[#181818] transition-colors hover:bg-[#fafafa]"
      >
        <GoogleIcon />
        Signup with Google
      </button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[#DDDDDD]" />
        <span className="text-xs text-[#8C8C8C]">Or Signup with email</span>
        <div className="h-px flex-1 bg-[#DDDDDD]" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="signup-email" className="text-sm font-medium text-[#444444]">Email</label>
          <input
            id="signup-email"
            type="email"
            {...register('email')}
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            className={emailClass}
          />
          {errors.email && <p className="text-xs font-medium text-[#DC2626]">{errors.email.message}</p>}
          {!errors.email && emailTaken && (
            <p className="text-xs font-medium text-[#DC2626]">
              An account with this email already exists.{' '}
              <button
                type="button"
                onClick={onLogin}
                className="font-medium text-[#2563EB] hover:underline"
              >
                Login instead
              </button>
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="signup-password" className="text-sm font-medium text-[#444444]">Password</label>
          <div className={passwordWrap}>
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              placeholder="Create a password"
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
          {/* Helper / strength line */}
          {errors.password ? (
            <p className="text-xs font-medium text-[#DC2626]">{errors.password.message}</p>
          ) : passwordValue && passwordStrong ? (
            <p className="text-xs text-[#16A34A]">Your password is strong.</p>
          ) : (
            <p className="text-xs text-[#616161]">Use 8+ characters and one number</p>
          )}
        </div>

        {errors.root && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
            {errors.root.message}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || emailTaken}
          className="flex h-12 items-center justify-center gap-2 rounded-lg bg-[#2563EB] text-base font-semibold text-white transition-all hover:bg-[#1d4fd7] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && <Spinner />}
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-sm text-[#2B2B2B]">
        Already have an account?{' '}
        <button type="button" onClick={onLogin} className="font-medium text-[#2563EB] transition-colors hover:text-[#1d4fd7]">
          Login
        </button>
      </p>

      <p className="text-center text-xs text-[#8C8C8C]">
        By continuing you agreed to{' '}
        <a href="/terms" className="text-[#2563EB] hover:underline">Terms of service</a> and{' '}
        <a href="/privacy" className="text-[#2563EB] hover:underline">privacy policy</a>
      </p>
    </div>
  )
}

// ─── Step 2: email OTP ────────────────────────────────────────────────
function OtpStep({ email, onVerified, onBack }: { email: string; onVerified: () => void; onBack: () => void }) {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [seconds, setSeconds] = useState(46)
  const refs = useRef<(HTMLInputElement | null)[]>([])
  // Browser client per mount — verifying the OTP through it (not a server
  // action) establishes the session client-side, so the navbar flips to logged
  // in the instant the code is confirmed.
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    if (seconds <= 0) return
    const t = setTimeout(() => setSeconds(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [seconds])

  function setDigit(i: number, val: string) {
    const d = val.replace(/\D/g, '').slice(-1)
    setError('')
    setDigits(prev => {
      const next = [...prev]
      next[i] = d
      return next
    })
    if (d && i < 7) refs.current[i + 1]?.focus()
  }

  function onKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus()
  }

  function onPaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 8)
    if (!text) return
    e.preventDefault()
    const next = ['', '', '', '', '', '', '', '']
    text.split('').forEach((c, idx) => { next[idx] = c })
    setDigits(next)
    refs.current[Math.min(text.length, 7)]?.focus()
  }

  async function handleConfirm() {
    const code = digits.join('')
    if (code.length < 8) {
      setError('Enter the 8-digit code from your email.')
      return
    }
    setLoading(true)
    try {
      // Verify on the browser client — this establishes the session locally, so
      // the header updates immediately (onAuthStateChange) rather than after a
      // server round-trip.
      const { error: verifyError } = await supabase.auth.verifyOtp({ email, token: code, type: 'signup' })
      if (verifyError) {
        setError(verifyError.message)
        setLoading(false)
        return
      }
      // Best-effort: seed full_name from the email prefix for users who skip the
      // profile step. The cookie the browser client just set is sent along.
      await syncSignupName()
      onVerified()
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  async function handleResend() {
    if (seconds > 0) return
    try {
      const { error: resendError } = await supabase.auth.resend({ type: 'signup', email })
      if (resendError) {
        setError(resendError.message || 'Could not resend code. Please try again.')
        return
      }
      setDigits(['', '', '', '', '', '', '', ''])
      setError('')
      setSeconds(46)
    } catch {
      setError('Could not resend code. Please try again.')
    }
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold leading-8 text-[#111111]">Check your inbox</h1>
        <p className="text-xs leading-4 text-[#616161]">We sent an 8 digit code to</p>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-medium text-[#111111] hover:text-[#2563EB]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
          {email}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-[#444444]">Enter 8 digit code</span>
        <div className="flex gap-2" onPaste={onPaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={el => { refs.current[i] = el }}
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => setDigit(i, e.target.value)}
              onKeyDown={e => onKeyDown(i, e)}
              className={`h-10 w-10 rounded-lg border text-center text-base font-semibold text-[#111111] outline-none transition-colors ${error ? 'border-[#DC2626] bg-[rgba(255,206,203,0.5)]' : 'border-[#ECECEC] bg-white focus:border-[#2563EB]'
                }`}
            />
          ))}
        </div>
        {error && <p className="text-xs font-medium text-[#DC2626]">{error}</p>}
      </div>

      <p className="text-xs text-[#8C8C8C]">
        Didn&apos;t receive code? Resend in{' '}
        <span className="text-[#2563EB]">{mm}:{ss}</span>{'   '}
        <button
          type="button"
          onClick={handleResend}
          disabled={seconds > 0}
          className="font-medium text-[#2563EB] disabled:text-[#A0A0A0] disabled:no-underline hover:underline"
        >
          Resend code
        </button>
      </p>

      <button
        type="button"
        onClick={handleConfirm}
        disabled={loading}
        className="flex h-12 items-center justify-center gap-2 rounded-lg bg-[#2563EB] text-base font-semibold text-white transition-all hover:bg-[#1d4fd7] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading && <Spinner />}
        {loading ? 'Confirming…' : 'Confirm'}
      </button>
    </div>
  )
}

// ─── Step 3: profile setup (skippable) ────────────────────────────────
const ROLE_OPTIONS = ['Project Manager', 'Data Scientist', 'ML Engineer', 'Researcher', 'Founder', 'Student', 'Other']

function ProfileStep({ onDone }: { onDone: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ProfileInput>({ resolver: zodResolver(profileSchema) })

  async function onSubmit(values: ProfileInput) {
    await updateProfile(values)
    onDone()
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold leading-8 text-[#111111]">Profile setup</h1>
          <p className="text-xs leading-4 text-[#616161]">Access datasets, samples, and downloads.</p>
        </div>
        <button type="button" onClick={onDone} className="text-sm font-medium text-[#2563EB] hover:underline">
          Skip
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="profile-name" className="text-sm font-medium text-[#444444]">Full Name</label>
          <input
            id="profile-name"
            {...register('fullName')}
            placeholder="E.g. Nitish Reddy"
            className={`${fieldBase} border-[#ECECEC] bg-white focus:border-[#2563EB]`}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="profile-org" className="text-sm font-medium text-[#444444]">Organization / University</label>
          <input
            id="profile-org"
            {...register('organization')}
            placeholder="E.g. Macgence"
            className={`${fieldBase} border-[#ECECEC] bg-white focus:border-[#2563EB]`}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="profile-role" className="text-sm font-medium text-[#444444]">Your Role</label>
          <select
            id="profile-role"
            {...register('jobTitle')}
            defaultValue=""
            className={`${fieldBase} border-[#ECECEC] bg-white focus:border-[#2563EB]`}
          >
            <option value="" disabled>E.g. Project Manager</option>
            {ROLE_OPTIONS.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 flex h-12 items-center justify-center gap-2 rounded-lg bg-[#2563EB] text-base font-semibold text-white transition-all hover:bg-[#1d4fd7] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && <Spinner />}
          {isSubmitting ? 'Saving…' : 'Save & Continue'}
        </button>
      </form>
    </div>
  )
}
