import { NextResponse, type NextRequest } from 'next/server'
import { getSlotAvailability } from '@/services/booking.service'

/**
 * GET /api/v1/meet/slots?date=YYYY-MM-DD
 * Returns available vs booked time slots for a specified date.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

  const slots = getSlotAvailability(date)

  return NextResponse.json({
    success: true,
    date,
    slots,
  })
}
