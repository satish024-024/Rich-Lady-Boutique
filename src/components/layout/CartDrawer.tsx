"use client";

import React, { useState, useEffect } from "react";
import { X, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/types/product";
import { toast } from "sonner";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);

  const loadCart = () => {
    const savedCart = localStorage.getItem("rich-lady-cart");
    if (savedCart) {
      const items = JSON.parse(savedCart);
      setCartItems(items);
      const total = items.reduce((acc: number, item: Product) => acc + item.price, 0);
      setTotalPrice(total);
    } else {
      setCartItems([]);
      setTotalPrice(0);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadCart();
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
    window.addEventListener("cart-updated", loadCart);
    return () => window.removeEventListener("cart-updated", loadCart);
  }, []);

  const removeFromCart = (id: string, name: string) => {
    const updated = cartItems.filter((item) => item.id !== id);
    localStorage.setItem("rich-lady-cart", JSON.stringify(updated));
    setCartItems(updated);
    setTotalPrice(updated.reduce((acc, item) => acc + item.price, 0));
    
    // Dispatch custom event to notify Header
    window.dispatchEvent(new Event("cart-updated"));
    toast.success(`${name} removed from cart`);
  };

  const handleCheckout = () => {
    // Future: Razorpay Checkout Integration
    // razorpayCheckout(totalPrice);
    toast.info("Checkout is disabled for this demo storefront. (Razorpay Integration Coming Soon)");
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
                <ShoppingBag className="w-5 h-5 text-muted-gold" />
                <span className="font-serif text-lg tracking-wider text-primary-text font-medium">
                  Your Shopping Bag ({cartItems.length})
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-primary-text hover:text-muted-gold transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 no-scrollbar">
              {cartItems.length > 0 ? (
                cartItems.map((item) => (
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

                    <button
                      onClick={() => removeFromCart(item.id, item.name)}
                      className="text-secondary-text/40 hover:text-red-700 transition-colors p-1.5 self-center"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-20 text-center">
                  <ShoppingBag className="w-12 h-12 text-border-accent/80 mb-4 stroke-[1.25]" />
                  <p className="font-serif text-lg text-secondary-text italic">
                    Your bag is currently empty
                  </p>
                  <p className="text-xs text-secondary-text/60 mt-1 max-w-[240px]">
                    Fill it with beautiful designs from our new collection.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-6 px-6 py-2.5 bg-forest-green hover:bg-[#1a2b24] text-primary-bg text-[10px] uppercase tracking-widest font-semibold rounded-xs border border-muted-gold/25"
                  >
                    Start Shopping
                  </button>
                </div>
              )}
            </div>

            {/* Footer Summary */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-border-accent/40 bg-card flex flex-col gap-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-sans font-medium text-secondary-text">Subtotal</span>
                  <span className="font-sans font-semibold text-chocolate text-base">
                    ₹{totalPrice.toLocaleString("en-IN")}
                  </span>
                </div>
                <p className="text-[10px] text-secondary-text/75 italic">
                  Shipping, taxes, and discounts calculated at checkout.
                </p>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-forest-green hover:bg-[#1a2b24] text-primary-bg py-3 text-xs font-semibold uppercase tracking-widest rounded-xs border border-muted-gold/25 flex items-center justify-center gap-2 mt-2 transition-all duration-300"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4 text-muted-gold" />
                </button>
                {/* Future: Supabase Orders DB sync & Razorpay Gateway integrations */}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
