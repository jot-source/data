import crypto from 'crypto'
import nodemailer from 'nodemailer'
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

// Persistent store on globalThis for meeting bookings across hot reloads
const globalForBookings = globalThis as unknown as {
  bookingsStore?: MeetingBooking[]
}

const bookingsStore: MeetingBooking[] = globalForBookings.bookingsStore || [
  {
    id: 'book_demo_1',
    date: new Date().toISOString().split('T')[0], // Today
    timeSlot: '11:00 AM',
    name: 'Sarah Jenkins',
    email: 'sarah.j@ai-labs.io',
    organization: 'AI Labs',
    meetLink: 'https://meet.google.com/abc-defg-hij',
    createdAt: new Date().toISOString(),
  },
]

if (process.env.NODE_ENV !== 'production') {
  globalForBookings.bookingsStore = bookingsStore
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

export async function createBooking(data: {
  date: string
  timeSlot: string
  name: string
  email: string
  organization?: string
  role?: string
  notes?: string
}): Promise<MeetingBooking> {
  const isAlreadyBooked = bookingsStore.some(
    (b) => b.date === data.date && b.timeSlot === data.timeSlot
  )
  if (isAlreadyBooked) {
    throw new Error('This time slot has already been booked. Please select another slot.')
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
    meetLink: defaultMeetLink,
    createdAt: new Date().toISOString(),
  }

  bookingsStore.push(newBooking)
  logger.info({ bookingId: newBooking.id, email: newBooking.email, date: newBooking.date }, 'Created custom discovery call booking')

  // 1. Call Google Calendar API to create live event & dispatch Google invitation email (sendUpdates=all)
  await createGoogleCalendarEvent(newBooking).catch((err) =>
    logger.error({ err }, 'Failed to create Google Calendar event')
  )

  // 2. Dispatch email with calendar invite via Gmail SMTP (Nodemailer)
  await sendBookingEmails(newBooking).catch((err) =>
    logger.error({ err }, 'Failed to dispatch Nodemailer emails')
  )

  return newBooking
}

/**
 * Creates a live Google Calendar event with Google Meet link and sends automatic Google invites
 */
async function createGoogleCalendarEvent(booking: MeetingBooking) {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL
  const privateKey = process.env.GOOGLE_PRIVATE_KEY
  const founderEmail = process.env.FOUNDER_EMAIL || 'hariom.1@macgence.com'

  if (!clientEmail || !privateKey) {
    logger.warn('Google Calendar API credentials missing in environment variables.')
    return
  }

  // Pass founderEmail for JWT impersonation sub claim if domain-wide delegation is enabled
  const accessToken = await getGoogleAccessToken(clientEmail, privateKey, founderEmail)
  if (!accessToken) {
    logger.warn('Could not authenticate with Google Calendar API.')
    return
  }

  // Parse timeSlot (e.g. "02:30 PM") into 24h format for ISO string
  const [timeStr, period] = booking.timeSlot.split(' ')
  let [hours, minutes] = timeStr.split(':').map(Number)
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

  const eventPayload = {
    summary: `Discovery Call: ${booking.name} (${booking.organization || 'Client'})`,
    description: `Macgence AI Discovery Call\nClient Name: ${booking.name}\nClient Email: ${booking.email}\nCompany: ${booking.organization || 'N/A'}\nRole: ${booking.role || 'N/A'}\nNotes: ${booking.notes || 'None'}`,
    start: { dateTime: startIso, timeZone: 'Asia/Kolkata' },
    end: { dateTime: endIso, timeZone: 'Asia/Kolkata' },
    attendees: [
      { email: booking.email, displayName: booking.name },
      { email: founderEmail, responseStatus: 'accepted' },
    ],
    conferenceData: {
      createRequest: {
        requestId: `macgence-meet-${booking.id}`,
      },
    },
  }

  try {
    // Insert event directly into calendar with sendUpdates=all so Google sends emails natively
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
      // Fallback to primary calendar if host calendar insert fails
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
    if (res.ok && (data.hangoutLink || data.htmlLink)) {
      if (data.hangoutLink) {
        booking.meetLink = data.hangoutLink
      }
      logger.info({ hangoutLink: data.hangoutLink || data.htmlLink }, 'Successfully created Google Calendar event with native Google invites')
    } else {
      logger.warn({ status: res.status, data }, 'Google Calendar API insert returned response')
    }
  } catch (err) {
    logger.error({ err }, 'Error inserting event into Google Calendar API')
  }
}

async function getGoogleAccessToken(clientEmail: string, privateKey: string, impersonateUser?: string): Promise<string | null> {
  try {
    const now = Math.floor(Date.now() / 1000)
    const header = { alg: 'RS256', typ: 'JWT' }
    const claimSet: Record<string, any> = {
      iss: clientEmail,
      scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    }

    if (impersonateUser) {
      claimSet.sub = impersonateUser
    }

    const encodeBase64Url = (obj: any) =>
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
    const formattedPrivateKey = privateKey.replace(/\\n/g, '\n')
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

function generateICSContent(booking: MeetingBooking, founderEmail: string): string {
  const [timeStr, period] = booking.timeSlot.split(' ')
  let [hours, minutes] = timeStr.split(':').map(Number)
  if (period === 'PM' && hours < 12) hours += 12
  if (period === 'AM' && hours === 12) hours = 0

  const startIso = `${booking.date}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00+05:30`
  const startDate = new Date(startIso)
  const endDate = new Date(startDate.getTime() + 30 * 60 * 1000)

  const toIcsUtc = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Macgence AI//Discovery Call//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:macgence-${booking.id}@macgence.com`,
    `DTSTAMP:${toIcsUtc(new Date())}`,
    `DTSTART:${toIcsUtc(startDate)}`,
    `DTEND:${toIcsUtc(endDate)}`,
    `SUMMARY:Macgence Discovery Call: ${booking.name}`,
    `DESCRIPTION:Discovery Call with ${booking.name}. Google Meet: ${booking.meetLink}`,
    `LOCATION:${booking.meetLink}`,
    `ORGANIZER;CN=Macgence AI Specialist:mailto:${founderEmail}`,
    `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN=Host:mailto:${founderEmail}`,
    `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE;CN=${booking.name}:mailto:${booking.email}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n')
}

export async function sendBookingEmails(booking: MeetingBooking) {
  const gmailUser = process.env.GMAIL_USER || 'pantrokbazz@gmail.com'
  const gmailPass = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '')
  const founderEmail = process.env.FOUNDER_EMAIL || 'pantrokbazz@gmail.com'

  const icsContent = generateICSContent(booking, founderEmail)

  // 1. Email HTML for Client
  const clientHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #2563EB;">Discovery Call Scheduled!</h2>
      <p>Hi <strong>${booking.name}</strong>,</p>
      <p>Your 30-minute discovery call with our Macgence AI Data Specialist has been confirmed.</p>
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <p style="margin: 5px 0;"><strong>Date:</strong> ${booking.date}</p>
        <p style="margin: 5px 0;"><strong>Time Slot:</strong> ${booking.timeSlot} (30 min)</p>
        <p style="margin: 5px 0;"><strong>Google Meet Link:</strong> <a href="${booking.meetLink}" style="color: #2563EB;">${booking.meetLink}</a></p>
      </div>
      <p style="color: #64748b; font-size: 13px;">This invitation has been automatically attached to your email. Your calendar app will prompt you to accept.</p>
      <p style="color: #64748b; font-size: 12px; margin-top: 20px;">Macgence AI Data Marketplace Team</p>
    </div>
  `

  // 2. Email HTML for Founder / Admin
  const founderHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #2563eb; border-radius: 12px;">
      <h2 style="color: #181818;">🔔 New Discovery Call Booked!</h2>
      <p>A new client has scheduled a call on your marketplace:</p>
      <ul style="line-height: 1.6;">
        <li><strong>Client Name:</strong> ${booking.name}</li>
        <li><strong>Client Email:</strong> ${booking.email}</li>
        <li><strong>Company/Org:</strong> ${booking.organization || 'N/A'}</li>
        <li><strong>Role:</strong> ${booking.role || 'N/A'}</li>
        <li><strong>Date:</strong> ${booking.date} at ${booking.timeSlot}</li>
        <li><strong>Meeting Notes:</strong> ${booking.notes || 'None provided'}</li>
      </ul>
      <p><strong>Google Meet Video Link:</strong> <a href="${booking.meetLink}">${booking.meetLink}</a></p>
    </div>
  `

  if (gmailUser && gmailPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      })

      // Send to client
      const clientInfo = await transporter.sendMail({
        from: `"Macgence AI" <${gmailUser}>`,
        to: booking.email,
        subject: `Discovery Call Confirmed - Macgence AI (${booking.date} at ${booking.timeSlot})`,
        html: clientHtml,
        icalEvent: {
          filename: 'invite.ics',
          method: 'REQUEST',
          content: icsContent,
        },
      })
      logger.info({ messageId: clientInfo.messageId, to: booking.email }, 'Successfully sent booking email to client via Gmail SMTP')

      // Send to founder if distinct
      if (founderEmail && founderEmail !== booking.email) {
        const founderInfo = await transporter.sendMail({
          from: `"Macgence Marketplace" <${gmailUser}>`,
          to: founderEmail,
          subject: `🔔 New Meeting Booking: ${booking.name} (${booking.organization || 'Client'})`,
          html: founderHtml,
          icalEvent: {
            filename: 'invite.ics',
            method: 'REQUEST',
            content: icsContent,
          },
        })
        logger.info({ messageId: founderInfo.messageId, to: founderEmail }, 'Successfully sent booking notification to founder via Gmail SMTP')
      }
      return
    } catch (err) {
      logger.error({ err }, 'Error sending emails via Gmail SMTP (Nodemailer)')
    }
  }

  // Fallback to Resend API if Gmail SMTP is not configured or fails
  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) {
    logger.warn('RESEND_API_KEY not set and Gmail SMTP skipped/failed. Email dispatch cancelled.')
    return
  }

  const icsBase64 = Buffer.from(icsContent).toString('base64')
  try {
    const clientRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Macgence Team <onboarding@resend.dev>',
        to: [booking.email],
        subject: `Discovery Call Confirmed - Macgence AI (${booking.date})`,
        html: clientHtml,
        attachments: [{ filename: 'invite.ics', content: icsBase64 }],
      }),
    })
    const clientData = await clientRes.json()
    if (clientRes.ok) {
      logger.info({ id: clientData.id, to: booking.email }, 'Successfully dispatched booking email to client via Resend')
    } else {
      logger.warn({ status: clientRes.status, data: clientData, to: booking.email }, 'Resend client email dispatch error')
    }
  } catch (err) {
    logger.error({ err }, 'Error sending booking confirmation emails via Resend')
  }
}

