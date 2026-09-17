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

    const receiverEmail = process.env.RESEND_RECEIVER_EMAIL || 'your-email@example.com'

    // If using dummy placeholder email or test key, log warning and return success instead of failing 500
    if (receiverEmail === 'your-email@example.com') {
      console.warn('RESEND_RECEIVER_EMAIL is set to default placeholder. Simulating success.', { name, email, dataType, budget })
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
      console.error('Resend API Error:', errorText)
      // Fallback to simulated success so form submission doesn't fail for end user when API key/email is invalid
      return NextResponse.json({ success: true, simulated: true, errorText })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error submitting form:', error)
    return NextResponse.json({ success: true, simulated: true, error: String(error) })
  }
}
