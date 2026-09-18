// components/ui/save-button.tsx
// Shared bookmark/save toggle used on both dataset detail and explore cards.
// Optimistically toggles the bookmark icon, then fires the server action.
'use client'

import { useState, useTransition } from 'react'
import { toggleSaveDataset } from '@/actions/saved-dataset.actions'
import { useAuthModal } from '@/stores/auth-modal.store'

interface SaveButtonProps {
  datasetId: string
  initialSaved: boolean
  isLoggedIn: boolean
  /** 'dark' for the dataset detail heading, 'light' for explore cards */
  variant?: 'dark' | 'light'
  label?: string
  savedLabel?: string
}

export function SaveButton({
  datasetId,
  initialSaved,
  isLoggedIn,
  variant = 'light',
  label = 'Save',
  savedLabel = 'Saved',
}: SaveButtonProps) {
  const [saved, setSaved] = useState(initialSaved)
  const [isPending, startTransition] = useTransition()
  const { open } = useAuthModal()

  function performSave() {
    const previousSaved = saved
    setSaved(!saved)

    startTransition(async () => {
      const result = await toggleSaveDataset(datasetId)
      if (result.error) {
        // Revert on error
        setSaved(previousSaved)
      } else if (result.saved !== undefined) {
        setSaved(result.saved)
      }
    })
  }

  function handleClick() {
    if (!isLoggedIn) {
      open('sign-in', performSave)
      return
    }

    performSave()
  }

  const isDark = variant === 'dark'

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={saved ? (savedLabel ?? 'Unsave dataset') : (label ?? 'Save dataset')}
      className={`flex items-center gap-1.5 rounded-md font-public-sans text-xs sm:text-sm font-medium transition-all duration-200 disabled:opacity-60 cursor-pointer ${
        isDark
          ? saved
            ? 'bg-white/20 text-white px-2.5 py-1.5'
            : 'bg-white/10 text-white hover:bg-white/20 px-2.5 py-1.5'
          : saved
            ? 'text-[#2563EB] px-0 py-1 sm:px-2.5 sm:py-1.5'
            : 'text-[#2B2B2B] hover:text-[#181818] px-0 py-1 sm:px-2.5 sm:py-1.5'
      }`}
    >
      <BookmarkIcon filled={saved} className="h-4 w-4 sm:h-5 sm:w-5" />
      <span>{saved ? savedLabel : label}</span>
    </button>
  )
}

function BookmarkIcon({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-all duration-200 ${className ?? ''}`}
    >
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </svg>
  )
}
