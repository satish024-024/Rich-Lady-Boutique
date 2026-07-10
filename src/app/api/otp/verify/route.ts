import { NextResponse } from "next/server";
import { verifyOtp } from "@/utils/otpService";
import { sendEmail } from "@/utils/emailService";
import { getWelcomeEmail } from "@/utils/emailTemplates";

export async function POST(request: Request) {
  try {
    const { phone, otp, isRegistering, name, email } = await request.json();

    if (!phone || !otp) {
      return NextResponse.json({ error: "Phone number and OTP code are required" }, { status: 400 });
    }

    const cleanPhone = phone.trim();
    const cleanOtp = otp.trim();

    // 1. Verify OTP
    const result = await verifyOtp(cleanPhone, cleanOtp);

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Verification failed" }, { status: 400 });
    }

    // 2. If registering, trigger the Welcome Email
    if (isRegistering && email && name) {
      const emailHtml = getWelcomeEmail(name);
      
      // Dispatch welcome email asynchronously (don't block OTP verification response)
      sendEmail({
        to: email.trim(),
        subject: "Welcome to Rich Lady Boutique",
        html: emailHtml,
        type: "welcome",
      }).catch((err) => console.error("Error sending welcome email in verify handler:", err));
    }

    // 3. Return success with user details
    const isEmailInput = cleanPhone.includes("@");
    return NextResponse.json({
      success: true,
      message: isEmailInput ? "Email verified successfully" : "Phone number verified successfully",
      user: {
        phone: isEmailInput ? "" : cleanPhone,
        name: isRegistering ? name : "Boutique Customer",
        email: isEmailInput ? cleanPhone : (isRegistering ? email : null),
      },
    });
  } catch (error: any) {
    console.error("Error in /api/otp/verify:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
