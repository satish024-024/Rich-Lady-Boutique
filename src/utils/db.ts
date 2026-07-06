import { Product } from "@/types/product";
import { productsData } from "@/data/products";
import { Category } from "@/types/category";
import { categoriesData } from "@/data/categories";

export function getLocalProducts(): Product[] {
  if (typeof window === "undefined") return productsData;
  const saved = localStorage.getItem("rich-lady-products");
  if (!saved) {
    localStorage.setItem("rich-lady-products", JSON.stringify(productsData));
    return productsData;
  }
  const parsed: Product[] = JSON.parse(saved);
  // Smart sync: if new default designs were added to productsData, merge them
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
  // Dispatch custom event to notify other components/pages
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
