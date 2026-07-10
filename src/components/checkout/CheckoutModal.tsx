"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle2, Truck, Calendar, ShoppingBag, CreditCard, ShieldCheck, MapPin, Navigation, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/types/product";
import { toast } from "sonner";
import { useAuth } from "@/providers/AuthProvider";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null; // Null if cart checkout
  totalAmount: number;
  isCartCheckout: boolean;
  quantity?: number;
}

export function CheckoutModal({
  isOpen,
  onClose,
  product,
  totalAmount,
  isCartCheckout,
  quantity = 1,
}: CheckoutModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<"details" | "payment" | "processing" | "success">("details");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  useEffect(() => {
    if (isOpen && user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
      }));
    }
  }, [isOpen, user]);

  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking">("upi");

  // Coupon States
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountType: "percentage" | "flat"; discountValue: number } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Geolocation and Live Map States & Refs
  const [showMap, setShowMap] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const mapRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<any>(null);
  const markerRef = React.useRef<any>(null);

  // Disable background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Load Leaflet css/js dynamically for maps when open
  useEffect(() => {
    if (isOpen) {
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }
      if (!document.getElementById("leaflet-js")) {
        const script = document.createElement("script");
        script.id = "leaflet-js";
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.async = true;
        document.body.appendChild(script);
      }
    }
  }, [isOpen]);

  // Cleanup map instance on unmount/close
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!isOpen || step !== "details") {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markerRef.current = null;
      setShowMap(false);
    }
  }, [isOpen, step]);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`, {
        headers: {
          "Accept-Language": "en"
        }
      });
      if (!res.ok) throw new Error("Failed to contact reverse-geocoding service.");
      const data = await res.json();
      if (data && data.address) {
        const address = data.address;
        const city = address.city || address.town || address.village || address.suburb || address.county || "";
        const pincode = address.postcode || "";

        const addressParts = [];
        if (address.road) addressParts.push(address.road);
        if (address.suburb && address.suburb !== city) addressParts.push(address.suburb);
        if (address.neighbourhood) addressParts.push(address.neighbourhood);
        if (address.county && address.county !== city) addressParts.push(address.county);
        
        const streetAddress = addressParts.join(", ") || data.display_name;

        setFormData((prev) => ({
          ...prev,
          address: streetAddress,
          city: city,
          pincode: pincode.replace(/\s+/g, ""),
        }));
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      toast.error("Failed to parse geocoded address. You can still input manually.");
    }
  };

  const initializeMapInstance = (lat: number, lng: number) => {
    const L = (window as any).L;
    if (!L || !mapRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 16);
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      }
      return;
    }

    const map = L.map(mapRef.current).setView([lat, lng], 16);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    const customIcon = L.divIcon({
      html: `<div class="w-6 h-6 rounded-full bg-forest-green border-2 border-primary-bg flex items-center justify-center shadow-md animate-pulse">
               <div class="w-2.5 h-2.5 rounded-full bg-muted-gold"></div>
             </div>`,
      className: "custom-leaflet-marker",
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const marker = L.marker([lat, lng], { 
      draggable: true,
      icon: customIcon
    }).addTo(map);
    markerRef.current = marker;

    marker.on("dragend", async () => {
      const position = marker.getLatLng();
      await reverseGeocode(position.lat, position.lng);
    });
  };

  const autoDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setIsDetectingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setShowMap(true);
        
        await reverseGeocode(latitude, longitude);
        
        setTimeout(() => {
          initializeMapInstance(latitude, longitude);
          setIsDetectingLocation(false);
          toast.success("Location auto-detected successfully!");
        }, 300);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsDetectingLocation(false);
        let errMsg = "Unable to retrieve your location.";
        if (error.code === error.PERMISSION_DENIED) {
          errMsg = "Location access denied. Please enter your address manually.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errMsg = "Location details are unavailable.";
        } else if (error.code === error.TIMEOUT) {
          errMsg = "Location request timed out.";
        }
        setLocationError(errMsg);
        toast.error(errMsg);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  // Delivery Calculations
  const today = new Date();
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const orderDateStr = formatDate(today);
  
  // Craft time calculation
  const craftHours = product?.category === "Sarees" 
    ? 72 
    : product?.category === "Accessories" 
    ? 24 
    : 48;

  const craftDays = Math.ceil(craftHours / 24);
  
  const craftCompleteDate = new Date();
  craftCompleteDate.setDate(today.getDate() + craftDays);
  const craftCompleteStr = formatDate(craftCompleteDate);

  const dispatchDate = new Date();
  dispatchDate.setDate(today.getDate() + craftDays + 1);
  const dispatchStr = formatDate(dispatchDate);

  const deliveryDate = new Date();
  deliveryDate.setDate(today.getDate() + craftDays + 5);
  const deliveryStr = formatDate(deliveryDate);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Load Razorpay checkout script dynamically
  useEffect(() => {
    if (isOpen) {
      if (!document.getElementById("razorpay-checkout-script")) {
        const script = document.createElement("script");
        script.id = "razorpay-checkout-script";
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
      }
    }
  }, [isOpen]);

  const discountAmount = appliedCoupon
    ? appliedCoupon.discountType === "percentage"
      ? (totalAmount * appliedCoupon.discountValue) / 100
      : appliedCoupon.discountValue
    : 0;

  const finalAmount = Math.max(0, totalAmount - discountAmount);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) {
      toast.error("Please enter a coupon code.");
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const res = await fetch("/api/checkout/coupon/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: couponInput, totalAmount }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to validate coupon");
      }
      setAppliedCoupon({
        code: data.code,
        discountType: data.discountType,
        discountValue: data.discountValue,
      });
      toast.success(`Coupon ${data.code} applied successfully!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to apply coupon.");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    toast.info("Coupon removed.");
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.pincode) {
      toast.error("Please fill in all delivery details.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setStep("payment");
  };

  const triggerRazorpayPayment = async () => {
    setStep("processing");

    try {
      // 1. Prepare items array
      let checkoutItems: { id: string; quantity: number }[] = [];

      if (isCartCheckout) {
        const savedCart = localStorage.getItem("rich-lady-cart");
        if (savedCart) {
          const cartList: Product[] = JSON.parse(savedCart);
          // Group items by id to get quantities
          const grouped = cartList.reduce((acc: Record<string, number>, item) => {
            acc[item.id] = (acc[item.id] || 0) + ((item as any).quantity || 1);
            return acc;
          }, {});
          checkoutItems = Object.entries(grouped).map(([id, qty]) => ({
            id,
            quantity: qty,
          }));
        }
      } else if (product) {
        checkoutItems = [{ id: product.id, quantity: quantity }];
      }

      if (checkoutItems.length === 0) {
        toast.error("No items in your bag to checkout.");
        setStep("details");
        return;
      }

      // 2. Call Next.js API to create Razorpay order
      const createOrderRes = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: checkoutItems, couponCode: appliedCoupon?.code }),
      });

      const orderData = await createOrderRes.json();

      if (!createOrderRes.ok || orderData.error) {
        throw new Error(orderData.error || "Failed to initiate payment");
      }

      // 3. Open Razorpay payment checkout options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TBQF8HjtqlS4Gl",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Rich Lady Boutique",
        description: "Secure Checkout Payment",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          setStep("processing");
          try {
            // 4. Verify payment signature on backend and record order
            const verifyRes = await fetch("/api/checkout/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                customerDetails: formData,
                items: checkoutItems,
                couponCode: appliedCoupon?.code,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok || verifyData.error) {
              throw new Error(verifyData.error || "Payment verification failed");
            }

            // 5. Success! Clear cart and move to success step
            toast.success("Payment Received Successfully!");
            setStep("success");

            if (isCartCheckout) {
              localStorage.removeItem("rich-lady-cart");
              window.dispatchEvent(new Event("cart-updated"));
            }
          } catch (err: any) {
            console.error("Payment verification error:", err);
            toast.error(err.message || "Failed to verify transaction");
            setStep("payment");
          }
        },
        prefill: {
          name: formData.name,
          contact: formData.phone,
        },
        theme: {
          color: "#23352D", // Forest Green brand color
        },
        modal: {
          ondismiss: function () {
            setStep("payment");
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error("Checkout payment error:", error);
      toast.error(error.message || "Could not complete payment setup");
      setStep("payment");
    }
  };

  const handleClose = () => {
    setStep("details");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          onClick={step !== "processing" ? handleClose : undefined}
          className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-xs"
        >
          {/* Checkout Card Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-primary-bg border border-border-accent/40 rounded-[2rem] md:rounded-[2.5rem] shadow-luxury overflow-hidden font-sans select-none flex flex-col max-h-[85dvh] md:max-h-[90dvh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-border-accent/25 flex justify-between items-center bg-card">
              <div className="flex items-center gap-2">
                {step === "success" ? (
                  <>
                    <ShoppingBag className="w-5 h-5 text-muted-gold" />
                    <span className="font-serif text-lg tracking-wider text-primary-text font-semibold">
                      Order Confirmed
                    </span>
                  </>
                ) : (
                  <div className="flex items-center gap-2.5">
                    {/* Shiprocket Purple Logo Mock */}
                    <div className="w-7 h-7 rounded-lg bg-[#7b2cbf] flex items-center justify-center text-white font-sans font-bold text-[10px] shadow-xs tracking-tighter">
                      SR
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-sans text-sm font-bold text-slate-800 leading-tight">
                        Shiprocket Checkout
                      </span>
                      <span className="text-[8px] uppercase tracking-wider text-indigo-600 font-bold">
                        Secure One-Click Partner
                      </span>
                    </div>
                  </div>
                )}
              </div>
              {step !== "processing" && (
                <button
                  onClick={handleClose}
                  className="p-1.5 text-primary-text hover:text-muted-gold transition-colors rounded-full hover:bg-secondary-bg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Scrollable Container */}
            <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
              
              {/* STEP 1: Delivery Details Form */}
              {step === "details" && (
                <form onSubmit={handleDetailsSubmit} className="flex flex-col gap-4">
                  {/* Shiprocket Quick Checkout Alert */}
                  <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-2xl p-4 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100/70 flex items-center justify-center text-indigo-700 flex-shrink-0">
                      <ShieldCheck className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex flex-col text-left gap-0.5">
                      <span className="text-[11px] font-bold text-slate-800">
                        {user ? "Verified Profile Found!" : "One-Click Checkout Enabled"}
                      </span>
                      <p className="text-[9.5px] text-slate-500 leading-relaxed font-light">
                        {user 
                          ? `We have prefilled your shipping details using your verified profile (${user.email}).`
                          : "Input your details below to save them securely with Shiprocket for lightning-fast checkouts on your next purchase."}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <h3 className="font-serif text-sm text-muted-gold font-semibold uppercase tracking-wider">
                      Delivery Address
                    </h3>
                    
                    {/* Auto-detect Location CTA */}
                    <button
                      type="button"
                      onClick={autoDetectLocation}
                      disabled={isDetectingLocation}
                      className="w-full flex items-center justify-center gap-2 py-3 border border-border-accent/40 hover:border-muted-gold rounded-full bg-card hover:bg-secondary-bg/25 text-xs text-primary-text font-semibold uppercase tracking-wider transition-all duration-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDetectingLocation ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-gold" />
                          <span>Detecting Current Location...</span>
                        </>
                      ) : (
                        <>
                          <Navigation className="w-3.5 h-3.5 text-muted-gold" />
                          <span>Auto-Detect Address via Live Map</span>
                        </>
                      )}
                    </button>
                    {locationError && (
                      <span className="text-[10px] text-red-600 font-medium text-center -mt-1">
                        {locationError}
                      </span>
                    )}

                    {/* Leaflet Map display */}
                    {showMap && (
                      <div className="flex flex-col gap-1.5 mt-1">
                        <div 
                          ref={mapRef} 
                          className="w-full h-44 rounded-2xl border border-border-accent/40 overflow-hidden shadow-inner relative z-10"
                          style={{ minHeight: "176px" }}
                        />
                        <span className="text-[9px] text-secondary-text/80 font-sans font-light leading-relaxed">
                          💡 <b>Tip:</b> Drag the marker on the map to pinpoint your exact delivery spot, or edit the fields manually below.
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-secondary-text">Full Name</label>
                    <input
                      required
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your name"
                      className="w-full px-4 py-3 bg-card border border-border-accent/40 rounded-full text-xs text-primary-text focus:outline-none focus:border-muted-gold"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-secondary-text">Email Address</label>
                    <input
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="yourname@domain.com"
                      className="w-full px-4 py-3 bg-card border border-border-accent/40 rounded-full text-xs text-primary-text focus:outline-none focus:border-muted-gold"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-secondary-text">Phone Number</label>
                    <input
                      required
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="10-digit mobile number"
                      className="w-full px-4 py-3 bg-card border border-border-accent/40 rounded-full text-xs text-primary-text focus:outline-none focus:border-muted-gold"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-secondary-text">Address</label>
                    <textarea
                      required
                      rows={2}
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Flat, House no., Building, Company, Apartment, Street"
                      className="w-full px-4 py-3 bg-card border border-border-accent/40 rounded-2xl text-xs text-primary-text focus:outline-none focus:border-muted-gold resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase tracking-wider font-semibold text-secondary-text">Town/City</label>
                      <input
                        required
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="e.g. Rajahmundry"
                        className="w-full px-4 py-3 bg-card border border-border-accent/40 rounded-full text-xs text-primary-text focus:outline-none focus:border-muted-gold"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase tracking-wider font-semibold text-secondary-text">Pincode</label>
                      <input
                        required
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        placeholder="6-digit PIN code"
                        className="w-full px-4 py-3 bg-card border border-border-accent/40 rounded-full text-xs text-primary-text focus:outline-none focus:border-muted-gold"
                      />
                    </div>
                  </div>

                  <div className="w-full border-t border-border-accent/25 my-4 pt-4 flex flex-col gap-3">
                    {/* Coupon entry */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Promo Coupon Code (e.g. WELCOME10)"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        disabled={isApplyingCoupon || !!appliedCoupon}
                        className="flex-1 px-4 py-2 border border-border-accent/30 rounded-full text-xs outline-none bg-card focus:border-muted-gold uppercase"
                      />
                      {appliedCoupon ? (
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 rounded-full text-[10px] uppercase font-bold transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={isApplyingCoupon || !couponInput.trim()}
                          className="px-4 py-2 bg-forest-green hover:bg-[#1a2b24] text-primary-bg rounded-full text-[10px] uppercase font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isApplyingCoupon ? "..." : "Apply"}
                        </button>
                      )}
                    </div>

                    {/* Pricing breakdown */}
                    <div className="flex flex-col gap-1.5 text-xs text-secondary-text pt-2 border-t border-border-accent/10">
                      <div className="flex justify-between">
                        <span>Bag Subtotal</span>
                        <span>₹{totalAmount.toLocaleString("en-IN")}</span>
                      </div>
                      {appliedCoupon && (
                        <div className="flex justify-between text-emerald-700 font-medium">
                          <span>Discount ({appliedCoupon.code})</span>
                          <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-primary-text pt-2 border-t border-border-accent/20">
                        <span className="font-semibold text-[10px] uppercase tracking-wider">Total Payable</span>
                        <span className="font-sans text-base font-bold text-chocolate">₹{finalAmount.toLocaleString("en-IN")}</span>
                      </div>
                    </div>

                    <div className="flex justify-end mt-2">
                      <button
                        type="submit"
                        className="bg-forest-green hover:bg-[#1a2b24] text-primary-bg px-8 py-3.5 text-[10px] font-sans font-semibold tracking-widest uppercase rounded-full border border-muted-gold/25 hover:border-muted-gold transition-all duration-300 cursor-pointer shadow-sm"
                      >
                        Proceed to Payment
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* STEP 2: Razorpay Payment Simulation Overlay */}
              {step === "payment" && (
                <div className="flex flex-col gap-6">
                  {/* Razorpay Banner */}
                  <div className="bg-[#0b162f] rounded-2xl p-6 text-white flex flex-col gap-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 rounded-full blur-2xl" />
                    <span className="text-[8px] uppercase tracking-widest text-blue-400 font-bold">Secure Checkout Powered By</span>
                    <span className="font-sans text-xl font-bold tracking-tight flex items-center gap-1">
                      Razorpay <span className="text-[10px] font-light bg-blue-500/20 px-2 py-0.5 rounded text-blue-300">Secure</span>
                    </span>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-xs text-slate-300">Order ID: pay_RL{Math.floor(Math.random() * 900000 + 100000)}</span>
                      <span className="font-sans text-base font-bold text-blue-400">₹{finalAmount.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-secondary-text">Choose Payment Method</span>
                    
                    {/* Method 1: UPI */}
                    <div
                      onClick={() => setPaymentMethod("upi")}
                      className={`flex justify-between items-center p-4 border rounded-xl cursor-pointer transition-colors ${
                        paymentMethod === "upi" ? "border-blue-600 bg-blue-50/15" : "border-border-accent/40 hover:border-muted-gold"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-blue-600">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-primary-text">UPI / QR Code</span>
                          <span className="text-[9px] text-secondary-text">Google Pay, PhonePe, Paytm</span>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === "upi" ? "border-blue-600" : "border-slate-300"}`}>
                        {paymentMethod === "upi" && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                      </div>
                    </div>

                    {/* Method 2: Cards */}
                    <div
                      onClick={() => setPaymentMethod("card")}
                      className={`flex justify-between items-center p-4 border rounded-xl cursor-pointer transition-colors ${
                        paymentMethod === "card" ? "border-blue-600 bg-blue-50/15" : "border-border-accent/40 hover:border-muted-gold"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-primary-text">Credit / Debit Card</span>
                          <span className="text-[9px] text-secondary-text">Visa, Mastercard, RuPay, Amex</span>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === "card" ? "border-blue-600" : "border-slate-300"}`}>
                        {paymentMethod === "card" && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                      </div>
                    </div>
                  </div>

                  {/* Razorpay Secure Badge */}
                  <div className="flex items-center justify-center gap-1.5 text-slate-500 text-[10px]">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Your transaction is encrypted with 256-bit SSL security</span>
                  </div>

                  <div className="w-full border-t border-border-accent/25 mt-4 pt-4 flex gap-4">
                    <button
                      onClick={() => setStep("details")}
                      className="w-1/3 border border-border-accent/40 hover:border-primary-text py-3.5 text-[10px] font-sans font-semibold tracking-widest uppercase rounded-full transition-colors cursor-pointer"
                    >
                      Go Back
                    </button>
                    
                    <button
                      onClick={triggerRazorpayPayment}
                      className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white py-3.5 text-[10px] font-sans font-semibold tracking-widest uppercase rounded-full transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                    >
                      Pay ₹{finalAmount.toLocaleString("en-IN")} via Razorpay
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Razorpay Connecting & Processing Screen */}
              {step === "processing" && (
                <div className="py-16 flex flex-col items-center justify-center text-center gap-6">
                  {/* Processing animation */}
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
                    <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <h3 className="font-serif text-lg text-primary-text font-medium">Processing Transaction</h3>
                    <p className="font-sans text-xs text-secondary-text leading-relaxed font-light max-w-[280px]">
                      Connecting to secure bank gateway... Please do not refresh the page or click back button.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 4: Success Screen with Live Delivery Timeline */}
              {step === "success" && (
                <div className="flex flex-col gap-6">
                  {/* Order Confirmed Banner */}
                  <div className="flex flex-col items-center justify-center text-center gap-3 py-4 border-b border-border-accent/25">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <CheckCircle2 className="w-10 h-10 stroke-[1.5]" />
                    </div>
                    <div className="flex flex-col gap-1 mt-2">
                      <h2 className="font-serif text-2xl text-primary-text font-normal">Order Confirmed!</h2>
                      <p className="font-sans text-xs text-secondary-text font-light">
                        Thank you, <b className="font-semibold text-primary-text">{formData.name}</b>. Your order <b className="font-semibold text-primary-text">#RL-{Math.floor(Math.random() * 9000 + 1000)}</b> has been received.
                      </p>
                    </div>
                  </div>

                  {/* Delivery Detail Panel */}
                  <div className="bg-card border border-border-accent/40 rounded-2xl p-5 flex flex-col gap-3 text-xs">
                    <div className="flex items-center gap-2 text-muted-gold font-serif font-bold uppercase tracking-wider text-[10px] pb-2 border-b border-border-accent/25">
                      <Truck className="w-4 h-4" />
                      Delivery Information
                    </div>
                    <div className="flex flex-col gap-1 text-secondary-text">
                      <span className="font-semibold text-primary-text">{formData.name}</span>
                      <span>{formData.phone}</span>
                      <span>{formData.address}, {formData.city} - {formData.pincode}</span>
                    </div>
                  </div>

                  {/* Delivery Timeline - layout match */}
                  <div className="flex flex-col gap-5 py-2">
                    <h3 className="font-serif text-xs text-muted-gold font-semibold uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-muted-gold" />
                      Estimated Delivery Timeline
                    </h3>

                    <div className="flex flex-col gap-6 relative pl-6 ml-3 border-l border-border-accent/30">
                      
                      {/* Timeline Node 1: Order Placed */}
                      <div className="relative">
                        {/* Dot indicator */}
                        <div className="absolute -left-[30px] top-0.5 w-4 h-4 rounded-full bg-emerald-600 flex items-center justify-center text-white ring-4 ring-emerald-50">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-primary-text">Order Confirmed</span>
                          <span className="text-[10px] text-secondary-text">Placed on {orderDateStr}</span>
                          <span className="text-[10px] text-emerald-700 font-medium mt-0.5">Payment Completed via Razorpay</span>
                        </div>
                      </div>

                      {/* Timeline Node 2: Artisan Crafting */}
                      <div className="relative">
                        {/* Dot indicator */}
                        <div className="absolute -left-[30px] top-0.5 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-white ring-4 ring-amber-50">
                          <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-primary-text">Artisan Crafting &amp; Quality Check</span>
                          <span className="text-[10px] text-secondary-text">Estimated Completion: {craftCompleteStr}</span>
                          <span className="text-[10px] text-amber-700 font-medium mt-0.5">
                            Handloom fabric care &amp; premium boutique finish (Time: {craftHours} Hrs)
                          </span>
                        </div>
                      </div>

                      {/* Timeline Node 3: Dispatched */}
                      <div className="relative">
                        {/* Dot indicator */}
                        <div className="absolute -left-[30px] top-0.5 w-4 h-4 rounded-full bg-slate-200 border border-slate-300" />
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-slate-400">Shipment Handed to BlueDart Express</span>
                          <span className="text-[10px] text-slate-400">Scheduled Dispatch: {dispatchStr}</span>
                        </div>
                      </div>

                      {/* Timeline Node 4: Expected Delivery */}
                      <div className="relative">
                        {/* Dot indicator */}
                        <div className="absolute -left-[30px] top-0.5 w-4 h-4 rounded-full bg-slate-200 border border-slate-300" />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-600">Expected Delivery at Your Address</span>
                          <span className="text-[10px] text-slate-500 font-medium">Estimated Arrival: {deliveryStr}</span>
                          <span className="text-[10px] text-secondary-text/60 mt-0.5">A tracking number will be sent to your phone via SMS/WhatsApp.</span>
                        </div>
                      </div>

                    </div>
                  </div>

                  <div className="w-full border-t border-border-accent/25 mt-4 pt-4">
                    <button
                      onClick={handleClose}
                      className="w-full bg-forest-green hover:bg-[#1a2b24] text-primary-bg py-4 text-[10px] font-sans font-semibold tracking-widest uppercase rounded-full border border-muted-gold/20 hover:border-muted-gold transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
