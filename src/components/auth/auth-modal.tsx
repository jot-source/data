// components/auth/auth-modal.tsx
// Overlay shell that renders the active auth form on top of the current route.
// All three views share the same light split-screen card: the blue AuthSidePanel
// on the left and the active form's content on the right.
// Closing it (Esc / backdrop / success) leaves the user exactly where they were.
'use client'

import { useEffect } from 'react'
import { useAuthModal } from '@/stores/auth-modal.store'
import { AuthSidePanel } from './auth-side-panel'
import { SignInForm } from './sign-in-form'
import { SignUpForm } from './sign-up-form'
import { ForgotPasswordForm } from './forgot-password-form'

export function AuthModal() {
  const { view, close } = useAuthModal()

  // Close on Escape and lock body scroll while open.
  useEffect(() => {
    if (!view) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [view, close])

  if (!view) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto px-4 py-8"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop — solid black at 65% opacity (per design) */}
      <button
        type="button"
        aria-label="Close"
        onClick={close}
        className="absolute inset-0 bg-black/65"
      />

      <div className="relative z-10 w-full max-w-[860px]">
        <button
          type="button"
          aria-label="Close"
          onClick={close}
          className="absolute -top-11 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Card — 860×600, 12px radius, square inner panels clipped by overflow */}
        <div className="overflow-hidden rounded-xl bg-[#F8F8F8] shadow-2xl shadow-black/50">
          <div className="flex min-h-[600px]">
            <AuthSidePanel />
            <div className="flex flex-1 flex-col justify-center bg-[#F8F8F8] px-[60px] py-10 text-[#111111]">
              {view === 'sign-in' && <SignInForm />}
              {view === 'sign-up' && <SignUpForm />}
              {view === 'forgot-password' && <ForgotPasswordForm />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
