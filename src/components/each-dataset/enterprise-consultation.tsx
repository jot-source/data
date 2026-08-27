'use client'

import React, { useState } from 'react'

/*
  Enterprise consultation banner — Figma spec:
  - Banner: 485px h, gradient 90deg #284BBB → #002360, radius 20
  - Ellipse: 430x430 @ left -110 / top 376, rgba(255,255,255,0.1)
  - Left content: offset ~56px, 32px gap heading → list
    Heading: Public Sans 700 32/48 #FFFFFF (max 672px)
    List: 12px gap, items 10px gap, 24px check, Public Sans 600 20/28 #FFFFFF
  - Form card: 383x361, right side, vertically centered, padding 32,
      bg rgba(255,255,255,0.16), border rgba(255,255,255,0.1),
      backdrop blur 5.4px, radius 16
  - Fields: 320 wide, 16px gap, labels Public Sans 500 14/20 #FFFFFF (8px gap)
      select: 48px h, padding 16px 12px, #FFF bg, 1px #ECECEC, radius 8, 12/16 #2B2B2B
      textarea: 96px h, 1px #DDDDDD, radius 8, 12/16 (#616161 placeholder)
  - Button: 320x48, 12px 32px, #2563EB, radius 8, Public Sans 600 16/24 #FFFFFF
      33px gap above
*/

export function EnterpriseConsultation() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    const body = Object.fromEntries(formData)

    const payload = {
      name: 'Enterprise User',
      email: body.email || 'not-provided@enterprise.lead',
      dataType: 'Enterprise Consultation',
      budget: body.budget,
      description: body.description,
    }

    try {
      const res = await fetch('/api/v1/contact', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
      })

      if (res.ok) {
        setSuccess(true)
        e.currentTarget.reset()
      } else {
        alert('Failed to send request. Please try again later.')
      }
    } catch {
      alert('An error occurred while sending your request.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="relative mt-12 overflow-hidden"
      style={{
        minHeight: 485,
        borderRadius: 20,
        background: 'linear-gradient(90deg, #284BBB 0%, #002360 99.99%)',
      }}
    >
      {/* Ellipse — bottom left */}
      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          width: 430,
          height: 430,
          left: -110,
          top: 376,
          background: 'rgba(255, 255, 255, 0.1)',
        }}
      />

      <div className="relative z-10 flex flex-col gap-10 p-8 lg:min-h-[485px] lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:py-[63px] lg:pl-[56px] lg:pr-[65px]">

        {/* Left: heading + checklist */}
        <div className="flex max-w-[672px] flex-col" style={{ gap: 32 }}>
          <h2
            style={{
              fontFamily: "'Public Sans', sans-serif",
              fontWeight: 700,
              fontSize: 32,
              lineHeight: '48px',
              color: '#FFFFFF',
            }}
          >
            Need enterprise pricing? Schedule a consultation.
          </h2>

          <ul className="flex flex-col" style={{ gap: 12 }}>
            {['Volume discounts', 'Multi-year terms', 'Dedicated manager'].map((item) => (
              <li key={item} className="flex items-center" style={{ gap: 10 }}>
                <CheckIcon />
                <span
                  style={{
                    fontFamily: "'Public Sans', sans-serif",
                    fontWeight: 600,
                    fontSize: 20,
                    lineHeight: '28px',
                    color: '#FFFFFF',
                  }}
                >
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: glass form card — 383x361, padding 32 */}
        <div
          className="w-full shrink-0 lg:w-[383px]"
          style={{
            minHeight: 361,
            padding: 32,
            background: 'rgba(255, 255, 255, 0.16)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(5.4px)',
            WebkitBackdropFilter: 'blur(5.4px)',
            borderRadius: 16,
          }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: 33 }}>
            <div className="flex flex-col" style={{ gap: 16 }}>

              {/* Budget range */}
              <div className="flex flex-col" style={{ gap: 8 }}>
                <label
                  htmlFor="ent-budget"
                  style={{
                    fontFamily: "'Public Sans', sans-serif",
                    fontWeight: 500,
                    fontSize: 14,
                    lineHeight: '20px',
                    color: '#FFFFFF',
                  }}
                >
                  Budget range
                </label>
                <div className="relative">
                  <select
                    id="ent-budget"
                    name="budget"
                    required
                    defaultValue="Under $15k"
                    className="w-full appearance-none focus:outline-none"
                    style={{
                      height: 48,
                      padding: '0 32px 0 12px',
                      background: '#FFFFFF',
                      border: '1px solid #ECECEC',
                      borderRadius: 8,
                      fontFamily: "'Public Sans', sans-serif",
                      fontWeight: 400,
                      fontSize: 12,
                      lineHeight: '16px',
                      color: '#2B2B2B',
                    }}
                  >
                    <option value="Under $15k">Under $15k</option>
                    <option value="$15k - $50k">$15k - $50k</option>
                    <option value="$50k+">$50k+</option>
                  </select>
                  <SelectChevron />
                </div>
              </div>

              {/* Project Description */}
              <div className="flex flex-col" style={{ gap: 8 }}>
                <label
                  htmlFor="ent-description"
                  style={{
                    fontFamily: "'Public Sans', sans-serif",
                    fontWeight: 500,
                    fontSize: 14,
                    lineHeight: '20px',
                    color: '#FFFFFF',
                  }}
                >
                  Project Description
                </label>
                <textarea
                  id="ent-description"
                  name="description"
                  required
                  placeholder="Describe the AI use case you are building and what data you need..."
                  className="w-full resize-none focus:outline-none placeholder:text-[#616161]"
                  style={{
                    height: 96,
                    padding: '16px 12px',
                    background: '#FFFFFF',
                    border: '1px solid #DDDDDD',
                    borderRadius: 8,
                    fontFamily: "'Public Sans', sans-serif",
                    fontWeight: 400,
                    fontSize: 12,
                    lineHeight: '16px',
                    color: '#2B2B2B',
                  }}
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex flex-col" style={{ gap: 12 }}>
              <button
                type="submit"
                disabled={loading}
                className="w-full transition-colors hover:bg-[#1D4ED8] focus:outline-none disabled:opacity-70"
                style={{
                  height: 48,
                  padding: '12px 32px',
                  background: '#2563EB',
                  borderRadius: 8,
                  fontFamily: "'Public Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: 16,
                  lineHeight: '24px',
                  color: '#FFFFFF',
                }}
              >
                {loading ? 'Submitting...' : 'Schedule call'}
              </button>

              {success && (
                <p
                  className="text-center"
                  style={{
                    fontFamily: "'Public Sans', sans-serif",
                    fontWeight: 500,
                    fontSize: 14,
                    lineHeight: '20px',
                    color: '#4ADE80',
                  }}
                >
                  Request submitted successfully!
                </p>
              )}
            </div>
          </form>
        </div>

      </div>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <polyline points="19.5 6.5 9 17.5 4.5 13"></polyline>
    </svg>
  )
}

function SelectChevron() {
  return (
    <svg
      width="14"
      height="8"
      viewBox="0 0 14 8"
      fill="none"
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
    >
      <path
        d="M1 1l6 6 6-6"
        stroke="#181818"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}