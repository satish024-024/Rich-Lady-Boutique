import twilio from "twilio";
import { supabaseServer } from "./supabaseServer";

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID || "";
const authToken = process.env.TWILIO_AUTH_TOKEN || "";
const twilioPhone = process.env.TWILIO_PHONE_NUMBER || "";

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

interface SendSmsParams {
  to: string;
  body: string;
  type: string; // 'otp', 'order_confirmation', 'shipping_confirmation', etc.
  orderId?: string;
}

export async function sendSms({
  to,
  body,
  type,
  orderId = undefined,
}: SendSmsParams) {
  // 1. Insert initial pending log into Supabase sms_logs
  let logId: string | null = null;
  try {
    const { data, error } = await supabaseServer
      .from("sms_logs")
      .insert({
        order_id: orderId,
        type,
        recipient_phone: to,
        body,
        status: "pending",
      })
      .select("id")
      .single();

    if (!error && data) {
      logId = data.id;
    }
  } catch (err) {
    console.error("Failed to create SMS log in Supabase:", err);
  }

  // Formatting phone number to E.164 if it isn't already (e.g. +91XXXXXXXXXX)
  let formattedTo = to.trim();
  if (!formattedTo.startsWith("+")) {
    // If it's a 10 digit number, default to Indian country code +91
    if (formattedTo.length === 10) {
      formattedTo = `+91${formattedTo}`;
    } else {
      formattedTo = `+${formattedTo}`;
    }
  }

  // 2. Check if Twilio is configured
  if (!client || !twilioPhone) {
    const note = "[SANDBOX MODE] Twilio credentials missing. SMS simulated.";
    console.log(`\n--- [SMS SANDBOX] ---\nTo: ${formattedTo}\nType: ${type}\nMessage: ${body}\n---------------------\n`);
    
    // In Sandbox, we treat it as sent with a sandbox note to help test positive user flows
    if (logId) {
      await supabaseServer
        .from("sms_logs")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          error_message: note,
        })
        .eq("id", logId);
    }
    return { success: true, message: "SMS simulated in sandbox mode" };
  }

  // 3. Dispatch SMS via Twilio API
  try {
    const response = await client.messages.create({
      body,
      from: twilioPhone,
      to: formattedTo,
    });

    // 4. Update log as sent on success
    if (logId) {
      await supabaseServer
        .from("sms_logs")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
        })
        .eq("id", logId);
    }

    return { success: true, sid: response.sid };
  } catch (error: any) {
    console.error(`Failed to send SMS via Twilio to ${formattedTo}:`, error);

    // 5. Update log as failed on error
    if (logId) {
      await supabaseServer
        .from("sms_logs")
        .update({
          status: "failed",
          error_message: error.message || "Unknown Twilio error",
        })
        .eq("id", logId);
    }

    return { success: false, error: error.message || "Failed to dispatch SMS" };
  }
}
