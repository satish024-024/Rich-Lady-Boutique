import { Resend } from "resend";
import { supabaseServer } from "./supabaseServer";

// Initialize Resend with key from env variables
const resendKey = process.env.RESEND_API_KEY || "";
const resend = resendKey ? new Resend(resendKey) : null;

// The default sender address for Resend.
// Note: In development using the free tier without a verified domain,
// Resend only allows sending from "onboarding@resend.dev" to the email
// associated with the Resend account.
const SENDER_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const SENDER_NAME = "Rich Lady Boutique";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  type: string; // 'welcome', 'email_verification', 'order_confirmation', 'payment_success', 'shipping_confirmation', etc.
  orderId?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  type,
  orderId = undefined,
}: SendEmailParams) {
  // 1. Insert initial pending log into Supabase email_logs
  let logId: string | null = null;
  try {
    const { data, error } = await supabaseServer
      .from("email_logs")
      .insert({
        order_id: orderId,
        type,
        recipient_email: to,
        subject,
        body: html,
        status: "pending",
      })
      .select("id")
      .single();

    if (!error && data) {
      logId = data.id;
    }
  } catch (err) {
    console.error("Failed to create email log in Supabase:", err);
  }

  // 2. Check if Resend is configured
  if (!resend) {
    const errorMsg = "Resend API key is not configured. Email simulated in sandbox.";
    console.warn(`[SANDBOX EMAIL] To: ${to} | Subject: ${subject} | Type: ${type}`);
    
    if (logId) {
      await supabaseServer
        .from("email_logs")
        .update({
          status: "failed",
          error_message: errorMsg,
        })
        .eq("id", logId);
    }
    return { success: false, error: errorMsg };
  }

  // 3. Dispatch email via Resend
  try {
    const { data: resData, error: resError } = await resend.emails.send({
      from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
      to: [to],
      subject,
      html,
    });

    if (resError) {
      throw resError;
    }

    // 4. Update log as sent on success
    if (logId) {
      await supabaseServer
        .from("email_logs")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
        })
        .eq("id", logId);
    }

    return { success: true, id: resData?.id };
  } catch (error: any) {
    console.error(`Failed to send email via Resend to ${to}:`, error);
    
    // 5. Update log as failed on error
    if (logId) {
      await supabaseServer
        .from("email_logs")
        .update({
          status: "failed",
          error_message: error.message || "Unknown Resend error",
        })
        .eq("id", logId);
    }

    return { success: false, error: error.message || "Failed to dispatch email" };
  }
}
