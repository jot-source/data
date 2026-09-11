'use client'

import React, { useState, useTransition } from 'react'
import { updateProfile, signOut } from '@/actions/auth.actions'
import { useAuthModal } from '@/stores/auth-modal.store'

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
  const { open } = useAuthModal()
  const [profileData, setProfileData] = useState({
    fullName: user.fullName || '',
    email: user.email,
    organization: user.organization || 'MedVantix AI Pvt. Ltd.',
    industry: user.industry || user.email,
    jobTitle: user.jobTitle || 'Data science lead',
    billingAddress: 'Plot 14, HITEC City, Hyderabad, 500081',
  })

  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [message, setMessage] = useState('')

  const handleFieldSave = async (fieldKey: string, newValue: string) => {
    const updated = { ...profileData, [fieldKey]: newValue }
    setProfileData(updated)
    setMessage('')

    const payload = {
      fullName: updated.fullName,
      organization: updated.organization,
      industry: updated.industry,
      jobTitle: updated.jobTitle,
    }

    const res = await updateProfile(payload)
    if (res.error) {
      setMessage(res.error)
    } else {
      setMessage('Profile updated successfully.')
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Account info</h2>
        <p className="mt-0.5 text-xs md:text-sm text-gray-500">
          Used on invoices, licenses, and data delivery.
        </p>
      </div>

      {message && (
        <div
          className={`rounded-lg p-3 text-xs font-medium ${
            message.includes('successfully')
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message}
        </div>
      )}

      {/* Card 1: Identity Card (ID) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all">
        {/* Card Header */}
        <div className="flex items-center gap-4">
          <div className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-2xl bg-[#DBEAFE] px-3 py-2.5 text-[#2565EB] font-medium text-sm tracking-normal leading-6 font-[family-name:var(--font-public-sans)]">
            ID
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-medium text-[#181818] tracking-normal leading-7 font-[family-name:var(--font-public-sans)]">
              Identity
            </h3>
            <p className="text-xs md:text-sm font-normal text-[#616161] tracking-normal leading-5 font-[family-name:var(--font-public-sans)] mt-0.5">
              How you sign in and how we address you
            </p>
          </div>
        </div>

        <hr className="my-5 border-gray-100" />

        {/* Fields List */}
        <div className="divide-y divide-gray-100">
          <EditableFieldRow
            label="FULL NAME"
            value={profileData.fullName}
            placeholder="Nitin kumar"
            onSave={(val) => handleFieldSave('fullName', val)}
          />

          <EditableFieldRow
            label="WORK EMAIL"
            value={profileData.email}
            readOnly
          />

          <EditableFieldRow
            label="ROLE"
            value={profileData.jobTitle}
            placeholder="Data science lead"
            onSave={(val) => handleFieldSave('jobTitle', val)}
          />
        </div>
      </div>

      {/* Card 2: Organisation Card (ORG) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all">
        {/* Card Header */}
        <div className="flex items-center gap-4">
          <div className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-2xl bg-[#DBEAFE] px-3 py-2.5 text-[#2565EB] font-medium text-sm tracking-normal leading-6 font-[family-name:var(--font-public-sans)]">
            ORG
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-medium text-[#181818] tracking-normal leading-7 font-[family-name:var(--font-public-sans)]">
              Organisation
            </h3>
            <p className="text-xs md:text-sm font-normal text-[#616161] tracking-normal leading-5 font-[family-name:var(--font-public-sans)] mt-0.5">
              Shown on licenses and data agreements
            </p>
          </div>
        </div>

        <hr className="my-5 border-gray-100" />

        {/* Fields List */}
        <div className="divide-y divide-gray-100">
          <EditableFieldRow
            label="COMPANY / ORG"
            value={profileData.organization}
            placeholder="MedVantix AI Pvt. Ltd."
            onSave={(val) => handleFieldSave('organization', val)}
          />

          <EditableFieldRow
            label="INDUSTRY"
            value={profileData.industry}
            placeholder="Healthcare AI"
            onSave={(val) => handleFieldSave('industry', val)}
          />

          <EditableFieldRow
            label="BILLING ADDRESS"
            value={profileData.billingAddress}
            placeholder="Plot 14, HITEC City, Hyderabad, 500081"
            onSave={(val) => handleFieldSave('billingAddress', val)}
          />
        </div>
      </div>

      {/* Card 3: Security & Logout Row Container */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
        {/* Change Password Row */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-gray-900">Password</h4>
            <p className="text-xs text-gray-500 mt-0.5">
              Last changed Jan 14, 2026
            </p>
          </div>

          <button
            type="button"
            onClick={() => open('forgot-password')}
            className="flex h-[48px] items-center justify-center rounded-xl bg-[#F1F5F9] px-8 text-sm font-semibold text-[#181818] tracking-normal leading-6 font-[family-name:var(--font-public-sans)] transition-colors hover:bg-slate-200"
          >
            Change password
          </button>
        </div>

        <hr className="border-gray-100" />

        {/* Logout Row */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-gray-900">Logout</h4>
            <p className="text-xs text-gray-500 mt-0.5">
              You&apos;ll need to sign in again to access your account.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="flex h-[48px] items-center justify-center rounded-xl bg-[#A31A1A] px-8 text-sm font-semibold text-white tracking-normal leading-6 font-[family-name:var(--font-public-sans)] transition-colors hover:bg-red-800"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Figma Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[440px] rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 transition-all">
            {/* Red Light Icon Badge (44px x 44px) */}
            <div className="flex h-[44px] w-[44px] items-center justify-center rounded-xl bg-[#FFDEDC] text-[#A31A1A] mb-4">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>

            {/* Modal Title */}
            <h3 className="text-lg font-semibold text-[#181818] tracking-normal font-[family-name:var(--font-public-sans)]">
              Logout of this account
            </h3>

            {/* Modal Description */}
            <p className="text-xs font-medium text-[#616161] tracking-normal leading-5 font-[family-name:var(--font-public-sans)] mt-1 mb-6">
              You&apos;ll need to sign in again to access your account on this device.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex h-[44px] flex-1 items-center justify-center rounded-xl bg-[#F1F5F9] text-sm font-semibold text-[#181818] tracking-normal font-[family-name:var(--font-public-sans)] transition-colors hover:bg-slate-200"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => signOut()}
                className="flex h-[44px] flex-1 items-center justify-center rounded-xl bg-[#A31A1A] text-sm font-semibold text-white tracking-normal font-[family-name:var(--font-public-sans)] transition-colors hover:bg-red-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function EditableFieldRow({
  label,
  value,
  placeholder = '',
  readOnly = false,
  onSave,
}: {
  label: string
  value: string
  placeholder?: string
  readOnly?: boolean
  onSave?: (val: string) => Promise<void> | void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [currentValue, setCurrentValue] = useState(value)
  const [isPending, startTransition] = useTransition()

  const handleSave = () => {
    if (!onSave || readOnly) return
    startTransition(async () => {
      await onSave(currentValue)
      setIsEditing(false)
    })
  }

  const handleCancel = () => {
    setCurrentValue(value)
    setIsEditing(false)
  }

  return (
    <div className="py-3.5 first:pt-0 last:pb-0">
      <label className="block text-[11px] font-medium text-[#616161] tracking-normal font-[family-name:var(--font-public-sans)] uppercase mb-1">
        {label}
      </label>

      {isEditing && !readOnly ? (
        /* Figma Edit Mode (Screenshots 2 & 3): Bordered input + Check & Cancel controls */
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-[#181818] tracking-normal font-[family-name:var(--font-public-sans)] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />

          <div className="flex items-center gap-1 shrink-0">
            {/* Green Checkmark Save Button (Figma Screenshot 3) */}
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              title="Save"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#059669] text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>

            {/* Cancel Button (Figma Screenshot 2 & 3) */}
            <button
              type="button"
              onClick={handleCancel}
              title="Cancel"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        /* View Mode */
        <div
          onClick={() => !readOnly && setIsEditing(true)}
          className={`group flex items-center justify-between rounded-lg py-1 transition-colors ${
            !readOnly ? 'cursor-pointer hover:bg-gray-50/50' : ''
          }`}
        >
          <span className="text-sm font-medium text-[#181818] tracking-normal font-[family-name:var(--font-public-sans)]">
            {value || placeholder || '—'}
          </span>

          {!readOnly && (
            <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
              Edit
            </span>
          )}
        </div>
      )}
    </div>
  )
}
