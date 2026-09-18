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
import { forgotPassword, resetPassword, verifyPasswordResetOtp } from '@/actions/auth.actions'
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

// ─── Step 1: email (Figma Screenshots 1-5) ──────────────────────────────
function EmailStep({ onSent, onSignIn }: { onSent: (email: string) => void; onSignIn: () => void }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) {
      onSignIn()
      return
    }
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

  const isEmailEntered = email.trim().length > 0

  const emailInputClass = error
    ? 'h-[44px] w-full rounded-lg border border-[#DC2626] bg-[rgba(255,206,203,0.5)] px-3 text-sm text-[#111111] outline-none font-[family-name:var(--font-public-sans)]'
    : isEmailEntered
      ? 'h-[44px] w-full rounded-lg border border-[#C9C9C9] bg-white px-3 text-sm text-[#111111] outline-none transition-colors focus:border-[#2563EB] font-[family-name:var(--font-public-sans)] placeholder:text-[#A0A0A0]'
      : 'h-[44px] w-full rounded-lg border border-[#ECECEC] bg-white px-3 text-sm text-[#111111] outline-none transition-colors focus:border-[#2563EB] font-[family-name:var(--font-public-sans)] placeholder:text-[#A0A0A0]'

  return (
    <div className={`flex flex-col font-[family-name:var(--font-public-sans)] ${isEmailEntered ? 'gap-8 md:gap-6 md:my-auto' : 'gap-8 md:gap-4'}`}>
      {/* Top Back Button (Desktop only) */}
      <button
        type="button"
        onClick={onSignIn}
        className="hidden md:flex items-center gap-2 text-[14px] leading-[20px] font-semibold text-[#616161] transition-colors hover:text-[#181818] self-start"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        <span>Back</span>
      </button>

      {/* Top Password Reset Illustration Banner (Figma Image 2: 407×180, 9px radius) */}
      {!isEmailEntered && (
        <div className="relative h-[180px] w-full overflow-hidden rounded-[9px]">
          <Image
            src="/password-reset/Frame 1272629799.png"
            alt="Password Reset Illustration"
            fill
            priority
            className="object-cover"
          />
        </div>
      )}

      {/* Copy (Figma Image 2: 407×52px, 4px gap) */}
      <div className="flex flex-col gap-1">
        <h1 className="text-[24px] font-semibold leading-[32px] tracking-normal text-[#111111]">
          Forgot Password
        </h1>
        <p className="text-[12px] font-normal leading-[16px] tracking-normal text-[#616161]">
          Enter email to verify and create new password
        </p>
      </div>

      <form onSubmit={handleSubmit} className={`flex flex-col ${isEmailEntered ? 'gap-8' : 'gap-8 md:gap-4'}`}>
        {/* Input Field (Figma Image 4: 407×44px, #C9C9C9 border when entered, 8px radius) */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="forgot-email" className="text-sm font-medium text-[#444444]">
            Email
          </label>
          <input
            id="forgot-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-invalid={!!error}
            className={emailInputClass}
          />
          {error && <p className="text-xs font-medium text-[#DC2626]">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] text-sm font-semibold text-white tracking-normal transition-all hover:bg-[#1d4fd7] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <Spinner />}
          <span className="md:hidden">{loading ? 'Sending…' : 'Continue'}</span>
          <span className="hidden md:inline">{loading ? 'Sending…' : isEmailEntered ? 'Continue' : 'Send verification code'}</span>
        </button>
      </form>

      {/* Desktop Footer */}
      {!isEmailEntered && (
        <p className="hidden md:block text-center text-sm text-[#2B2B2B]">
          Remember your password?{' '}
          <button type="button" onClick={onSignIn} className="font-semibold text-[#2563EB] transition-colors hover:text-[#1d4fd7]">
            Sign in
          </button>
        </p>
      )}
    </div>
  )
}

// ─── Step 2: OTP verification (Figma Screenshots 1-5 — 8-digit OTP) ──────────────────────
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
  const [failedAttempts, setFailedAttempts] = useState(0)
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
      const newCount = failedAttempts + 1
      setFailedAttempts(newCount)
      if (newCount >= 3) {
        setError('Too many incorrect attempts. Please request a new verification code.')
      } else {
        setError('The verification code is incorrect. Please try again.')
      }
      return
    }
    setLoading(true)
    setError('')
    const res = await verifyPasswordResetOtp(email, code, '')
    if (res?.error) {
      const newCount = failedAttempts + 1
      setFailedAttempts(newCount)
      if (newCount >= 3 || res.error.toLowerCase().includes('attempt') || res.error.toLowerCase().includes('many')) {
        setError('Too many incorrect attempts. Please request a new verification code.')
      } else {
        setError('The verification code is incorrect. Please try again.')
      }
      setLoading(false)
      return
    }
    setLoading(false)
    onVerified(code)
  }

  async function handleResend() {
    setLoading(true)
    const res = await forgotPassword(email)
    if (res?.error) {
      setError(res.error)
    } else {
      setDigits(['', '', '', '', '', '', '', ''])
      setError('')
      setFailedAttempts(0)
    }
    setSeconds(46)
    setLoading(false)
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  const isFilled = digits.every(d => d !== '')

  return (
    <div className="flex flex-col gap-4 font-[family-name:var(--font-public-sans)]">
      {/* Top Back Button (Figma: ← Back, 8px gap, 14px 600 #616161) */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-[14px] leading-[20px] font-semibold text-[#616161] transition-colors hover:text-[#181818] self-start"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        <span>Back</span>
      </button>

      {/* Title & Email Display Row */}
      <div className="flex flex-col gap-1">
        <h1 className="text-[24px] font-semibold leading-[32px] text-[#111111]">
          Check your inbox
        </h1>
        <p className="text-[12px] leading-[16px] text-[#616161]">
          We sent an 8 digit code to
        </p>

        <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-[#111111]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#2563EB">
            <path d="M1.5 4.5a2.5 2.5 0 0 1 2.5-2.5h16a2.5 2.5 0 0 1 2.5 2.5v15a2.5 2.5 0 0 1-2.5 2.5h-16a2.5 2.5 0 0 1-2.5-2.5v-15zm3.172.5l7.328 6.107L19.328 5H4.672zM21 6.57l-7.79 6.492a1.875 1.875 0 0 1-2.42 0L3 6.57V19.5c0 .552.448 1 1 1h16c.552 0 1-.448 1-1V6.57z" />
          </svg>
          <span className="font-semibold text-sm text-[#111111]">{email}</span>
          <button
            type="button"
            onClick={onBack}
            title="Edit email"
            className="ml-1 flex items-center justify-center text-[#616161] transition-colors hover:text-[#2563EB]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </button>
        </div>
      </div>

      {/* 8-Digit OTP Input Boxes (348px width, 38x44px boxes, #E0E0E0 border, 6px gap) */}
      <div className="flex flex-col gap-2 w-full max-w-[348px]">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#616161]">
          ENTER 8 DIGIT CODE
        </span>

        <div className="flex items-center justify-between gap-1.5" onPaste={onPaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={el => { refs.current[i] = el }}
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => setDigit(i, e.target.value)}
              onKeyDown={e => onKeyDown(i, e)}
              className={`h-[44px] w-[38px] rounded-lg border text-center text-lg font-semibold outline-none transition-all ${
                error
                  ? 'border-[#DC2626] bg-[rgba(255,206,203,0.3)] text-[#DC2626]'
                  : 'border-[#E0E0E0] bg-white text-[#111111] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Error / Timer & Resend Link Row */}
      <div className="flex items-start justify-between text-xs w-full max-w-[348px] gap-2">
        {error ? (
          <p className="text-[11px] font-medium leading-4 text-[#DC2626] flex-1">
            {error}
          </p>
        ) : (
          <span className="text-[#616161]">
            Code expires in <span className="font-semibold text-[#2563EB]">{mm}:{ss}</span>
          </span>
        )}

        <button
          type="button"
          onClick={handleResend}
          disabled={seconds > 0 && !error}
          className="font-semibold text-[#2563EB] transition-colors hover:underline disabled:text-[#A0A0A0] disabled:no-underline whitespace-nowrap"
        >
          Resend code
        </button>
      </div>

      {/* Verify Button */}
      <button
        type="button"
        onClick={handleVerify}
        disabled={loading || !isFilled || error.includes('Too many')}
        className={`flex h-[44px] w-full max-w-[348px] items-center justify-center gap-2 rounded-xl text-sm font-semibold tracking-normal transition-all font-[family-name:var(--font-public-sans)] ${
          !isFilled || error.includes('Too many')
            ? 'border border-[#DDDDDD] bg-[#F1F5F9] text-[#A0A0A0] cursor-not-allowed'
            : 'border border-transparent bg-[#2563EB] text-white hover:bg-[#1d4fd7] active:scale-[0.99]'
        } disabled:cursor-not-allowed`}
      >
        {loading && <Spinner />}
        {loading ? 'Verifying…' : 'Verify'}
      </button>
    </div>
  )
}

// ─── Step 3: Create new password (Figma Screenshots 1 & 2) ───────────────────
const newPasswordFormSchema = z.object({
  password: z
    .string()
    .min(8, 'Use 8+ characters and one number.')
    .max(128, 'Password is too long.')
    .regex(/[0-9]/, 'Use 8+ characters and one number.'),
  confirmPassword: z.string().min(1, 'Please confirm your password.'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match. Please re-enter them.',
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
  const isMismatch = confirmValue.length > 0 && passwordValue !== confirmValue

  async function onSubmit(values: NewPasswordFormInput) {
    setServerError('')
    const res = await resetPassword(values.password)
    if (res?.error) {
      setServerError(res.error)
      return
    }
    onSuccess()
  }

  const passwordWrap = (errors.password || isMismatch)
    ? 'flex h-12 items-center gap-2 rounded-lg border border-[#DC2626] bg-[rgba(255,206,203,0.5)] px-3'
    : 'flex h-12 items-center gap-2 rounded-lg border border-[#ECECEC] bg-white px-3 transition-colors focus-within:border-[#2563EB]'

  const confirmWrap = (errors.confirmPassword || isMismatch)
    ? 'flex h-12 items-center gap-2 rounded-lg border border-[#DC2626] bg-[rgba(255,206,203,0.5)] px-3'
    : passwordsMatch
      ? 'flex h-12 items-center gap-2 rounded-lg border border-[#ECECEC] bg-white px-3 transition-colors'
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
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.88 9.88a3 3 0 0 0 4.24 4.24" />
            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
            <path d="M6.61 6.61A13.5 13.5 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
            <line x1="2" y1="2" x2="22" y2="22" />
          </svg>
        )}
      </button>
    )
  }

  return (
    <div className="flex h-full flex-1 flex-col gap-4 font-[family-name:var(--font-public-sans)]">
      {/* Top Back Button (Figma: ← Back, 8px gap, 14px 600 #616161) */}
      <button
        type="button"
        onClick={() => open('sign-in')}
        className="flex items-center gap-2 text-[14px] leading-[20px] font-semibold text-[#616161] transition-colors hover:text-[#181818] self-start"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        <span>Back</span>
      </button>

      {/* Heading Block (Figma: Heading/H3 24px/32px SemiBold #111111) */}
      <div className="flex flex-col gap-1">
        <h1 className="text-[24px] font-semibold leading-[32px] text-[#111111]">Create new password</h1>
        <p className="text-[12px] font-normal leading-[16px] text-[#616161]">
          Almost there! set a new password to get back into your account
        </p>
      </div>

      {/* Separator Line between heading block and input fields */}
      <hr className="w-full border-t border-[#DDDDDD]" />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex h-full flex-1 flex-col gap-4">
        {/* Enter password */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="reset-new-password" className="text-sm font-medium text-[#444444]">Enter password</label>
          <div className={passwordWrap}>
            <input
              id="reset-new-password"
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              placeholder="Enter new password"
              aria-invalid={!!errors.password || isMismatch}
              className="min-w-0 flex-1 bg-transparent text-sm text-[#181818] outline-none placeholder:text-[#A0A0A0]"
            />
            <EyeToggle show={showPassword} onToggle={() => setShowPassword(v => !v)} hasError={!!errors.password || isMismatch} />
          </div>
        </div>

        {/* Re-enter password */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="reset-confirm-password" className="text-sm font-medium text-[#444444]">Re-enter password</label>
          <div className={confirmWrap}>
            <input
              id="reset-confirm-password"
              type={showConfirm ? 'text' : 'password'}
              {...register('confirmPassword')}
              placeholder="Re-enter password"
              aria-invalid={!!errors.confirmPassword || isMismatch}
              className="min-w-0 flex-1 bg-transparent text-sm text-[#181818] outline-none placeholder:text-[#A0A0A0]"
            />
            <EyeToggle show={showConfirm} onToggle={() => setShowConfirm(v => !v)} hasError={!!errors.confirmPassword || isMismatch} />
          </div>

          {/* Feedback messages (Figma SS 1 & 2) */}
          {isMismatch ? (
            <p className="text-xs font-medium text-[#DC2626]">Passwords do not match. Please re-enter them.</p>
          ) : passwordsMatch ? (
            <p className="text-xs font-medium text-[#16A34A]">Passwords match</p>
          ) : errors.password ? (
            <p className="text-xs font-medium text-[#DC2626]">{errors.password.message}</p>
          ) : (
            <p className="text-xs text-[#616161]">Use 8+ characters and one number</p>
          )}
        </div>

        {serverError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
            {serverError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-auto flex h-[44px] items-center justify-center gap-2 rounded-xl bg-[#2563EB] text-sm font-semibold text-white transition-all hover:bg-[#1d4fd7] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && <Spinner />}
          {isSubmitting ? 'Saving…' : 'Save password'}
        </button>
      </form>
    </div>
  )
}

// ─── Step 4: Password updated success (Figma Screenshot 3) ───────────────
function SuccessStep({ onBackToLogin }: { onBackToLogin: () => void }) {
  return (
    <div className="flex flex-col items-center gap-6 font-[family-name:var(--font-public-sans)]">
      {/* Top Reset illustration banner (Figma SS 3) */}
      <div className="relative h-[180px] w-full overflow-hidden rounded-[9px]">
        <Image
          src="/password-reset/reset.png"
          alt="Password updated illustration"
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* Copy */}
      <div className="flex flex-col gap-1 w-full text-left">
        <h1 className="text-2xl font-semibold leading-8 text-[#181818]">Password Updated</h1>
        <p className="text-xs leading-4 text-[#616161]">
          Your new password is set. Sign in to get back into your account.
        </p>
      </div>

      {/* Back to login button */}
      <button
        type="button"
        onClick={onBackToLogin}
        className="flex h-[44px] w-full items-center justify-center rounded-xl bg-[#2563EB] text-sm font-semibold text-white transition-all hover:bg-[#1d4fd7] active:scale-[0.99]"
      >
        Back to login
      </button>
    </div>
  )
}
