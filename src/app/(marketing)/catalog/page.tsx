"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Heart, ShoppingBag, Search, Sparkles, Grid, List } from "lucide-react";
import { getLocalProducts } from "@/utils/db";
import { Product } from "@/types/product";
import { FadeIn } from "@/components/motion/FadeIn";
import { toast } from "sonner";

function CatalogContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState("All Designs");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Category filters including special ones
  const categories = [
    "All Designs",
    "New Arrivals",
    "Sarees",
    "Kurtis",
    "Dress Materials",
    "Lehengas",
    "Gowns",
    "Western Wear",
    "Accessories",
    "Sale"
  ];

  // Initialize and listen to categoryParam changes
  useEffect(() => {
    if (categoryParam) {
      const matched = categories.find(
        (c) => c.toLowerCase() === categoryParam.toLowerCase()
      );
      if (matched) {
        setActiveCategory(matched);
      } else {
        setActiveCategory("All Designs");
      }
    } else {
      setActiveCategory("All Designs");
    }
  }, [categoryParam]);

  // Handle pill clicks
  const handleCategorySelect = (cat: string) => {
    setActiveCategory(cat);
    const newParams = new URLSearchParams(window.location.search);
    if (cat === "All Designs") {
      newParams.delete("category");
    } else {
      newParams.set("category", cat);
    }
    // Smooth URL update without router re-fetch
    window.history.pushState(null, "", `/catalog?${newParams.toString()}`);
  };

  useEffect(() => {
    let prods = getLocalProducts();

    // Search query filter
    if (searchQuery.trim() !== "") {
      prods = prods.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (activeCategory === "New Arrivals") {
      prods = prods.filter((p) => p.isNewArrival);
    } else if (activeCategory === "Sale") {
      prods = prods.filter((p) => p.isSale);
    } else if (activeCategory !== "All Designs") {
      prods = prods.filter((p) => p.category.toLowerCase() === activeCategory.toLowerCase());
    }

    // Sort logic
    if (sortBy === "price-low") {
      prods = [...prods].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      prods = [...prods].sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(prods);
  }, [searchQuery, activeCategory, sortBy, products]);

  useEffect(() => {
    setProducts(getLocalProducts());

    const savedWishlist = localStorage.getItem("rich-lady-wishlist");
    if (savedWishlist) {
      const items: Product[] = JSON.parse(savedWishlist);
      setWishlist(items.map(item => item.id));
    }

    const handleUpdate = () => {
      setProducts(getLocalProducts());
    };
    window.addEventListener("products-updated", handleUpdate);
    return () => window.removeEventListener("products-updated", handleUpdate);
  }, []);

  const toggleWishlist = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const saved = localStorage.getItem("rich-lady-wishlist");
    let currentList: Product[] = saved ? JSON.parse(saved) : [];
    
    const isAlreadyLiked = currentList.some(item => item.id === product.id);
    let updatedList: Product[];

    if (isAlreadyLiked) {
      updatedList = currentList.filter(item => item.id !== product.id);
      setWishlist(prev => prev.filter(id => id !== product.id));
      toast.success(`${product.name} removed from wishlist`);
    } else {
      updatedList = [...currentList, product];
      setWishlist(prev => [...prev, product.id]);
      toast.success(`${product.name} added to wishlist!`);
    }

    localStorage.setItem("rich-lady-wishlist", JSON.stringify(updatedList));
    window.dispatchEvent(new Event("wishlist-updated"));
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const savedCart = localStorage.getItem("rich-lady-cart");
    let currentCart: Product[] = savedCart ? JSON.parse(savedCart) : [];

    if (!currentCart.some(item => item.id === product.id)) {
      const updated = [...currentCart, product];
      localStorage.setItem("rich-lady-cart", JSON.stringify(updated));
      window.dispatchEvent(new Event("cart-updated"));
      toast.success(`${product.name} added to bag!`);
    } else {
      toast.info(`${product.name} is already in your bag`);
    }
  };

  return (
    <div className="w-full min-h-screen bg-primary-bg py-32 font-sans select-none">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Breadcrumb - layout match */}
        <div className="text-[10px] text-secondary-text/70 uppercase tracking-widest mb-8 flex gap-2 items-center font-sans">
          <Link href="/" className="hover:text-muted-gold transition-colors font-medium">Home</Link>
          <span>/</span>
          <span className="text-primary-text font-semibold">Boutique Collection</span>
        </div>

        {/* Page Title & Tagline - layout match */}
        <FadeIn className="flex flex-col items-center text-center mb-10">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-primary-text font-normal mb-4 tracking-tight">
            Explore Heritage Weaves
          </h1>
          <p className="text-xs md:text-sm text-secondary-text max-w-xl font-light leading-relaxed">
            Discover a curated collection of handloom sarees, embroidered designer wear, and custom boutique ensembles since 2011.
          </p>
        </FadeIn>

        {/* Search Bar - pill shape layout match */}
        <FadeIn delay={0.05} className="max-w-2xl mx-auto mb-10 relative font-sans">
          <div className="relative w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-text/80" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by fabric, style, weave, pattern, or product category..."
              className="w-full bg-card border border-border-accent/40 rounded-full pl-12 pr-12 py-3.5 text-xs text-primary-text outline-none focus:border-muted-gold transition-all shadow-xs"
            />
            <Sparkles className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-gold cursor-pointer" />
          </div>
        </FadeIn>

        {/* Filter Pills - layout match */}
        <FadeIn delay={0.1} className="w-full flex justify-center mb-12 font-sans">
          <div className="flex flex-wrap justify-center gap-2.5 max-w-4xl">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`px-5 py-2 text-[10px] uppercase tracking-wider font-semibold rounded-full border transition-all duration-medium cursor-pointer ${
                  activeCategory === cat
                    ? "bg-forest-green text-primary-bg border-forest-green shadow-sm"
                    : "bg-card text-secondary-text border-border-accent/50 hover:border-muted-gold"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </FadeIn>

        {/* Wide Promotional Banner Card - layout match */}
        <FadeIn delay={0.15} className="w-full aspect-[21/9] md:aspect-[3/1] bg-card border border-border-accent/40 rounded-lg overflow-hidden relative mb-16 shadow-xs flex items-center">
          <div className="absolute inset-0 z-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/cat_lehengas.jpg"
              alt="Bridal Luxury Collection"
              className="w-full h-full object-cover opacity-35 filter blur-xs"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary-bg via-primary-bg/70 to-transparent" />
          </div>

          <div className="relative z-10 px-8 md:px-16 max-w-md flex flex-col items-start text-left">
            <span className="text-[9px] uppercase tracking-widest text-muted-gold font-bold font-sans mb-3">Trending Collection</span>
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl text-primary-text font-normal mb-3 tracking-tight">
              2026 Bridal Heritage Collection
            </h2>
            <p className="text-[10px] md:text-xs text-secondary-text leading-relaxed font-light mb-6">
              Exquisite hand-woven fabrics and custom designer silhouettes curated for your special celebrations.
            </p>
            <Link
              href={`/product/royal-velvet-lehenga`}
              className="bg-forest-green hover:bg-[#1a2b24] text-primary-bg px-5 py-3 text-[9px] font-sans font-semibold tracking-widest uppercase rounded-xs border border-muted-gold/20 hover:border-muted-gold transition-all duration-300 shadow-sm"
            >
              Explore Bridal Couture &rarr;
            </Link>
          </div>
        </FadeIn>

        {/* Sorting and Grid/List Toggles - layout match */}
        <FadeIn delay={0.2} className="w-full flex justify-between items-center border-b border-border-accent/30 pb-4 mb-8 font-sans">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-secondary-text">
            Showing {filteredProducts.length} Styles
          </div>

          <div className="flex items-center gap-4">
            {/* Sort Dropdown */}
            <div className="relative flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-secondary-text cursor-pointer">
              <span>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none outline-none font-semibold text-primary-text cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {/* Layout Toggles */}
            <div className="h-4 w-[1px] bg-border-accent/40" />
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-xs transition-colors cursor-pointer ${viewMode === "grid" ? "text-muted-gold bg-secondary-bg/20" : "text-secondary-text hover:text-primary-text"}`}
                aria-label="Grid view"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-xs transition-colors cursor-pointer ${viewMode === "list" ? "text-muted-gold bg-secondary-bg/20" : "text-secondary-text hover:text-primary-text"}`}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </FadeIn>

        {/* Catalog Grid/List Render */}
        {filteredProducts.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 xl:gap-8 max-w-7xl mx-auto">
              {filteredProducts.map((prod, idx) => {
                const isLiked = wishlist.includes(prod.id);
                return (
                  <FadeIn
                    key={prod.id}
                    delay={idx * 0.04}
                    duration="slow"
                    className="flex flex-col items-start group relative"
                  >
                    <Link href={`/product/${prod.id}`} className="w-full flex flex-col items-start cursor-pointer">
                      {/* Image Frame */}
                      <div className="w-full aspect-[4/5] bg-card overflow-hidden border border-border-accent/30 relative group shadow-xs hover:shadow-md transition-all duration-medium rounded-xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          className="w-full h-full object-cover transition-transform duration-slow group-hover:scale-[1.02]"
                        />

                        {/* Sale Tag */}
                        {prod.isSale && (
                          <span className="absolute top-4 left-4 px-2 py-1 bg-chocolate text-primary-bg text-[8px] uppercase tracking-widest font-bold rounded-xs shadow-xs select-none z-10">
                            Sale
                          </span>
                        )}
                        
                        {/* Wishlist toggle */}
                        <button
                          onClick={(e) => toggleWishlist(prod, e)}
                          className="absolute top-4 right-4 p-2 bg-primary-bg/70 hover:bg-primary-bg backdrop-blur-xs rounded-full shadow-xs text-primary-text hover:text-red-700 transition-colors duration-medium cursor-pointer z-10"
                          aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
                        >
                          <Heart
                            className={`w-4 h-4 transition-colors duration-medium ${
                              isLiked ? "fill-red-700 text-red-700" : "text-primary-text"
                            }`}
                          />
                        </button>

                        {/* Add to bag hover CTA */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-chocolate/40 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-medium flex justify-center">
                          <button
                            onClick={(e) => handleAddToCart(prod, e)}
                            className="bg-primary-bg text-primary-text hover:bg-forest-green hover:text-primary-bg px-4 py-2 text-[8px] font-sans font-semibold tracking-widest uppercase rounded-xs border border-border-accent hover:border-forest-green transition-all duration-medium flex items-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            <ShoppingBag className="w-3 h-3" />
                            Add to Bag
                          </button>
                        </div>
                      </div>

                      {/* Info details */}
                      <div className="flex justify-between items-start w-full mt-4">
                        <div>
                          <h3 className="font-serif text-xs md:text-sm text-primary-text font-normal mb-0.5 group-hover:text-muted-gold transition-colors duration-medium">
                            {prod.name}
                          </h3>
                          <span className="text-[9px] uppercase tracking-wider font-semibold text-secondary-text">
                            {prod.category}
                          </span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-xs font-sans text-chocolate font-semibold">
                            ₹{prod.price.toLocaleString("en-IN")}
                          </span>
                          {prod.isSale && prod.originalPrice && (
                            <span className="text-[10px] font-sans text-secondary-text/60 line-through mt-0.5">
                              ₹{prod.originalPrice.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </FadeIn>
                );
              })}
            </div>
          ) : (
            /* List Layout Render */
            <div className="flex flex-col gap-4">
              {filteredProducts.map((prod, idx) => {
                const isLiked = wishlist.includes(prod.id);
                return (
                  <FadeIn
                    key={prod.id}
                    delay={idx * 0.04}
                    className="w-full bg-card border border-border-accent/30 p-4 rounded-md flex flex-row items-center justify-between gap-6 hover:border-muted-gold/40 transition-colors"
                  >
                    <Link href={`/product/${prod.id}`} className="flex items-center gap-4 flex-1">
                      <div className="w-20 h-24 bg-primary-bg border border-border-accent/40 rounded-xs overflow-hidden relative flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                        />
                        {/* Sale Tag */}
                        {prod.isSale && (
                          <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-chocolate text-primary-bg text-[6px] uppercase tracking-widest font-bold rounded-xs shadow-xs select-none">
                            Sale
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-[8px] uppercase tracking-widest text-muted-gold font-bold font-sans">{prod.category}</span>
                        <h3 className="font-serif text-sm md:text-base text-primary-text font-normal mt-0.5 hover:text-muted-gold transition-colors">
                          {prod.name}
                        </h3>
                        <p className="text-[10px] text-secondary-text/80 font-light mt-1 max-w-xl line-clamp-1">
                          {prod.description}
                        </p>
                      </div>
                    </Link>

                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-end">
                        <span className="text-xs md:text-sm font-sans text-chocolate font-semibold">
                          ₹{prod.price.toLocaleString("en-IN")}
                        </span>
                        {prod.isSale && prod.originalPrice && (
                          <span className="text-[10px] font-sans text-secondary-text/60 line-through mt-0.5">
                            ₹{prod.originalPrice.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={(e) => toggleWishlist(prod, e)}
                          className="p-2 border border-border-accent/40 hover:border-red-700 hover:text-red-700 rounded-xs transition-colors cursor-pointer text-secondary-text"
                          aria-label="Toggle wishlist"
                        >
                          <Heart className={`w-4 h-4 ${isLiked ? "fill-red-700 text-red-700" : ""}`} />
                        </button>
                        <button
                          onClick={(e) => handleAddToCart(prod, e)}
                          className="px-4 py-2 bg-forest-green hover:bg-[#1a2b24] text-primary-bg text-[9px] uppercase tracking-wider font-semibold rounded-xs border border-muted-gold/20 flex items-center gap-1"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          Add
                        </button>
                      </div>
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          )
        ) : (
          <div className="text-center py-24 flex flex-col items-center">
            <ShoppingBag className="w-16 h-16 text-border-accent/80 mb-6 stroke-[1.25]" />
            <h3 className="font-serif text-xl text-primary-text italic mb-2">No designs match your criteria</h3>
            <p className="text-xs text-secondary-text/70 max-w-[280px]">
              Try searching for something else or reset the filter selection.
            </p>
            <button
              onClick={() => {
                setActiveCategory("All Designs");
                setSearchQuery("");
              }}
              className="mt-6 px-6 py-2.5 bg-forest-green text-primary-bg text-[10px] uppercase tracking-widest font-semibold rounded-xs border border-muted-gold/20"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-screen bg-primary-bg flex items-center justify-center">
        <p className="font-serif italic text-lg text-secondary-text animate-pulse">Loading Collection...</p>
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}
