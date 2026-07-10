"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getProducts } from "@/utils/db";
import { Product } from "@/types/product";
import { ProductCard } from "@/components/shared/ProductCard";
import { FadeIn } from "@/components/motion/FadeIn";

export function RecentlyAdded() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Slice the first 4 items as "Recently Added"
    getProducts().then((all) => {
      setProducts(all.slice(2, 6)); // slice a distinct set of products
    });
  }, []);

  return (
    <section
      className="w-full py-20 bg-secondary-bg overflow-hidden border-b border-border-accent/40 select-none"
      id="recently-added"
    >
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
          <FadeIn className="flex flex-col items-start">
            <span className="font-serif text-[10px] md:text-xs tracking-[0.25em] text-muted-gold font-medium uppercase mb-2">
              Just Arrived
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-primary-text font-normal">
              Recently Added
            </h2>
            <div className="w-16 h-[1px] bg-muted-gold/60 mt-4" />
          </FadeIn>

          <FadeIn className="text-secondary-text font-light text-xs max-w-xs leading-relaxed">
            Freshly crafted from weaver looms. Discover today's arrivals in premium silk, linen, and designer collections.
          </FadeIn>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 xl:gap-8 max-w-7xl mx-auto">
          {products.map((prod, idx) => (
            <FadeIn
              key={prod.id}
              delay={idx * 0.08}
              duration="slow"
            >
              <ProductCard product={prod} />
            </FadeIn>
          ))}
        </div>

      </div>
    </section>
  );
}
