// components/auth/sign-out-button.tsx
// Simple sign-out button for the navbar — calls the signOut server action.
'use client'

import { signOut } from '@/actions/auth.actions'

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut()}
      className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-white/60 transition-colors hover:border-white/20 hover:text-white"
    >
      Sign Out
    </button>
  )
}
