'use client'

import React from 'react'
import { useAuthModal } from '@/stores/auth-modal.store'

export function SecuritySettings() {
  const { open } = useAuthModal()

  return (
    <div className="mt-12" id="security-section">
      <h2 className="mb-2 text-xl font-semibold text-gray-900">Security</h2>
      <p className="mb-6 text-sm text-gray-500">Manage how you sign in and who can access your account.</p>

      <div className="rounded-xl border border-gray-200 bg-white/50">
        
        {/* Password */}
        <div className="flex items-center justify-between p-6">
          <div>
            <h3 className="font-medium text-gray-900">Password</h3>
            <p className="mt-1 text-sm text-gray-500">Last changed Jan 14, 2026</p>
          </div>
          <button
            onClick={() => open('forgot-password')}
            className="rounded-lg border border-blue-500 px-4 py-2 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50"
          >
            Change password
          </button>
        </div>
        
        <hr className="border-gray-200" />

        {/* Two factor authentication */}
        <div className="flex items-center justify-between p-6">
          <div>
            <h3 className="font-medium text-gray-900">Two factor authentication</h3>
            <p className="mt-1 text-sm text-gray-500">dds an extra step when signing in</p>
          </div>
          {/* Simple toggle switch placeholder */}
          <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none">
            <span className="inline-block h-5 w-5 translate-x-1 transform rounded-full bg-white transition-transform" />
          </button>
        </div>

        <hr className="border-gray-200" />

        {/* Single sign-on (SSO) */}
        <div className="flex items-center justify-between p-6">
          <div>
            <h3 className="font-medium text-gray-900">Single sign-on (SSO)</h3>
            <p className="mt-1 text-sm text-gray-500">Enterprise buyers can sign in with their company identity provider</p>
          </div>
          <button className="rounded-lg border border-blue-500 px-4 py-2 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50">
            Configure SSO
          </button>
        </div>
        
      </div>
    </div>
  )
}
