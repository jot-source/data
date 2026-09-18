// components/auth/auth-tab-switcher.tsx
'use client'

import { useAuthModal } from '@/stores/auth-modal.store'

interface AuthTabSwitcherProps {
  activeTab: 'sign-in' | 'sign-up'
}

export function AuthTabSwitcher({ activeTab }: AuthTabSwitcherProps) {
  const { open } = useAuthModal()

  return (
    <div className="mb-5 flex w-full items-center gap-2.5 md:hidden">
      <button
        type="button"
        onClick={() => open('sign-in')}
        className={`flex h-10 flex-1 items-center justify-center rounded-lg text-sm font-semibold transition-all ${
          activeTab === 'sign-in'
            ? 'bg-[#2563EB] text-white shadow-sm'
            : 'bg-[#F4F5F7] text-[#616161] hover:text-[#111111]'
        }`}
      >
        Login
      </button>
      <button
        type="button"
        onClick={() => open('sign-up')}
        className={`flex h-10 flex-1 items-center justify-center rounded-lg text-sm font-semibold transition-all ${
          activeTab === 'sign-up'
            ? 'bg-[#2563EB] text-white shadow-sm'
            : 'bg-[#F4F5F7] text-[#616161] hover:text-[#111111]'
        }`}
      >
        Signup
      </button>
    </div>
  )
}
