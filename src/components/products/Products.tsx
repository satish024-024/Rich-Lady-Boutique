"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { getProducts } from "@/utils/db";
import { Product } from "@/types/product";
import { ProductCard } from "@/components/shared/ProductCard";
import { FadeIn } from "@/components/motion/FadeIn";
import { motion, AnimatePresence } from "framer-motion";

export function Products() {
  return (
    <Suspense
      fallback={
        <div className="w-full py-20 bg-primary-bg flex items-center justify-center">
          <span className="font-serif italic text-sm text-secondary-text animate-pulse">
            Loading Catalog...
          </span>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [categoriesList, setCategoriesList] = useState<string[]>(["All"]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const categoryQuery = searchParams.get("category");

  // Load all products and categories
  useEffect(() => {
    getProducts().then((all) => {
      setAllProducts(all);
    });
    import("@/utils/db").then((db) => {
      db.getCategories().then((cats) => {
        setCategoriesList(["All", ...cats.map(c => c.title)]);
      });
    });
  }, []);

  // Sync category query parameter from URL
  useEffect(() => {
    if (categoryQuery) {
      // Decode URL string, e.g. "Kids Wear"
      setActiveCategory(categoryQuery);
    } else {
      setActiveCategory("All");
    }
  }, [categoryQuery]);

  // Handle active filter changes
  useEffect(() => {
    let filtered = allProducts;
    if (activeCategory !== "All") {
      filtered = allProducts.filter(
        (p) => p.category.toLowerCase() === activeCategory.toLowerCase()
      );
    }
    setFilteredProducts(filtered);
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
      className="w-full py-20 bg-primary-bg overflow-hidden border-b border-border-accent/40 select-none"
      id="new-arrivals"
    >
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <FadeIn className="flex flex-col items-start">
            <span className="font-serif text-[10px] md:text-xs tracking-[0.25em] text-muted-gold font-medium uppercase mb-2">
              Just Released
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-primary-text font-normal">
              New Arrivals
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

        {/* Category Filter Tabs Bar */}
        <FadeIn className="w-full flex gap-3 overflow-x-auto no-scrollbar pb-4 mb-8 border-b border-border-accent/15">
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 text-[9px] uppercase tracking-widest font-sans font-bold border transition-all duration-300 rounded-full cursor-pointer flex-shrink-0 ${
                activeCategory.toLowerCase() === cat.toLowerCase()
                  ? "bg-forest-green border-forest-green text-primary-bg shadow-sm"
                  : "bg-card border-border-accent/40 text-secondary-text hover:border-muted-gold hover:text-muted-gold"
              }`}
            >
              {cat}
            </button>
          ))}
        </FadeIn>

        {/* Horizontal scrollable slider */}
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
                  Crafting new designs for this collection...
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
