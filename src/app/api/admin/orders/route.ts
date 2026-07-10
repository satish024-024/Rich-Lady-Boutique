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
            name,
            image_url
          )
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    console.error("Error fetching admin orders:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch orders" }, { status: 500 });
  }
}
