"use client";

import React, { useState, useEffect } from "react";
import { X, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/types/product";
import { toast } from "sonner";
import { CheckoutModal } from "@/components/checkout/CheckoutModal";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const loadCart = () => {
    const savedCart = localStorage.getItem("rich-lady-cart");
    if (savedCart) {
      const items = JSON.parse(savedCart);
      setCartItems(items);
      const total = items.reduce((acc: number, item: any) => acc + (item.price * (item.quantity || 1)), 0);
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

  const removeFromCart = (id: string, selectedSize: string, name: string) => {
    const updated = cartItems.filter((item) => !(item.id === id && (item as any).selectedSize === selectedSize));
    localStorage.setItem("rich-lady-cart", JSON.stringify(updated));
    setCartItems(updated);
    setTotalPrice(updated.reduce((acc, item: any) => acc + (item.price * (item.quantity || 1)), 0));
    
    // Dispatch custom event to notify Header
    window.dispatchEvent(new Event("cart-updated"));
    toast.success(`${name} (${selectedSize ? `Size: ${selectedSize}` : ""}) removed from cart`);
  };

  const updateCartItemQuantity = (index: number, newQty: number) => {
    const item = cartItems[index];
    if (!item) return;

    let updated: Product[];
    if (newQty < 1) {
      updated = cartItems.filter((_, idx) => idx !== index);
      toast.success(`${item.name} removed from bag`);
    } else {
      const maxAvailable = item.stock !== undefined ? item.stock : 10;
      if (newQty > maxAvailable) {
        toast.error(`Only ${maxAvailable} items available in stock.`);
        return;
      }
      updated = [...cartItems];
      (updated[index] as any).quantity = newQty;
    }

    localStorage.setItem("rich-lady-cart", JSON.stringify(updated));
    setCartItems(updated);
    setTotalPrice(updated.reduce((acc, it: any) => acc + (it.price * (it.quantity || 1)), 0));
    window.dispatchEvent(new Event("cart-updated"));
  };

  const handleCheckout = () => {
    setIsCheckoutOpen(true);
  };

  return (
    <>
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
                  cartItems.map((item, idx) => (
                    <div
                      key={`${item.id}-${idx}`}
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
                        <div className="flex flex-wrap gap-x-2 gap-y-1 items-center mt-1">
                          <span className="text-[10px] uppercase text-secondary-text tracking-wider">
                            {item.category}
                          </span>
                          {(item as any).selectedSize && (
                            <>
                              <span className="text-[10px] text-secondary-text/50">•</span>
                              <span className="text-[9px] uppercase tracking-wider font-bold text-muted-gold bg-secondary-bg px-2 py-0.5 rounded border border-border-accent/35">
                                Size: {(item as any).selectedSize}
                              </span>
                            </>
                          )}
                        </div>
                        
                        {/* Quantity controls in drawer */}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center border border-border-accent/30 bg-[#FFFDF9]/60 rounded-xs overflow-hidden h-7">
                            <button
                              onClick={() => updateCartItemQuantity(idx, ((item as any).quantity || 1) - 1)}
                              className="w-7 h-full flex items-center justify-center text-xs font-bold text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-[10px] font-bold text-primary-text select-none">
                              {(item as any).quantity || 1}
                            </span>
                            <button
                              onClick={() => updateCartItemQuantity(idx, ((item as any).quantity || 1) + 1)}
                              className="w-7 h-full flex items-center justify-center text-xs font-bold text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <span className="text-xs font-sans text-chocolate font-medium mt-2">
                          ₹{(item.price * ((item as any).quantity || 1)).toLocaleString("en-IN")}
                          {((item as any).quantity || 1) > 1 && (
                            <span className="text-[9px] text-secondary-text/60 font-light ml-1.5">
                              (₹{item.price.toLocaleString("en-IN")} each)
                            </span>
                          )}
                        </span>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id, (item as any).selectedSize || "", item.name)}
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
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Razorpay Checkout Modal Overlay */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => {
          setIsCheckoutOpen(false);
          onClose(); // close cart drawer as well
        }}
        product={null} // null for cart checkout
        totalAmount={totalPrice}
        isCartCheckout={true}
      />
    </>
  );
}
