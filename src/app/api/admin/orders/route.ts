import { NextResponse } from "next/server";
import { supabaseServer } from "@/utils/supabaseServer";

export async function GET() {
  try {
    const { data: orders, error } = await supabaseServer
      .from("orders")
      .select(`
        *,
        order_items (
          id,
          quantity,
          price,
          product_id,
          products (
            id,
            name,
            side_profile1_url
          )
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const mappedOrders = (orders || []).map((ord: any) => ({
      ...ord,
      total: Number(ord.total_amount),
      status: ord.shipping_status,
      order_items: (ord.order_items || []).map((item: any) => ({
        ...item,
        products: item.products ? {
          name: item.products.name,
          image_url: item.products.side_profile1_url || "/images/prod_fallback.jpg",
        } : null,
      })),
    }));

    return NextResponse.json({ success: true, orders: mappedOrders });
  } catch (error: any) {
    console.error("Error fetching admin orders:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch orders" }, { status: 500 });
  }
}
