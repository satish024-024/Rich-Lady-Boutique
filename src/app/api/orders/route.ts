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
            name,
            image_url,
            category
          )
        )
      `)
      .or(queryFilter.join(","))
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, orders: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
