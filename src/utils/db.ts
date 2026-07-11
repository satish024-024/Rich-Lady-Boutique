import { Product } from "@/types/product";
import { productsData } from "@/data/products";
import { Category } from "@/types/category";
import { categoriesData } from "@/data/categories";
import { supabase } from "./supabaseClient";

// Existing local fallback helpers
export function getLocalProducts(): Product[] {
  if (typeof window === "undefined") return productsData;
  const saved = localStorage.getItem("rich-lady-products");
  if (!saved) {
    localStorage.setItem("rich-lady-products", JSON.stringify(productsData));
    return productsData;
  }
  const parsed: Product[] = JSON.parse(saved);
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
  window.dispatchEvent(new Event("products-updated"));
}

export function getLocalCategories(): Category[] {
  if (typeof window === "undefined") return categoriesData;
  const saved = localStorage.getItem("rich-lady-categories");
  if (!saved) {
    localStorage.setItem("rich-lady-categories", JSON.stringify(categoriesData));
    return categoriesData;
  }
  return JSON.parse(saved);
}

export function saveLocalCategories(categories: Category[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("rich-lady-categories", JSON.stringify(categories));
  window.dispatchEvent(new Event("categories-updated"));
}

// ----------------------------------------------------
// New Async Supabase Integrated Methods
// ----------------------------------------------------

export async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    
    if (!data || data.length === 0) {
      // If DB is empty, use local products
      return getLocalProducts();
    }

    const mapped: Product[] = data.map((p: any) => ({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      imageUrl: p.image_url,
      sideProfile1Url: p.side_profile1_url || "",
      sideProfile2Url: p.side_profile2_url || "",
      collectionTag: p.collection_tag || "",
      category: p.category ? p.category.charAt(0).toUpperCase() + p.category.slice(1).replace("-", " ") : "",
      rating: Number(p.rating),
      reviewsCount: p.reviews_count,
      isNewArrival: p.is_new_arrival,
      description: p.description,
      stock: p.stock !== undefined && p.stock !== null ? Number(p.stock) : 10,
      fabric: p.fabric || "",
      dimensions: p.dimensions || "",
      garmentCut: p.garment_cut || "",
      artisanOrigin: p.artisan_origin || "",
      weavingStyle: p.weaving_style || "",
      craftTime: p.craft_time || "",
      threadCount: p.thread_count || "",
      washingStandard: p.washing_standard || "",
    }));

    if (typeof window !== "undefined") {
      localStorage.setItem("rich-lady-products", JSON.stringify(mapped));
    }
    return mapped;
  } catch (err) {
    console.error("Failed to fetch products from Supabase, falling back to local storage:", err);
    return getLocalProducts();
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      return getLocalCategories();
    }

    const mapped: Category[] = data.map((c: any) => ({
      id: c.id,
      title: c.name,
      imageUrl: c.image_url,
      link: `/catalog?category=${c.name}`,
    }));

    if (typeof window !== "undefined") {
      localStorage.setItem("rich-lady-categories", JSON.stringify(mapped));
    }
    return mapped;
  } catch (err) {
    console.error("Failed to fetch categories from Supabase:", err);
    return getLocalCategories();
  }
}

export async function addProduct(prod: Product): Promise<void> {
  try {
    const dbProduct = {
      id: prod.id,
      name: prod.name,
      price: prod.price,
      image_url: prod.imageUrl,
      side_profile1_url: prod.sideProfile1Url || null,
      side_profile2_url: prod.sideProfile2Url || null,
      category: prod.category ? prod.category.toLowerCase().replace(/\s+/g, "-") : null,
      collection_tag: prod.collectionTag || null,
      rating: prod.rating,
      reviews_count: prod.reviewsCount,
      is_new_arrival: prod.isNewArrival,
      description: prod.description,
      stock: prod.stock !== undefined && prod.stock !== null ? prod.stock : 10,
      fabric: prod.fabric || null,
      dimensions: prod.dimensions || null,
      garment_cut: prod.garmentCut || null,
      artisan_origin: prod.artisanOrigin || null,
      weaving_style: prod.weavingStyle || null,
      craft_time: prod.craftTime || null,
      thread_count: prod.threadCount || null,
      washing_standard: prod.washingStandard || null,
    };

    const res = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dbProduct),
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      throw new Error(data.error || "Failed to add product via API");
    }

    // Trigger local updates
    if (typeof window !== "undefined") {
      const current = getLocalProducts();
      const updated = [prod, ...current.filter(p => p.id !== prod.id)];
      localStorage.setItem("rich-lady-products", JSON.stringify(updated));
      window.dispatchEvent(new Event("products-updated"));
    }
  } catch (err) {
    console.error("Failed to add product:", err);
    throw err;
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    const res = await fetch(`/api/products?id=${id}`, {
      method: "DELETE",
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      throw new Error(data.error || "Failed to delete product via API");
    }

    if (typeof window !== "undefined") {
      const current = getLocalProducts();
      const updated = current.filter(p => p.id !== id);
      localStorage.setItem("rich-lady-products", JSON.stringify(updated));
      window.dispatchEvent(new Event("products-updated"));
    }
  } catch (err) {
    console.error("Failed to delete product:", err);
    throw err;
  }
}

export async function updateProductPhoto(id: string, imageUrl: string): Promise<void> {
  try {
    const res = await fetch("/api/products", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, imageUrl }),
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      throw new Error(data.error || "Failed to update product photo via API");
    }

    if (typeof window !== "undefined") {
      const current = getLocalProducts();
      const updated = current.map(p => p.id === id ? { ...p, imageUrl } : p);
      localStorage.setItem("rich-lady-products", JSON.stringify(updated));
      window.dispatchEvent(new Event("products-updated"));
    }
  } catch (err) {
    console.error("Failed to update product photo:", err);
    throw err;
  }
}

export async function updateProductStock(id: string, stock: number): Promise<void> {
  try {
    const res = await fetch("/api/products", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, stock }),
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      throw new Error(data.error || "Failed to update product stock via API");
    }

    if (typeof window !== "undefined") {
      const current = getLocalProducts();
      const updated = current.map(p => p.id === id ? { ...p, stock } : p);
      localStorage.setItem("rich-lady-products", JSON.stringify(updated));
      window.dispatchEvent(new Event("products-updated"));
    }
  } catch (err) {
    console.error("Failed to update product stock:", err);
    throw err;
  }
}

export async function updateProductCollectionTag(id: string, collectionTag: string): Promise<void> {
  try {
    const res = await fetch("/api/products", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, collectionTag }),
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      throw new Error(data.error || "Failed to update product occasion tag via API");
    }

    if (typeof window !== "undefined") {
      const current = getLocalProducts();
      const updated = current.map(p => p.id === id ? { ...p, collectionTag } : p);
      localStorage.setItem("rich-lady-products", JSON.stringify(updated));
      window.dispatchEvent(new Event("products-updated"));
    }
  } catch (err) {
    console.error("Failed to update product occasion tag:", err);
    throw err;
  }
}

export async function updateProductSpecs(
  id: string, 
  specs: {
    fabric: string;
    dimensions: string;
    garmentCut: string;
    artisanOrigin: string;
    weavingStyle: string;
    craftTime: string;
    threadCount: string;
    washingStandard: string;
  }
): Promise<void> {
  try {
    const res = await fetch("/api/products", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, ...specs }),
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      throw new Error(data.error || "Failed to update product specifications via API");
    }

    if (typeof window !== "undefined") {
      const current = getLocalProducts();
      const updated = current.map(p => p.id === id ? { ...p, ...specs } : p);
      localStorage.setItem("rich-lady-products", JSON.stringify(updated));
      window.dispatchEvent(new Event("products-updated"));
    }
  } catch (err) {
    console.error("Failed to update product specifications:", err);
    throw err;
  }
}


