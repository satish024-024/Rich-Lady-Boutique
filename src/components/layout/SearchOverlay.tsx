"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getLocalProducts } from "@/utils/db";
import { Product } from "@/types/product";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setResults([]);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSearch = (val: string) => {
    setQuery(val);
    if (val.trim() === "") {
      setResults([]);
      return;
    }
    const products = getLocalProducts();
    const filtered = products.filter((prod) =>
      prod.name.toLowerCase().includes(val.toLowerCase()) ||
      prod.category.toLowerCase().includes(val.toLowerCase())
    );
    setResults(filtered);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
          className="fixed inset-0 z-50 bg-[#FAF8F3]/98 backdrop-blur-md flex flex-col justify-start px-6 pt-24 md:pt-36"
        >
          {/* Close button top right */}
          <button
            onClick={onClose}
            className="absolute top-8 right-8 p-3 text-primary-text hover:text-muted-gold transition-colors focus:outline-none"
            aria-label="Close search"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="max-w-2xl w-full mx-auto flex flex-col">
            {/* Input row */}
            <div className="relative border-b border-border-accent pb-3 flex items-center mb-10">
              <Search className="w-6 h-6 text-muted-gold mr-4 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search Sarees, Kurtis, Dress Materials..."
                className="w-full bg-transparent font-serif text-xl md:text-2xl text-primary-text placeholder-secondary-text/50 border-none outline-none focus:ring-0 focus:outline-none"
              />
            </div>

            {/* Results Grid */}
            <div className="w-full max-h-[50vh] overflow-y-auto pr-2 no-scrollbar">
              {results.length > 0 ? (
                <div className="flex flex-col gap-6">
                  <p className="text-[10px] uppercase tracking-widest text-secondary-text font-semibold">
                    Search Results ({results.length})
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => {
                          onClose();
                          // Future: Navigate to product detail page
                          // router.push(`/product/${prod.id}`)
                        }}
                        className="flex items-center gap-4 bg-card p-3 rounded-md border border-border-accent/40 cursor-pointer hover:border-muted-gold/60 transition-all duration-300 group"
                      >
                        <div className="w-16 h-20 bg-secondary-bg flex-shrink-0 rounded-xs overflow-hidden relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={prod.imageUrl}
                            alt={prod.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-serif text-sm text-primary-text font-medium group-hover:text-muted-gold transition-colors">
                            {prod.name}
                          </span>
                          <span className="text-[10px] uppercase text-secondary-text tracking-wider mt-1">
                            {prod.category}
                          </span>
                          <span className="text-xs font-sans text-chocolate font-medium mt-1">
                            ₹{prod.price.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : query.trim() !== "" ? (
                <div className="text-center py-10 flex flex-col items-center">
                  <p className="font-serif text-lg text-secondary-text italic">
                    No results found for &ldquo;{query}&rdquo;
                  </p>
                  <p className="text-xs text-secondary-text/60 mt-2">
                    Try searching for different terms like &ldquo;Saree&rdquo; or &ldquo;Kurti&rdquo;
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <p className="text-[10px] uppercase tracking-widest text-secondary-text font-semibold">
                    Popular Searches
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Soft Silk Saree", "Floral Kurti", "Embroidered Suit", "Traditional Gown"].map(
                      (term) => (
                        <button
                          key={term}
                          onClick={() => handleSearch(term)}
                          className="px-4 py-2 bg-card hover:bg-secondary-bg text-[10px] uppercase tracking-wider font-medium text-secondary-text border border-border-accent/60 rounded-full transition-colors cursor-pointer"
                        >
                          {term}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
