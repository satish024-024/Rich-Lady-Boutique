import { NextResponse } from "next/server";
import { supabaseServer } from "@/utils/supabaseServer";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const phone = searchParams.get("phone");

    if (!email && !phone) {
      return NextResponse.json({ error: "Missing email or phone query parameter" }, { status: 400 });
    }

    const queryFilter = [];
    if (email) queryFilter.push(`customer_email.eq.${email}`);
    if (phone) queryFilter.push(`customer_phone.eq.${phone}`);

    const { data, error } = await supabaseServer
      .from("orders")
      .select(`
        *,
        order_items (
          id,
          quantity,
          price,
          products (
            id,
            name,
            side_profile1_url
          )
        )
      `)
      .or(queryFilter.join(","))
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const mappedOrders = (data || []).map((ord: any) => ({
      ...ord,
      order_items: (ord.order_items || []).map((item: any) => ({
        ...item,
        products: item.products ? {
          name: item.products.name,
          image_url: item.products.side_profile1_url || "/images/prod_fallback.jpg",
          category: "Artisan Craft", // Fallback category string
        } : null,
      })),
    }));

    return NextResponse.json({ success: true, orders: mappedOrders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
