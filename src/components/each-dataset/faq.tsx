'use client'

import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const FAQS = [
  {
    q: 'What licensing options do you offer?',
    a: 'We offer research, commercial, and enterprise licensing tiers. Research licenses restrict commercial use; commercial licenses cover production deployment; enterprise licenses include redistribution rights and SLAs. Full terms are available in our Terms of Service before purchase.'
  },
  {
    q: 'How is pricing calculated for custom quotes?',
    a: 'Custom quotes are based on dataset size, exclusivity, and intended use case. Submit a quote request and our sales team will respond within 1-2 business days with a tailored proposal.'
  },
  {
    q: 'Can I get a sample before purchasing?',
    a: 'Yes. Most datasets offer a free sample or paid test packet so you can validate quality and fit before committing to a full purchase.'
  },
  {
    q: 'What happens if the dataset doesn\u2019t meet my needs?',
    a: 'We offer a satisfaction guarantee on first-time purchases. Reach out to support within 7 days and our team will work with you on a resolution or refund.'
  },
  {
    q: 'Do you support subscription billing?',
    a: 'Yes, datasets with ongoing updates support monthly or annual subscription billing, with prorated upgrades and cancellation anytime.'
  }
]

function FAQItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="rounded-xl border border-[#CBD5E1] bg-white overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-medium text-[#181818]">{q}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-[#616161] transition-transform duration-300 ease-out ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        />
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-4 text-sm text-[#616161] leading-5">{a}</p>
        </div>
      </div>
    </div>
  )
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div id="faq" className="scroll-mt-32 flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-[#181818]">Questions before you buy</h2>
        <p className="text-sm text-[#616161] leading-5">
          Answers to what buyers ask most. Can&apos;t find yours? Reach out and our team will get back within a day.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {FAQS.map((faq, i) => (
          <FAQItem
            key={i}
            q={faq.q}
            a={faq.a}
            isOpen={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? null : i)}
          />
        ))}
      </div>
    </div>
  )
}