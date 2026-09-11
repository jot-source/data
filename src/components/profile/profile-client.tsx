'use client'

import React, { useState } from 'react'
import { ProfileHeader } from './profile-header'
import { ProfileSidebar } from './profile-sidebar'
import { AccountInfoForm } from './account-info-form'
import { SecuritySettings } from './security-settings'
import { SavedDatasets } from './saved-datasets'
import { MyOrders, type OrderItem } from './my-orders'
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
  orders?: OrderItem[]
}

export function ProfileClient({ user, savedDatasets = [], orders = [] }: ProfileClientProps) {
  const [activeTab, setActiveTab] = useState('Account info')

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
      {/* Top Banner */}
      <div className="mb-12">
        <ProfileHeader user={user} />
      </div>

      <div className="flex flex-col gap-12 lg:flex-row">
        {/* Left Sidebar */}
        <aside className="w-full shrink-0 lg:w-64">
          <ProfileSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        </aside>

        {/* Right Content */}
        <main className="flex-1">
          {activeTab === 'Account info' && (
            <div className="space-y-12">
              <AccountInfoForm user={user} />
              <SecuritySettings />
            </div>
          )}

          {activeTab === 'My orders' && (
            <MyOrders orders={orders} />
          )}

          {activeTab === 'Wishlist' && (
            <SavedDatasets initialDatasets={savedDatasets} />
          )}
        </main>
      </div>
    </div>
  )
}
