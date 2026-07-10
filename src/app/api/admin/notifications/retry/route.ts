import { NextResponse } from "next/server";
import { supabaseServer } from "@/utils/supabaseServer";
import { Resend } from "resend";
import twilio from "twilio";

// Initialize Resend
const resendKey = process.env.RESEND_API_KEY || "";
const resend = resendKey ? new Resend(resendKey) : null;
const SENDER_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const SENDER_NAME = "Rich Lady Boutique";

// Initialize Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID || "";
const authToken = process.env.TWILIO_AUTH_TOKEN || "";
const twilioPhone = process.env.TWILIO_PHONE_NUMBER || "";
const twilioClient = accountSid && authToken ? twilio(accountSid, authToken) : null;

export async function POST(request: Request) {
  try {
    const { logId, type } = await request.json();

    if (!logId || !type) {
      return NextResponse.json({ error: "Log ID and notification type are required" }, { status: 400 });
    }

    // ----------------------------------------------------
    // Retry Email Delivery
    // ----------------------------------------------------
    if (type === "email") {
      // 1. Fetch the failed log
      const { data: log, error: fetchError } = await supabaseServer
        .from("email_logs")
        .select("*")
        .eq("id", logId)
        .single();

      if (fetchError || !log) {
        return NextResponse.json({ error: "Email log not found" }, { status: 404 });
      }

      // 2. Update status to pending
      await supabaseServer
        .from("email_logs")
        .update({ status: "pending", error_message: null })
        .eq("id", logId);

      // 3. Retry sending
      if (!resend) {
        // Sandbox simulation
        await supabaseServer
          .from("email_logs")
          .update({
            status: "failed",
            error_message: "Resend API key missing. Simulated retry failed.",
          })
          .eq("id", logId);
        return NextResponse.json({ error: "Resend not configured. Simulated retry failed." }, { status: 500 });
      }

      try {
        await resend.emails.send({
          from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
          to: [log.recipient_email],
          subject: log.subject,
          html: log.body || `<p style="font-size: 14px;">(No saved body content)</p>`,
        });

        // Update to sent
        await supabaseServer
          .from("email_logs")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
            error_message: null,
          })
          .eq("id", logId);

        return NextResponse.json({ success: true, message: "Email resent successfully" });
      } catch (sendErr: any) {
        // Update back to failed
        await supabaseServer
          .from("email_logs")
          .update({
            status: "failed",
            error_message: sendErr.message || "Failed during retry dispatch",
          })
          .eq("id", logId);

        return NextResponse.json({ error: sendErr.message || "Email dispatch failed during retry" }, { status: 500 });
      }
    }

    // ----------------------------------------------------
    // Retry SMS Delivery
    // ----------------------------------------------------
    if (type === "sms") {
      // 1. Fetch the failed log
      const { data: log, error: fetchError } = await supabaseServer
        .from("sms_logs")
        .select("*")
        .eq("id", logId)
        .single();

      if (fetchError || !log) {
        return NextResponse.json({ error: "SMS log not found" }, { status: 404 });
      }

      // 2. Update status to pending
      await supabaseServer
        .from("sms_logs")
        .update({ status: "pending", error_message: null })
        .eq("id", logId);

      // Format phone number to E.164
      let formattedTo = log.recipient_phone.trim();
      if (!formattedTo.startsWith("+")) {
        if (formattedTo.length === 10) {
          formattedTo = `+91${formattedTo}`;
        } else {
          formattedTo = `+${formattedTo}`;
        }
      }

      // 3. Retry sending
      if (!twilioClient || !twilioPhone) {
        // Sandbox simulation: We treat retry as sent since the developer is triggering it manual in sandbox
        await supabaseServer
          .from("sms_logs")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
            error_message: "[Sandbox Mode] SMS retry simulated successfully.",
          })
          .eq("id", logId);
        return NextResponse.json({ success: true, message: "SMS retry simulated successfully (Sandbox)" });
      }

      try {
        await twilioClient.messages.create({
          body: log.body,
          from: twilioPhone,
          to: formattedTo,
        });

        // Update to sent
        await supabaseServer
          .from("sms_logs")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
            error_message: null,
          })
          .eq("id", logId);

        return NextResponse.json({ success: true, message: "SMS resent successfully" });
      } catch (sendErr: any) {
        // Update back to failed
        await supabaseServer
          .from("sms_logs")
          .update({
            status: "failed",
            error_message: sendErr.message || "Failed during retry SMS dispatch",
          })
          .eq("id", logId);

        return NextResponse.json({ error: sendErr.message || "SMS dispatch failed during retry" }, { status: 500 });
      }
    }

    return NextResponse.json({ error: "Invalid type. Must be 'email' or 'sms'" }, { status: 400 });
  } catch (error: any) {
    console.error("Error in /api/admin/notifications/retry:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
