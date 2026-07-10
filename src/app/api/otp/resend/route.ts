import { NextResponse } from "next/server";
import { resendOtp } from "@/utils/otpService";
import { sendEmail } from "@/utils/emailService";
import { getEmailVerificationEmail } from "@/utils/emailTemplates";

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 });
    }

    const cleanInput = phone.trim();
    const isEmail = cleanInput.includes("@");

    if (!isEmail) {
      return NextResponse.json({ error: "SMS authentication is disabled. Please use your email." }, { status: 400 });
    }

    // 1. Trigger OTP resend
    const result = await resendOtp(cleanInput);
    if (!result.success || !result.otp) {
      return NextResponse.json({ error: result.error || "Failed to resend verification code" }, { status: 429 });
    }

    // 2. Dispatch Email
    const html = getEmailVerificationEmail("Boutique Customer", result.otp);
    const emailResult = await sendEmail({
      to: cleanInput,
      subject: "Login Verification Code - Rich Lady Boutique",
      html,
      type: "email_verification",
    });

    const isResendConfigured = !!process.env.RESEND_API_KEY;
    const responsePayload: any = {
      success: true,
      message: "Verification code resent to your email",
      isEmail: true,
    };

    if (!isResendConfigured || !emailResult.success) {
      responsePayload.sandboxOtp = result.otp;
      responsePayload.note = "Sandbox Mode: Resend not configured. Verification code provided in response.";
    }

    return NextResponse.json(responsePayload);
  } catch (error: any) {
    console.error("Error in /api/otp/resend:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
