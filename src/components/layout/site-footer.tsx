// components/layout/site-footer.tsx
// Dark site-wide footer — brand blurb + SERVICES / SOLUTIONS / COMPANY link
// columns, and a bottom copyright bar. Static content for now (no CMS yet).
import { BrandLogo } from '@/components/landing'

const COLUMNS: { heading: string; links: string[] }[] = [
  {
    heading: 'SERVICES',
    links: ['Custom Data Sourcing', 'Data Annotations / Enhancements', 'Localization', 'Crowd as a service', 'Content Moderation'],
  },
  {
    heading: 'SOLUTIONS',
    links: [
      'Computer Vision',
      'Data Annotations / Enhancements',
      'Conversational AI',
      'Neutral Language Processing',
      'Document AI',
      'Generative AI',
      'Healthcare',
      'ADAS',
    ],
  },
  {
    heading: 'COMPANY',
    links: ['About Macgence', 'Become a provider', 'Careers', 'Contact', 'In the media', 'JOB'],
  },
]

export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer
      className="relative overflow-hidden px-6 sm:px-12 md:px-16 lg:px-[120px] pb-10 pt-16 text-white"
      style={{
        background:
          'radial-gradient(ellipse 60% 80% at 8% 50%, rgba(37, 99, 235, 0.2) 0%, transparent 65%), radial-gradient(ellipse 60% 80% at 92% 50%, rgba(59, 130, 246, 0.16) 0%, transparent 65%), #0B1220',
      }}
    >
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="flex flex-col items-start">
          <BrandLogo variant="dark" />
          <p className="mt-4 max-w-xs font-public-sans text-sm leading-relaxed text-[#94A3B8]">
            The marketplace for high-quality AI training data. Built for teams that ship models to production.
          </p>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.heading}>
            <h3 className="font-public-sans text-xs font-bold tracking-wider text-[#94A3B8] uppercase">
              {column.heading}
            </h3>
            <ul className="mt-4 flex flex-col gap-3">
              {column.links.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="font-public-sans text-sm font-normal text-[#CBD5E1] transition-colors hover:text-white"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-16 flex max-w-[1200px] flex-col gap-4 border-t border-white/10 pt-8 font-public-sans text-xs text-[#64748B] sm:flex-row sm:items-center sm:justify-between">
        <span>COPYRIGHT © {year} — MACGENCE</span>
        <div className="flex items-center gap-6">
          <a href="#" className="transition-colors hover:text-white">Privacy Policy</a>
          <span aria-hidden="true" className="text-white/20">·</span>
          <a href="#" className="transition-colors hover:text-white">Terms of Service</a>
        </div>
      </div>
    </footer>
  )
}
