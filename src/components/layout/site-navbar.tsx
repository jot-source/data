'use client'

import { useEffect, useState, useRef } from 'react'
import { useAuthModal } from '@/stores/auth-modal.store'
import { BrandLogo } from '../landing/brand-logo'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useDatasetFacets } from '@/hooks/use-dataset-facets'
import { useCartStore } from '@/stores/cart.store'
import { useDatasetFilters, type FacetKey } from '@/stores/dataset-filters.store'
import type { SessionUser } from '@/services/auth.service'
// (type-only import — auth.service.ts itself, which touches next/headers and
// Prisma, is never pulled into this client bundle)

type HeaderUser = { email: string | null }

/*
  Mega menu — Figma spec:
  - Popup: 856x356, #FFF, 1px #CBD5E1, radius 16, shadow 0 2px 2px rgba(0,0,0,0.16)
  - Anchored left-center under the header (not under the trigger link)
  - Left rail: 270px, border-right #CBD5E1, 24px padding, tabs 44px h,
      padding 10px 16px, radius 8, Public Sans 500 16/24,
      active: bg #DBEAFE text #2565EB — inactive: #616161
  - Cards: 2 cols, 24px gaps, 64px h, padding 8, gap 16, radius 8
      icon 48x48 #D3E0FB radius 8
      title 500 16/24 #181818, subtitle 400 12/16 #616161
      hover/active: 0.5px #2563EB border + 0 2px 10px rgba(26,111,202,0.25)
  - Footer (right column only): border-top #CBD5E1, padding 24px 0,
      Public Sans 500 14/20 — #616161 left, #2565EB right
*/

const NAV_LINKS = [
  { label: 'Browse Datasets', href: '/datasets', hasMenu: true, id: 'browse' },
  // Root-relative hashes so these jump to the landing-page sections from any
  // route (Next routes to `/`, then scrolls to the anchored section).
  { label: 'How it works', href: '/#how-it-works', hasMenu: false, id: 'how' },
  { label: 'Customize Dataset', href: '/#customize', hasMenu: false, id: 'customize' },
  { label: 'Resources', href: '#resources', hasMenu: true, id: 'resources' },
] as const

function Chevron({ open }: { open?: boolean }) {
  return (
    <svg
      width="13"
      height="7"
      viewBox="0 0 13 7"
      fill="none"
      className={`transition-transform duration-200 ${open ? 'rotate-180 text-[#2563EB]' : 'text-[#616161]'}`}
    >
      <path d="M1 1l5.25 5L11.5 1" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="white" />
    </svg>
  )
}

function GridIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="3" y1="9" x2="21" y2="9"></line>
      <line x1="9" y1="21" x2="9" y2="9"></line>
    </svg>
  )
}

/* ---------- Shared shell: left rail tabs + right item grid + footer ---------- */

type MenuItem = { title: string; subtitle: string; onSelect: () => void }
type MenuTab = { id: string; label: string; count?: number }

function MegaMenuShell({
  tabs,
  activeTabId,
  onTabChange,
  items,
  footerText,
  footerAction,
  onFooterClick,
}: {
  tabs: MenuTab[]
  activeTabId: string
  onTabChange: (id: string) => void
  items: MenuItem[]
  footerText: string
  footerAction: string
  onFooterClick: () => void
}) {
  return (
    <div
      className="overflow-hidden bg-white"
      style={{
        width: 856,
        maxWidth: '100%',
        height: 360,
        border: '1px solid #E2E8F0',
        boxShadow: '0px 12px 32px -4px rgba(0, 0, 0, 0.12), 0px 4px 12px -2px rgba(0, 0, 0, 0.08)',
        borderRadius: 16,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex h-full">
        {/* Left rail */}
        <div
          className="flex h-full shrink-0 flex-col overflow-y-auto"
          style={{ width: 270, borderRight: '1px solid #E2E8F0', padding: 20, gap: 8 }}
        >
          {tabs.map((tab) => {
            const isActive = activeTabId === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onMouseEnter={() => onTabChange(tab.id)}
                onClick={() => onTabChange(tab.id)}
                className="flex w-full items-center justify-between transition-colors focus:outline-none"
                style={{
                  height: 44,
                  padding: '10px 16px',
                  borderRadius: 8,
                  background: isActive ? '#EFF6FF' : 'transparent',
                }}
              >
                <span
                  style={{
                    fontFamily: "'Public Sans', sans-serif",
                    fontWeight: isActive ? 600 : 500,
                    fontSize: 15,
                    lineHeight: '22px',
                    color: isActive ? '#2563EB' : '#475569',
                  }}
                >
                  {tab.label}
                </span>
                {typeof tab.count === 'number' && (
                  <span
                    style={{
                      fontFamily: "'Public Sans', sans-serif",
                      fontWeight: 500,
                      fontSize: 14,
                      lineHeight: '20px',
                      color: isActive ? '#2563EB' : '#94A3B8',
                    }}
                  >
                    {String(tab.count).padStart(2, '0')}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Right column — fixed height; grid scrolls, footer stays pinned */}
        <div className="flex h-full min-w-0 flex-1 flex-col" style={{ padding: '20px 24px 0 24px' }}>
          {/* Item grid — scrolls when options overflow */}
          <div
            className="grid flex-1 auto-rows-min grid-cols-2 content-start overflow-y-auto overscroll-contain"
            style={{ gap: 16, paddingRight: 4, scrollbarWidth: 'thin' }}
          >
            {items.map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={item.onSelect}
                className="group flex shrink-0 items-center text-left transition-all focus:outline-none hover:border-[#2563EB] hover:shadow-[0_4px_16px_rgba(37,99,235,0.12)]"
                style={{
                  height: 64,
                  minHeight: 64,
                  padding: 8,
                  gap: 14,
                  borderRadius: 8,
                  border: '1px solid #F1F5F9',
                  background: '#FFFFFF',
                }}
              >
                <div
                  className="flex shrink-0 items-center justify-center text-[#2563EB] transition-colors group-hover:bg-[#DBEAFE]"
                  style={{ width: 48, height: 48, background: '#EFF6FF', borderRadius: 8 }}
                >
                  <GridIcon />
                </div>
                <div className="flex min-w-0 flex-col" style={{ gap: 2 }}>
                  <span
                    className="line-clamp-1 transition-colors group-hover:text-[#2563EB]"
                    style={{
                      fontFamily: "'Public Sans', sans-serif",
                      fontWeight: 600,
                      fontSize: 15,
                      lineHeight: '22px',
                      color: '#181818',
                    }}
                  >
                    {item.title}
                  </span>
                  <span
                    className="line-clamp-1"
                    style={{
                      fontFamily: "'Public Sans', sans-serif",
                      fontWeight: 400,
                      fontSize: 12,
                      lineHeight: '16px',
                      color: '#64748B',
                    }}
                  >
                    {item.subtitle}
                  </span>
                </div>
              </button>
            ))}
            {items.length === 0 && (
              <div
                className="col-span-2 flex items-center justify-center"
                style={{
                  fontFamily: "'Public Sans', sans-serif",
                  fontSize: 14,
                  color: '#8C8C8C',
                  minHeight: 152,
                }}
              >
                Loading options...
              </div>
            )}
          </div>

          {/* Footer — right column only, pinned below the scroll area */}
          <div
            className="flex shrink-0 items-center justify-between"
            style={{ borderTop: '1px solid #E2E8F0', padding: '18px 0' }}
          >
            <span
              style={{
                fontFamily: "'Public Sans', sans-serif",
                fontWeight: 500,
                fontSize: 14,
                lineHeight: '20px',
                color: '#64748B',
              }}
            >
              {footerText}
            </span>
            <button
              type="button"
              onClick={onFooterClick}
              className="hover:underline focus:outline-none"
              style={{
                fontFamily: "'Public Sans', sans-serif",
                fontWeight: 600,
                fontSize: 14,
                lineHeight: '20px',
                color: '#2563EB',
              }}
            >
              {footerAction}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- Browse Datasets menu (facet-driven) ---------- */

function BrowseDatasetsMenu({ close }: { close: () => void }) {
  const router = useRouter()
  const { data: facets } = useDatasetFacets()
  const { clearAll, toggleFacet } = useDatasetFilters()
  const [activeTab, setActiveTab] = useState<'industry' | 'modality' | 'useCase'>('industry')

  const tabs: MenuTab[] = [
    { id: 'industry', label: 'Domain', count: facets?.industry?.length || 0 },
    { id: 'modality', label: 'Modality', count: facets?.modality?.length || 0 },
    { id: 'useCase', label: 'Usecase', count: facets?.useCase?.length || 0 },
  ]

  const activeOptions = facets?.[activeTab] || []

  const handleSelectOption = (value: string) => {
    clearAll()
    toggleFacet(activeTab as FacetKey, value)
    close()
    router.push('/datasets')
  }

  const handleBrowseAll = () => {
    clearAll()
    close()
    router.push('/datasets')
  }

  return (
    <MegaMenuShell
      tabs={tabs}
      activeTabId={activeTab}
      onTabChange={(id) => setActiveTab(id as typeof activeTab)}
      items={activeOptions.map((opt: { value: string; count: number }) => ({
        title: opt.value,
        subtitle: `${opt.count} Datasets available`,
        onSelect: () => handleSelectOption(opt.value),
      }))}
      footerText="Over 200+ datasets across 30+ domains"
      footerAction="Browse all datasets"
      onFooterClick={handleBrowseAll}
    />
  )
}

/* ---------- Resources menu (static) ---------- */

const RESOURCES_MENU: Record<string, { label: string; items: { title: string; subtitle: string; href: string }[] }> = {
  company: {
    label: 'Company',
    items: [
      { title: 'Case studies', subtitle: 'Customer stories, results', href: '/case-studies' },
      { title: 'Testimonials', subtitle: 'What customers say about us', href: '/testimonials' },
      { title: 'Careers', subtitle: 'Open roles, hiring', href: '/careers' },
      { title: 'About us', subtitle: 'Mission, team, story', href: '/about' },
    ],
  },
  support: {
    label: 'Support',
    items: [
      { title: 'Help center', subtitle: 'Guides and answers', href: '/help' },
      { title: 'Contact us', subtitle: 'Talk to our team', href: '/contact' },
    ],
  },
  learn: {
    label: 'Learn',
    items: [
      { title: 'Blog', subtitle: 'Product news, insights', href: '/blog' },
      { title: 'Docs', subtitle: 'Integration guides, API', href: '/docs' },
    ],
  },
}

function ResourcesMenu({ close }: { close: () => void }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<keyof typeof RESOURCES_MENU>('company')

  const tabs: MenuTab[] = Object.entries(RESOURCES_MENU).map(([id, group]) => ({
    id,
    label: group.label,
  }))

  const go = (href: string) => {
    close()
    router.push(href)
  }

  return (
    <MegaMenuShell
      tabs={tabs}
      activeTabId={activeTab}
      onTabChange={(id) => setActiveTab(id as keyof typeof RESOURCES_MENU)}
      items={RESOURCES_MENU[activeTab].items.map((item) => ({
        title: item.title,
        subtitle: item.subtitle,
        onSelect: () => go(item.href),
      }))}
      footerText="Over 200+ datasets across 30+ domains"
      footerAction="Browse all datasets"
      onFooterClick={() => go('/datasets')}
    />
  )
}

/* ---------- Header ---------- */

export function SiteHeader({ initialUser }: { initialUser: SessionUser | null }) {
  const { open } = useAuthModal()
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<HeaderUser | null>(initialUser)
  const [supabase] = useState(() => createClient())

  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [drawerAccordion, setDrawerAccordion] = useState<string | null>('domain')
  const toggleFacet = useDatasetFilters((s) => s.toggleFacet)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const rawCartCount = useCartStore((s) => s.items.length)
  const cartCount = mounted ? rawCartCount : 0
  const isCartSelected = pathname === '/cart' || cartCount > 0

  // Sign-in/up happen through a *server-side* Supabase client (the Server
  // Action), so this browser client never observes them directly — the
  // server-rendered `initialUser` is what actually carries the update,
  // arriving for free whenever router.refresh() re-renders the layout.
  const [prevInitialUser, setPrevInitialUser] = useState(initialUser)
  if (initialUser !== prevInitialUser) {
    setPrevInitialUser(initialUser)
    setUser(initialUser)
  }

  // Fallback + live sync for auth changes this browser client DOES see
  // directly (OAuth redirect completion, another tab signing out, token
  // refresh). Runs once on mount — `supabase` is now a stable reference.
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUser({ email: user.email ?? null })
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { email: session.user.email ?? null } : null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleMouseEnter = (id: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setActiveMenu(id)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null)
    }, 150)
  }

  const isCartPage = pathname === '/cart'

  return (
    <header className={`sticky top-0 z-[90] ${isCartPage ? 'hidden sm:flex' : 'flex'} h-16 w-full max-w-[100vw] items-center justify-between bg-white px-4 sm:px-10 lg:px-[120px] py-3 border-b border-[#F1F5F9]`}>
      {/* Desktop Brand Logo */}
      <Link href={'/'} className="hidden md:flex shrink-0 items-center">
        <BrandLogo />
      </Link>

      {/* Mobile Top Header Left (< 768px): Hamburger (☰) or Back button on /datasets */}
      <div className="flex items-center md:hidden">
        {pathname?.startsWith('/datasets') ? (
          <Link
            href="/"
            className="flex items-center gap-1.5 font-public-sans text-sm font-semibold text-[#181818] hover:text-[#2563EB] transition-colors"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>Search</span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#CBD5E1] bg-white text-[#181818] transition-colors hover:bg-[#F8FAFC] text-xl leading-none select-none cursor-pointer"
            aria-label="Open navigation drawer"
          >
            ☰
          </button>
        )}
      </div>

      {/* Desktop Navigation Links (< 768px hidden) */}
      <nav className="hidden md:flex items-center gap-6">
        {NAV_LINKS.map((link) => (
          <div
            key={link.id}
            onMouseEnter={() => link.hasMenu && handleMouseEnter(link.id)}
            onMouseLeave={() => link.hasMenu && handleMouseLeave()}
          >
            <Link
              href={link.href}
              className={`flex items-center gap-1.5 py-2 font-public-sans text-sm font-medium transition-colors ${
                activeMenu === link.id
                  ? 'text-[#2563EB]'
                  : 'text-[#616161] hover:text-[#2563EB]'
              }`}
            >
              {link.label}
              {link.hasMenu && <Chevron open={activeMenu === link.id} />}
            </Link>
          </div>
        ))}
      </nav>

      {/* Backdrop overlay when mega menu is open */}
      {(activeMenu === 'browse' || activeMenu === 'resources') && (
        <div
          className="fixed inset-0 top-16 z-40 bg-black/20 backdrop-blur-[2px] transition-opacity duration-200"
          onClick={() => setActiveMenu(null)}
          onMouseEnter={handleMouseLeave}
        />
      )}

      {/* Mega menus — aligned with 120px padding left on wide screens */}
      {(activeMenu === 'browse' || activeMenu === 'resources') && (
        <div
          className="fixed top-16 left-0 right-0 z-50 pointer-events-none hidden md:block"
          onMouseEnter={() => handleMouseEnter(activeMenu)}
          onMouseLeave={handleMouseLeave}
        >
          <div className="mx-auto w-full max-w-[1440px] px-6 sm:px-10 lg:px-[120px] pt-3 pointer-events-auto">
            {activeMenu === 'browse' ? (
              <BrowseDatasetsMenu close={() => setActiveMenu(null)} />
            ) : (
              <ResourcesMenu close={() => setActiveMenu(null)} />
            )}
          </div>
        </div>
      )}

      {/* Desktop Profile / CTA Button */}
      <div className="hidden md:flex items-center">
        {user ? (
          <div className="flex items-center gap-3">
            {/* Pure SVG/React Cart Button (44px x 44px - Figma Selected vs Normal state) */}
            <Link
              href="/cart"
              className={`relative flex h-[44px] w-[44px] items-center justify-center rounded-[12px] transition-all active:scale-95 shrink-0 ${
                isCartSelected
                  ? 'bg-[#2563EB] text-white shadow-sm hover:bg-[#1d4ed8]'
                  : 'bg-[#EBF1FF] text-[#475569] hover:bg-[#DBEAFE] hover:text-[#1E293B]'
              }`}
              title="Cart"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#2563EB] text-white text-[11px] font-bold ring-2 ring-white shadow-md">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* My Profile Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('profile-menu')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                className="flex h-[44px] items-center gap-2 rounded-full bg-[#EBF1FF] py-1.5 pl-1.5 pr-4 transition-colors hover:bg-blue-100"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0F1B3D] text-white font-semibold text-sm">
                  {user.email ? user.email.charAt(0).toUpperCase() : <UserIcon />}
                </div>
                <span className="font-public-sans text-sm font-semibold text-[#2563EB]">
                  My profile
                </span>
                <Chevron open={activeMenu === 'profile-menu'} />
              </button>

              {activeMenu === 'profile-menu' && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setActiveMenu(null)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-public-sans"
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={async () => {
                        await supabase.auth.signOut()
                        setActiveMenu(null)
                        router.refresh()
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 font-public-sans"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => open('sign-up')}
            className="rounded-lg bg-[#2563EB] px-7 py-2 font-public-sans text-base font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
          >
            Get started
          </button>
        )}
      </div>

      {/* Mobile Top Header Right (< 768px): Cart button (40px x 40px - Figma spec) */}
      <div className="flex items-center md:hidden">
        <Link
          href="/cart"
          className="relative flex h-10 w-10 items-center justify-center rounded-[8px] border border-[#CBD5E1] bg-[#EFF6FF] text-[#616161] hover:bg-[#DBEAFE] hover:text-[#1E293B] transition-colors shrink-0"
          aria-label="Cart"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#2563EB] text-white text-[10px] font-bold ring-1 ring-white shadow-sm">
              {cartCount}
            </span>
          )}
        </Link>
      </div>

      {/* Mobile Slide-In Left Drawer (< 768px) per Figma Design */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setMobileNavOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 z-[101] flex w-[300px] max-w-[85vw] flex-col justify-between bg-white p-5 shadow-2xl overflow-y-auto">
            <div className="flex flex-col">
              {/* Header: Brand Logo + Close Button */}
              <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9]">
                <BrandLogo />
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8C8C8C] hover:bg-[#F1F5F9] hover:text-[#181818] text-lg cursor-pointer"
                  aria-label="Close drawer"
                >
                  ✕
                </button>
              </div>

              {/* Navigation Menu */}
              <div className="flex flex-col mt-4">
                <span className="mb-2 font-public-sans text-xs font-semibold uppercase tracking-wider text-[#8C8C8C]">
                  Browse datasets
                </span>

                {/* Domain Accordion */}
                <div className="mb-2">
                  <button
                    type="button"
                    onClick={() => setDrawerAccordion(drawerAccordion === 'domain' ? null : 'domain')}
                    className="flex w-full items-center justify-between rounded-lg bg-[#EFF6FF] px-3.5 py-2.5 font-public-sans text-sm font-medium text-[#181818] hover:bg-[#DBEAFE] transition-colors"
                  >
                    <span>Domain</span>
                    <Chevron open={drawerAccordion === 'domain'} />
                  </button>
                  {drawerAccordion === 'domain' && (
                    <div className="mt-1.5 flex flex-col gap-1 pl-2 pr-1">
                      {[
                        { label: 'Healthcare', count: '32', value: 'Healthcare' },
                        { label: 'Conversational AI', count: '18', value: 'Conversational AI' },
                        { label: 'Robotics', count: '08', value: 'Robotics' },
                        { label: 'BFSI', count: '08', value: 'BFSI' },
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => {
                            toggleFacet('industry', item.value)
                            router.push('/datasets')
                            setMobileNavOpen(false)
                          }}
                          className="flex items-center justify-between rounded-md py-1.5 px-2 font-public-sans text-xs text-[#475569] hover:bg-[#F1F5F9] hover:text-[#181818] transition-colors text-left"
                        >
                          <span>{item.label}</span>
                          <span className="text-[#8C8C8C] font-mono">{item.count}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Modality Accordion */}
                <div className="mb-2">
                  <button
                    type="button"
                    onClick={() => setDrawerAccordion(drawerAccordion === 'modality' ? null : 'modality')}
                    className="flex w-full items-center justify-between rounded-lg border border-[#F1F5F9] bg-white px-3.5 py-2.5 font-public-sans text-sm font-medium text-[#181818] hover:bg-[#F8FAFC] transition-colors"
                  >
                    <span>Modality</span>
                    <Chevron open={drawerAccordion === 'modality'} />
                  </button>
                  {drawerAccordion === 'modality' && (
                    <div className="mt-1.5 flex flex-col gap-1 pl-2 pr-1">
                      {[
                        { label: 'Text / NLP', count: '24', value: 'Text' },
                        { label: 'Computer Vision', count: '16', value: 'Image' },
                        { label: 'Audio / Speech', count: '12', value: 'Audio' },
                        { label: 'Video', count: '08', value: 'Video' },
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => {
                            toggleFacet('modality', item.value)
                            router.push('/datasets')
                            setMobileNavOpen(false)
                          }}
                          className="flex items-center justify-between rounded-md py-1.5 px-2 font-public-sans text-xs text-[#475569] hover:bg-[#F1F5F9] hover:text-[#181818] transition-colors text-left"
                        >
                          <span>{item.label}</span>
                          <span className="text-[#8C8C8C] font-mono">{item.count}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Usecase Accordion */}
                <div className="mb-2">
                  <button
                    type="button"
                    onClick={() => setDrawerAccordion(drawerAccordion === 'usecase' ? null : 'usecase')}
                    className="flex w-full items-center justify-between rounded-lg border border-[#F1F5F9] bg-white px-3.5 py-2.5 font-public-sans text-sm font-medium text-[#181818] hover:bg-[#F8FAFC] transition-colors"
                  >
                    <span>Usecase</span>
                    <Chevron open={drawerAccordion === 'usecase'} />
                  </button>
                  {drawerAccordion === 'usecase' && (
                    <div className="mt-1.5 flex flex-col gap-1 pl-2 pr-1">
                      {[
                        { label: 'Healthcare Diagnosis', count: '14' },
                        { label: 'Fraud Detection', count: '09' },
                        { label: 'Autonomous Driving', count: '07' },
                        { label: 'Customer Support', count: '11' },
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => {
                            router.push('/datasets')
                            setMobileNavOpen(false)
                          }}
                          className="flex items-center justify-between rounded-md py-1.5 px-2 font-public-sans text-xs text-[#475569] hover:bg-[#F1F5F9] hover:text-[#181818] transition-colors text-left"
                        >
                          <span>{item.label}</span>
                          <span className="text-[#8C8C8C] font-mono">{item.count}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="my-3 border-t border-[#F1F5F9]" />

                {/* How it works */}
                <Link
                  href="/#how-it-works"
                  onClick={() => setMobileNavOpen(false)}
                  className="py-2.5 px-1 font-public-sans text-sm font-medium text-[#181818] hover:text-[#2563EB] transition-colors"
                >
                  How it works
                </Link>

                {/* Custom dataset */}
                <Link
                  href="/#customize"
                  onClick={() => setMobileNavOpen(false)}
                  className="py-2.5 px-1 font-public-sans text-sm font-medium text-[#181818] hover:text-[#2563EB] transition-colors"
                >
                  Custom dataset
                </Link>

                {/* Resources Accordion */}
                <div className="mt-1">
                  <button
                    type="button"
                    onClick={() => setDrawerAccordion(drawerAccordion === 'resources' ? null : 'resources')}
                    className="flex w-full items-center justify-between py-2.5 px-1 font-public-sans text-sm font-medium text-[#181818] hover:text-[#2563EB] transition-colors"
                  >
                    <span>Resources</span>
                    <Chevron open={drawerAccordion === 'resources'} />
                  </button>
                  {drawerAccordion === 'resources' && (
                    <div className="mt-1 flex flex-col gap-1 pl-3 pb-2">
                      <Link href="/about" onClick={() => setMobileNavOpen(false)} className="py-1 text-xs text-[#64748B] hover:text-[#2563EB]">About Macgence</Link>
                      <Link href="/#customize" onClick={() => setMobileNavOpen(false)} className="py-1 text-xs text-[#64748B] hover:text-[#2563EB]">API Documentation</Link>
                      <Link href="/about" onClick={() => setMobileNavOpen(false)} className="py-1 text-xs text-[#64748B] hover:text-[#2563EB]">Terms of Service</Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Profile Card */}
            <div className="pt-4 border-t border-[#F1F5F9] mt-6">
              {user ? (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/profile"
                    onClick={() => setMobileNavOpen(false)}
                    className="flex items-center justify-between rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] p-3 hover:bg-[#DBEAFE] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0F1B3D] text-white font-semibold text-xs shadow-xs">
                        {user.email ? user.email.charAt(0).toUpperCase() : <UserIcon />}
                      </div>
                      <span className="font-public-sans text-sm font-semibold text-[#181818]">My profile</span>
                    </div>
                    <span className="text-[#2563EB] font-bold text-base">›</span>
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      await supabase.auth.signOut()
                      setMobileNavOpen(false)
                      router.refresh()
                    }}
                    className="w-full text-left px-2 py-1 font-public-sans text-xs text-red-600 hover:underline"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileNavOpen(false)
                    open('sign-in')
                  }}
                  className="w-full flex items-center justify-between rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] p-3 hover:bg-[#DBEAFE] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0F1B3D] text-white font-semibold text-xs shadow-xs">
                      <UserIcon />
                    </div>
                    <span className="font-public-sans text-sm font-semibold text-[#181818]">My profile</span>
                  </div>
                  <span className="text-[#2563EB] font-bold text-base">›</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}