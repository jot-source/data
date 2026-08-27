// components/auth/forgot-password-form.tsx
// Three-step OTP password reset (light theme, rendered in the shared auth card):
//   1. Enter email  → Supabase emails a 6-digit recovery code
//   2. Enter OTP code (6-digit boxes, like sign-up OTP)
//   3. Create new password + confirm → verifyOtp() + updateUser(), then close
'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { forgotPassword, verifyPasswordResetOtp } from '@/actions/auth.actions'
import { useAuthModal } from '@/stores/auth-modal.store'
import { z } from 'zod'

import Image from 'next/image'

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

type Step = 'email' | 'otp' | 'new-password' | 'success'

export function ForgotPasswordForm() {
  const { open, close } = useAuthModal()
  const router = useRouter()

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otpToken, setOtpToken] = useState('')

  if (step === 'success') {
    return (
      <SuccessStep onBackToLogin={() => { close(); open('sign-in') }} />
    )
  }
  if (step === 'otp') {
    return (
      <OtpStep
        email={email}
        onVerified={(token) => { setOtpToken(token); setStep('new-password') }}
        onBack={() => setStep('email')}
        onResend={() => setStep('email')}
      />
    )
  }
  if (step === 'new-password') {
    return (
      <NewPasswordStep
        email={email}
        token={otpToken}
        onSuccess={() => { router.refresh(); setStep('success') }}
      />
    )
  }
  return (
    <EmailStep
      onSent={(sentEmail) => { setEmail(sentEmail); setStep('otp') }}
      onSignIn={() => open('sign-in')}
    />
  )
}

// ─── Step 1: email ──────────────────────────────────────────────────────
function EmailStep({ onSent, onSignIn }: { onSent: (email: string) => void; onSignIn: () => void }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await forgotPassword(email)
    if (res?.error) {
      setError(res.error)
      setLoading(false)
      return
    }
    onSent(email)
  }

  const emailClass = error
    ? `${fieldBase} border-[#DC2626] bg-[rgba(255,206,203,0.5)]`
    : `${fieldBase} border-[#ECECEC] bg-white focus:border-[#2563EB]`

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold leading-8 text-[#111111]">Forgot Password</h1>
        <p className="text-xs leading-4 text-[#616161]">Enter email to verify and create new password</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="forgot-email" className="text-sm font-medium text-[#444444]">Email</label>
          <input
            id="forgot-email"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-invalid={!!error}
            className={emailClass}
          />
          {error && <p className="text-xs font-medium text-[#DC2626]">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex h-12 items-center justify-center gap-2 rounded-lg bg-[#2563EB] text-base font-semibold text-white transition-all hover:bg-[#1d4fd7] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <Spinner />}
          {loading ? 'Sending…' : 'Continue'}
        </button>
      </form>

      <p className="text-center text-sm text-[#2B2B2B]">
        Remember your password?{' '}
        <button type="button" onClick={onSignIn} className="font-medium text-[#2563EB] transition-colors hover:text-[#1d4fd7]">
          Sign in
        </button>
      </p>
    </div>
  )
}

// ─── Step 2: OTP verification ───────────────────────────────────────────
function OtpStep({
  email,
  onVerified,
  onBack,
}: {
  email: string
  onVerified: (token: string) => void
  onBack: () => void
  onResend: () => void
}) {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [seconds, setSeconds] = useState(46)
  const refs = useRef<(HTMLInputElement | null)[]>([])

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

  async function handleVerify() {
    const code = digits.join('')
    if (code.length < 8) {
      setError('Enter the 8-digit code from your email.')
      return
    }
    setLoading(true)
    // We just verify the OTP is correct. The actual password update happens
    // in the next step, but we need to pass the token forward. We'll call
    // onVerified with the token so the NewPasswordStep can use it.
    onVerified(code)
  }

  async function handleResend() {
    if (seconds > 0) return
    setLoading(true)
    const res = await forgotPassword(email)
    if (res?.error) {
      setError(res.error)
    } else {
      setDigits(['', '', '', '', '', '', '', ''])
      setError('')
    }
    setSeconds(46)
    setLoading(false)
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
              className={`h-10 w-10 rounded-lg border text-center text-base font-semibold text-[#111111] outline-none transition-colors ${
                error ? 'border-[#DC2626] bg-[rgba(255,206,203,0.5)]' : 'border-[#ECECEC] bg-white focus:border-[#2563EB]'
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
        onClick={handleVerify}
        disabled={loading}
        className="flex h-12 items-center justify-center gap-2 rounded-lg bg-[#2563EB] text-base font-semibold text-white transition-all hover:bg-[#1d4fd7] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading && <Spinner />}
        {loading ? 'Verifying…' : 'Verify'}
      </button>
    </div>
  )
}

// ─── Step 3: Create new password ────────────────────────────────────────
const newPasswordFormSchema = z.object({
  password: z
    .string()
    .min(8, 'Use 8+ characters and one number.')
    .max(128, 'Password is too long.')
    .regex(/[0-9]/, 'Use 8+ characters and one number.'),
  confirmPassword: z.string().min(1, 'Please confirm your password.'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
})

type NewPasswordFormInput = z.infer<typeof newPasswordFormSchema>

function NewPasswordStep({
  email,
  token,
  onSuccess,
}: {
  email: string
  token: string
  onSuccess: () => void
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<NewPasswordFormInput>({
    resolver: zodResolver(newPasswordFormSchema),
  })

  const passwordValue = watch('password') || ''
  const confirmValue = watch('confirmPassword') || ''
  const passwordStrong = passwordValue.length >= 8 && /[0-9]/.test(passwordValue)
  const passwordsMatch = passwordValue && confirmValue && passwordValue === confirmValue

  async function onSubmit(values: NewPasswordFormInput) {
    setServerError('')
    const res = await verifyPasswordResetOtp(email, token, values.password)
    if (res?.error) {
      setServerError(res.error)
      return
    }
    onSuccess()
  }

  const passwordWrap = errors.password
    ? 'flex h-12 items-center gap-2 rounded-lg border border-[#DC2626] bg-[rgba(255,206,203,0.5)] px-3'
    : 'flex h-12 items-center gap-2 rounded-lg border border-[#ECECEC] bg-white px-3 transition-colors focus-within:border-[#2563EB]'

  const confirmWrap = errors.confirmPassword
    ? 'flex h-12 items-center gap-2 rounded-lg border border-[#DC2626] bg-[rgba(255,206,203,0.5)] px-3'
    : passwordsMatch
      ? 'flex h-12 items-center gap-2 rounded-lg border border-[#16A34A] bg-white px-3 transition-colors'
      : 'flex h-12 items-center gap-2 rounded-lg border border-[#ECECEC] bg-white px-3 transition-colors focus-within:border-[#2563EB]'

  function EyeToggle({ show, onToggle, hasError }: { show: boolean; onToggle: () => void; hasError: boolean }) {
    return (
      <button
        type="button"
        onClick={onToggle}
        aria-label={show ? 'Hide password' : 'Show password'}
        className={hasError ? 'text-[#DC2626]' : 'text-[#A0A0A0] transition-colors hover:text-[#444444]'}
      >
        {show ? (
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
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold leading-8 text-[#111111]">Create new password</h1>
        <p className="text-xs leading-4 text-[#616161]">Enter new password through set new password for your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        {/* New Password */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="reset-new-password" className="text-sm font-medium text-[#444444]">New password</label>
          <div className={passwordWrap}>
            <input
              id="reset-new-password"
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              placeholder="Create a password"
              aria-invalid={!!errors.password}
              className="min-w-0 flex-1 bg-transparent text-sm text-[#111111] outline-none placeholder:text-[#A0A0A0]"
            />
            <EyeToggle show={showPassword} onToggle={() => setShowPassword(v => !v)} hasError={!!errors.password} />
          </div>
          {errors.password ? (
            <p className="text-xs font-medium text-[#DC2626]">{errors.password.message}</p>
          ) : passwordValue && passwordStrong ? (
            <p className="text-xs text-[#16A34A]">Your password is strong.</p>
          ) : (
            <p className="text-xs text-[#616161]">Use 8+ characters and one number</p>
          )}
        </div>

        {/* Re-enter Password */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="reset-confirm-password" className="text-sm font-medium text-[#444444]">Re-enter password</label>
          <div className={confirmWrap}>
            <input
              id="reset-confirm-password"
              type={showConfirm ? 'text' : 'password'}
              {...register('confirmPassword')}
              placeholder="Confirm your password"
              aria-invalid={!!errors.confirmPassword}
              className="min-w-0 flex-1 bg-transparent text-sm text-[#111111] outline-none placeholder:text-[#A0A0A0]"
            />
            <EyeToggle show={showConfirm} onToggle={() => setShowConfirm(v => !v)} hasError={!!errors.confirmPassword} />
          </div>
          {errors.confirmPassword ? (
            <p className="text-xs font-medium text-[#DC2626]">{errors.confirmPassword.message}</p>
          ) : passwordsMatch ? (
            <p className="flex items-center gap-1 text-xs text-[#16A34A]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1.2 14.3-3.5-3.5 1.4-1.4 2.1 2.1 4.3-4.3 1.4 1.4-5.7 5.7Z" />
              </svg>
              Passwords matched and matched
            </p>
          ) : null}
        </div>

        {serverError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
            {serverError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-12 items-center justify-center gap-2 rounded-lg bg-[#2563EB] text-base font-semibold text-white transition-all hover:bg-[#1d4fd7] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && <Spinner />}
          {isSubmitting ? 'Saving…' : 'Save password'}
        </button>
      </form>
    </div>
  )
}

// ─── Step 4: Password updated success ───────────────────────────────────
function SuccessStep({ onBackToLogin }: { onBackToLogin: () => void }) {
  return (
    <div className="flex flex-col items-start gap-8">
      {/* Reset illustration */}
      <div className="flex w-full items-center justify-center overflow-hidden rounded-[9px]">
        <Image
          src="/password-reset/reset.png"
          alt="Password updated"
          width={407}
          height={180}
          className="h-[180px] w-full object-cover"
          priority
        />
      </div>

      {/* Copy */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold leading-8 text-[#111111]">Password Updated</h1>
        <p className="text-xs leading-4 text-[#616161]">
          Your new password is set. Sign in to get back into your account.
        </p>
      </div>

      {/* Back to login */}
      <button
        type="button"
        onClick={onBackToLogin}
        className="flex h-12 w-full items-center justify-center rounded-lg bg-[#2563EB] text-base font-semibold text-white transition-all hover:bg-[#1d4fd7] active:scale-[0.99]"
      >
        Back to login
      </button>
    </div>
  )
}
