'use client'

import React, { useState } from 'react'
import { ProfileHeader } from './profile-header'
import { ProfileSidebar } from './profile-sidebar'
import { AccountInfoForm } from './account-info-form'
import { SecuritySettings } from './security-settings'
import { SavedDatasets } from './saved-datasets'
import type { DatasetCard } from '@/types/dataset'

interface ProfileClientProps {
  user: {
    fullName: string | null
    email: string
    organization: string | null
    industry: string | null
    jobTitle: string | null
  }
  savedDatasets?: (DatasetCard & { savedAt: string })[]
}

export function ProfileClient({ user, savedDatasets = [] }: ProfileClientProps) {
  const [activeTab, setActiveTab] = useState('Account info')

  function handleTabChange(tab: string) {
    setActiveTab(tab)

    // For Security and Saved datasets, scroll to the section if we're on Account info
    if (tab === 'Security') {
      setActiveTab('Account info')
      setTimeout(() => {
        document.getElementById('security-section')?.scrollIntoView({ behavior: 'smooth' })
      }, 50)
      return
    }
    if (tab === 'Saved datasets') {
      setActiveTab('Account info')
      setTimeout(() => {
        document.getElementById('wishlist-section')?.scrollIntoView({ behavior: 'smooth' })
      }, 50)
      return
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
      {/* Top Banner */}
      <div className="mb-12">
        <ProfileHeader user={user} />
      </div>

      <div className="flex flex-col gap-12 lg:flex-row">
        {/* Left Sidebar */}
        <aside className="w-full shrink-0 lg:w-64">
          <ProfileSidebar activeTab={activeTab} onTabChange={handleTabChange} />
        </aside>

        {/* Right Content */}
        <main className="flex-1">
          {activeTab === 'Account info' && (
            <>
              <AccountInfoForm user={user} />
              <SecuritySettings />
              <SavedDatasets initialDatasets={savedDatasets} />
            </>
          )}
          
          {/* Placeholder for other tabs */}
          {['Your orders', 'Billing & Invoices', 'Custom requests', 'Quotations'].includes(activeTab) && (
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500">This section is coming soon.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
