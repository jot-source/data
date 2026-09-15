import crypto from 'crypto'
import { logger } from '@/lib/logger'

export interface MeetingBooking {
  id: string
  date: string // YYYY-MM-DD
  timeSlot: string // e.g. "10:00 AM"
  name: string
  email: string
  organization?: string
  role?: string
  notes?: string
  budgetRange?: string // 'Under $15k' | '$15k - $50k' | '$50k+'
  assignedHost?: string
  meetLink: string
  createdAt: string
}

// Default standard daily time slots for 30-min discovery calls
export const DEFAULT_TIME_SLOTS = [
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '11:30 AM',
  '01:30 PM',
  '02:30 PM',
  '03:30 PM',
  '04:30 PM',
]

// Round-Robin state tracking across server executions
const globalForBookings = globalThis as unknown as {
  bookingsStore?: MeetingBooking[]
  lastAssignedIndex?: number
}

const bookingsStore: MeetingBooking[] = globalForBookings.bookingsStore || [
  {
    id: 'book_demo_1',
    date: new Date().toISOString().split('T')[0], // Today
    timeSlot: '11:00 AM',
    name: 'Sarah Jenkins',
    email: 'sarah.j@ai-labs.io',
    organization: 'AI Labs',
    budgetRange: '$50k+',
    assignedHost: 'hariom.1@macgence.com',
    meetLink: 'https://meet.google.com/abc-defg-hij',
    createdAt: new Date().toISOString(),
  },
]

let lastAssignedIndex = globalForBookings.lastAssignedIndex || 0

if (process.env.NODE_ENV !== 'production') {
  globalForBookings.bookingsStore = bookingsStore
  globalForBookings.lastAssignedIndex = lastAssignedIndex
}

export function getBookingsForDate(dateStr: string): MeetingBooking[] {
  return bookingsStore.filter((b) => b.date === dateStr)
}

export function getSlotAvailability(dateStr: string) {
  const bookedSlots = getBookingsForDate(dateStr).map((b) => b.timeSlot)

  return DEFAULT_TIME_SLOTS.map((slot) => ({
    time: slot,
    available: !bookedSlots.includes(slot),
  }))
}

// Test Configuration for Round-Robin Pool & CEO / Always-Present Guests
const HIGH_BUDGET_HOST = process.env.TEST_HIGH_BUDGET_HOST || 'hariom.1@macgence.com' // CEO (High Budget $50k+)
const TEAM_MEMBERS = [
  process.env.TEST_RR_MEMBER_1 || 'pantrokbazz@gmail.com',    // Round-Robin Pool Member 1
  process.env.TEST_RR_MEMBER_2 || 'hari.2428cs2277@kiet.edu', // Round-Robin Pool Member 2
]
const ALWAYS_PRESENT = [
  process.env.TEST_ALWAYS_PRESENT || 'shanisingh638876@gmail.com', // Always Added Guest
]

export async function createBooking(data: {
  date: string
  timeSlot: string
  name: string
  email: string
  organization?: string
  role?: string
  notes?: string
  budgetRange?: string
}): Promise<MeetingBooking> {
  const isAlreadyBooked = bookingsStore.some(
    (b) => b.date === data.date && b.timeSlot === data.timeSlot
  )
  if (isAlreadyBooked) {
    throw new Error('This time slot has already been booked. Please select another slot.')
  }

  // Budget-Based Routing Logic:
  // - High Budget ($50k+): Assigned directly to CEO (hariom.1@macgence.com)
  // - Regular Budget (Under $15k / $15k-$50k): Rotated via Round-Robin pool
  const budgetRange = data.budgetRange || 'Under $15k'
  const isHighBudget = budgetRange === '$50k+'

  let assignedHost: string
  if (isHighBudget) {
    assignedHost = HIGH_BUDGET_HOST
    logger.info({ email: data.email, budgetRange }, 'High-budget booking assigned to CEO (hariom.1@macgence.com)')
  } else {
    assignedHost = TEAM_MEMBERS[lastAssignedIndex % TEAM_MEMBERS.length]
    lastAssignedIndex = (lastAssignedIndex + 1) % TEAM_MEMBERS.length
    globalForBookings.lastAssignedIndex = lastAssignedIndex
    logger.info({ email: data.email, budgetRange, assignedHost, queueIndex: lastAssignedIndex }, 'Regular budget booking assigned via Round-Robin')
  }

  const randomId = Math.random().toString(36).substring(2, 6) + '-' + Math.random().toString(36).substring(2, 6)
  const defaultMeetLink = `https://meet.google.com/mac-${randomId}`

  const newBooking: MeetingBooking = {
    id: `book_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    date: data.date,
    timeSlot: data.timeSlot,
    name: data.name,
    email: data.email,
    organization: data.organization,
    role: data.role,
    notes: data.notes,
    budgetRange,
    assignedHost,
    meetLink: defaultMeetLink,
    createdAt: new Date().toISOString(),
  }

  bookingsStore.push(newBooking)
  logger.info({ bookingId: newBooking.id, email: newBooking.email, date: newBooking.date, assignedHost }, 'Created discovery call booking')

  // Create Google Calendar event with Google Meet link & dispatch native Google Calendar invitation emails (sendUpdates=all)
  await createGoogleCalendarEvent(newBooking).catch((err) =>
    logger.error({ err }, 'Failed to create Google Calendar event')
  )

  return newBooking
}

/**
 * Creates a live Google Calendar event with Google Meet link and sends automatic Google invites via Domain-Wide Delegation (sendUpdates=all)
 */
async function createGoogleCalendarEvent(booking: MeetingBooking) {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL
  const privateKey = process.env.GOOGLE_PRIVATE_KEY
  const founderEmail = process.env.FOUNDER_EMAIL || 'hariom.1@macgence.com'

  if (!clientEmail || !privateKey) {
    logger.warn('Google Calendar API credentials missing in environment variables.')
    return
  }

  // Pass founderEmail for JWT impersonation sub claim via domain-wide delegation
  const accessToken = await getGoogleAccessToken(clientEmail, privateKey, founderEmail)
  if (!accessToken) {
    logger.warn('Could not authenticate with Google Calendar API.')
    return
  }

  // Parse timeSlot (e.g. "02:30 PM") into 24h format for ISO string
  const [timeStr, period] = booking.timeSlot.split(' ')
  const [parsedHours, minutes] = timeStr.split(':').map(Number)
  let hours = parsedHours
  if (period === 'PM' && hours < 12) hours += 12
  if (period === 'AM' && hours === 12) hours = 0

  const startHourStr = String(hours).padStart(2, '0')
  const startMinStr = String(minutes).padStart(2, '0')
  const startIso = `${booking.date}T${startHourStr}:${startMinStr}:00+05:30`

  let endHours = hours
  let endMinutes = minutes + 30
  if (endMinutes >= 60) {
    endHours += 1
    endMinutes -= 60
  }
  const endHourStr = String(endHours).padStart(2, '0')
  const endMinStr = String(endMinutes).padStart(2, '0')
  const endIso = `${booking.date}T${endHourStr}:${endMinStr}:00+05:30`

  const hostEmail = booking.assignedHost || founderEmail

  // Construct deduplicated attendee list
  const uniqueAttendeesMap = new Map<string, { email: string; displayName?: string; responseStatus?: string }>()
  
  // 1. Client attendee
  uniqueAttendeesMap.set(booking.email.toLowerCase(), {
    email: booking.email,
    displayName: booking.name,
  })

  // 2. Assigned Host attendee
  if (hostEmail.toLowerCase() !== booking.email.toLowerCase()) {
    uniqueAttendeesMap.set(hostEmail.toLowerCase(), {
      email: hostEmail,
      responseStatus: 'accepted',
    })
  }

  // 3. Always Present team members
  for (const guest of ALWAYS_PRESENT) {
    const guestLower = guest.toLowerCase()
    if (!uniqueAttendeesMap.has(guestLower)) {
      uniqueAttendeesMap.set(guestLower, { email: guest })
    }
  }

  const attendeesList = Array.from(uniqueAttendeesMap.values())

  const eventPayload = {
    summary: `Discovery Call: ${booking.name} (${booking.organization || 'Client'})`,
    description: `Macgence AI Discovery Call\nClient Name: ${booking.name}\nClient Email: ${booking.email}\nCompany: ${booking.organization || 'N/A'}\nRole: ${booking.role || 'N/A'}\nBudget Range: ${booking.budgetRange || 'N/A'}\nAssigned Host: ${hostEmail}\nNotes: ${booking.notes || 'None'}`,
    start: { dateTime: startIso, timeZone: 'Asia/Kolkata' },
    end: { dateTime: endIso, timeZone: 'Asia/Kolkata' },
    attendees: attendeesList,
    conferenceData: {
      createRequest: {
        requestId: `macgence-meet-${booking.id}-${Date.now()}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
  }

  try {
    // Insert event directly into user's calendar with sendUpdates=all so Google Workspace sends official invite emails
    let res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(founderEmail)}/events?conferenceDataVersion=1&sendUpdates=all`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventPayload),
      }
    )

    if (!res.ok) {
      // Fallback to primary calendar if user email calendar endpoint returns non-ok
      res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventPayload),
        }
      )
    }

    const data = await res.json()
    if (res.ok) {
      if (data.hangoutLink) {
        booking.meetLink = data.hangoutLink
      } else if (data.conferenceData?.entryPoints?.[0]?.uri) {
        booking.meetLink = data.conferenceData.entryPoints[0].uri
      }
      logger.info({ meetLink: booking.meetLink, eventId: data.id }, 'Successfully created Google Calendar event with native Google invites (sendUpdates=all)')
    } else {
      logger.warn({ status: res.status, data }, 'Google Calendar API insert returned error response')
    }
  } catch (err) {
    logger.error({ err }, 'Error inserting event into Google Calendar API')
  }
}

/**
 * Obtains an OAuth 2.0 Access Token using Service Account JWT assertion with Domain-Wide Delegation (sub claim)
 */
async function getGoogleAccessToken(clientEmail: string, privateKey: string, impersonateUser?: string): Promise<string | null> {
  try {
    const now = Math.floor(Date.now() / 1000)
    const header = { alg: 'RS256', typ: 'JWT' }
    const claimSet: Record<string, unknown> = {
      iss: clientEmail,
      scope: 'https://www.googleapis.com/auth/calendar',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    }

    if (impersonateUser) {
      claimSet.sub = impersonateUser
    }

    const encodeBase64Url = (obj: unknown) =>
      Buffer.from(JSON.stringify(obj))
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')

    const encodedHeader = encodeBase64Url(header)
    const encodedClaim = encodeBase64Url(claimSet)
    const signatureInput = `${encodedHeader}.${encodedClaim}`

    const signer = crypto.createSign('RSA-SHA256')
    signer.update(signatureInput)
    
    // Clean formatted private key
    const formattedPrivateKey = privateKey.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n')
    const signature = signer.sign(formattedPrivateKey, 'base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')

    const jwt = `${signatureInput}.${signature}`

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    })

    const data = await res.json()
    if (data.access_token) {
      return data.access_token
    }
    logger.error({ data }, 'Failed to obtain Google OAuth access token')
    return null
  } catch (err) {
    logger.error({ err }, 'Error in getGoogleAccessToken JWT signing')
    return null
  }
}


