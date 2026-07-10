import { NextResponse } from "next/server";
import { generateOtp } from "@/utils/otpService";
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
      return NextResponse.json({ error: "SMS login is disabled. Please log in using your email address." }, { status: 400 });
    }

    // 1. Validate email structure
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanInput)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // 2. Generate OTP
    const result = await generateOtp(cleanInput);
    if (!result.success || !result.otp) {
      return NextResponse.json({ error: result.error || "Failed to generate verification code" }, { status: 429 });
    }

    // 3. Dispatch Email
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
      message: "Verification code sent to your email",
      isEmail: true,
    };

    if (!isResendConfigured || !emailResult.success) {
      responsePayload.sandboxOtp = result.otp;
      responsePayload.note = "Sandbox Mode: Resend not configured. Verification code provided in response.";
    }

    return NextResponse.json(responsePayload);
  } catch (error: any) {
    console.error("Error in /api/otp/send:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
