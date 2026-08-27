'use client'

import React, { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

const STEPS = [
  {
    id: 1,
    title: 'Discover datasets',
    description: 'Search by industry, use case, or data type. Filter by volume, language, annotation format, and licensing terms.',
    icon: <SearchIcon />,
  },
  {
    id: 2,
    title: 'Preview & Validate',
    description: 'Download free sample packets to verify data structure, check annotation quality, and ensure model compatibility before purchasing.',
    icon: <FileIcon />,
  },
  {
    id: 3,
    title: 'License & Purchase',
    description: 'Select from flexible licensing options tailored for research, commercial use, or enterprise scale, with clear transparent pricing.',
    icon: <BagIcon />,
  },
  {
    id: 4,
    title: 'Download & Integrate',
    description: 'Securely access your full dataset via direct download or API and integrate it directly into your AI training pipelines.',
    icon: <CubeIcon />,
  },
]

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(1)
  const [isHovered, setIsHovered] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const sectionRef = useRef<HTMLElement | null>(null)
  const hasStartedRef = useRef(false)

  // Watch for the section entering the viewport
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)

        // Restart from step 1 the first time it comes into view
        if (entry.isIntersecting && !hasStartedRef.current) {
          hasStartedRef.current = true
          setActiveStep(1)
        }
      },
      { threshold: 0.4 } // starts when ~40% of the section is visible
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Auto-advance steps (2s) — only while in view and not hovered
  useEffect(() => {
    if (!isInView || isHovered) return

    const timer = setInterval(() => {
      setActiveStep((prev) => (prev % 4) + 1)
    }, 2000)

    return () => clearInterval(timer)
  }, [isInView, isHovered])

  return (
    <section id="how-it-works" ref={sectionRef} className="w-full scroll-mt-4 bg-[#F5F8FF] py-24 border-t border-[#CBD5E1]">
      <div className="mx-auto max-w-[1200px] px-5 flex flex-col items-center">

        <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-[#181818] md:text-4xl">
          From discovery to delivery in four steps
        </h2>
        <p className="mb-20 text-center text-base text-[#616161] max-w-2xl">
          A simple, transparent path from finding the right data to getting it in your hands.
        </p>

        {/* Timeline visualization */}
        <div
          className="relative w-full max-w-3xl mb-16"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Background line (gray) */}
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#CBD5E1] -translate-y-1/2 z-0"></div>

          {/* Animated progress line (blue) */}
          <div
            className="absolute top-1/2 left-0 h-[1px] bg-[#2563EB] -translate-y-1/2 z-0 transition-all duration-500 ease-in-out"
            style={{ width: `${((activeStep - 1) / 3) * 100}%` }}
          ></div>

          {/* Step nodes */}
          <div className="relative z-10 flex justify-between items-center w-full">
            {STEPS.map((step) => {
              const isActive = activeStep === step.id
              const isPast = activeStep > step.id

              return (
                <div key={step.id} className="relative flex flex-col items-center">
                  <button
                    onClick={() => setActiveStep(step.id)}
                    className={cn(
                      "flex h-16 w-16 items-center justify-center rounded-full transition-all duration-500",
                      isActive
                        ? "bg-[#2563EB] text-white shadow-[0_0_40px_rgba(37,99,235,0.4)] scale-110 border-none"
                        : isPast
                          ? "bg-white border border-[#2563EB] text-[#2563EB]"
                          : "bg-white border border-[#CBD5E1] text-[#8C8C8C]"
                    )}
                  >
                    {step.icon}
                  </button>

                  {/* Step label (only shows for active) */}
                  <div className={cn(
                    "absolute -bottom-8 font-semibold text-xs transition-opacity duration-300",
                    isActive ? "opacity-100 text-[#181818]" : "opacity-0"
                  )}>
                    STEP {step.id}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Active Step Details Card */}
        <div
          className="w-full max-w-3xl rounded-3xl border border-[#CBD5E1] bg-white p-8 md:p-10 transition-all duration-300"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">
            {/* Big Blue Icon Square */}
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-[#2563EB] text-white transition-all duration-500">
              {STEPS[activeStep - 1].icon}
            </div>

            {/* Text Content */}
            <div className="flex flex-col gap-3">
              <h3 className="text-2xl font-bold text-[#181818]">
                {STEPS[activeStep - 1].title}
              </h3>
              <p className="text-[#616161] leading-relaxed">
                {STEPS[activeStep - 1].description}
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

function SearchIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  )
}

function FileIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  )
}

function BagIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <path d="M16 10a4 4 0 0 1-8 0"></path>
    </svg>
  )
}

function CubeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
      <line x1="12" y1="22.08" x2="12" y2="12"></line>
    </svg>
  )
}