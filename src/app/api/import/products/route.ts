import { NextResponse } from "next/server";
import { supabaseServer } from "@/utils/supabaseServer";
import { productSchema } from "@/utils/validation";
import { revalidateTag } from "next/cache";

export async function POST(request: Request) {
  try {
    const { products, filename, categoryMappings } = await request.json();

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({
        success: false,
        error: { code: "INVALID_PAYLOAD", message: "Payload must contain an array of products." }
      }, { status: 400 });
    }

    // 1. Resolve Category mappings & verify DB category IDs
    const { data: dbCategories, error: catError } = await supabaseServer
      .from("categories")
      .select("id, name, slug");

    if (catError) {
      return NextResponse.json({
        success: false,
        error: { code: "DB_FETCH_ERROR", message: "Failed to retrieve category options for mapping." }
      }, { status: 500 });
    }

    const categoriesMap: Record<string, string> = {};
    dbCategories.forEach((c) => {
      categoriesMap[c.name.toLowerCase()] = c.id;
    });

    const unresolvedCategories: string[] = [];
    const parsedProducts: any[] = [];
    const failedRows: any[] = [];

    // Parse and map categories
    products.forEach((p: any, idx: number) => {
      const rawCategoryName = (p.category || "").trim();
      const lowerCat = rawCategoryName.toLowerCase();
      
      let mappedId = categoriesMap[lowerCat] || null;

      // Check if user provided explicit mapping
      if (!mappedId && categoryMappings && categoryMappings[rawCategoryName]) {
        mappedId = categoryMappings[rawCategoryName];
      }

      if (!mappedId && rawCategoryName) {
        if (!unresolvedCategories.includes(rawCategoryName)) {
          unresolvedCategories.push(rawCategoryName);
        }
      }

      // Generate server slug
      const generatedSlug = (p.name || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") + "-" + Math.floor(1000 + Math.random() * 9000);

      const validation = productSchema.safeParse({
        name: p.name,
        slug: generatedSlug,
        price: Number(p.price || 0),
        description: p.description || "",
        categoryId: mappedId || undefined,
        quantityAvailable: Number(p.quantityAvailable || p.stock || 10),
        trackInventory: p.trackInventory !== false,
        allowBackorder: p.allowBackorder === true,
        isNewArrival: p.isNewArrival !== false,
        isActive: true,
        imageUrl: p.imageUrl || "",
        specifications: {
          fabric: p.fabric || "",
          dimensions: p.dimensions || "",
          garmentCut: p.garmentCut || "",
          artisanOrigin: p.artisanOrigin || "",
          weavingStyle: p.weavingStyle || "",
          craftTime: p.craftTime || "",
          threadCount: p.threadCount || "",
          washingStandard: p.washingStandard || ""
        }
      });

      if (validation.success) {
        parsedProducts.push(validation.data);
      } else {
        failedRows.push({
          row: idx + 1,
          name: p.name || `Row ${idx + 1}`,
          error: validation.error.issues[0].message
        });
      }
    });

    // If there are unresolved categories, pause and return warning mapping block
    if (unresolvedCategories.length > 0) {
      return NextResponse.json({
        success: false,
        error: { 
          code: "UNRESOLVED_CATEGORIES", 
          message: "One or more category titles are unrecognized. Please map them to continue.",
          unresolved: unresolvedCategories,
          availableCategories: dbCategories.map(c => ({ id: c.id, name: c.name }))
        }
      }, { status: 400 });
    }

    // 2. Batch-wise transactional commit in groups of 100 rows
    const BATCH_SIZE = 100;
    let successCount = 0;
    const errors: any[] = [];

    // Create run status in import_history
    const { data: importRun, error: runError } = await supabaseServer
      .from("import_history")
      .insert({
        filename: filename || "bulk_import.csv",
        rows_processed: products.length,
        rows_success: 0,
        rows_failed: failedRows.length,
        status: "running"
      })
      .select()
      .single();

    const runId = importRun?.id;

    for (let i = 0; i < parsedProducts.length; i += BATCH_SIZE) {
      const batch = parsedProducts.slice(i, i + BATCH_SIZE);
      
      const dbBatch = batch.map((p) => ({
        name: p.name,
        slug: p.slug,
        price: p.price,
        description: p.description,
        category_id: p.categoryId || null,
        collection_id: p.collectionId || null,
        quantity_available: p.quantityAvailable,
        track_inventory: p.trackInventory,
        allow_backorder: p.allowBackorder,
        rating: p.rating,
        reviews_count: p.reviewsCount,
        is_new_arrival: p.isNewArrival,
        is_active: p.isActive,
        specifications: p.specifications,
        version: 1
      }));

      const { data: inserted, error: batchErr } = await supabaseServer
        .from("products")
        .insert(dbBatch)
        .select("id");

      if (batchErr) {
        errors.push({
          batchStart: i + 1,
          message: batchErr.message
        });
      } else if (inserted) {
        successCount += inserted.length;
        
        // Populate primary image mappings if defined
        const imageInserts = batch
          .map((p, idx) => {
            if (!p.imageUrl) return null;
            return {
              product_id: inserted[idx].id,
              url: p.imageUrl,
              is_primary: true,
              sort_order: 0
            };
          })
          .filter((x): x is NonNullable<typeof x> => x !== null);

        if (imageInserts.length > 0) {
          await supabaseServer.from("product_images").insert(imageInserts);
        }
      }
    }

    const failedCount = products.length - successCount;
    const finalStatus = failedCount === 0 ? "completed" : (successCount === 0 ? "failed" : "completed");

    // 3. Finalize import run logs entry
    if (runId) {
      await supabaseServer
        .from("import_history")
        .update({
          rows_success: successCount,
          rows_failed: failedCount,
          status: finalStatus,
          error_summary: {
            validationErrors: failedRows,
            databaseErrors: errors
          }
        })
        .eq("id", runId);
    }

    revalidateTag("products", "default");

    return NextResponse.json({
      success: true,
      message: `Batch import completed. Success: ${successCount}, Failed: ${failedCount}`,
      data: {
        successCount,
        failedCount,
        errors: [...failedRows, ...errors]
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: { code: "SERVER_ERROR", message: error.message }
    }, { status: 500 });
  }
}
