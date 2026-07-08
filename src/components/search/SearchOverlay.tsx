"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, Search, Clock, TrendingUp, DollarSign, FileText, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getLocalProducts } from "@/utils/db";
import { Product } from "@/types/product";

export function SearchOverlay() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Popular queries
  const popularSearches = [
    "Pure Silk Saree",
    "Cotton Kurti",
    "Heavy Zari Lehenga",
    "Gown Dress",
    "Accessories"
  ];

  // Recommendations data
  const budgetSuggestions = [
    { label: "Under ₹999", link: "/catalog?maxPrice=999" },
    { label: "Under ₹1499", link: "/catalog?maxPrice=1499" },
    { label: "Under ₹1999", link: "/catalog?maxPrice=1999" },
    { label: "Premium Silk", link: "/catalog?category=premium" }
  ];

  const categorySuggestions = [
    { label: "Sarees", link: "/catalog?category=sarees" },
    { label: "Kurtis", link: "/catalog?category=kurtis" },
    { label: "Dress Materials", link: "/catalog?category=dress-materials" },
    { label: "Lehengas", link: "/catalog?category=lehengas" }
  ];

  const fabricSuggestions = [
    { label: "Cotton Weaves", link: "/catalog?fabric=cotton" },
    { label: "Mulberry Silk", link: "/catalog?fabric=silk" },
    { label: "Organic Linen", link: "/catalog?fabric=linen" },
    { label: "Banarasi Zari", link: "/catalog?fabric=banarasi" }
  ];

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setTimeout(() => inputRef.current?.focus(), 150);
    };

    window.addEventListener("open-search", handleOpen);

    // Load recent searches
    const saved = localStorage.getItem("rich-lady-recents");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }

    return () => {
      window.removeEventListener("open-search", handleOpen);
    };
  }, []);

  // Update results based on query
  useEffect(() => {
    if (query.trim().length > 1) {
      const allProducts = getLocalProducts();
      const filtered = allProducts.filter((prod) =>
        prod.name.toLowerCase().includes(query.toLowerCase()) ||
        prod.category.toLowerCase().includes(query.toLowerCase()) ||
        (prod.fabric && prod.fabric.toLowerCase().includes(query.toLowerCase()))
      );
      setResults(filtered.slice(0, 5));
    } else {
      setResults([]);
    }
  }, [query]);

  const handleClose = () => {
    setIsOpen(false);
    setQuery("");
  };

  const handleSearchSubmit = (searchVal: string) => {
    if (!searchVal.trim()) return;

    // Save recent search
    const updated = [searchVal, ...recentSearches.filter(s => s !== searchVal)].slice(0, 5);
    localStorage.setItem("rich-lady-recents", JSON.stringify(updated));
    setRecentSearches(updated);

    handleClose();
    router.push(`/catalog?search=${encodeURIComponent(searchVal)}`);
  };

  const handleClearRecents = () => {
    localStorage.removeItem("rich-lady-recents");
    setRecentSearches([]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay Background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-[#2D221C]/80 z-50 backdrop-blur-xs"
          />

          {/* Search Content Drawer */}
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ type: "tween", duration: 0.35, ease: "easeOut" }}
            className="fixed inset-x-0 top-0 bg-primary-bg border-b border-border-accent z-50 py-10 px-6 max-h-screen overflow-y-auto"
          >
            <div className="max-w-4xl mx-auto flex flex-col gap-8 font-sans">
              
              {/* Header Input bar */}
              <div className="flex items-center gap-4 border-b border-border-accent pb-4">
                <Search className="w-6 h-6 text-muted-gold" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search for pure silk sarees, cotton kurtis, linen..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearchSubmit(query);
                  }}
                  className="flex-1 bg-transparent text-primary-text font-serif text-lg md:text-xl placeholder:text-secondary-text/50 outline-hidden"
                />
                <button
                  onClick={handleClose}
                  className="p-1 rounded-full hover:bg-secondary-bg text-secondary-text transition-colors cursor-pointer"
                  aria-label="Close search"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Predictive results strip */}
              {results.length > 0 ? (
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] uppercase tracking-widest text-muted-gold font-bold">Suggested Products</span>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {results.map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => {
                          handleClose();
                          router.push(`/product/${prod.id}`);
                        }}
                        className="bg-card border border-border-accent/40 rounded-lg p-3 hover:border-muted-gold hover:shadow-sm cursor-pointer transition-all flex md:flex-col items-center md:items-start gap-4 md:gap-3"
                      >
                        <div className="w-12 h-14 md:w-full md:aspect-[4/5] bg-secondary-bg rounded-xs overflow-hidden flex-shrink-0">
                          <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="font-serif text-xs text-primary-text font-semibold truncate w-full">{prod.name}</span>
                          <span className="text-[10px] text-chocolate font-medium mt-1">₹{prod.price.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : query.trim().length > 1 ? (
                <div className="py-8 text-center text-secondary-text/75 font-serif italic text-sm">
                  No matching designs found. Press enter to search catalog.
                </div>
              ) : null}

              {/* Default Suggestions grid when no query is typed */}
              {query.trim().length <= 1 && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-xs">
                  
                  {/* Left block: Recents & Popular */}
                  <div className="md:col-span-5 flex flex-col gap-6">
                    {/* Recents */}
                    {recentSearches.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] uppercase tracking-widest text-muted-gold font-bold flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> Recent Searches
                          </span>
                          <button onClick={handleClearRecents} className="text-[9px] uppercase tracking-widest text-red-600 hover:underline">
                            Clear
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {recentSearches.map((s, i) => (
                            <button
                              key={i}
                              onClick={() => handleSearchSubmit(s)}
                              className="px-3 py-1.5 rounded-full border border-border-accent/40 hover:border-muted-gold bg-card text-secondary-text hover:text-primary-text cursor-pointer transition-colors"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Popular searches */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] uppercase tracking-widest text-muted-gold font-bold flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5" /> Popular Searches
                      </span>
                      <div className="flex flex-col gap-2 mt-1 font-serif text-sm">
                        {popularSearches.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => handleSearchSubmit(s)}
                            className="text-left text-secondary-text hover:text-muted-gold transition-colors py-1 cursor-pointer"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right block: Category / Fabric / Budget Suggestions */}
                  <div className="md:col-span-7 grid grid-cols-3 gap-4 border-t md:border-t-0 md:border-l border-border-accent/35 pt-6 md:pt-0 md:pl-8">
                    
                    {/* Shop by Budget */}
                    <div className="flex flex-col gap-3">
                      <span className="text-[10px] uppercase tracking-widest text-muted-gold font-bold flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5" /> By Budget
                      </span>
                      <div className="flex flex-col gap-2 font-serif text-sm">
                        {budgetSuggestions.map((item, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              handleClose();
                              router.push(item.link);
                            }}
                            className="text-left text-secondary-text hover:text-primary-text cursor-pointer"
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Shop by Category */}
                    <div className="flex flex-col gap-3">
                      <span className="text-[10px] uppercase tracking-widest text-muted-gold font-bold flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" /> By Category
                      </span>
                      <div className="flex flex-col gap-2 font-serif text-sm">
                        {categorySuggestions.map((item, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              handleClose();
                              router.push(item.link);
                            }}
                            className="text-left text-secondary-text hover:text-primary-text cursor-pointer"
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Shop by Fabric */}
                    <div className="flex flex-col gap-3">
                      <span className="text-[10px] uppercase tracking-widest text-muted-gold font-bold flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" /> By Fabric
                      </span>
                      <div className="flex flex-col gap-2 font-serif text-sm">
                        {fabricSuggestions.map((item, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              handleClose();
                              router.push(item.link);
                            }}
                            className="text-left text-secondary-text hover:text-primary-text cursor-pointer"
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>
              )}

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
