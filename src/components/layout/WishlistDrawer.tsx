"use client";

import React, { useState, useEffect } from "react";
import { X, Trash2, Heart, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/types/product";
import { toast } from "sonner";

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WishlistDrawer({ isOpen, onClose }: WishlistDrawerProps) {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);

  const loadWishlist = () => {
    const saved = localStorage.getItem("rich-lady-wishlist");
    if (saved) {
      setWishlistItems(JSON.parse(saved));
    } else {
      setWishlistItems([]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadWishlist();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    // Listen to custom event for updates
    window.addEventListener("wishlist-updated", loadWishlist);
    return () => window.removeEventListener("wishlist-updated", loadWishlist);
  }, []);

  const removeFromWishlist = (id: string, name: string) => {
    const updated = wishlistItems.filter((item) => item.id !== id);
    localStorage.setItem("rich-lady-wishlist", JSON.stringify(updated));
    setWishlistItems(updated);
    
    // Dispatch custom event to notify Header
    window.dispatchEvent(new Event("wishlist-updated"));
    toast.success(`${name} removed from wishlist`);
  };

  const addToCart = (product: Product) => {
    const savedCart = localStorage.getItem("rich-lady-cart");
    let cart = savedCart ? JSON.parse(savedCart) : [];
    
    // Check if already in cart
    if (!cart.some((item: Product) => item.id === product.id)) {
      cart.push(product);
      localStorage.setItem("rich-lady-cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cart-updated"));
      toast.success(`${product.name} added to cart!`);
    } else {
      toast.info(`${product.name} is already in your cart`);
    }

    // Remove from wishlist
    removeFromWishlist(product.id, product.name);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.45 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#2D221C] z-50"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
            className="fixed top-0 right-0 w-full max-w-md h-full bg-primary-bg border-l border-border-accent z-50 shadow-2xl flex flex-col justify-between"
          >
            {/* Header */}
            <div className="p-6 border-b border-border-accent/40 flex justify-between items-center bg-card">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-muted-gold fill-muted-gold" />
                <span className="font-serif text-lg tracking-wider text-primary-text font-medium">
                  Your Wishlist ({wishlistItems.length})
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-primary-text hover:text-muted-gold transition-colors"
                aria-label="Close wishlist"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 no-scrollbar">
              {wishlistItems.length > 0 ? (
                wishlistItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 bg-card p-4 rounded-md border border-border-accent/30 relative group"
                  >
                    <div className="w-16 h-20 bg-secondary-bg rounded-xs overflow-hidden relative flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <span className="font-serif text-sm text-primary-text font-medium">
                        {item.name}
                      </span>
                      <span className="text-[10px] uppercase text-secondary-text tracking-wider mt-1">
                        {item.category}
                      </span>
                      <span className="text-xs font-sans text-chocolate font-medium mt-2">
                        ₹{item.price.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => addToCart(item)}
                        className="p-2 bg-forest-green hover:bg-[#1a2b24] text-primary-bg rounded-xs border border-muted-gold/20 flex items-center justify-center transition-colors"
                        aria-label="Add to bag"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeFromWishlist(item.id, item.name)}
                        className="text-secondary-text/40 hover:text-red-700 transition-colors p-2 self-center"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-20 text-center">
                  <Heart className="w-12 h-12 text-border-accent/80 mb-4 stroke-[1.25]" />
                  <p className="font-serif text-lg text-secondary-text italic">
                    Your wishlist is empty
                  </p>
                  <p className="text-xs text-secondary-text/60 mt-1 max-w-[240px]">
                    Bookmark items you love to keep track of them here.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-6 px-6 py-2.5 bg-forest-green hover:bg-[#1a2b24] text-primary-bg text-[10px] uppercase tracking-widest font-semibold rounded-xs border border-muted-gold/25"
                  >
                    Explore Arrivals
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border-accent/40 bg-card text-center text-[10px] text-secondary-text tracking-widest uppercase">
              Rich Lady Boutique • Since 2011
              {/* Future: Supabase Wishlist DB sync */}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
