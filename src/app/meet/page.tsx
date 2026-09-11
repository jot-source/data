import { Metadata } from 'next'
import { ScheduleMeeting } from '@/components/meet/schedule-meeting'

export const metadata: Metadata = {
  title: 'Book a Discovery Call — Macgence',
  description: 'Schedule a 30-minute consultation with Macgence AI training data experts to discuss custom datasets, annotation, and enterprise pricing.',
}

export default function MeetPage() {
  return <ScheduleMeeting />
}
