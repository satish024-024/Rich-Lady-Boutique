import { NextResponse } from "next/server";
import { sendEmail } from "@/utils/emailService";
import { getEmailVerificationEmail, getWelcomeEmail, getNewsletterSubscriptionEmail } from "@/utils/emailTemplates";

export async function POST(request: Request) {
  try {
    const { to, subject, body, type, orderId, name, code } = await request.json();

    if (!to || !subject) {
      return NextResponse.json({ error: "Recipient ('to') and 'subject' are required" }, { status: 400 });
    }

    // Determine HTML content
    let htmlContent = "";
    if (type === "welcome" && name) {
      htmlContent = getWelcomeEmail(name);
    } else if (type === "email_verification" && code) {
      htmlContent = getEmailVerificationEmail(name || "Customer", code);
    } else if (type === "newsletter_subscription") {
      htmlContent = getNewsletterSubscriptionEmail(to);
    } else if (body) {
      // Wrap plain body in basic HTML structure
      htmlContent = `<p style="font-size: 14px; line-height: 1.6; color: #5B5046;">${body}</p>`;
    } else {
      return NextResponse.json({ error: "Email body or recognized type parameters are missing" }, { status: 400 });
    }

    const result = await sendEmail({
      to,
      subject,
      html: htmlContent,
      type: type || "custom",
      orderId,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Email sent successfully", emailId: result.id });
  } catch (error: any) {
    console.error("Error in /api/email/send:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
