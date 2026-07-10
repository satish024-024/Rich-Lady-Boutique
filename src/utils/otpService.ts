import crypto from "crypto";
import { supabaseServer } from "./supabaseServer";

const OTP_EXPIRY_MINUTES = 5;
const MAX_VERIFICATION_ATTEMPTS = 3;
const RESEND_THROTTLE_SECONDS = 60;
const HOURLY_LIMIT = 5;

// In-Memory Fallback Store (Used if Supabase tables are not yet created)
interface InMemoryOtpRecord {
  id: string;
  phone: string;
  otp_hash: string;
  created_at: Date;
  expires_at: Date;
  verified: boolean;
  attempts: number;
  resend_count: number;
  last_resend_at: Date | null;
}

const inMemoryOtps: InMemoryOtpRecord[] = [];
let useInMemoryFallback = false;

// Helper to hash OTP using SHA-256
function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

/**
 * Generate a new secure 6-digit OTP, perform rate limiting, and save its hash to public.otp_verifications (or in-memory fallback).
 */
export async function generateOtp(phone: string): Promise<{ success: boolean; otp?: string; error?: string }> {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  // If already falling back, use in-memory store
  if (useInMemoryFallback) {
    return generateOtpInMemory(phone, now, oneHourAgo);
  }

  try {
    // 1. Rate Limiting: Max 5 OTPs sent in the last hour
    const { count, error: countError } = await supabaseServer
      .from("otp_verifications")
      .select("*", { count: "exact", head: true })
      .eq("phone", phone)
      .gt("created_at", oneHourAgo.toISOString());

    if (countError) {
      // Check if table is missing in Supabase
      if (countError.code === "PGRST205" || countError.message?.includes("public.otp_verifications")) {
        console.warn("⚠️ Supabase public.otp_verifications table not found. Switching to local in-memory OTP fallback.");
        useInMemoryFallback = true;
        return generateOtpInMemory(phone, now, oneHourAgo);
      }
      throw countError;
    }

    if (count && count >= HOURLY_LIMIT) {
      return {
        success: false,
        error: `Rate limit exceeded. Maximum ${HOURLY_LIMIT} OTPs per hour. Please try again later.`,
      };
    }

    // 2. Throttling: Must wait 60 seconds since last OTP request
    const { data: latestOtp, error: latestError } = await supabaseServer
      .from("otp_verifications")
      .select("created_at, last_resend_at")
      .eq("phone", phone)
      .order("created_at", { ascending: false })
      .limit(1);

    if (latestError) throw latestError;

    if (latestOtp && latestOtp.length > 0) {
      const lastActionTime = new Date(latestOtp[0].last_resend_at || latestOtp[0].created_at);
      const secondsSinceLastAction = Math.floor((now.getTime() - lastActionTime.getTime()) / 1000);

      if (secondsSinceLastAction < RESEND_THROTTLE_SECONDS) {
        return {
          success: false,
          error: `Please wait ${RESEND_THROTTLE_SECONDS - secondsSinceLastAction} seconds before requesting a new OTP.`,
        };
      }
    }

    // 3. Securely generate a 6-digit OTP
    const randomBuffer = crypto.randomBytes(4);
    const randomNum = randomBuffer.readUInt32BE(0);
    const otp = (100000 + (randomNum % 900000)).toString();

    // 4. Hash the OTP for secure database storage
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // 5. Store record in Supabase
    const { error: insertError } = await supabaseServer
      .from("otp_verifications")
      .insert({
        phone,
        otp_hash: otpHash,
        expires_at: expiresAt.toISOString(),
        verified: false,
        attempts: 0,
        resend_count: 0,
      });

    if (insertError) throw insertError;

    return { success: true, otp };
  } catch (error: any) {
    console.error("Database error generating OTP:", error);
    // Graceful fallback for unexpected database connection errors
    if (error.code === "PGRST205" || error.message?.includes("otp_verifications")) {
      console.warn("⚠️ Triggering in-memory OTP fallback due to table cache error.");
      useInMemoryFallback = true;
      return generateOtpInMemory(phone, now, oneHourAgo);
    }
    return { success: false, error: error.message || "Failed to generate OTP" };
  }
}

/**
 * Validate a user-submitted OTP for a given phone number.
 */
export async function verifyOtp(phone: string, submittedOtp: string): Promise<{ success: boolean; error?: string }> {
  const now = new Date();

  if (useInMemoryFallback) {
    return verifyOtpInMemory(phone, submittedOtp, now);
  }

  try {
    // 1. Fetch latest active OTP for this phone
    const { data: records, error: fetchError } = await supabaseServer
      .from("otp_verifications")
      .select("*")
      .eq("phone", phone)
      .eq("verified", false)
      .gt("expires_at", now.toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    if (fetchError) {
      if (fetchError.code === "PGRST205" || fetchError.message?.includes("otp_verifications")) {
        useInMemoryFallback = true;
        return verifyOtpInMemory(phone, submittedOtp, now);
      }
      throw fetchError;
    }

    if (!records || records.length === 0) {
      return { success: false, error: "Your OTP has expired or is invalid. Please request a new one." };
    }

    const otpRecord = records[0];

    // 2. Check retry limit
    if (otpRecord.attempts >= MAX_VERIFICATION_ATTEMPTS) {
      return {
        success: false,
        error: "Maximum verification attempts exceeded. Please request a new OTP.",
      };
    }

    // 3. Hash submitted OTP and compare
    const submittedHash = hashOtp(submittedOtp.trim());

    if (submittedHash === otpRecord.otp_hash) {
      // SUCCESS: Mark as verified
      const { error: updateError } = await supabaseServer
        .from("otp_verifications")
        .update({ verified: true })
        .eq("id", otpRecord.id);

      if (updateError) throw updateError;

      return { success: true };
    } else {
      // FAILURE: Increment attempts
      const newAttempts = otpRecord.attempts + 1;
      const { error: attemptError } = await supabaseServer
        .from("otp_verifications")
        .update({ attempts: newAttempts })
        .eq("id", otpRecord.id);

      if (attemptError) throw attemptError;

      const remaining = MAX_VERIFICATION_ATTEMPTS - newAttempts;
      if (remaining <= 0) {
        return {
          success: false,
          error: "Maximum verification attempts exceeded. Please request a new OTP.",
        };
      }

      return {
        success: false,
        error: `Invalid OTP code. ${remaining} attempts remaining.`,
      };
    }
  } catch (error: any) {
    console.error("Database error verifying OTP:", error);
    if (error.code === "PGRST205" || error.message?.includes("otp_verifications")) {
      useInMemoryFallback = true;
      return verifyOtpInMemory(phone, submittedOtp, now);
    }
    return { success: false, error: error.message || "Failed to verify OTP" };
  }
}

/**
 * Handle secure resends, updating the active OTP hash, expiry timer, and incrementing counters.
 */
export async function resendOtp(phone: string): Promise<{ success: boolean; otp?: string; error?: string }> {
  const now = new Date();

  if (useInMemoryFallback) {
    return resendOtpInMemory(phone, now);
  }

  try {
    // 1. Fetch latest active unverified OTP
    const { data: records, error: fetchError } = await supabaseServer
      .from("otp_verifications")
      .select("*")
      .eq("phone", phone)
      .eq("verified", false)
      .gt("expires_at", now.toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    if (fetchError) {
      if (fetchError.code === "PGRST205" || fetchError.message?.includes("otp_verifications")) {
        useInMemoryFallback = true;
        return resendOtpInMemory(phone, now);
      }
      throw fetchError;
    }

    // If no active OTP exists, generate a brand new one
    if (!records || records.length === 0) {
      return generateOtp(phone);
    }

    const otpRecord = records[0];

    // 2. Throttle check (must wait 60s since last resend or original creation)
    const lastActionTime = new Date(otpRecord.last_resend_at || otpRecord.created_at);
    const secondsSinceLastAction = Math.floor((now.getTime() - lastActionTime.getTime()) / 1000);

    if (secondsSinceLastAction < RESEND_THROTTLE_SECONDS) {
      return {
        success: false,
        error: `Please wait ${RESEND_THROTTLE_SECONDS - secondsSinceLastAction} seconds before resending.`,
      };
    }

    // 3. Generate new 6-digit OTP
    const randomBuffer = crypto.randomBytes(4);
    const randomNum = randomBuffer.readUInt32BE(0);
    const newOtp = (100000 + (randomNum % 900000)).toString();

    // 4. Update database record with new hash and reset attempts
    const newHash = hashOtp(newOtp);
    const newExpiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);

    const { error: updateError } = await supabaseServer
      .from("otp_verifications")
      .update({
        otp_hash: newHash,
        expires_at: newExpiresAt.toISOString(),
        attempts: 0,
        resend_count: otpRecord.resend_count + 1,
        last_resend_at: now.toISOString(),
      })
      .eq("id", otpRecord.id);

    if (updateError) throw updateError;

    return { success: true, otp: newOtp };
  } catch (error: any) {
    console.error("Database error resending OTP:", error);
    if (error.code === "PGRST205" || error.message?.includes("otp_verifications")) {
      useInMemoryFallback = true;
      return resendOtpInMemory(phone, now);
    }
    return { success: false, error: error.message || "Failed to resend OTP" };
  }
}

// ----------------------------------------------------
// Local In-Memory Implementations
// ----------------------------------------------------

function generateOtpInMemory(phone: string, now: Date, oneHourAgo: Date) {
  // 1. Rate Limiting check
  const recentOtps = inMemoryOtps.filter(
    (r) => r.phone === phone && r.created_at.getTime() > oneHourAgo.getTime()
  );
  if (recentOtps.length >= HOURLY_LIMIT) {
    return {
      success: false,
      error: `Rate limit exceeded. Maximum ${HOURLY_LIMIT} OTPs per hour. Please try again later.`,
    };
  }

  // 2. Cooldown check
  const userOtps = inMemoryOtps
    .filter((r) => r.phone === phone)
    .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());

  if (userOtps.length > 0) {
    const lastAction = userOtps[0].last_resend_at || userOtps[0].created_at;
    const diffSeconds = Math.floor((now.getTime() - lastAction.getTime()) / 1000);
    if (diffSeconds < RESEND_THROTTLE_SECONDS) {
      return {
        success: false,
        error: `Please wait ${RESEND_THROTTLE_SECONDS - diffSeconds} seconds before requesting a new OTP.`,
      };
    }
  }

  // 3. Generate OTP code
  const randomBuffer = crypto.randomBytes(4);
  const randomNum = randomBuffer.readUInt32BE(0);
  const otp = (100000 + (randomNum % 900000)).toString();

  // 4. Save to list
  const otpHash = hashOtp(otp);
  const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);

  inMemoryOtps.push({
    id: Math.random().toString(36).substring(7),
    phone,
    otp_hash: otpHash,
    created_at: now,
    expires_at: expiresAt,
    verified: false,
    attempts: 0,
    resend_count: 0,
    last_resend_at: null,
  });

  return { success: true, otp };
}

function verifyOtpInMemory(phone: string, submittedOtp: string, now: Date) {
  const activeRecord = inMemoryOtps
    .filter((r) => r.phone === phone && !r.verified && r.expires_at.getTime() > now.getTime())
    .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())[0];

  if (!activeRecord) {
    return { success: false, error: "Your OTP has expired or is invalid. Please request a new one." };
  }

  if (activeRecord.attempts >= MAX_VERIFICATION_ATTEMPTS) {
    return {
      success: false,
      error: "Maximum verification attempts exceeded. Please request a new OTP.",
    };
  }

  const submittedHash = hashOtp(submittedOtp.trim());
  if (submittedHash === activeRecord.otp_hash) {
    activeRecord.verified = true;
    return { success: true };
  } else {
    activeRecord.attempts += 1;
    const remaining = MAX_VERIFICATION_ATTEMPTS - activeRecord.attempts;
    if (remaining <= 0) {
      return {
        success: false,
        error: "Maximum verification attempts exceeded. Please request a new OTP.",
      };
    }
    return {
      success: false,
      error: `Invalid OTP code. ${remaining} attempts remaining.`,
    };
  }
}

function resendOtpInMemory(phone: string, now: Date) {
  const activeRecord = inMemoryOtps
    .filter((r) => r.phone === phone && !r.verified && r.expires_at.getTime() > now.getTime())
    .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())[0];

  if (!activeRecord) {
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    return generateOtpInMemory(phone, now, oneHourAgo);
  }

  const lastAction = activeRecord.last_resend_at || activeRecord.created_at;
  const diffSeconds = Math.floor((now.getTime() - lastAction.getTime()) / 1000);
  if (diffSeconds < RESEND_THROTTLE_SECONDS) {
    return {
      success: false,
      error: `Please wait ${RESEND_THROTTLE_SECONDS - diffSeconds} seconds before resending.`,
    };
  }

  const randomBuffer = crypto.randomBytes(4);
  const randomNum = randomBuffer.readUInt32BE(0);
  const newOtp = (100000 + (randomNum % 900000)).toString();

  activeRecord.otp_hash = hashOtp(newOtp);
  activeRecord.expires_at = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);
  activeRecord.attempts = 0;
  activeRecord.resend_count += 1;
  activeRecord.last_resend_at = now;

  return { success: true, otp: newOtp };
}
