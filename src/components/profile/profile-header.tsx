import React from 'react'
import Image from 'next/image'

interface ProfileHeaderProps {
  user: {
    fullName: string | null
    email: string
    organization: string | null
    jobTitle: string | null
  }
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const name = user.fullName || user.email.split('@')[0]
  
  // Format the sub-line (e.g. email · Company · Role)
  const parts = [user.email]
  if (user.organization) parts.push(user.organization)
  if (user.jobTitle) parts.push(user.jobTitle)
  
  const subline = parts.join(' · ')

  return (
    <div className="flex items-center justify-between rounded-xl bg-[#131F37] p-6 lg:p-8">
      <div className="flex items-center gap-6">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#EBF3FF] overflow-hidden">
          {/* Avatar Placeholder (Whale icon in Figma, we'll use a stylized initial if no avatar) */}
          <div className="text-3xl font-bold text-[#2563EB]">
            {name.charAt(0).toUpperCase()}
          </div>
        </div>
        
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-bold text-white lg:text-3xl">
            {name}
          </h1>
          <p className="text-sm font-medium text-white/70 lg:text-base">
            {subline}
          </p>
        </div>
      </div>
      
      <div className="hidden shrink-0 lg:block">
        <span className="inline-flex items-center rounded-full bg-[#2563EB] px-4 py-1.5 text-sm font-semibold text-white">
          Enterprise buyer
        </span>
      </div>
    </div>
  )
}
