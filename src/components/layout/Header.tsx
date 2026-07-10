"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Heart, ShoppingBag, Menu, X, ArrowRight, MessageCircle, Phone, Clock, ChevronDown, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { brandInfo } from "@/data/brand";
import { navigationItems } from "@/data/navigation";
import { toast } from "sonner";
import { useAuth } from "@/providers/AuthProvider";
import { AuthModal } from "@/components/auth/AuthModal";
import { isAdmin } from "@/utils/auth";

interface HeaderProps {
  onSearchClick: () => void;
  onCartClick: () => void;
  onWishlistClick: () => void;
}

export function Header({ onSearchClick, onCartClick, onWishlistClick }: HeaderProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Cart & Wishlist counters
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  // Auth states
  const { user, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Set mock items for demonstration
  useEffect(() => {
    // Listen to custom events for cart & wishlist changes
    const updateCounters = () => {
      const savedCart = localStorage.getItem("rich-lady-cart");
      const savedWishlist = localStorage.getItem("rich-lady-wishlist");
      if (savedCart) setCartCount(JSON.parse(savedCart).length);
      if (savedWishlist) setWishlistCount(JSON.parse(savedWishlist).length);
    };

    updateCounters();
    window.addEventListener("storage", updateCounters);
    window.addEventListener("cart-updated", updateCounters);
    window.addEventListener("wishlist-updated", updateCounters);

    return () => {
      window.removeEventListener("storage", updateCounters);
      window.removeEventListener("cart-updated", updateCounters);
      window.removeEventListener("wishlist-updated", updateCounters);
    };
  }, []);

  return (
    <>
      <header className="w-full z-40 relative">
        {/* Forest Green Announcement Bar */}
        <div className="w-full bg-forest-green text-primary-bg py-2 px-6 border-b border-muted-gold/20 text-xs font-sans font-medium select-none">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2 md:gap-0">
            {/* Trust Badges Sliding/Grid */}
            <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-1 text-[10px] md:text-xs tracking-wider uppercase opacity-90">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-gold" />
                Since 2011
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-gold" />
                Premium Quality
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-gold" />
                Wholesale & Retail
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-gold" />
                Worldwide Shipping
              </span>
            </div>

            {/* Store Timing & Phone */}
            <div className="flex items-center gap-4 text-[10px] md:text-xs opacity-90 tracking-wide">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-muted-gold" />
                {brandInfo.storeTimings.split(" ")[0]} {brandInfo.storeTimings.split(" ")[1]} {brandInfo.storeTimings.split(" ")[2]}
              </span>
              <a href={`tel:${brandInfo.phone}`} className="flex items-center gap-1 hover:text-muted-gold transition-colors">
                <Phone className="w-3.5 h-3.5 text-muted-gold" />
                {brandInfo.phone.replace("+91 ", "")}
              </a>
            </div>
          </div>
        </div>

        {/* Main Floating Navigation Bar */}
        <nav
          className={`w-full transition-all duration-300 sticky top-0 bg-primary-bg/95 backdrop-blur-md border-b z-50 text-primary-text ${
            isScrolled
              ? "py-3 shadow-md border-border-accent/40"
              : "py-5 border-border-accent/20"
          }`}
        >
          <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
            {/* Logo Left */}
            <Link href="/" className="flex items-center gap-3 group relative select-none">
              <div className="w-10 h-10 border rounded-full flex items-center justify-center bg-card transition-colors p-1 shadow-xs border-muted-gold/45 group-hover:border-muted-gold">
                <svg viewBox="0 0 100 100" fill="none" className="w-7 h-7 text-muted-gold">
                  <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="0.8" />
                  <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="0.4" strokeDasharray="2 2" />
                  <path d="M50 20 C46 34 32 44 32 55 C32 66 50 74 50 74 C50 74 68 66 68 55 C68 44 54 34 50 20 Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  <path d="M50 32 C41 42 37 50 37 58 C37 66 50 70 50 70" stroke="currentColor" strokeWidth="0.8" />
                  <path d="M50 32 C59 42 63 50 63 58 C63 66 50 70 50 70" stroke="currentColor" strokeWidth="0.8" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-lg md:text-xl tracking-[0.2em] font-semibold uppercase leading-none text-primary-text">
                  Rich Lady
                </span>
                <span className="text-[7.5px] uppercase tracking-[0.32em] mt-1 text-muted-gold font-bold">
                  The Luxury Atelier
                </span>
              </div>
            </Link>

            {/* Navigation Center */}
            <div className="hidden lg:flex items-center gap-8">
              {navigationItems.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.dropdownItems && setActiveDropdown(item.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className="flex items-center gap-1 text-[11px] uppercase tracking-[0.2em] font-sans font-medium hover:text-muted-gold transition-colors py-2 text-primary-text"
                  >
                    {item.label}
                    {item.dropdownItems && <ChevronDown className="w-3.5 h-3.5 opacity-60" />}
                  </Link>

                  {/* Dropdown Menu */}
                  {item.dropdownItems && activeDropdown === item.label && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-48 bg-card border border-border-accent shadow-luxury py-3 rounded-md flex flex-col z-50">
                      {item.dropdownItems.map((drop) => (
                        <Link
                          key={drop.label}
                          href={drop.href}
                          className="px-5 py-2 text-[10px] uppercase tracking-wider font-sans font-medium text-secondary-text hover:text-muted-gold hover:bg-secondary-bg/30 transition-colors"
                        >
                          {drop.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Icons Right */}
            <div className="flex items-center gap-4 md:gap-5">
              <button
                onClick={() => {
                  onSearchClick();
                  window.dispatchEvent(new Event("open-search"));
                }}
                className="hover:text-muted-gold transition-colors p-1.5 cursor-pointer text-primary-text"
                aria-label="Search items"
              >
                <Search className="w-4.5 h-4.5" />
              </button>

              <button
                onClick={onWishlistClick}
                className="hover:text-muted-gold transition-colors p-1.5 relative cursor-pointer text-primary-text"
                aria-label="Wishlist items"
              >
                <Heart className="w-4.5 h-4.5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-muted-gold text-primary-bg rounded-full text-[8px] flex items-center justify-center font-bold">
                    {wishlistCount}
                  </span>
                )}
              </button>

              <button
                onClick={onCartClick}
                className="hover:text-muted-gold transition-colors p-1.5 relative cursor-pointer text-primary-text"
                aria-label="Cart items"
              >
                <ShoppingBag className="w-4.5 h-4.5" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-forest-green text-primary-bg rounded-full text-[8px] flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Profile Account */}
              <div className="relative flex items-center">
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      className="w-7 h-7 rounded-full bg-forest-green border border-muted-gold/45 text-primary-bg flex items-center justify-center text-[10px] font-sans font-bold uppercase tracking-wider cursor-pointer hover:border-muted-gold transition-colors"
                      aria-label="User Profile"
                    >
                      {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </button>
                    {isProfileDropdownOpen && (
                      <div className="absolute right-0 mt-2.5 w-48 bg-card border border-border-accent/40 rounded-xl shadow-luxury py-2 z-50 text-[11px] font-sans">
                        <div className="px-4 py-2 border-b border-border-accent/25 text-secondary-text font-light">
                          <p className="font-serif text-xs text-primary-text font-bold leading-normal truncate">{user.name}</p>
                          <p className="text-[9px] truncate mt-0.5">{user.phone}</p>
                        </div>
                        <Link
                          href="/orders"
                          className="block w-full text-left px-4 py-2.5 text-secondary-text hover:text-primary-text hover:bg-secondary-bg transition-colors"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          My Orders &amp; Tracking
                        </Link>
                        {isAdmin(user) && (
                          <Link
                            href="/admin"
                            className="block w-full text-left px-4 py-2.5 text-secondary-text hover:text-primary-text hover:bg-secondary-bg transition-colors"
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            Boutique Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            logout();
                            setIsProfileDropdownOpen(false);
                            toast.success("Logged out successfully.");
                          }}
                          className="w-full text-left px-4 py-2.5 text-red-700 hover:bg-red-50/50 transition-colors cursor-pointer"
                        >
                          Log Out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="hover:text-muted-gold transition-colors p-1.5 cursor-pointer text-primary-text"
                    aria-label="Account Login"
                  >
                    <User className="w-4.5 h-4.5" />
                  </button>
                )}
              </div>

              {/* WhatsApp Button */}
              <a
                href={brandInfo.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-1.5 bg-forest-green hover:bg-[#1a2b24] text-primary-bg px-4 py-2 text-[10px] font-sans font-semibold tracking-wider uppercase rounded-xs border border-muted-gold/30 hover:border-muted-gold transition-all duration-300"
              >
                <MessageCircle className="w-3.5 h-3.5 text-muted-gold" />
                WhatsApp
              </a>

              {/* Mobile Menu Burger */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden hover:text-muted-gold transition-colors p-1.5 cursor-pointer text-primary-text"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer Slide-out (Custom Framer Motion Drawer) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Dark Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-[#2D221C] z-50 lg:hidden"
            />

            {/* Sidebar menu drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
              className="fixed top-0 right-0 w-[80%] max-w-sm h-full bg-primary-bg border-l border-border-accent z-50 shadow-2xl p-8 flex flex-col justify-between lg:hidden"
            >
              <div>
                {/* Header of Mobile Menu */}
                <div className="flex justify-between items-center mb-10">
                  <div className="flex flex-col">
                    <span className="font-serif text-lg tracking-widest text-primary-text uppercase">
                      Rich Lady
                    </span>
                    <span className="text-[8px] uppercase tracking-wider text-secondary-text mt-0.5">
                      Boutique
                    </span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1.5 text-primary-text hover:text-muted-gold transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Links */}
                <div className="flex flex-col gap-5">
                  {user && (
                    <div className="border-b border-border-accent/40 pb-4 text-left">
                      <p className="font-serif text-sm text-primary-text font-bold leading-normal">{user.name}</p>
                      <p className="text-[9px] text-secondary-text mt-0.5">{user.email}</p>
                      <div className="mt-3 flex flex-col gap-2">
                        <Link
                          href="/orders"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="text-[10px] font-sans uppercase font-bold tracking-widest text-forest-green hover:underline"
                        >
                          My Orders &amp; Tracking &rarr;
                        </Link>
                        {isAdmin(user) && (
                          <Link
                            href="/admin"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-[10px] font-sans uppercase font-bold tracking-widest text-forest-green hover:underline"
                          >
                            Boutique Admin Panel &rarr;
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            logout();
                            setIsMobileMenuOpen(false);
                            toast.success("Logged out successfully.");
                          }}
                          className="text-left text-[10px] font-sans uppercase font-bold tracking-widest text-red-700 hover:underline cursor-pointer"
                        >
                          Log Out
                        </button>
                      </div>
                    </div>
                  )}
                  {navigationItems.map((item) => (
                    <div key={item.label} className="border-b border-border-accent/40 pb-2">
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-xs uppercase tracking-widest font-sans font-medium text-primary-text hover:text-muted-gold flex justify-between items-center"
                      >
                        {item.label}
                        <ArrowRight className="w-3.5 h-3.5 opacity-30" />
                      </Link>
                      {item.dropdownItems && (
                        <div className="pl-4 mt-2 flex flex-col gap-2">
                          {item.dropdownItems.map((drop) => (
                            <Link
                              key={drop.label}
                              href={drop.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="text-[10px] uppercase tracking-wider text-secondary-text hover:text-muted-gold"
                            >
                              {drop.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Footer Info */}
              <div className="flex flex-col gap-4 border-t border-border-accent/40 pt-6">
                <a
                  href={brandInfo.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-forest-green text-primary-bg py-3 text-xs font-semibold uppercase tracking-wider rounded-xs border border-muted-gold/20"
                >
                  <MessageCircle className="w-4 h-4 text-muted-gold" />
                  Chat on WhatsApp
                </a>
                <p className="text-[10px] text-center text-secondary-text tracking-wide italic">
                  Since 2011 • Luxury Editorial Storytelling
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
