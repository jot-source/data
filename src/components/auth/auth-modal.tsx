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

  // Close on Escape, handle browser back button, and lock body scroll while open.
  useEffect(() => {
    if (!view) return

    // Push a history entry so pressing the browser Back button closes the modal
    // without navigating away from the page or resetting filters/forms.
    window.history.pushState({ authModal: true }, '')

    function onPopState() {
      close()
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (window.history.state?.authModal) {
          window.history.back()
        } else {
          close()
        }
      }
    }

    window.addEventListener('popstate', onPopState)
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('popstate', onPopState)
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [view, close])

  const handleManualClose = () => {
    if (window.history.state?.authModal) {
      window.history.back()
    } else {
      close()
    }
  }

  if (!view) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex min-h-full items-start justify-center overflow-y-auto overflow-x-hidden p-0 md:items-center md:px-4 md:py-8"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop — solid black at 65% opacity */}
      <button
        type="button"
        aria-label="Close"
        onClick={handleManualClose}
        className="fixed inset-0 bg-black/65 transition-opacity"
      />

      <div className="relative z-10 flex min-h-screen w-full flex-col md:min-h-0 md:max-w-[860px]">
        {/* Close Button — floating outside card on desktop, hidden on mobile */}
        <button
          type="button"
          aria-label="Close"
          onClick={handleManualClose}
          className="hidden md:flex absolute z-30 items-center justify-center rounded-full text-white backdrop-blur transition-colors hover:bg-white/25 md:-top-11 md:right-0 md:h-9 md:w-9 md:bg-white/10 md:hover:bg-white/20"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Card: Mobile vertical stacked layout with navy hero at top, Desktop 860x600 rounded-xl side-by-side */}
        <div className="flex flex-1 flex-col overflow-hidden bg-[#1A2552] shadow-2xl shadow-black/50 md:min-h-[600px] md:flex-row md:rounded-xl md:bg-[#F8F8F8]">
          <AuthSidePanel />
          
          {/* White form card section: rounded-t-[24px] and margin-top: -20px overlapping navy banner on mobile */}
          <div className="auth-mobile-card relative z-10 -mt-[20px] flex flex-1 flex-col justify-start rounded-t-[24px] bg-white px-4 py-6 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] sm:px-8 md:mt-0 md:rounded-none md:bg-[#F8F8F8] md:px-[60px] md:py-10 md:shadow-none text-[#111111]">
            {view === 'sign-in' && <SignInForm />}
            {view === 'sign-up' && <SignUpForm />}
            {view === 'forgot-password' && <ForgotPasswordForm />}
          </div>
        </div>
      </div>
    </div>
  )
}
