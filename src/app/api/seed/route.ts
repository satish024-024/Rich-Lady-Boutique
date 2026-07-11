import { NextResponse } from "next/server";
import { supabaseServer } from "@/utils/supabaseServer";
import { productsData } from "@/data/products";
import { categoriesData } from "@/data/categories";

export async function GET() {
  try {
    // 1. Seed categories
    const categoriesToInsert = categoriesData.map((cat) => ({
      id: cat.id,
      name: cat.title,
      image_url: cat.imageUrl,
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
      let mappedCategory = prod.category ? prod.category.toLowerCase().replace(/\s+/g, "-") : null;
      
      return {
        id: prod.id,
        name: prod.name,
        price: prod.price,
        image_url: prod.imageUrl,
        side_profile1_url: prod.sideProfile1Url || null,
        side_profile2_url: prod.sideProfile2Url || null,
        category: mappedCategory,
        rating: prod.rating || 5.0,
        reviews_count: prod.reviewsCount || 0,
        is_new_arrival: prod.isNewArrival || false,
        description: prod.description || "",
        collection_tag: prod.collectionTag || null,
        fabric: prod.fabric || null,
        dimensions: prod.dimensions || null,
        garment_cut: prod.garmentCut || null,
        artisan_origin: prod.artisanOrigin || null,
        weaving_style: prod.weavingStyle || null,
        craft_time: prod.craftTime || null,
        thread_count: prod.threadCount || null,
        washing_standard: prod.washingStandard || null,
      };
    });

    const { error: prodError } = await supabaseServer
      .from("products")
      .upsert(productsToInsert, { onConflict: "id" });

    if (prodError) {
      return NextResponse.json({ error: "Failed to seed products: " + prodError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Database seeded successfully!" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
