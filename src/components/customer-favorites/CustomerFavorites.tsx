"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getLocalProducts } from "@/utils/db";
import { Product } from "@/types/product";
import { ProductCard } from "@/components/shared/ProductCard";
import { FadeIn } from "@/components/motion/FadeIn";

export function CustomerFavorites() {
  const [products, setProducts] = useState<Product[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Select top 6 products as customer favorites
    const all = getLocalProducts();
    setProducts(all.slice(0, 6));
  }, []);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -340, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 340, behavior: "smooth" });
    }
  };

  return (
    <section
      className="w-full py-20 bg-secondary-bg overflow-hidden border-b border-border-accent/40 select-none"
      id="customer-favorites"
    >
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
          <FadeIn className="flex flex-col items-start">
            <span className="font-serif text-[10px] md:text-xs tracking-[0.25em] text-muted-gold font-medium uppercase mb-2">
              Most Loved
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-primary-text font-normal">
              Customer Favorites
            </h2>
            <div className="w-16 h-[1px] bg-muted-gold/60 mt-4" />
          </FadeIn>

          {/* Slider Buttons */}
          <FadeIn className="flex items-center gap-3">
            <button
              onClick={scrollLeft}
              className="p-2.5 rounded-full border border-border-accent/45 bg-card hover:border-muted-gold hover:text-muted-gold text-secondary-text transition-colors cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={scrollRight}
              className="p-2.5 rounded-full border border-border-accent/45 bg-card hover:border-muted-gold hover:text-muted-gold text-secondary-text transition-colors cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </FadeIn>
        </div>

        {/* Horizontal Scroll list */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-6 max-w-7xl mx-auto"
        >
          {products.map((prod) => (
            <div
              key={prod.id}
              className="w-[280px] md:w-[300px] flex-shrink-0"
            >
              <ProductCard product={prod} />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
