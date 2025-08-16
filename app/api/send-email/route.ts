import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { recipients, subject, summary } = await request.json()

    if (!recipients || recipients.length === 0) {
      return NextResponse.json({ error: "At least one recipient is required" }, { status: 400 })
    }

    if (!summary || summary.trim().length === 0) {
      return NextResponse.json({ error: "Summary content is required" }, { status: 400 })
    }

    // Validate email addresses
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const invalidEmails = recipients.filter((email: string) => !emailRegex.test(email.trim()))

    if (invalidEmails.length > 0) {
      return NextResponse.json(
        {
          error: `Invalid email addresses: ${invalidEmails.join(", ")}`,
        },
        { status: 400 },
      )
    }

    console.log("[v0] Email sharing request:", {
      recipients: recipients.length,
      subject: subject?.substring(0, 50) + "...",
      summaryLength: summary.length,
    })

    // In a real implementation, you would integrate with an email service like:
    // - Resend
    // - SendGrid
    // - AWS SES
    // - Nodemailer with SMTP

    // For now, we'll simulate the email sending process
    await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate API delay

    console.log("[v0] Email sent successfully to:", recipients)

    return NextResponse.json({
      success: true,
      message: `Summary shared successfully with ${recipients.length} recipient${recipients.length > 1 ? "s" : ""}`,
    })
  } catch (error) {
    console.error("[v0] Error sending email:", error)
    return NextResponse.json(
      {
        error: "Failed to send email. Please try again.",
      },
      { status: 500 },
    )
  }
}
