import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { supabaseServer } from "@/utils/supabaseServer";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder_key",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder_secret",
});

export async function POST(request: Request) {
  try {
    const { items, couponCode } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Missing items in order" }, { status: 400 });
    }

    // Server-side amount verification to prevent tampering
    let totalAmount = 0;

    for (const item of items) {
      // Fetch product from Supabase to verify price and stock
      let product: any = null;
      let dbError: any = null;

      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id);
      const query = supabaseServer.from("products").select("price, quantity_available");
      if (isUuid) {
        query.eq("id", item.id);
      } else {
        query.eq("slug", item.id);
      }

      const firstQuery = await query.single();
      product = firstQuery.data;
      dbError = firstQuery.error;

      if (dbError || !product) {
        return NextResponse.json({ error: `Product not found in database: ${item.id}` }, { status: 400 });
      }

      const qty = item.quantity || 1;
      const stockCount = product.quantity_available !== null ? Number(product.quantity_available) : 10;
      if (qty > stockCount) {
        return NextResponse.json({ error: `Insufficient stock for product: ${item.id}. Only ${stockCount} left.` }, { status: 400 });
      }

      // Sum it up
      totalAmount += Number(product.price) * qty;
    }

    // Apply Coupon discount if present (server-side verification)
    let discountedAmount = totalAmount;
    if (couponCode) {
      const cleanCode = couponCode.trim().toUpperCase();
      let discountType: "percentage" | "flat" | null = null;
      let discountValue = 0;
      let minOrder = 0;

      // 1. Try DB
      try {
        const { data: coupon } = await supabaseServer
          .from("coupons")
          .select("*")
          .eq("code", cleanCode)
          .eq("is_active", true)
          .single();
        if (coupon) {
          discountType = coupon.discount_type;
          discountValue = Number(coupon.discount_value);
          minOrder = Number(coupon.min_order_value || 0);
        }
      } catch (e) {}

      // 2. Try Static Fallback
      if (!discountType) {
        const staticCoupons: Record<string, { type: "percentage" | "flat"; value: number; minOrder?: number }> = {
          WELCOME10: { type: "percentage", value: 10 },
          FESTIVE15: { type: "percentage", value: 15, minOrder: 2000 },
          BOUTIQUE500: { type: "flat", value: 500, minOrder: 3000 },
        };
        const promo = staticCoupons[cleanCode];
        if (promo) {
          discountType = promo.type;
          discountValue = promo.value;
          minOrder = promo.minOrder || 0;
        }
      }

      if (discountType && totalAmount >= minOrder) {
        if (discountType === "percentage") {
          discountedAmount = Math.max(0, totalAmount - (totalAmount * discountValue) / 100);
        } else if (discountType === "flat") {
          discountedAmount = Math.max(0, totalAmount - discountValue);
        }
      }
    }

    // Razorpay amount is in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(discountedAmount * 100);

    // Create a new Razorpay order
    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    const errorMessage = error?.message || 
      (typeof error === "object" ? JSON.stringify(error) : String(error));
    return NextResponse.json({ error: errorMessage || "Failed to create order" }, { status: 500 });
  }
}
