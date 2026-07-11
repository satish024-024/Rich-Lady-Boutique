import { NextResponse } from "next/server";
import { supabaseServer } from "@/utils/supabaseServer";
import { createRemoteJWKSet, jwtVerify, SignJWT } from "jose";

const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com")
);

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "default-secret-key-please-replace-in-env-file-with-32-chars-long"
);

export async function POST(request: Request) {
  try {
    const { idToken, name, email } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: "Missing Firebase ID Token" }, { status: 400 });
    }

    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (!projectId) {
      return NextResponse.json({ error: "Firebase Project ID is not configured on the server" }, { status: 500 });
    }

    // 1. Verify the Google Firebase JWT token remotely using certificates
    let payload;
    try {
      const { payload: verifiedPayload } = await jwtVerify(idToken, JWKS, {
        issuer: `https://securetoken.google.com/${projectId}`,
        audience: projectId,
      });
      payload = verifiedPayload;
    } catch (verifyError: any) {
      console.error("Firebase ID Token verification failed:", verifyError);
      return NextResponse.json({ error: "Authentication token verification failed" }, { status: 401 });
    }

    const firebaseUid = payload.sub; // Google Firebase UID is mapped as standard 'sub' field
    const rawPhoneNumber = payload.phone_number as string;

    if (!rawPhoneNumber) {
      return NextResponse.json({ error: "Phone number not found in token claims" }, { status: 400 });
    }

    // Normalize number to last 10 digits for DB alignment
    const cleanPhone = rawPhoneNumber.replace(/\D/g, "").slice(-10);

    // 2. Fetch or Create user profile in Supabase users table
    let { data: user, error: fetchError } = await supabaseServer
      .from("users")
      .select("*")
      .eq("id", firebaseUid)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Supabase user search query failed:", fetchError);
      return NextResponse.json({ error: "Database error querying user profile" }, { status: 500 });
    }

    if (!user) {
      // Check if user exists by phone
      const { data: phoneUser } = await supabaseServer
        .from("users")
        .select("*")
        .eq("phone", cleanPhone)
        .single();
      
      if (phoneUser) {
        // Link Firebase UID to existing phone user
        const { data: updatedUser, error: updateError } = await supabaseServer
          .from("users")
          .update({ id: firebaseUid })
          .eq("phone", cleanPhone)
          .select()
          .single();
        
        if (updateError) {
          console.error("Failed to link user UID:", updateError);
          return NextResponse.json({ error: "Failed to link user credentials" }, { status: 500 });
        }
        user = updatedUser;
      } else {
        // Create user
        const insertPayload = {
          id: firebaseUid,
          phone: cleanPhone,
          name: name || "Boutique Customer",
          email: email || null,
        };

        const { data: newUser, error: insertError } = await supabaseServer
          .from("users")
          .insert(insertPayload)
          .select()
          .single();

        if (insertError) {
          console.error("Supabase create user insert failed:", insertError);
          return NextResponse.json({ error: "Database error saving user account" }, { status: 500 });
        }
        user = newUser;
      }
    } else if (name || email) {
      // Update details if supplied
      const updateData: any = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      updateData.updated_at = new Date().toISOString();

      const { data: updatedUser, error: updateError } = await supabaseServer
        .from("users")
        .update(updateData)
        .eq("id", firebaseUid)
        .select()
        .single();

      if (!updateError && updatedUser) {
        user = updatedUser;
      }
    }

    // 3. Generate our backend Custom JWT Token for frontend state
    const adminPhone = process.env.NEXT_PUBLIC_ADMIN_PHONE || "9912493997";
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@richladyboutique.com";
    
    const isAdminUser = cleanPhone === adminPhone.replace(/\D/g, "").slice(-10) || user.email === adminEmail;

    const tokenClaims = {
      uid: user.id,
      phone: user.phone,
      name: user.name,
      email: user.email,
      role: isAdminUser ? "admin" : "user",
    };

    const customToken = await new SignJWT(tokenClaims)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(secret);

    return NextResponse.json({
      success: true,
      user: {
        phone: user.phone,
        name: user.name,
        email: user.email,
      },
      token: customToken,
    });
  } catch (error: any) {
    console.error("Exception in firebase-login endpoint:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
