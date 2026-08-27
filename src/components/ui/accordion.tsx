'use client'

import * as React from 'react'

/** A simple utility to merge tailwind classes since this project seems to use standard React */
export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}

const AccordionContext = React.createContext<{
  openValue: string | null
  toggle: (v: string) => void
}>({ openValue: null, toggle: () => {} })

export const Accordion = ({
  children,
  className,
  defaultValue = null,
}: {
  children: React.ReactNode
  className?: string
  defaultValue?: string | null
}) => {
  const [openValue, setOpenValue] = React.useState<string | null>(defaultValue)

  const toggle = (value: string) => {
    setOpenValue((prev) => (prev === value ? null : value))
  }

  return (
    <AccordionContext.Provider value={{ openValue, toggle }}>
      <div className={cn('flex flex-col', className)}>{children}</div>
    </AccordionContext.Provider>
  )
}

const AccordionItemContext = React.createContext<{ value: string }>({ value: '' })

export const AccordionItem = ({
  children,
  className,
  value,
}: {
  children: React.ReactNode
  className?: string
  value: string
}) => {
  const { openValue } = React.useContext(AccordionContext)
  const isOpen = openValue === value

  return (
    <AccordionItemContext.Provider value={{ value }}>
      <div className={cn(
        'border-b-0 transition-colors',
        isOpen ? 'border-[#2563EB] ring-1 ring-[#2563EB]' : '',
        className
      )}>{children}</div>
    </AccordionItemContext.Provider>
  )
}

export const AccordionTrigger = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  const { openValue, toggle } = React.useContext(AccordionContext)
  const { value } = React.useContext(AccordionItemContext)
  const isOpen = openValue === value

  return (
    <button
      type="button"
      className={cn(
        'flex w-full flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline',
        isOpen ? 'text-[#2563EB]' : 'text-[#181818]',
        className
      )}
      onClick={() => toggle(value)}
    >
      {children}
      <svg
        className={cn('h-4 w-4 shrink-0 transition-transform duration-200', isOpen && 'rotate-180')}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  )
}

export const AccordionContent = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  const { openValue } = React.useContext(AccordionContext)
  const { value } = React.useContext(AccordionItemContext)
  const isOpen = openValue === value

  if (!isOpen) return null

  return (
    <div className={cn('overflow-hidden text-sm', className)}>
      <div className="pb-4 pt-0 text-[#616161] leading-relaxed">{children}</div>
    </div>
  )
}
