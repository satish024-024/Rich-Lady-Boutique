"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { getLocalProducts } from "@/utils/db";
import { Product } from "@/types/product";
import { FadeIn } from "@/components/motion/FadeIn";
import { toast } from "sonner";

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Load products and wishlist
  useEffect(() => {
    setProducts(getLocalProducts());
    
    const handleUpdate = () => {
      setProducts(getLocalProducts());
    };
    window.addEventListener("products-updated", handleUpdate);

    const savedWishlist = localStorage.getItem("rich-lady-wishlist");
    if (savedWishlist) {
      const items: Product[] = JSON.parse(savedWishlist);
      setWishlist(items.map(item => item.id));
    }

    return () => {
      window.removeEventListener("products-updated", handleUpdate);
    };
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
    // Dispatch custom event to notify Header
    window.dispatchEvent(new Event("wishlist-updated"));
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const savedCart = localStorage.getItem("rich-lady-cart");
    let currentCart: Product[] = savedCart ? JSON.parse(savedCart) : [];

    // Check if already in cart
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
    <section
      className="w-full py-[120px] md:py-[90px] sm:py-[70px] bg-primary-bg overflow-hidden select-none border-b border-border-accent/40"
      id="new-arrivals"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <FadeIn className="flex flex-col items-center text-center mb-16">
          <span className="font-serif text-[10px] md:text-xs tracking-[0.25em] text-muted-gold font-medium uppercase mb-2">
            Just Released
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-primary-text font-normal mb-4">
            New Arrivals
          </h2>
          <div className="ornament-line">
            <span className="ornament-diamond" />
          </div>
        </FadeIn>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 xl:gap-8 max-w-7xl mx-auto mb-16">
          {products.slice(0, 5).map((prod, idx) => {
            const isLiked = wishlist.includes(prod.id);
            return (
              <FadeIn
                key={prod.id}
                delay={idx * 0.08}
                duration="slow"
                className="flex flex-col items-start group relative"
              >
                <Link href={`/product/${prod.id}`} className="w-full flex flex-col items-start cursor-pointer">
                  {/* Product Card Image Container */}
                  <div className="w-full aspect-[4/5] bg-card overflow-hidden border border-border-accent/30 relative group shadow-xs hover:shadow-md transition-all duration-medium rounded-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      className="w-full h-full object-cover transition-transform duration-slow group-hover:scale-[1.02]"
                    />
                    
                    {/* Heart / Wishlist Toggle Overlay */}
                    <button
                      onClick={(e) => toggleWishlist(prod, e)}
                      className="absolute top-4 right-4 p-2 bg-primary-bg/70 hover:bg-primary-bg backdrop-blur-xs rounded-full shadow-xs text-primary-text hover:text-red-700 transition-colors duration-medium cursor-pointer"
                      aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors duration-medium ${
                          isLiked ? "fill-red-700 text-red-700" : "text-primary-text"
                        }`}
                      />
                    </button>

                    {/* Add To Bag Floating Hover CTA */}
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

                  {/* Product Details below card */}
                  <h3 className="font-serif text-xs md:text-sm text-primary-text font-normal mt-5 mb-1 group-hover:text-muted-gold transition-colors duration-medium">
                    {prod.name}
                  </h3>
                  <span className="text-xs font-sans text-chocolate font-semibold">
                    ₹{prod.price.toLocaleString("en-IN")}
                  </span>
                </Link>
              </FadeIn>
            );
          })}
        </div>

        {/* View All Button */}
        <FadeIn className="flex justify-center mt-4">
          <Link
            href="/catalog"
            className="bg-forest-green hover:bg-[#1a2b24] text-primary-bg px-8 py-3.5 text-[10px] font-sans font-semibold tracking-widest uppercase rounded-xs border border-muted-gold/20 hover:border-muted-gold transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md text-center"
          >
            View All Collection
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}

