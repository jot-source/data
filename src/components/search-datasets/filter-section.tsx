// components/datasets/filter-section.tsx
// Collapsible "Industry / Modality / Usecase / …" panel used throughout the
// filters sidebar. Uncontrolled <details> — no state needed for open/closed,
// and it's keyboard/AT accessible for free.
export function FilterSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-xl border border-[#ECECEC] bg-white shadow-xs transition-all [&_summary::-webkit-details-marker]:hidden"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 font-public-sans text-sm font-semibold text-[#181818] transition-colors hover:text-[#2563EB]">
        {title}
        <svg
          width="12"
          height="7"
          viewBox="0 0 12 7"
          fill="none"
          className="text-[#64748B] transition-transform duration-200 group-open:rotate-180"
          aria-hidden="true"
        >
          <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <div className="border-t border-[#ECECEC] px-3 py-2.5">{children}</div>
    </details>
  )
}
