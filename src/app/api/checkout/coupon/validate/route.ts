import { NextResponse } from "next/server";
import { supabaseServer } from "@/utils/supabaseServer";

export async function POST(request: Request) {
  try {
    const { code, totalAmount } = await request.json();
    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    // 1. Try querying Supabase coupons table first (if it exists)
    try {
      const { data: coupon, error } = await supabaseServer
        .from("coupons")
        .select("*")
        .eq("code", cleanCode)
        .eq("is_active", true)
        .single();

      if (!error && coupon) {
        // Validate min order value
        if (coupon.min_order_value && totalAmount < Number(coupon.min_order_value)) {
          return NextResponse.json({
            error: `Coupon valid on orders above ₹${Number(coupon.min_order_value).toLocaleString("en-IN")}`
          }, { status: 400 });
        }

        return NextResponse.json({
          success: true,
          code: coupon.code,
          discountType: coupon.discount_type, // "percentage" | "flat"
          discountValue: Number(coupon.discount_value),
        });
      }
    } catch (e) {
      console.warn("Coupons table not found in Supabase schema, utilizing static fallbacks.");
    }

    // 2. Static fallbacks (Self-healing out of the box)
    const staticCoupons: Record<string, { type: "percentage" | "flat"; value: number; minOrder?: number }> = {
      WELCOME10: { type: "percentage", value: 10 },
      FESTIVE15: { type: "percentage", value: 15, minOrder: 2000 },
      BOUTIQUE500: { type: "flat", value: 500, minOrder: 3000 },
    };

    const promo = staticCoupons[cleanCode];
    if (!promo) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 });
    }

    if (promo.minOrder && totalAmount < promo.minOrder) {
      return NextResponse.json({
        error: `Coupon valid on orders above ₹${promo.minOrder.toLocaleString("en-IN")}`
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      code: cleanCode,
      discountType: promo.type,
      discountValue: promo.value,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to validate coupon" }, { status: 500 });
  }
}
