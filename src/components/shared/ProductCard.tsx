"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/types/product";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  onQuickViewClick?: (product: Product) => void;
}

export function ProductCard({ product, onQuickViewClick }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Fallback lists if fabric or sizes are missing
  const fabric = product.fabric || "Pure Cotton";
  const sizes = product.sizes || ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
  const hoverImage = product.hoverImageUrl || product.imageUrl;

  const updateWishlistState = () => {
    const saved = localStorage.getItem("rich-lady-wishlist");
    if (saved) {
      const items: Product[] = JSON.parse(saved);
      setIsLiked(items.some((item) => item.id === product.id));
    } else {
      setIsLiked(false);
    }
  };

  useEffect(() => {
    updateWishlistState();
    window.addEventListener("wishlist-updated", updateWishlistState);
    return () => window.removeEventListener("wishlist-updated", updateWishlistState);
  }, [product.id]);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const saved = localStorage.getItem("rich-lady-wishlist");
    let currentList: Product[] = saved ? JSON.parse(saved) : [];
    const exists = currentList.some((item) => item.id === product.id);
    let updatedList: Product[];

    if (exists) {
      updatedList = currentList.filter((item) => item.id !== product.id);
      toast.success(`${product.name} removed from wishlist`);
    } else {
      updatedList = [...currentList, product];
      toast.success(`${product.name} added to wishlist!`);
    }

    localStorage.setItem("rich-lady-wishlist", JSON.stringify(updatedList));
    window.dispatchEvent(new Event("wishlist-updated"));
  };

  return (
    <div
      className="flex flex-col w-full group select-none relative bg-primary-bg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${product.id}`} className="w-full flex flex-col cursor-pointer">
        {/* Visual Frame */}
        <div className="w-full aspect-[4/5] bg-card overflow-hidden border border-border-accent/30 rounded-[1.5rem] relative shadow-xs group-hover:shadow-luxury group-hover:border-muted-gold/40 transition-all duration-500">
          
          {/* Tag */}
          {product.collectionTag && (
            <div className="absolute top-4 left-4 bg-forest-green text-primary-bg px-2.5 py-0.5 rounded-full text-[8px] font-sans font-bold uppercase tracking-wider z-10 border border-muted-gold/20 shadow-xs">
              {product.collectionTag}
            </div>
          )}

          {/* Hover Image Fade Transition */}
          <div className="w-full h-full relative">
            <motion.img
              src={product.imageUrl}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover"
              animate={{ opacity: isHovered && hoverImage ? 0 : 1 }}
              transition={{ duration: 0.4 }}
            />
            {hoverImage && (
              <motion.img
                src={hoverImage}
                alt={`${product.name} alternate view`}
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.4 }}
              />
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={toggleWishlist}
            className="absolute top-4 right-4 p-2 bg-primary-bg/75 hover:bg-primary-bg backdrop-blur-xs rounded-full shadow-xs text-primary-text hover:text-red-700 transition-all duration-medium z-10 cursor-pointer"
            aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`w-3.5 h-3.5 transition-colors duration-medium ${
                isLiked ? "fill-red-700 text-red-700" : "text-primary-text"
              }`}
            />
          </button>

          {/* Hover Action Strip - Custom animated slider */}
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-chocolate/35 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-medium z-10 flex justify-center gap-2">
            {onQuickViewClick && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onQuickViewClick(product);
                }}
                className="bg-primary-bg hover:bg-forest-green text-primary-text hover:text-primary-bg p-2.5 rounded-full border border-border-accent/40 hover:border-forest-green transition-all duration-medium flex items-center justify-center cursor-pointer shadow-xs"
                title="Quick View"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            )}
            
            <Link
              href={`/product/${product.id}`}
              className="bg-primary-bg hover:bg-forest-green text-primary-text hover:text-primary-bg px-4 py-2 text-[8px] font-sans font-bold tracking-widest uppercase rounded-full border border-border-accent/40 hover:border-forest-green transition-all duration-medium flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              View Design
            </Link>
          </div>
        </div>

        {/* Info Block */}
        <div className="mt-4 flex flex-col items-start px-1">
          {/* Category & Fabric Tagline */}
          <span className="text-[8px] uppercase tracking-[0.2em] font-sans font-bold text-muted-gold">
            {product.category} • {fabric}
          </span>

          {/* Serif Product Title */}
          <h3 className="font-serif text-sm text-primary-text font-medium mt-1 mb-1 group-hover:text-muted-gold transition-colors duration-medium truncate w-full">
            {product.name}
          </h3>

          {/* Available Sizes Strip */}
          <div className="flex gap-1.5 flex-wrap my-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {sizes.slice(0, 5).map((sz, idx) => (
              <span key={idx} className="text-[7px] font-bold font-sans text-secondary-text/80 bg-secondary-bg border border-border-accent/25 px-1.5 py-0.5 rounded-sm">
                {sz}
              </span>
            ))}
            {sizes.length > 5 && (
              <span className="text-[7px] font-bold font-sans text-secondary-text/80 bg-secondary-bg border border-border-accent/25 px-1.5 py-0.5 rounded-sm">
                +{sizes.length - 5}
              </span>
            )}
          </div>

          {/* Price Tag */}
          <span className="text-xs font-sans text-chocolate font-semibold mt-1">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
        </div>
      </Link>
    </div>
  );
}
