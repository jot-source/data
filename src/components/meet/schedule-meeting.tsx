'use client'

import React, { useState, useEffect } from 'react'
import {
  Calendar as CalendarIcon,
  Video,
  Clock,
  Globe,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Copy,
  Check,
  User,
  Mail,
  Building2,
  MessageSquare,
  ArrowLeft,
  Sparkles,
  AlertCircle
} from 'lucide-react'

interface TimeSlot {
  time: string
  available: boolean
}

interface ConfirmedBooking {
  id?: string
  date: string
  timeSlot: string
  meetLink?: string
  name?: string
  email?: string
  organization?: string
  role?: string
  notes?: string
}

// Global list of major international timezones
const TIMEZONES = [
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST - India, UTC+5:30)' },
  { value: 'America/New_York', label: 'America/New_York (EST/EDT - US East, UTC-4)' },
  { value: 'America/Chicago', label: 'America/Chicago (CST/CDT - US Central, UTC-5)' },
  { value: 'America/Denver', label: 'America/Denver (MST/MDT - US Mountain, UTC-6)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST/PDT - US Pacific, UTC-7)' },
  { value: 'Europe/London', label: 'Europe/London (GMT/BST - UK, UTC+1)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CET/CEST - Central Europe, UTC+2)' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin (CET/CEST - Germany, UTC+2)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST - UAE, UTC+4)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT - Singapore, UTC+8)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST - Japan, UTC+9)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST/AEDT - Sydney, UTC+10)' },
  { value: 'UTC', label: 'UTC (Universal Coordinated Time)' },
]

function getTimezoneOffsetLabel(timezone: string): string {
  try {
    const now = new Date()
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short',
    })
    const parts = formatter.formatToParts(now)
    const tzPart = parts.find((p) => p.type === 'timeZoneName')
    return tzPart ? tzPart.value : timezone
  } catch {
    return timezone
  }
}

function convertSlotTimeToZone(dateStr: string, slotTimeStr: string, targetTimezone: string): string {
  if (!slotTimeStr) return ''
  try {
    const [time, period] = slotTimeStr.split(' ')
    let [hours, minutes] = time.split(':').map(Number)
    if (period === 'PM' && hours < 12) hours += 12
    if (period === 'AM' && hours === 12) hours = 0

    const hh = String(hours).padStart(2, '0')
    const mm = String(minutes).padStart(2, '0')

    const istIso = `${dateStr}T${hh}:${mm}:00+05:30`
    const dateObj = new Date(istIso)

    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: targetTimezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    return formatter.format(dateObj)
  } catch {
    return slotTimeStr
  }
}

const HOLIDAYS: Record<string, string> = {
  '01-01': "New Year's Day",
  '01-26': 'Republic Day',
  '05-01': 'Labor Day',
  '08-15': 'Independence Day',
  '10-02': 'Gandhi Jayanti',
  '12-25': 'Christmas',
  '12-31': "New Year's Eve",
}

function checkIsHoliday(dayDate: Date): string | null {
  const mm = String(dayDate.getMonth() + 1).padStart(2, '0')
  const dd = String(dayDate.getDate()).padStart(2, '0')
  return HOLIDAYS[`${mm}-${dd}`] || null
}

function checkIsWeekend(dayDate: Date): boolean {
  const day = dayDate.getDay()
  return day === 0 || day === 6
}

function formatDateYYYYMMDD(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Popular global timezones for user selection
const POPULAR_TIMEZONES = [
  { value: 'America/New_York', label: 'US Eastern Time (New York)' },
  { value: 'America/Chicago', label: 'US Central Time (Chicago)' },
  { value: 'America/Denver', label: 'US Mountain Time (Denver)' },
  { value: 'America/Los_Angeles', label: 'US Pacific Time (Los Angeles)' },
  { value: 'Europe/London', label: 'UK Time (London)' },
  { value: 'Europe/Paris', label: 'Central European Time (Paris)' },
  { value: 'Asia/Kolkata', label: 'India Standard Time (Kolkata)' },
  { value: 'Asia/Dubai', label: 'Gulf Standard Time (Dubai)' },
  { value: 'Asia/Singapore', label: 'Singapore Time (Singapore)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (Tokyo)' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (Sydney)' },
]

function getTimezoneOffsetString(timeZone: string): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'shortOffset' })
    const parts = formatter.formatToParts(new Date())
    const tzPart = parts.find((p) => p.type === 'timeZoneName')
    return tzPart ? tzPart.value : 'GMT'
  } catch {
    return 'GMT'
  }
}

export function ScheduleMeeting() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  
  // Timezone state with browser auto-detection
  const [userTimezone, setUserTimezone] = useState<string>('Asia/Kolkata')

  useEffect(() => {
    try {
      const detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone
      if (detectedTz) {
        setUserTimezone(detectedTz)
      }
    } catch {
      // Fallback
    }
  }, [])

  // Date selection state
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date()
    while (checkIsWeekend(today) || checkIsHoliday(today)) {
      today.setDate(today.getDate() + 1)
    }
    return formatDateYYYYMMDD(today)
  })
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('')
  
  // Slot availability
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    role: '',
    budgetRange: 'Under $15k',
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [bookingError, setBookingError] = useState('')
  
  // Confirmation state
  const [confirmedBooking, setConfirmedBooking] = useState<ConfirmedBooking | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)

  // Fetch slot availability when selectedDate changes
  useEffect(() => {
    async function fetchSlots() {
      setLoadingSlots(true)
      try {
        const res = await fetch(`/api/v1/meet/slots?date=${selectedDate}`)
        const data = await res.json()
        if (data.success && data.slots) {
          setSlots(data.slots)
        }
      } catch (err) {
        console.error('Failed to load slots:', err)
      } finally {
        setLoadingSlots(false)
      }
    }
    fetchSlots()
  }, [selectedDate])

  // Month navigation helpers
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const prevMonth = () => {
    const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    if (prev.getMonth() >= new Date().getMonth() || prev.getFullYear() > new Date().getFullYear()) {
      setCurrentMonth(prev)
    }
  }

  // Calendar rendering math
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDayOfWeek = new Date(year, month, 1).getDay()

    const days: (Date | null)[] = []
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null)
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(year, month, d))
    }
    return days
  }

  const daysGrid = getDaysInMonth(currentMonth)
  const todayStr = formatDateYYYYMMDD(new Date())

  const handleDateClick = (dayDate: Date) => {
    const dateStr = formatDateYYYYMMDD(dayDate)
    if (dateStr < todayStr || checkIsWeekend(dayDate) || checkIsHoliday(dayDate)) return // Disable past, weekend, and holiday dates
    setSelectedDate(dateStr)
    setSelectedTimeSlot('') // Reset selected time
  }

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email) {
      setBookingError('Please fill in your name and email address.')
      return
    }

    setSubmitting(true)
    setBookingError('')

    try {
      const res = await fetch('/api/v1/meet/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          timeSlot: selectedTimeSlot,
          name: formData.name,
          email: formData.email,
          organization: formData.organization,
          role: formData.role,
          budgetRange: formData.budgetRange,
          notes: formData.notes,
        }),
      })

      const data = await res.json()
      if (data.success && data.booking) {
        setConfirmedBooking(data.booking)
        setStep(3)
      } else {
        setBookingError(data.error || 'Failed to complete booking. Please try another slot.')
      }
    } catch {
      setBookingError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopyLink = () => {
    if (confirmedBooking?.meetLink) {
      navigator.clipboard.writeText(confirmedBooking.meetLink)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-public-sans text-[#181818] pb-24">
      {/* Hero Header Section */}
      <section className="relative overflow-hidden bg-white border-b border-[#E2E8F0] py-12 px-6 md:py-16">
        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[#2563EB]/5 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-[#2563EB]/10 blur-3xl" />

        <div className="mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#2563EB]/10 px-3.5 py-1.5 text-xs font-semibold text-[#2563EB] mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Direct 1-on-1 Consultation</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#181818] leading-tight mb-4">
            Schedule a <span className="text-[#2563EB]">Discovery Call</span>
          </h1>

          <p className="mx-auto max-w-2xl text-base md:text-lg text-[#475569] leading-relaxed mb-8">
            Book a 30-minute session with our AI data specialists to discuss your custom dataset requirements, data annotation needs, or enterprise solutions.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-medium text-[#475569]">
            <div className="flex items-center gap-2 bg-[#F1F5F9] px-3.5 py-2 rounded-lg border border-[#E2E8F0]">
              <Clock className="h-4 w-4 text-[#2563EB]" />
              <span>30 Min Call</span>
            </div>
            <div className="flex items-center gap-2 bg-[#F1F5F9] px-3.5 py-2 rounded-lg border border-[#E2E8F0]">
              <Video className="h-4 w-4 text-[#2563EB]" />
              <span>Google Meet Included</span>
            </div>
            <div className="flex items-center gap-2 bg-[#F1F5F9] px-3.5 py-2 rounded-lg border border-[#E2E8F0]">
              <Globe className="h-4 w-4 text-[#2563EB]" />
              <span>Auto Timezone Sync</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Scheduling Widget Container */}
      <main className="mx-auto max-w-5xl px-4 sm:px-6 pt-10">
        <div className="rounded-2xl border border-[#CBD5E1] bg-white shadow-xl shadow-slate-200/50 overflow-hidden transition-all">
          
          {/* Progress Header */}
          <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-[#F8FAFC] px-6 py-4">
            <div className="flex items-center gap-2.5">
              <CalendarIcon className="h-5 w-5 text-[#2563EB]" />
              <span className="font-semibold text-sm sm:text-base text-[#181818]">
                {step === 1 && 'Select Date & Time Slot'}
                {step === 2 && 'Enter Your Booking Details'}
                {step === 3 && 'Booking Confirmed!'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#616161]">
              <span className={`px-2.5 py-1 rounded-full ${step === 1 ? 'bg-[#2563EB] text-white' : 'bg-[#E2E8F0] text-[#475569]'}`}>Step 1</span>
              <span>→</span>
              <span className={`px-2.5 py-1 rounded-full ${step === 2 ? 'bg-[#2563EB] text-white' : 'bg-[#E2E8F0] text-[#475569]'}`}>Step 2</span>
            </div>
          </div>

          {/* STEP 1: Date & Time Picker */}
          {step === 1 && (
            <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Datepicker */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-base text-[#181818]">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={prevMonth}
                      className="p-2 rounded-lg border border-[#CBD5E1] hover:bg-[#F1F5F9] transition-colors"
                      aria-label="Previous Month"
                    >
                      <ChevronLeft className="h-4 w-4 text-[#181818]" />
                    </button>
                    <button
                      onClick={nextMonth}
                      className="p-2 rounded-lg border border-[#CBD5E1] hover:bg-[#F1F5F9] transition-colors"
                      aria-label="Next Month"
                    >
                      <ChevronRight className="h-4 w-4 text-[#181818]" />
                    </button>
                  </div>
                </div>

                {/* Calendar Days Header */}
                <div className="grid grid-cols-7 text-center text-xs font-semibold text-[#616161] py-2 border-b border-[#E2E8F0]">
                  <span>Sun</span>
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                </div>

                {/* Calendar Days Grid */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {daysGrid.map((dayDate, idx) => {
                    if (!dayDate) {
                      return <div key={`empty-${idx}`} className="h-10 sm:h-12" />
                    }
                    const dateStr = formatDateYYYYMMDD(dayDate)
                    const isPast = dateStr < todayStr
                    const isWeekend = checkIsWeekend(dayDate)
                    const holidayName = checkIsHoliday(dayDate)
                    const isDisabled = isPast || isWeekend || Boolean(holidayName)
                    const isSelected = dateStr === selectedDate
                    const isToday = dateStr === todayStr

                    return (
                      <button
                        key={dateStr}
                        disabled={isDisabled}
                        onClick={() => handleDateClick(dayDate)}
                        title={holidayName ? `Holiday: ${holidayName}` : isWeekend ? 'Weekend (Closed)' : undefined}
                        className={`h-10 sm:h-12 rounded-xl text-xs sm:text-sm font-semibold flex flex-col items-center justify-center transition-all relative ${
                          isSelected
                            ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
                            : isDisabled
                            ? 'text-[#CBD5E1] cursor-not-allowed bg-[#F8FAFC] opacity-60'
                            : isToday
                            ? 'border-2 border-[#2563EB] text-[#2563EB] hover:bg-[#EFF6FF]'
                            : 'text-[#181818] hover:bg-[#F1F5F9] border border-transparent'
                        }`}
                      >
                        <span>{dayDate.getDate()}</span>
                        {holidayName && !isPast && (
                          <span className="text-[7px] sm:text-[8px] font-medium text-[#F43F5E] leading-none">Holiday</span>
                        )}
                        {isWeekend && !isPast && !holidayName && (
                          <span className="text-[7px] sm:text-[8px] font-medium text-[#94A3B8] leading-none">Off</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Right Column: Time Slots */}
              <div className="lg:col-span-5 flex flex-col gap-4 border-t lg:border-t-0 lg:border-l border-[#E2E8F0] pt-6 lg:pt-0 lg:pl-8">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-base text-[#181818]">Select Time Slot</h3>
                    <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2563EB] bg-[#EFF6FF] px-2.5 py-1 rounded-full border border-[#BFDBFE]">
                      <Globe className="h-3.5 w-3.5" />
                      <span>International Sync</span>
                    </div>
                  </div>

                  {/* Timezone Selector Dropdown */}
                  <div className="flex flex-col gap-1">
                    <label htmlFor="tz-select" className="text-xs font-semibold text-[#475569] flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-[#2563EB]" />
                      <span>Your Time Zone:</span>
                    </label>
                    <div className="relative">
                      <select
                        id="tz-select"
                        value={userTimezone}
                        onChange={(e) => setUserTimezone(e.target.value)}
                        className="w-full h-10 pl-3 pr-8 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] text-xs font-medium text-[#181818] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all cursor-pointer appearance-none"
                      >
                        {!TIMEZONES.some((t) => t.value === userTimezone) && (
                          <option value={userTimezone}>{userTimezone} (Auto-detected)</option>
                        )}
                        {TIMEZONES.map((tz) => (
                          <option key={tz.value} value={tz.value}>
                            {tz.label}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[#64748B]">
                    {formatDisplayDate(selectedDate)} • Timezone: <strong className="text-[#181818]">{getTimezoneOffsetLabel(userTimezone)}</strong>
                  </p>
                </div>

                {loadingSlots ? (
                  <div className="flex flex-col gap-2.5 py-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-11 rounded-xl bg-slate-100 animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5 max-h-[320px] overflow-y-auto pr-1">
                    {slots.map((slot) => {
                      const isSelected = selectedTimeSlot === slot.time
                      const convertedTime = convertSlotTimeToZone(selectedDate, slot.time, userTimezone)

                      return (
                        <button
                          key={slot.time}
                          disabled={!slot.available}
                          onClick={() => setSelectedTimeSlot(slot.time)}
                          className={`h-12 rounded-xl text-xs sm:text-sm font-semibold flex flex-col items-center justify-center transition-all border p-1 ${
                            !slot.available
                              ? 'bg-[#F1F5F9] text-[#94A3B8] border-[#E2E8F0] line-through cursor-not-allowed'
                              : isSelected
                              ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-md shadow-blue-500/20'
                              : 'bg-white text-[#181818] border-[#CBD5E1] hover:border-[#2563EB] hover:text-[#2563EB]'
                          }`}
                        >
                          <span className="font-bold">{convertedTime}</span>
                          {userTimezone !== 'Asia/Kolkata' && (
                            <span className={`text-[10px] font-normal ${isSelected ? 'text-blue-100' : 'text-[#64748B]'}`}>
                              ({slot.time} IST)
                            </span>
                          )}
                          {!slot.available && <span className="text-[10px] no-underline font-normal">(Booked)</span>}
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Continue to Step 2 Button */}
                <button
                  disabled={!selectedTimeSlot}
                  onClick={() => setStep(2)}
                  className="mt-auto w-full h-12 rounded-xl bg-[#2563EB] text-sm font-semibold text-white transition-all hover:bg-[#1D4FD7] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <span>Continue to Details</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Details Form */}
          {step === 2 && (
            <div className="p-6 md:p-8 max-w-2xl mx-auto">
              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#616161] hover:text-[#181818] mb-6"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Date & Time selection</span>
              </button>

              <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-4 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-5 w-5 text-[#2563EB]" />
                  <div>
                    <p className="text-sm font-semibold text-[#181818]">{formatDisplayDate(selectedDate)}</p>
                    <p className="text-xs text-[#475569]">
                      {convertSlotTimeToZone(selectedDate, selectedTimeSlot, userTimezone)} ({getTimezoneOffsetLabel(userTimezone)}) • 30 min discovery call
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs font-semibold text-[#2563EB] hover:underline"
                >
                  Change
                </button>
              </div>

              {bookingError && (
                <div className="bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl p-4 mb-6 text-xs text-[#DC2626] flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{bookingError}</span>
                </div>
              )}

              <form onSubmit={handleBookingSubmit} className="flex flex-col gap-4">
                <div>
                  <label htmlFor="name" className="block text-xs font-semibold text-[#475569] mb-1.5">
                    Your Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-[#94A3B8]" />
                    <input
                      id="name"
                      type="text"
                      required
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#CBD5E1] text-sm text-[#181818] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-[#475569] mb-1.5">
                    Work Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-[#94A3B8]" />
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="john@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#CBD5E1] text-sm text-[#181818] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="organization" className="block text-xs font-semibold text-[#475569] mb-1.5">
                      Organization / Company
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-3.5 h-4 w-4 text-[#94A3B8]" />
                      <input
                        id="organization"
                        type="text"
                        placeholder="Acme AI Inc."
                        value={formData.organization}
                        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                        className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#CBD5E1] text-sm text-[#181818] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="budgetRange" className="block text-xs font-semibold text-[#475569] mb-1.5">
                      Estimated Project Budget *
                    </label>
                    <select
                      id="budgetRange"
                      value={formData.budgetRange}
                      onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl border border-[#CBD5E1] text-sm text-[#181818] bg-white outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                    >
                      <option value="Under $15k">Under $15k</option>
                      <option value="$15k - $50k">$15k - $50k</option>
                      <option value="$50k+">$50k+ (High Budget / Enterprise)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-xs font-semibold text-[#475569] mb-1.5">
                    Dataset Requirements / Meeting Notes
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3.5 top-3.5 h-4 w-4 text-[#94A3B8]" />
                    <textarea
                      id="notes"
                      rows={3}
                      placeholder="Tell us what dataset scope, language, or annotation quality you are looking for..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full py-2.5 pl-10 pr-4 rounded-xl border border-[#CBD5E1] text-sm text-[#181818] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-2 w-full h-12 rounded-xl bg-[#2563EB] text-sm font-semibold text-white transition-all hover:bg-[#1D4FD7] active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <span>Confirming Booking...</span>
                  ) : (
                    <span>Confirm & Schedule Meeting</span>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP 3: Confirmation View */}
          {step === 3 && confirmedBooking && (
            <div className="p-8 max-w-2xl mx-auto flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center mb-4 shadow-sm">
                <CheckCircle2 className="h-10 w-10" />
              </div>

              <h2 className="text-2xl font-bold text-[#181818] mb-1">Your Call is Scheduled!</h2>
              <p className="text-sm text-[#475569] mb-8">
                A calendar invitation with Google Meet video link has been dispatched to <strong>{confirmedBooking.email}</strong>.
              </p>

              {/* Meeting Card */}
              <div className="w-full rounded-2xl border border-[#CBD5E1] bg-[#F8FAFC] p-6 text-left flex flex-col gap-4 mb-8">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#181818]">
                    <CalendarIcon className="h-4 w-4 text-[#2563EB]" />
                    <span>{formatDisplayDate(confirmedBooking.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#2563EB] bg-[#EFF6FF] px-3 py-1 rounded-full">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{convertSlotTimeToZone(confirmedBooking.date, confirmedBooking.timeSlot, userTimezone)} ({getTimezoneOffsetLabel(userTimezone)}) • 30 min</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 text-sm">
                  <p className="text-[#475569]"><strong>Host:</strong> Macgence AI Data Specialist</p>
                  <p className="text-[#475569]"><strong>Attendee:</strong> {confirmedBooking.name} ({confirmedBooking.email})</p>
                </div>

                {/* Google Meet Link Action Box */}
                <div className="mt-2 rounded-xl bg-white border border-[#CBD5E1] p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center shrink-0">
                      <Video className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-semibold text-[#181818]">Google Meet Video Link</p>
                      <p className="text-xs text-[#2563EB] truncate max-w-[220px] sm:max-w-[280px]">
                        {confirmedBooking.meetLink}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleCopyLink}
                      className="flex-1 sm:flex-none h-9 px-3 rounded-lg border border-[#CBD5E1] text-xs font-medium text-[#181818] hover:bg-[#F1F5F9] transition-colors flex items-center justify-center gap-1.5"
                    >
                      {copiedLink ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                    </button>

                    <a
                      href={confirmedBooking.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-none h-9 px-4 rounded-lg bg-[#2563EB] text-xs font-semibold text-white hover:bg-[#1D4FD7] transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Join Meet</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setStep(1)
                    setSelectedTimeSlot('')
                    setFormData({ name: '', email: '', organization: '', role: '', budgetRange: 'Under $15k', notes: '' })
                  }}
                  className="h-11 px-6 rounded-xl bg-[#2563EB] text-xs font-semibold text-white hover:bg-[#1D4FD7] shadow-sm transition-colors"
                >
                  Schedule Another Call
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
