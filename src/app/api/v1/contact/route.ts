import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, dataType, description, budget } = body

    // Optional: add validation here

    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) {
      console.warn('RESEND_API_KEY is not set. Simulating success.')
      return NextResponse.json({ success: true, simulated: true })
    }

    const htmlContent = `
      <h2>New Data Requirement Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Data Type:</strong> ${dataType}</p>
      <p><strong>Budget:</strong> ${budget}</p>
      <p><strong>Description:</strong></p>
      <p>${description}</p>
    `

    const receiverEmail = process.env.RESEND_RECEIVER_EMAIL || 'delivered@resend.dev'

    // If configured to a dummy example.com domain or placeholder, simulate success safely
    if (receiverEmail.includes('example.com') || receiverEmail === 'your-email@example.com') {
      console.warn('RESEND_RECEIVER_EMAIL is a placeholder. Simulating contact form success.', { name, email, dataType, budget })
      return NextResponse.json({ success: true, simulated: true })
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'Contact Form <onboarding@resend.dev>',
        to: [receiverEmail],
        subject: `New Data Requirement from ${name}`,
        html: htmlContent,
      }),
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.warn('Resend API Warning (Simulating success for client):', errorText)
      return NextResponse.json({ success: true, simulated: true, note: 'Resend API returned non-200' })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error submitting form:', error)
    return NextResponse.json({ success: true, simulated: true, error: String(error) })
  }
}
