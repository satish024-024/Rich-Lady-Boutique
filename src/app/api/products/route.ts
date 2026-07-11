import { NextResponse } from "next/server";
import { supabaseServer } from "@/utils/supabaseServer";
import { productSchema } from "@/utils/validation";
import { revalidateTag } from "next/cache";

// GET: Retrieve products list
export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("products")
      .select("*")
      .eq("is_active", true);

    if (error) {
      return NextResponse.json({
        success: false,
        error: { code: "DB_FETCH_ERROR", message: error.message }
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Products list retrieved successfully",
      data
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: { code: "SERVER_ERROR", message: err.message }
    }, { status: 500 });
  }
}

// POST: Add new product
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
    // Generate server-side slug
    const baseSlug = (payload.name || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    
    // Validate schema
    const validation = productSchema.safeParse({
      ...payload,
      slug: payload.slug || baseSlug,
      price: Number(payload.price),
      quantityAvailable: Number(payload.stock || payload.quantityAvailable || 10)
    });

    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: validation.error.issues[0].message }
      }, { status: 400 });
    }

    const { data: validProduct } = validation;

    // Database payload map
    const dbProduct = {
      name: validProduct.name,
      slug: validProduct.slug,
      price: validProduct.price,
      description: validProduct.description,
      category_id: validProduct.categoryId || null,
      collection_id: validProduct.collectionId || null,
      quantity_available: validProduct.quantityAvailable,
      track_inventory: validProduct.trackInventory,
      allow_backorder: validProduct.allowBackorder,
      rating: validProduct.rating,
      reviews_count: validProduct.reviewsCount,
      is_new_arrival: validProduct.isNewArrival,
      is_active: validProduct.isActive,
      specifications: validProduct.specifications,
      collection_tag: validProduct.collectionTag || null,
      version: 1
    };

    const { data, error } = await supabaseServer
      .from("products")
      .insert(dbProduct)
      .select()
      .single();

    if (error) {
      const isUniqueConflict = error.code === "23505" || error.message?.includes("duplicate key");
      return NextResponse.json({
        success: false,
        error: { 
          code: isUniqueConflict ? "SLUG_CONFLICT" : "DB_INSERT_ERROR", 
          message: isUniqueConflict ? "Product with this name/slug already exists." : error.message 
        }
      }, { status: isUniqueConflict ? 409 : 500 });
    }

    // Insert product images if provided
    const imagesToInsert = [];
    if (payload.imageUrl) {
      imagesToInsert.push({
        product_id: data.id,
        url: payload.imageUrl,
        is_primary: true,
        sort_order: 0
      });
    }
    if (payload.sideProfile1Url) {
      imagesToInsert.push({
        product_id: data.id,
        url: payload.sideProfile1Url,
        is_primary: false,
        sort_order: 1
      });
    }
    if (payload.sideProfile2Url) {
      imagesToInsert.push({
        product_id: data.id,
        url: payload.sideProfile2Url,
        is_primary: false,
        sort_order: 2
      });
    }
    if (imagesToInsert.length > 0) {
      await supabaseServer.from("product_images").insert(imagesToInsert);
    }

    // Revalidate tags
    revalidateTag("products", "default");

    return NextResponse.json({
      success: true,
      message: "Product created successfully",
      data
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: { code: "SERVER_ERROR", message: error.message }
    }, { status: 500 });
  }
}

// PATCH: Updates details or archives products
export async function PATCH(request: Request) {
  try {
    const { id, is_active, quantity_available, ...updates } = await request.json();

    if (!id) {
      return NextResponse.json({
        success: false,
        error: { code: "MISSING_ID", message: "Missing product ID" }
      }, { status: 400 });
    }

    // Verify version/locking if provided
    const updatePayload: any = {};
    if (is_active !== undefined) updatePayload.is_active = is_active;
    if (quantity_available !== undefined) updatePayload.quantity_available = quantity_available;
    
    // Group specs
    if (Object.keys(updates).length > 0) {
      updatePayload.specifications = updates;
    }

    const { error } = await supabaseServer
      .from("products")
      .update(updatePayload)
      .eq("id", id);

    if (error) {
      return NextResponse.json({
        success: false,
        error: { code: "DB_UPDATE_ERROR", message: error.message }
      }, { status: 500 });
    }

    revalidateTag("products", "default");

    return NextResponse.json({
      success: true,
      message: "Product updated successfully"
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: { code: "SERVER_ERROR", message: err.message }
    }, { status: 500 });
  }
}

// DELETE: Soft archive product
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({
        success: false,
        error: { code: "MISSING_ID", message: "Missing product ID" }
      }, { status: 400 });
    }

    // Soft delete: is_active = false
    const { error } = await supabaseServer
      .from("products")
      .update({ is_active: false })
      .eq("id", id);

    if (error) {
      return NextResponse.json({
        success: false,
        error: { code: "DB_DELETE_ERROR", message: error.message }
      }, { status: 500 });
    }

    revalidateTag("products", "default");

    return NextResponse.json({
      success: true,
      message: "Product archived successfully"
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: { code: "SERVER_ERROR", message: error.message }
    }, { status: 500 });
  }
}

// PUT fallback logic to maintain backward compatibility with old forms
export async function PUT(request: Request) {
  try {
    const payload = await request.json();
    const { id, stock, imageUrl, collectionTag, ...specs } = payload;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: { code: "MISSING_ID", message: "Missing product ID" }
      }, { status: 400 });
    }

    const updatePayload: any = {};
    if (stock !== undefined) {
      updatePayload.quantity_available = Number(stock);
    }
    if (collectionTag !== undefined) {
      updatePayload.collection_tag = collectionTag === "" ? null : collectionTag;
    }
    if (Object.keys(specs).length > 0) {
      updatePayload.specifications = specs;
    }

    const { error } = await supabaseServer
      .from("products")
      .update(updatePayload)
      .eq("id", id);

    if (error) {
      return NextResponse.json({
        success: false,
        error: { code: "DB_UPDATE_ERROR", message: error.message }
      }, { status: 500 });
    }

    // Handle photo updates separately if provided
    if (imageUrl) {
      await supabaseServer
        .from("product_images")
        .update({ url: imageUrl })
        .eq("product_id", id);
    }

    revalidateTag("products", "default");

    return NextResponse.json({
      success: true,
      message: "Product updated successfully"
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: { code: "SERVER_ERROR", message: error.message }
    }, { status: 500 });
  }
}
