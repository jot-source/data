'use client'

import { useState } from 'react'
import { BrandLogo } from '@/components/landing'

const COLUMNS: { heading: string; links: string[] }[] = [
  {
    heading: 'Services',
    links: ['Custom data sourcing', 'Data annotations / Enhancements', 'Localization', 'Crowd as a service', 'Content moderation'],
  },
  {
    heading: 'Solutions',
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
    heading: 'Company',
    links: ['About Macgence', 'Become a provider', 'Careers', 'Contact', 'In the media', 'JOB'],
  },
]

export function SiteFooter() {
  const year = new Date().getFullYear()
  const [openSection, setOpenSection] = useState<string | null>(null)

  const toggleSection = (heading: string) => {
    setOpenSection(openSection === heading ? null : heading)
  }

  return (
    <footer className="w-full max-w-[100vw] relative overflow-x-hidden pb-10 pt-10 sm:pt-16 text-white bg-[#0B0F1F]">
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-5">
        <div className="flex flex-col md:grid md:grid-cols-[1.4fr_1fr_1fr_1fr] md:gap-12">
          
          {/* Brand Info */}
          <div className="flex flex-col items-start mb-8 md:mb-0">
            <BrandLogo variant="dark" />
            <p className="mt-4 max-w-xs font-public-sans text-sm leading-relaxed text-[#94A3B8]">
              The marketplace for high-quality AI training data. Built for teams that ship models to production.
            </p>
          </div>

          {/* Desktop Columns */}
          {COLUMNS.map((column) => (
            <div key={column.heading} className="hidden md:block">
              <h3 className="font-public-sans text-base font-medium text-white">
                {column.heading}
              </h3>
              <ul className="mt-5 flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="font-public-sans text-[14px] font-normal text-[#94A3B8] transition-colors hover:text-white"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Mobile Accordion */}
          <div className="flex flex-col md:hidden border-t border-[#1B2136]">
            {COLUMNS.map((column) => (
              <div key={column.heading} className="border-b border-[#1B2136]">
                <button
                  onClick={() => toggleSection(column.heading)}
                  className="flex w-full items-center justify-between py-4 font-public-sans text-base font-medium text-white focus:outline-none"
                >
                  <span>{column.heading}</span>
                  <span className="text-2xl font-light text-white leading-none">
                    {openSection === column.heading ? '−' : '+'}
                  </span>
                </button>
                
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openSection === column.heading ? 'max-h-[500px] pb-5 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <ul className="flex flex-col gap-3.5">
                    {column.links.map((link) => (
                      <li key={link}>
                        <a
                          href="#"
                          className="font-public-sans text-[14px] font-normal text-[#94A3B8] transition-colors hover:text-white"
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Copyright Bar */}
        <div className="mt-8 flex flex-row items-center justify-between font-public-sans text-[10px] sm:text-xs text-[#94A3B8] pt-4 md:pt-8 md:border-t md:border-[#1B2136]">
          <span className="uppercase tracking-wider">COPYRIGHT©{year} - MACGENCE</span>
          <div className="flex items-center gap-2 sm:gap-6">
            <a href="#" className="transition-colors hover:text-white">Privacy</a>
            <span aria-hidden="true" className="text-white/20 text-xs sm:text-sm leading-none">•</span>
            <a href="#" className="transition-colors hover:text-white">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
