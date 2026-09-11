// components/auth/auth-tab-switcher.tsx
'use client'

import { useAuthModal } from '@/stores/auth-modal.store'

interface AuthTabSwitcherProps {
  activeTab: 'sign-in' | 'sign-up'
}

export function AuthTabSwitcher({ activeTab }: AuthTabSwitcherProps) {
  const { open } = useAuthModal()

  return (
    <div className="mb-5 flex w-full rounded-xl bg-[#f1f3f9] p-1 md:hidden">
      <button
        type="button"
        onClick={() => open('sign-in')}
        className={`flex-1 rounded-lg py-2.5 text-center text-sm font-semibold transition-all ${
          activeTab === 'sign-in'
            ? 'bg-white text-[#111111] shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
            : 'text-[#616161] hover:text-[#111111]'
        }`}
      >
        Login
      </button>
      <button
        type="button"
        onClick={() => open('sign-up')}
        className={`flex-1 rounded-lg py-2.5 text-center text-sm font-semibold transition-all ${
          activeTab === 'sign-up'
            ? 'bg-white text-[#111111] shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
            : 'text-[#616161] hover:text-[#111111]'
        }`}
      >
        Signup
      </button>
    </div>
  )
}
