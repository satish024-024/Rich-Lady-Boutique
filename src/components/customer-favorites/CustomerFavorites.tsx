"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { getProducts } from "@/utils/db";
import { Product } from "@/types/product";
import { ProductCard } from "@/components/shared/ProductCard";
import { FadeIn } from "@/components/motion/FadeIn";
import { motion, AnimatePresence } from "framer-motion";

export function CustomerFavorites() {
  return (
    <Suspense
      fallback={
        <div className="w-full py-20 bg-secondary-bg flex items-center justify-center">
          <span className="font-serif italic text-sm text-secondary-text animate-pulse">
            Loading Favorites...
          </span>
        </div>
      }
    >
      <CustomerFavoritesContent />
    </Suspense>
  );
}

function CustomerFavoritesContent() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const categoryQuery = searchParams.get("category");

  // Load all products (we select top 12 as potential favorites, then filter)
  useEffect(() => {
    getProducts().then((all) => {
      setAllProducts(all);
    });
  }, []);

  // Sync category query parameter from URL
  useEffect(() => {
    if (categoryQuery) {
      setActiveCategory(categoryQuery);
    } else {
      setActiveCategory("All");
    }
  }, [categoryQuery]);

  // Filter products by category
  useEffect(() => {
    let filtered = allProducts;
    if (activeCategory !== "All") {
      filtered = allProducts.filter(
        (p) => p.category.toLowerCase() === activeCategory.toLowerCase()
      );
    }
    // Limit to top 6 customer favorites for clean display
    setFilteredProducts(filtered.slice(0, 6));
  }, [activeCategory, allProducts]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: "smooth" });
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

        {/* Horizontal Scroll list with exit/enter transitions */}
        <div className="relative min-h-[350px]">
          <AnimatePresence mode="popLayout">
            {filteredProducts.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="w-full py-20 flex flex-col items-center justify-center text-center"
              >
                <span className="font-serif italic text-sm text-secondary-text/80">
                  Crafting new favorites for this collection...
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                ref={scrollContainerRef}
                className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-6 max-w-7xl mx-auto"
              >
                {filteredProducts.map((prod) => (
                  <motion.div
                    key={prod.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className="w-[280px] md:w-[300px] flex-shrink-0"
                  >
                    <ProductCard product={prod} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
