import { NextResponse } from 'next/server'

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

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Contact Form <onboarding@resend.dev>', // Update this to your verified domain when going to production
        to: ['your-email@example.com'], // Update this to your receiving email
        subject: `New Data Requirement from ${name}`,
        html: htmlContent,
      }),
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('Resend API Error:', errorText)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error submitting form:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
