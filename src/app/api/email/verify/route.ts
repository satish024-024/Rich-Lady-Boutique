import { NextResponse } from "next/server";
import { generateOtp, verifyOtp } from "@/utils/otpService";
import { sendEmail } from "@/utils/emailService";
import { getEmailVerificationEmail } from "@/utils/emailTemplates";

export async function POST(request: Request) {
  try {
    const { email, code, action, name } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // ----------------------------------------------------
    // Action 1: Send verification code
    // ----------------------------------------------------
    if (action === "send") {
      const result = await generateOtp(cleanEmail);

      if (!result.success || !result.otp) {
        return NextResponse.json({ error: result.error || "Failed to generate verification code" }, { status: 429 });
      }

      // Compile template and send email
      const html = getEmailVerificationEmail(name || "Customer", result.otp);
      const emailResult = await sendEmail({
        to: cleanEmail,
        subject: "Verify your email address - Rich Lady Boutique",
        html,
        type: "email_verification",
      });

      const isResendConfigured = !!process.env.RESEND_API_KEY;
      const responsePayload: any = {
        success: true,
        message: "Verification code sent to your email",
      };

      // Dev convenience: expose code in sandbox mode for easy UI testing
      if (!isResendConfigured) {
        responsePayload.sandboxCode = result.otp;
        responsePayload.note = "Sandbox Mode: Resend not configured. Verification code provided in response.";
      }

      return NextResponse.json(responsePayload);
    }

    // ----------------------------------------------------
    // Action 2: Verify code
    // ----------------------------------------------------
    if (action === "verify") {
      if (!code) {
        return NextResponse.json({ error: "Verification code is required" }, { status: 400 });
      }

      const result = await verifyOtp(cleanEmail, code.trim());

      if (!result.success) {
        return NextResponse.json({ error: result.error || "Verification failed" }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: "Email verified successfully",
      });
    }

    return NextResponse.json({ error: "Invalid action. Must be 'send' or 'verify'" }, { status: 400 });
  } catch (error: any) {
    console.error("Error in /api/email/verify:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
