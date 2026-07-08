import React from "react";
import { Hero } from "@/components/hero/Hero";
import { Budget } from "@/components/budget/Budget";
import { RecentlyAdded } from "@/components/recently-added/RecentlyAdded";
import { Categories } from "@/components/categories/Categories";
import { CustomerFavorites } from "@/components/customer-favorites/CustomerFavorites";
import { Featured } from "@/components/featured/Featured";
import { Occasion } from "@/components/occasion/Occasion";
import { Fabric } from "@/components/fabric/Fabric";
import { Festival } from "@/components/festival/Festival";
import { Products } from "@/components/products/Products";
import { EditorsPicks } from "@/components/editors-picks/EditorsPicks";
import { Services } from "@/components/services/Services";
import { Journey } from "@/components/journey/Journey";
import { Reviews } from "@/components/reviews/Reviews";
import { InstagramSection } from "@/components/instagram/Instagram";
import { Newsletter } from "@/components/newsletter/Newsletter";

export default function HomePage() {
  return (
    <>
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Shop by Budget */}
      <Budget />

      {/* 3. Recently Added (Just Arrived) */}
      <RecentlyAdded />

      {/* 4. Shop by Category */}
      <Categories />

      {/* 5. Customer Favorites (Most Loved) */}
      <CustomerFavorites />

      {/* 6. Featured Collections */}
      <Featured />

      {/* 7. Shop by Occasion */}
      <Occasion />

      {/* 8. Shop by Fabric */}
      <Fabric />

      {/* 9. Festival Collections spotlight */}
      <Festival />

      {/* 10. New Arrivals slider */}
      <Products />

      {/* 11. Editor's Picks */}
      <EditorsPicks />

      {/* 12. Why Shop With Us */}
      <Services />

      {/* 13. Our Journey */}
      <Journey />

      {/* 14. Our Customers Testimonials */}
      <Reviews />

      {/* 15. Instagram Reels Gallery */}
      <InstagramSection />

      {/* 16. WhatsApp Community Join */}
      <Newsletter />
    </>
  );
}
