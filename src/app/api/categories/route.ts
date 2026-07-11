import { NextResponse } from "next/server";
import { supabaseServer } from "@/utils/supabaseServer";
import { categorySchema } from "@/utils/validation";
import { revalidateTag } from "next/cache";

// GET: Retrieve active categories list
export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      return NextResponse.json({
        success: false,
        error: { code: "DB_FETCH_ERROR", message: error.message }
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Categories list retrieved successfully",
      data
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: { code: "SERVER_ERROR", message: err.message }
    }, { status: 500 });
  }
}

// POST: Add new category
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
    // Generate server slug
    const baseSlug = (payload.name || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const validation = categorySchema.safeParse({
      ...payload,
      slug: payload.slug || baseSlug
    });

    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: validation.error.issues[0].message }
      }, { status: 400 });
    }

    const { data: validCategory } = validation;

    const { data, error } = await supabaseServer
      .from("categories")
      .insert({
        name: validCategory.name,
        slug: validCategory.slug,
        image_url: validCategory.imageUrl || null,
        sort_order: validCategory.sortOrder,
        is_active: validCategory.isActive,
        version: 1
      })
      .select()
      .single();

    if (error) {
      const isUniqueConflict = error.code === "23505" || error.message?.includes("duplicate key");
      return NextResponse.json({
        success: false,
        error: { 
          code: isUniqueConflict ? "SLUG_CONFLICT" : "DB_INSERT_ERROR", 
          message: isUniqueConflict ? "Category with this slug already exists." : error.message 
        }
      }, { status: isUniqueConflict ? 409 : 500 });
    }

    revalidateTag("categories", "default");

    return NextResponse.json({
      success: true,
      message: "Category created successfully",
      data
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: { code: "SERVER_ERROR", message: error.message }
    }, { status: 500 });
  }
}

// PATCH: Update category details or archive it
export async function PATCH(request: Request) {
  try {
    const { id, is_active, name, image_url, sort_order } = await request.json();

    if (!id) {
      return NextResponse.json({
        success: false,
        error: { code: "MISSING_ID", message: "Missing category ID" }
      }, { status: 400 });
    }

    const updatePayload: any = {};
    if (is_active !== undefined) updatePayload.is_active = is_active;
    if (name !== undefined) updatePayload.name = name;
    if (image_url !== undefined) updatePayload.image_url = image_url;
    if (sort_order !== undefined) updatePayload.sort_order = sort_order;

    const { error } = await supabaseServer
      .from("categories")
      .update(updatePayload)
      .eq("id", id);

    if (error) {
      return NextResponse.json({
        success: false,
        error: { code: "DB_UPDATE_ERROR", message: error.message }
      }, { status: 500 });
    }

    revalidateTag("categories", "default");

    return NextResponse.json({
      success: true,
      message: "Category updated successfully"
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: { code: "SERVER_ERROR", message: err.message }
    }, { status: 500 });
  }
}

// DELETE: Soft archive category
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({
        success: false,
        error: { code: "MISSING_ID", message: "Missing category ID" }
      }, { status: 400 });
    }

    // Soft delete: is_active = false
    const { error } = await supabaseServer
      .from("categories")
      .update({ is_active: false })
      .eq("id", id);

    if (error) {
      return NextResponse.json({
        success: false,
        error: { code: "DB_DELETE_ERROR", message: error.message }
      }, { status: 500 });
    }

    revalidateTag("categories", "default");

    return NextResponse.json({
      success: true,
      message: "Category archived successfully"
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: { code: "SERVER_ERROR", message: error.message }
    }, { status: 500 });
  }
}
