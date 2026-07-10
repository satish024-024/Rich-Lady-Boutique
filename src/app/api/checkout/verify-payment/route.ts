import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseServer } from "@/utils/supabaseServer";
import { sendEmail } from "@/utils/emailService";
import {
  getOrderConfirmationEmail,
  getPaymentSuccessEmail,
  getAdminNewOrderNotification
} from "@/utils/emailTemplates";

export async function POST(request: Request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      customerDetails,
      items,
      couponCode,
    } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing Razorpay details" }, { status: 400 });
    }

    if (!customerDetails || !items || !Array.isArray(items)) {
      return NextResponse.json({ error: "Missing customer or item details" }, { status: 400 });
    }

    // 1. Verify Razorpay Signature
    const text = razorpay_order_id + "|" + razorpay_payment_id;
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(text)
      .digest("hex");

    const isSignatureValid = generated_signature === razorpay_signature;

    if (!isSignatureValid) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // 2. Calculate actual server-side verified amount again
    let totalAmount = 0;
    const orderItemsToInsert: any[] = [];
    const emailItems: any[] = [];

    for (const item of items) {
      const { data: product, error } = await supabaseServer
        .from("products")
        .select("name, price")
        .eq("id", item.id)
        .single();

      if (error || !product) {
        return NextResponse.json({ error: `Product not found: ${item.id}` }, { status: 400 });
      }

      const qty = item.quantity || 1;
      const itemPrice = Number(product.price);
      totalAmount += itemPrice * qty;

      orderItemsToInsert.push({
        product_id: item.id,
        quantity: qty,
        price: itemPrice,
      });

      emailItems.push({
        name: product.name,
        price: itemPrice,
        quantity: qty,
      });
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

    // 3. Save Order in Supabase (with self-healing fallback for missing customer_email column)
    const orderPayload: any = {
      customer_name: customerDetails.name,
      customer_phone: customerDetails.phone,
      customer_email: customerDetails.email || null,
      shipping_address: customerDetails.address,
      city: customerDetails.city,
      pincode: customerDetails.pincode,
      total_amount: discountedAmount, // Save final verified discounted total
      payment_status: "paid",
      razorpay_order_id,
      razorpay_payment_id,
    };

    let { data: order, error: orderError } = await supabaseServer
      .from("orders")
      .insert(orderPayload)
      .select()
      .single();

    if (orderError) {
      console.warn("Primary order insert failed, checking for schema mismatch:", orderError.message);
      const isMissingEmailCol =
        orderError.code === "PGRST204" ||
        orderError.message?.includes("customer_email") ||
        orderError.message?.includes("column \"customer_email\" of relation \"orders\" does not exist");

      if (isMissingEmailCol) {
        console.warn("⚠️ 'customer_email' column does not exist on your Supabase 'orders' table. Retrying order save without it.");
        delete orderPayload.customer_email;
        const retry = await supabaseServer
          .from("orders")
          .insert(orderPayload)
          .select()
          .single();
        order = retry.data;
        orderError = retry.error;
      }
    }

    if (orderError || !order) {
      console.error("Failed to save order in Supabase:", orderError);
      return NextResponse.json({ error: "Payment verified but failed to record order" }, { status: 500 });
    }

    // 4. Save Order Items in Supabase
    const orderItemsWithOrderId = orderItemsToInsert.map((item) => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemsError } = await supabaseServer
      .from("order_items")
      .insert(orderItemsWithOrderId);

    if (itemsError) {
      console.error("Failed to save order items in Supabase:", itemsError);
    }

    // 5. Deduct product inventory stock (with self-healing fallback)
    for (const item of items) {
      const qty = item.quantity || 1;
      let currentStock: number | null = null;
      try {
        const { data: stockData } = await supabaseServer
          .from("products")
          .select("stock")
          .eq("id", item.id)
          .single();
        if (stockData && stockData.stock !== undefined && stockData.stock !== null) {
          currentStock = Number(stockData.stock);
        }
      } catch (err) {
        console.warn("Could not retrieve stock info for product:", item.id);
      }

      if (currentStock !== null) {
        const newStock = Math.max(0, currentStock - qty);
        try {
          const { error: updateStockErr } = await supabaseServer
            .from("products")
            .update({ stock: newStock })
            .eq("id", item.id);
          if (updateStockErr) {
            console.error(`Failed to deduct inventory for ${item.id}:`, updateStockErr.message);
          }
        } catch (err: any) {
          console.error(`Exception while deducting inventory for ${item.id}:`, err.message);
        }
      }
    }

    // ----------------------------------------------------
    // Async Triggers: Notifications & Confirmations
    // ----------------------------------------------------
    const orderRef = `#RL-${order.id.slice(0, 8).toUpperCase()}`;

    // A. Send Order Confirmation Email (to customer)
    if (order.customer_email) {
      const orderConfHtml = getOrderConfirmationEmail(order, emailItems);
      sendEmail({
        to: order.customer_email,
        subject: `Order Confirmed ${orderRef} - Rich Lady Boutique`,
        html: orderConfHtml,
        type: "order_confirmation",
        orderId: order.id,
      }).catch((err) => console.error("Error sending order confirmation email:", err));
      
      // B. Send Payment Success Email (to customer)
      const paySuccessHtml = getPaymentSuccessEmail(order);
      sendEmail({
        to: order.customer_email,
        subject: `Payment Successful for Order ${orderRef}`,
        html: paySuccessHtml,
        type: "payment_success",
        orderId: order.id,
      }).catch((err) => console.error("Error sending payment success email:", err));
    }

    // C. SMS Order Confirmation removed (handled by Shiprocket)

    // D. Send Admin Order Notification Email
    const adminEmail = process.env.ADMIN_ALERT_EMAIL || "orders@richladyboutique.com";
    const adminAlertHtml = getAdminNewOrderNotification(order, emailItems);
    sendEmail({
      to: adminEmail,
      subject: `[ADMIN ALERT] New Order ${orderRef} Placed`,
      html: adminAlertHtml,
      type: "admin_new_order",
      orderId: order.id,
    }).catch((err) => console.error("Error sending admin order notification email:", err));

    return NextResponse.json({
      success: true,
      message: "Payment verified and order saved successfully",
      orderId: order.id,
    });
  } catch (error: any) {
    console.error("Error verifying Razorpay payment:", error);
    return NextResponse.json({ error: error.message || "Verification failed" }, { status: 500 });
  }
}
