"use client";

import React, { useState } from "react";
import { X, CheckCircle2, Truck, Calendar, ShoppingBag, CreditCard, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/types/product";
import { toast } from "sonner";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null; // Null if cart checkout
  totalAmount: number;
  isCartCheckout: boolean;
}

export function CheckoutModal({
  isOpen,
  onClose,
  product,
  totalAmount,
  isCartCheckout,
}: CheckoutModalProps) {
  const [step, setStep] = useState<"details" | "payment" | "processing" | "success">("details");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking">("upi");

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

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.pincode) {
      toast.error("Please fill in all delivery details.");
      return;
    }
    setStep("payment");
  };

  const triggerRazorpayPayment = () => {
    setStep("processing");
    
    // Simulate Razorpay processing flow
    setTimeout(() => {
      setStep("success");
      toast.success("Payment Received Successfully!");
      
      // If it was a cart checkout, clear the cart
      if (isCartCheckout) {
        localStorage.removeItem("rich-lady-cart");
        window.dispatchEvent(new Event("cart-updated"));
      }
    }, 2500);
  };

  const handleClose = () => {
    setStep("details");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={step !== "processing" ? handleClose : undefined}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-xs"
          />

          {/* Checkout Card Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-x-4 bottom-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full max-w-lg bg-primary-bg border border-border-accent/40 rounded-[2.5rem] shadow-luxury z-50 overflow-hidden font-sans select-none flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-border-accent/25 flex justify-between items-center bg-card">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-muted-gold" />
                <span className="font-serif text-lg tracking-wider text-primary-text font-semibold">
                  {step === "success" ? "Order Confirmed" : "Secure Checkout"}
                </span>
              </div>
              {step !== "processing" && (
                <button
                  onClick={handleClose}
                  className="p-1.5 text-primary-text hover:text-muted-gold transition-colors rounded-full hover:bg-secondary-bg"
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
                  <h3 className="font-serif text-sm text-muted-gold font-semibold uppercase tracking-wider mb-2">
                    Delivery Address
                  </h3>
                  
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

                  <div className="w-full border-t border-border-accent/25 my-4 pt-4 flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase tracking-wider text-secondary-text">Total Payable</span>
                      <span className="font-sans text-lg font-bold text-chocolate">₹{totalAmount.toLocaleString("en-IN")}</span>
                    </div>
                    <button
                      type="submit"
                      className="bg-forest-green hover:bg-[#1a2b24] text-primary-bg px-8 py-3.5 text-[10px] font-sans font-semibold tracking-widest uppercase rounded-full border border-muted-gold/25 hover:border-muted-gold transition-all duration-300 cursor-pointer shadow-sm"
                    >
                      Proceed to Payment
                    </button>
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
                      <span className="font-sans text-base font-bold text-blue-400">₹{totalAmount.toLocaleString("en-IN")}</span>
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
                      Pay ₹{totalAmount.toLocaleString("en-IN")} via Razorpay
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
        </>
      )}
    </AnimatePresence>
  );
}
