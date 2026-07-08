"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid, Search, Heart, MessageCircle } from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();
  const [wishlistCount, setWishlistCount] = useState(0);

  const updateCount = () => {
    const saved = localStorage.getItem("rich-lady-wishlist");
    if (saved) {
      const items = JSON.parse(saved);
      setWishlistCount(items.length);
    } else {
      setWishlistCount(0);
    }
  };

  useEffect(() => {
    updateCount();
    window.addEventListener("wishlist-updated", updateCount);
    return () => window.removeEventListener("wishlist-updated", updateCount);
  }, []);

  const triggerSearch = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new Event("open-search"));
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open("https://wa.me/919030443306?text=Hello%20Rich%20Lady%20Boutique!%20I'm%20visiting%20your%20website%20and%20need%20some%20help.", "_blank");
  };

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-primary-bg/90 backdrop-blur-md border-t border-border-accent/35 flex items-center justify-around z-45 px-2 shadow-lg">
      <Link
        href="/"
        className={`flex flex-col items-center justify-center w-12 h-full text-secondary-text transition-colors duration-medium ${
          pathname === "/" ? "text-forest-green" : "hover:text-muted-gold"
        }`}
      >
        <Home className="w-5 h-5 stroke-[1.5]" />
        <span className="text-[8px] font-sans font-medium mt-1 uppercase tracking-wider">Home</span>
      </Link>

      <Link
        href="/catalog"
        className={`flex flex-col items-center justify-center w-12 h-full text-secondary-text transition-colors duration-medium ${
          pathname === "/catalog" ? "text-forest-green" : "hover:text-muted-gold"
        }`}
      >
        <Grid className="w-5 h-5 stroke-[1.5]" />
        <span className="text-[8px] font-sans font-medium mt-1 uppercase tracking-wider">Categories</span>
      </Link>

      <button
        onClick={triggerSearch}
        className="flex flex-col items-center justify-center w-12 h-full text-secondary-text hover:text-muted-gold transition-colors duration-medium cursor-pointer"
      >
        <Search className="w-5 h-5 stroke-[1.5]" />
        <span className="text-[8px] font-sans font-medium mt-1 uppercase tracking-wider">Search</span>
      </button>

      <Link
        href="/catalog?wishlist=true"
        className={`flex flex-col items-center justify-center w-12 h-full text-secondary-text transition-colors duration-medium relative ${
          pathname.includes("wishlist") ? "text-forest-green" : "hover:text-muted-gold"
        }`}
      >
        <Heart className="w-5 h-5 stroke-[1.5]" />
        {wishlistCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-muted-gold text-primary-bg text-[7px] font-bold font-sans rounded-full flex items-center justify-center border border-primary-bg">
            {wishlistCount}
          </span>
        )}
        <span className="text-[8px] font-sans font-medium mt-1 uppercase tracking-wider">Wishlist</span>
      </Link>

      <button
        onClick={handleWhatsApp}
        className="flex flex-col items-center justify-center w-12 h-full text-secondary-text hover:text-forest-green transition-colors duration-medium cursor-pointer"
      >
        <MessageCircle className="w-5 h-5 stroke-[1.5]" />
        <span className="text-[8px] font-sans font-medium mt-1 uppercase tracking-wider">WhatsApp</span>
      </button>
    </div>
  );
}
