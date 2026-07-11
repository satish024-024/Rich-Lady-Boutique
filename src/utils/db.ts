import { Product } from "@/types/product";
import { Category } from "@/types/category";

// Re-export services to maintain backward compatibility
export { 
  getProducts, 
  getLocalProducts, 
  saveLocalProducts 
} from "./services/products";

export { 
  getCategories, 
  getLocalCategories, 
  saveLocalCategories 
} from "./services/categories";

export {
  getSiteSettings
} from "./services/settings";

// DB Write proxies (calling Next.js API Routes for security)
export async function addProduct(prod: Product): Promise<void> {
  const res = await fetch("/api/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(prod),
  });

  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.error?.message || "Failed to add product via API");
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`/api/products?id=${id}`, {
    method: "DELETE",
  });

  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.error?.message || "Failed to delete product via API");
  }
}

export async function updateProductPhoto(id: string, imageUrl: string): Promise<void> {
  const res = await fetch("/api/products", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, imageUrl }),
  });

  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.error?.message || "Failed to update product photo");
  }
}

export async function updateProductStock(id: string, stock: number): Promise<void> {
  const res = await fetch("/api/products", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, stock }),
  });

  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.error?.message || "Failed to update stock");
  }
}

export async function updateProductCollectionTag(id: string, collectionTag: string): Promise<void> {
  const res = await fetch("/api/products", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, collectionTag }),
  });

  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.error?.message || "Failed to update collection tag");
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
  const res = await fetch("/api/products", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, ...specs }),
  });

  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.error?.message || "Failed to update specifications");
  }
}
