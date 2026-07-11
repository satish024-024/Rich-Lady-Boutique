import { supabase } from "@/utils/supabaseClient";

const defaultSettings: Record<string, any> = {
  homepage_hero: {
    heroHeading: "Timeless Indian Craftsmanship, Modern Grace",
    heroSubheading: "Curated collections of premium sarees, bespoke kurtis, and wedding lehengas handcrafted by master artisans.",
    whatsappLink: "https://wa.me/919030443306"
  },
  general_branding: {
    boutiqueEmail: "admin@richladyboutique.com",
    boutiqueAddress: "Godavari District, Andhra Pradesh, India",
    instagramHandle: "@RichLadyBoutique"
  }
};

export async function getSiteSettings(id: string): Promise<any> {
  try {
    const { data, error } = await supabase
      .from("cms_registry")
      .select("content")
      .eq("id", id)
      .single();

    // PGRST116 = "no rows returned" — not a real error, row just hasn't been seeded yet
    if (error) {
      if (error.code === "PGRST116") {
        // Silently return default — row doesn't exist yet
        return defaultSettings[id] || {};
      }
      throw error;
    }

    return data?.content || defaultSettings[id] || {};
  } catch (err) {
    // Only log genuine unexpected errors (connection failures, schema issues)
    console.warn(`getSiteSettings: unexpected error for "${id}", using default.`, err);
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`rich-lady-copy-${id}`);
      if (saved) return JSON.parse(saved);
    }
    return defaultSettings[id] || {};
  }
}

