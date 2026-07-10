import { NextResponse } from "next/server";
import { supabaseServer } from "@/utils/supabaseServer";

// POST: Add new product
export async function POST(request: Request) {
  try {
    const product = await request.json();
    
    let { data, error } = await supabaseServer
      .from("products")
      .insert(product)
      .select()
      .single();

    if (error) {
      console.warn("Primary product insert failed, checking for stock column mismatch:", error.message);
      const isMissingStockCol =
        error.code === "PGRST204" ||
        error.message?.includes("stock") ||
        error.message?.includes("column \"stock\" of relation \"products\" does not exist");

      if (isMissingStockCol && product.hasOwnProperty("stock")) {
        console.warn("⚠️ 'stock' column does not exist on your Supabase 'products' table. Retrying insert without it.");
        const retryPayload = { ...product };
        delete retryPayload.stock;
        const retry = await supabaseServer
          .from("products")
          .insert(retryPayload)
          .select()
          .single();
        data = retry.data;
        error = retry.error;
      }
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Delete a product
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing product ID" }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Update product details (photo or stock level)
export async function PUT(request: Request) {
  try {
    const { id, imageUrl, stock } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Missing product ID" }, { status: 400 });
    }

    const updatePayload: any = {};
    if (imageUrl !== undefined) {
      updatePayload.image_url = imageUrl;
    }
    if (stock !== undefined) {
      updatePayload.stock = Number(stock);
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from("products")
      .update(updatePayload)
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
