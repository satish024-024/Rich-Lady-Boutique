import { NextResponse } from "next/server";
import { supabaseServer } from "@/utils/supabaseServer";
import { productsData } from "@/data/products";
import { categoriesData } from "@/data/categories";

// Helper to deterministically generate a valid UUID from any string slug
function stringToUUID(str: string): string {
  let hex = "";
  for (let i = 0; i < str.length; i++) {
    hex += str.charCodeAt(i).toString(16);
  }
  while (hex.length < 32) {
    hex += "0";
  }
  hex = hex.substring(0, 32);
  return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20, 32)}`;
}

export async function GET() {
  try {
    // Check if Supabase variables are unset or placeholders
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-project")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Supabase Environment Variables Missing",
          message: "Please create a .env.local file in the project root containing your NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to connect your database.",
        },
        { status: 400 }
      );
    }

    // 1. Seed categories
    const categoriesToInsert = categoriesData.map((cat) => ({
      id: stringToUUID(cat.id),
      name: cat.title,
      slug: cat.id,
      image_url: cat.imageUrl,
      sort_order: 0,
      is_active: true,
      version: 1,
    }));

    const { error: catError } = await supabaseServer
      .from("categories")
      .upsert(categoriesToInsert, { onConflict: "id" });

    if (catError) {
      return NextResponse.json({ error: "Failed to seed categories: " + catError.message }, { status: 500 });
    }

    // 2. Seed products
    const productsToInsert = productsData.map((prod) => {
      // Map capitalized category name to lowercase/kebab-case id
      const mappedCategorySlug = prod.category ? prod.category.toLowerCase().replace(/\s+/g, "-") : null;
      const categoryUUID = mappedCategorySlug ? stringToUUID(mappedCategorySlug) : null;
      
      return {
        id: stringToUUID(prod.id),
        slug: prod.id,
        name: prod.name,
        price: Number(prod.price),
        description: prod.description || "",
        category_id: categoryUUID,
        quantity_available: prod.stock !== undefined ? prod.stock : 10,
        track_inventory: true,
        allow_backorder: false,
        rating: Number(prod.rating || 5.0),
        reviews_count: Number(prod.reviewsCount || 0),
        is_new_arrival: Boolean(prod.isNewArrival || false),
        is_active: true,
        collection_tag: prod.collectionTag || null,
        fabric: prod.fabric || null,
        dimensions: prod.dimensions || null,
        garment_cut: prod.garmentCut || null,
        artisan_origin: prod.artisanOrigin || null,
        weaving_style: prod.weavingStyle || null,
        craft_time: prod.craftTime || null,
        thread_count: prod.threadCount || null,
        washing_standard: prod.washingStandard || null,
        version: 1,
      };
    });

    const { error: prodError } = await supabaseServer
      .from("products")
      .upsert(productsToInsert, { onConflict: "id" });

    if (prodError) {
      return NextResponse.json({ error: "Failed to seed products: " + prodError.message }, { status: 500 });
    }

    // 3. Seed product images into product_images table
    const productImagesToInsert: any[] = [];
    productsData.forEach((prod) => {
      const productUUID = stringToUUID(prod.id);
      
      // Primary Image
      productImagesToInsert.push({
        product_id: productUUID,
        url: prod.imageUrl,
        sort_order: 0,
        is_primary: true,
        alt_text: `${prod.name} Main View`,
      });

      // Side Profile 1
      if (prod.sideProfile1Url) {
        productImagesToInsert.push({
          product_id: productUUID,
          url: prod.sideProfile1Url,
          sort_order: 1,
          is_primary: false,
          alt_text: `${prod.name} Side Detail 1`,
        });
      }

      // Side Profile 2
      if (prod.sideProfile2Url) {
        productImagesToInsert.push({
          product_id: productUUID,
          url: prod.sideProfile2Url,
          sort_order: 2,
          is_primary: false,
          alt_text: `${prod.name} Side Detail 2`,
        });
      }
    });

    const { error: imgError } = await supabaseServer
      .from("product_images")
      .upsert(productImagesToInsert, { onConflict: "product_id,url" });

    // Note: upsert on product_images needs a unique constraint on (product_id, url) to conflict on,
    // which is not defined in the schema. In case upsert fails due to missing constraint, we fall back to delete and insert.
    if (imgError) {
      console.warn("Product images upsert failed, falling back to delete and insert", imgError);
      
      // Delete old images for seeded products
      const seededProductUUIDs = productsData.map(prod => stringToUUID(prod.id));
      await supabaseServer
        .from("product_images")
        .delete()
        .in("product_id", seededProductUUIDs);

      // Insert new images
      const { error: insertImgError } = await supabaseServer
        .from("product_images")
        .insert(productImagesToInsert);

      if (insertImgError) {
        return NextResponse.json({ error: "Failed to seed product images: " + insertImgError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: "Database seeded successfully!" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
