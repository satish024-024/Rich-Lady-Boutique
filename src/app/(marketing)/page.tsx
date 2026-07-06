import React from "react";
import { Hero } from "@/components/hero/Hero";
import { Journey } from "@/components/journey/Journey";
import { Categories } from "@/components/categories/Categories";
import { Products } from "@/components/products/Products";
import { ValueStrip } from "@/components/shared/ValueStrip";
import { Reviews } from "@/components/reviews/Reviews";
import { InstagramSection } from "@/components/instagram/Instagram";
import { Newsletter } from "@/components/newsletter/Newsletter";

export default function HomePage() {
  return (
    <>
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Our Journey Section */}
      <Journey />

      {/* 3. Shop by Category Section */}
      <Categories />

      {/* 4. New Arrivals Section */}
      <Products />

      {/* 5. Trust / Value Strip */}
      <ValueStrip />

      {/* 6. Reviews Section */}
      <Reviews />

      {/* 7. Instagram Reels Section */}
      <InstagramSection />

      {/* 8. Newsletter Section */}
      <Newsletter />
    </>
  );
}
