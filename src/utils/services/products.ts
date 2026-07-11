import { Product } from "@/types/product";
import { productsData } from "@/data/products";
import { supabase } from "@/utils/supabaseClient";

// Local storage fallback helpers
export function getLocalProducts(): Product[] {
  if (typeof window === "undefined") return productsData;
  const saved = localStorage.getItem("rich-lady-products");
  if (!saved) {
    localStorage.setItem("rich-lady-products", JSON.stringify(productsData));
    return productsData;
  }
  const parsed: Product[] = JSON.parse(saved);
  
  // Merge missing default seed files
  if (parsed.length < productsData.length) {
    const parsedIds = new Set(parsed.map(p => p.id));
    const missing = productsData.filter(p => !parsedIds.has(p.id));
    if (missing.length > 0) {
      const merged = [...parsed, ...missing];
      localStorage.setItem("rich-lady-products", JSON.stringify(merged));
      return merged;
    }
  }
  return parsed;
}

export function saveLocalProducts(products: Product[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("rich-lady-products", JSON.stringify(products));
}

// ----------------------------------------------------
// Products DB Service
// ----------------------------------------------------

export async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(`
        id, slug, name, price, description, category_id, collection_id,
        quantity_available, track_inventory, allow_backorder, rating,
        reviews_count, is_new_arrival, specifications, collection_tag,
        categories ( id, name, slug )
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      // PGRST116 = no rows | 42P01 = table doesn't exist yet (migration not run)
      if (error.code === "PGRST116" || error.code === "42P01") {
        return getLocalProducts();
      }
      throw error;
    }

    if (!data || data.length === 0) {
      return getLocalProducts();
    }

    // Parallel fetch for product images
    const { data: imagesData } = await supabase
      .from("product_images")
      .select("product_id, url, sort_order, is_primary")
      .order("sort_order", { ascending: true });

    const imagesMap: Record<string, string[]> = {};
    if (imagesData) {
      imagesData.forEach((img: any) => {
        if (!imagesMap[img.product_id]) imagesMap[img.product_id] = [];
        imagesMap[img.product_id].push(img.url);
      });
    }

    const mapped: Product[] = data.map((p: any) => {
      const prodImages = imagesMap[p.id] || [];
      const specs = p.specifications || {};
      
      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        price: Number(p.price),
        imageUrl: prodImages[0] || "/images/prod_fallback.jpg",
        sideProfile1Url: prodImages[1] || "",
        sideProfile2Url: prodImages[2] || "",
        category: p.categories?.name || "",
        collectionTag: p.collection_tag || "",
        rating: Number(p.rating),
        reviewsCount: p.reviews_count,
        isNewArrival: p.is_new_arrival,
        description: p.description || "",
        stock: p.quantity_available,
        fabric: specs.fabric || "",
        dimensions: specs.dimensions || "",
        garmentCut: specs.garment_cut || "",
        artisanOrigin: specs.artisan_origin || "",
        weavingStyle: specs.weaving_style || "",
        craftTime: specs.craft_time || "",
        threadCount: specs.thread_count || "",
        washingStandard: specs.washing_standard || "",
      };
    });

    if (typeof window !== "undefined") {
      saveLocalProducts(mapped);
    }
    return mapped;
  } catch (err) {
    console.warn("getProducts: falling back to local data.", err);
    return getLocalProducts();
  }
}
