import { NextResponse, type NextRequest } from 'next/server'
import { createBooking, getBookingsForDate } from '@/services/booking.service'

/**
 * POST /api/v1/meet/book
 * Submits a new meeting booking, checks slot availability, and returns Google Meet link details.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, timeSlot, name, email, organization, role, notes, budgetRange } = body

    if (!date || !timeSlot || !name || !email) {
      return NextResponse.json(
        { success: false, error: 'Please provide all required fields (date, timeSlot, name, email).' },
        { status: 400 }
      )
    }

    // Check if slot is already booked
    const existing = getBookingsForDate(date)
    const isBooked = existing.some((b) => b.timeSlot === timeSlot)

    if (isBooked) {
      return NextResponse.json(
        { success: false, error: 'This time slot has already been booked. Please select another slot.' },
        { status: 409 }
      )
    }

    const booking = await createBooking({
      date,
      timeSlot,
      name,
      email,
      organization,
      role,
      notes,
      budgetRange,
    })

    return NextResponse.json({
      success: true,
      booking,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create booking'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
