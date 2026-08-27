// components/auth/auth-nav-buttons.tsx
// Navbar Sign In / Get Started buttons — open the auth modal in place
// instead of navigating to a dedicated route.
'use client'

import { useAuthModal } from '@/stores/auth-modal.store'

export function AuthNavButtons() {
  const { open } = useAuthModal()

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => open('sign-in')}
        className="rounded-lg px-4 py-2 text-sm font-medium text-white/60 transition-colors hover:text-white"
      >
        Sign In
      </button>
      <button
        type="button"
        onClick={() => open('sign-up')}
        className="rounded-lg bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] px-4 py-2 text-sm font-semibold shadow-lg shadow-[#6366f1]/20 transition-all hover:shadow-xl hover:shadow-[#6366f1]/30 hover:brightness-110"
      >
        Get Started
      </button>
    </div>
  )
}
