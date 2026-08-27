'use client'

import React, { useState } from 'react'
import { updateProfile } from '@/actions/auth.actions'

interface AccountInfoFormProps {
  user: {
    fullName: string | null
    email: string
    organization: string | null
    industry: string | null
    jobTitle: string | null
  }
}

export function AccountInfoForm({ user }: AccountInfoFormProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const formData = new FormData(e.currentTarget)
    const payload = {
      fullName: formData.get('fullName') as string,
      organization: formData.get('organization') as string,
      industry: formData.get('industry') as string,
      jobTitle: formData.get('jobTitle') as string,
    }

    const res = await updateProfile(payload)
    if (res.error) {
      setMessage(res.error)
    } else {
      setMessage('Profile updated successfully.')
    }
    setLoading(false)
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white/50 p-6 lg:p-8">
      <h2 className="mb-2 text-xl font-semibold text-gray-900">Account info</h2>
      <p className="mb-6 text-sm text-gray-500">Used on invoices, licenses, and data delivery.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Full Name */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="fullName">Full Name</label>
            <div className="relative">
              <input
                id="fullName"
                name="fullName"
                type="text"
                defaultValue={user.fullName || ''}
                className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <EditIcon />
            </div>
          </div>

          {/* Work Email */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="email">Work Email</label>
            <div className="relative">
              <input
                id="email"
                type="email"
                defaultValue={user.email}
                disabled
                className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm text-gray-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Company / ORG Name */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="organization">Company / ORG Name</label>
            <div className="relative">
              <input
                id="organization"
                name="organization"
                type="text"
                defaultValue={user.organization || ''}
                className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <EditIcon />
            </div>
          </div>

          {/* Industry */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="industry">Industry</label>
            <div className="relative">
              <input
                id="industry"
                name="industry"
                type="text"
                defaultValue={user.industry || ''}
                className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <EditIcon />
            </div>
          </div>

          {/* Role */}
          <div className="flex flex-col gap-2 md:col-span-1">
            <label className="text-sm font-medium text-gray-700" htmlFor="jobTitle">Role</label>
            <div className="relative">
              <input
                id="jobTitle"
                name="jobTitle"
                type="text"
                defaultValue={user.jobTitle || ''}
                className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <EditIcon />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-lg bg-[#F8FAFC] py-3 text-sm font-semibold text-gray-400 border border-gray-200 transition-colors hover:bg-gray-100 focus:outline-none disabled:opacity-70"
        >
          {loading ? 'Saving...' : 'Save & Continue'}
        </button>

        {message && (
          <p className={`text-center text-sm font-medium ${message.includes('successfully') ? 'text-green-600' : 'text-red-500'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  )
}

function EditIcon() {
  return (
    <svg 
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" 
      width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
    </svg>
  )
}
