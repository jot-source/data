'use client'

import React, { useState } from 'react'
import Link from 'next/link'

/*
  FAQ section — Figma spec:
  - Section: #FFFFFF, padding 80px 120px, columns justify-between, gap 130px
  - Left (472px): heading 24px gap subtitle, 32px gap button
    Heading: Public Sans 600 48/64 #181818 (max 417px)
    Subtitle: Public Sans 400 20/28 #616161
    Button: 172x48, 12px 24px, #2563EB, radius 8, Public Sans 600 16/24 #FFF
  - Right (456px): 12px gap between fields
    Field: padding 20px 16px, radius 12, border #DDDDDD (closed) / #2565EB (open)
    Question: Public Sans 500 14/20 — #181818 closed, #2565EB open
    Answer: Public Sans 400 12/16 #616161, 20px gap below question
  - One item open at a time, smooth height animation, no focus squares
*/

const FAQS = [
  {
    id: 1,
    question: 'What licensing options do you offer?',
    answer:
      'We offer research, commercial, and enterprise licensing tiers. Research licenses restrict commercial use; commercial licenses cover production deployment; enterprise licenses include redistribution rights and SLAs. Full terms are available in our Terms of Service before purchase.',
  },
  {
    id: 2,
    question: 'How do you ensure data quality?',
    answer:
      'Every dataset goes through a rigorous multi-stage QA process, including automated validation scripts and human-in-the-loop review by domain experts to guarantee high accuracy.',
  },
  {
    id: 3,
    question: 'Can I get a custom dataset?',
    answer:
      'Yes! If you cannot find what you need in our marketplace, you can submit your requirements for a custom data collection or annotation project.',
  },
  {
    id: 4,
    question: 'What formats are datasets delivered in?',
    answer:
      'We support standard formats such as JSON, CSV, JSONL, and specialized formats for computer vision (COCO, YOLO) and audio (WAV, MP3) depending on the dataset type.',
  },
  {
    id: 5,
    question: 'How is my data kept secure?',
    answer:
      'All datasets are encrypted end to end, in transit and at rest. Access is controlled via signed, time-limited download URLs, and every download is logged for auditability.',
  },
  {
    id: 6,
    question: 'Do you offer refunds?',
    answer:
      'Since data is a digital asset, we generally do not offer refunds once a dataset has been downloaded. We recommend downloading the free sample packet to verify suitability before purchase.',
  },
]

export function FaqSection() {
  const [openId, setOpenId] = useState<number | null>(1)

  const toggle = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id))
  }

  return (
    <section
      className="w-full"
      style={{ background: '#FFFFFF', paddingTop: 80, paddingBottom: 80 }}
    >
      <div className="mx-auto flex max-w-[1200px] flex-col justify-between gap-16 px-5 lg:flex-row lg:items-start lg:gap-[130px]">

        {/* Left: heading, subtitle, CTA */}
        <div className="flex w-full max-w-[472px] flex-col" style={{ gap: 32 }}>
          <div className="flex flex-col" style={{ gap: 24 }}>
            <h2
              style={{
                fontFamily: "'Public Sans', sans-serif",
                fontWeight: 600,
                fontSize: 48,
                lineHeight: '64px',
                color: '#181818',
                maxWidth: 417,
              }}
            >
              Questions before you buy
            </h2>
            <p
              style={{
                fontFamily: "'Public Sans', sans-serif",
                fontWeight: 400,
                fontSize: 20,
                lineHeight: '28px',
                color: '#616161',
              }}
            >
              Licensing, quality, delivery the answers teams ask before signing.
            </p>
          </div>

          <div>
            <Link
              href="/meet"
              className="inline-flex items-center justify-center transition-colors hover:bg-[#1D4ED8] focus:outline-none"
              style={{
                width: 172,
                height: 48,
                padding: '12px 24px',
                background: '#2563EB',
                borderRadius: 8,
                fontFamily: "'Public Sans', sans-serif",
                fontWeight: 600,
                fontSize: 16,
                lineHeight: '24px',
                color: '#FFFFFF',
              }}
            >
              Talk to the Team
            </Link>
          </div>
        </div>

        {/* Right: accordion — 456px, 12px gap, one open at a time */}
        <div className="flex w-full flex-col lg:max-w-[456px]" style={{ gap: 12 }}>
          {FAQS.map((faq) => {
            const isOpen = openId === faq.id

            return (
              <div
                key={faq.id}
                className="w-full overflow-hidden transition-colors duration-300"
                style={{
                  background: '#FFFFFF',
                  border: `1px solid ${isOpen ? '#2565EB' : '#DDDDDD'}`,
                  borderRadius: 12,
                }}
              >
                {/* Question row */}
                <button
                  type="button"
                  onClick={() => toggle(faq.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-2 text-left outline-none focus:outline-none focus-visible:outline-none"
                  style={{
                    padding: '20px 16px',
                    background: 'transparent',
                    border: 'none',
                  }}
                >
                  <span
                    className="transition-colors duration-300"
                    style={{
                      fontFamily: "'Public Sans', sans-serif",
                      fontWeight: 500,
                      fontSize: 14,
                      lineHeight: '20px',
                      color: isOpen ? '#2565EB' : '#181818',
                    }}
                  >
                    {faq.question}
                  </span>
                  <ChevronIcon
                    className="shrink-0 transition-transform duration-300 ease-in-out"
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      color: isOpen ? '#2565EB' : '#111111',
                    }}
                  />
                </button>

                {/* Answer — smooth grid-rows height animation */}
                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-in-out"
                  style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                >
                  <div className="min-h-0 overflow-hidden">
                    <p
                      style={{
                        fontFamily: "'Public Sans', sans-serif",
                        fontWeight: 400,
                        fontSize: 12,
                        lineHeight: '16px',
                        color: '#616161',
                        padding: '0 16px 20px 16px',
                      }}
                    >
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}

function ChevronIcon({
  className,
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className={className}
      style={style}
    >
      <path
        d="M4 7.5 L10 13 L16 7.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}