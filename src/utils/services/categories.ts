import { Category } from "@/types/category";
import { supabase } from "@/utils/supabaseClient";

// Local storage helpers for categories fallback
export function getLocalCategories(): Category[] {
  if (typeof window === "undefined") {
    return [
      { id: "sarees", title: "Sarees", imageUrl: "/images/cat_sarees.jpg", link: "/catalog?category=sarees" },
      { id: "kurtis", title: "Kurtis", imageUrl: "/images/cat_kurtis.jpg", link: "/catalog?category=kurtis" },
      { id: "lehengas", title: "Lehengas", imageUrl: "/images/cat_lehengas.jpg", link: "/catalog?category=lehengas" },
      { id: "gowns", title: "Gowns", imageUrl: "/images/prod_party_gown.jpg", link: "/catalog?category=gowns" },
      { id: "western-wear", title: "Western Wear", imageUrl: "/images/cat_western.jpg", link: "/catalog?category=western-wear" },
      { id: "kids-wear", title: "Kids Wear", imageUrl: "/images/cat_kids.jpg", link: "/catalog?category=kids-wear" }
    ];
  }
  const saved = localStorage.getItem("rich-lady-categories");
  if (!saved) {
    const defaults = [
      { id: "sarees", title: "Sarees", imageUrl: "/images/cat_sarees.jpg", link: "/catalog?category=sarees" },
      { id: "kurtis", title: "Kurtis", imageUrl: "/images/cat_kurtis.jpg", link: "/catalog?category=kurtis" },
      { id: "lehengas", title: "Lehengas", imageUrl: "/images/cat_lehengas.jpg", link: "/catalog?category=lehengas" },
      { id: "gowns", title: "Gowns", imageUrl: "/images/prod_party_gown.jpg", link: "/catalog?category=gowns" },
      { id: "western-wear", title: "Western Wear", imageUrl: "/images/cat_western.jpg", link: "/catalog?category=western-wear" },
      { id: "kids-wear", title: "Kids Wear", imageUrl: "/images/cat_kids.jpg", link: "/catalog?category=kids-wear" }
    ];
    localStorage.setItem("rich-lady-categories", JSON.stringify(defaults));
    return defaults;
  }
  return JSON.parse(saved);
}

export function saveLocalCategories(categories: Category[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("rich-lady-categories", JSON.stringify(categories));
}

// ----------------------------------------------------
// Categories DB Service
// ----------------------------------------------------

export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, image_url, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      return getLocalCategories();
    }

    const mapped: Category[] = data.map((c: any) => ({
      id: c.id,
      title: c.name,
      slug: c.slug,
      imageUrl: c.image_url || "/images/cat_fallback.jpg",
      link: `/catalog?category=${c.slug}`,
      sortOrder: c.sort_order
    }));

    if (typeof window !== "undefined") {
      saveLocalCategories(mapped);
    }
    return mapped;
  } catch (err) {
    console.error("getCategories Service Fallback:", err);
    return getLocalCategories();
  }
}
