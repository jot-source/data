import React from 'react'
import clsx from 'clsx'

const TABS = [
  'Account info',
  'Your orders',
  'Billing & Invoices',
  'Custom requests',
  'Quotations',
  'Saved datasets',
  'Security'
]

interface ProfileSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function ProfileSidebar({ activeTab, onTabChange }: ProfileSidebarProps) {
  return (
    <nav className="flex flex-col gap-1 pr-6">
      {TABS.map((tab) => {
        const isActive = activeTab === tab
        return (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={clsx(
              'flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-[#E2EDFF] text-[#1E293B]'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            {tab}
          </button>
        )
      })}
    </nav>
  )
}
