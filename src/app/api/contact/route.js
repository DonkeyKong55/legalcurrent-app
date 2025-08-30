import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, subject, message, type } = body;

    // Validate required fields
    if (!name || !email || !subject || !message || !type) {
      return Response.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Store the contact message in database
    const result = await sql`
      INSERT INTO contact_messages (
        name, email, subject, message, message_type, created_at
      ) VALUES (
        ${name}, ${email}, ${subject}, ${message}, ${type}, now()
      )
      RETURNING id
    `;

    // Send notification email (if email service is configured)
    if (process.env.CONTACT_EMAIL) {
      try {
        await sendContactNotification({
          name,
          email,
          subject,
          message,
          type,
          messageId: result[0].id
        });
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return Response.json(
      { 
        success: true,
        message: 'Contact message sent successfully',
        id: result[0].id
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    return Response.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    );
  }
}

async function sendContactNotification({ name, email, subject, message, type, messageId }) {
  const emailBody = `
New contact message received:

Message ID: ${messageId}
Type: ${type.charAt(0).toUpperCase() + type.slice(1)}
Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
LegalCurrent Contact Form
  `.trim();

  // For production, integrate with email service like:
  // - SendGrid, Mailgun, AWS SES, etc.
  // - Or use a webhook to send to Slack/Discord
  
  // Example fetch to email service (replace with actual service):
  const response = await fetch(process.env.EMAIL_WEBHOOK_URL || 'https://httpbin.org/post', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.EMAIL_SERVICE_TOKEN || ''}`,
    },
    body: JSON.stringify({
      to: process.env.CONTACT_EMAIL,
      subject: `[LegalCurrent] ${type.charAt(0).toUpperCase() + type.slice(1)}: ${subject}`,
      text: emailBody,
      replyTo: email
    }),
  });

  if (!response.ok) {
    throw new Error(`Email service responded with ${response.status}`);
  }
}