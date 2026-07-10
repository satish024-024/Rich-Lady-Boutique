import { NextResponse } from "next/server";
import { supabaseServer } from "@/utils/supabaseServer";
import { sendEmail } from "@/utils/emailService";
import { getNewsletterSubscriptionEmail } from "@/utils/emailTemplates";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Regular expression for basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json({ error: "Invalid email address format" }, { status: 400 });
    }

    // 1. Check if email already subscribed
    const { data: existing, error: fetchError } = await supabaseServer
      .from("newsletter_subscribers")
      .select("*")
      .eq("email", cleanEmail)
      .limit(1);

    if (fetchError) throw fetchError;

    if (existing && existing.length > 0) {
      if (existing[0].status === "subscribed") {
        return NextResponse.json({ success: true, message: "You are already subscribed to our newsletter." });
      } else {
        // Reactivate subscription if they unsubscribed previously
        const { error: updateError } = await supabaseServer
          .from("newsletter_subscribers")
          .update({ status: "subscribed", created_at: new Date().toISOString() })
          .eq("id", existing[0].id);

        if (updateError) throw updateError;
      }
    } else {
      // 2. Insert new subscriber record
      const { error: insertError } = await supabaseServer
        .from("newsletter_subscribers")
        .insert({
          email: cleanEmail,
          status: "subscribed",
        });

      if (insertError) throw insertError;
    }

    // 3. Send confirmation email via Resend
    const emailHtml = getNewsletterSubscriptionEmail(cleanEmail);
    sendEmail({
      to: cleanEmail,
      subject: "Newsletter Subscription Confirmed - Rich Lady Boutique",
      html: emailHtml,
      type: "newsletter_subscription",
    }).catch((err) => console.error("Error sending newsletter welcome email:", err));

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to Rich Lady newsletter!",
    });
  } catch (error: any) {
    console.error("Error in /api/email/newsletter:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
