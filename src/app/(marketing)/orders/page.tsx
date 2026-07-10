"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/utils/supabaseClient";
import { FileText, Truck, Calendar, ArrowRight, ShieldCheck, MapPin, Printer, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  products: {
    name: string;
    image_url: string;
    category: string;
  } | null;
}

interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  shipping_address: string;
  city: string;
  pincode: string;
  total_amount: number;
  payment_status: string;
  shipping_status: string;
  shiprocket_order_id: string | null;
  shiprocket_shipment_id: string | null;
  shiprocket_awb_code: string | null;
  shiprocket_courier_name: string | null;
  shiprocket_tracking_url: string | null;
  order_items: OrderItem[];
}

export default function UserOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Order | null>(null);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    // Fetch orders matching customer_email or customer_phone
    const fetchOrders = async () => {
      try {
        const queryFilter = [];
        if (user.email) queryFilter.push(`customer_email.eq.${user.email}`);
        if (user.phone) queryFilter.push(`customer_phone.eq.${user.phone}`);

        if (queryFilter.length === 0) {
          setOrders([]);
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("orders")
          .select(`
            *,
            order_items (
              id,
              quantity,
              price,
              products (
                name,
                image_url,
                category
              )
            )
          `)
          .or(queryFilter.join(","))
          .order("created_at", { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (err: any) {
        console.error("Error fetching orders:", err);
        toast.error("Failed to load your orders");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const handlePrintInvoice = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (!user) {
    return (
      <div className="w-full min-h-[80vh] bg-primary-bg flex flex-col items-center justify-center text-center p-6 py-40 select-none">
        <AlertCircle className="w-16 h-16 text-muted-gold/80 mb-6 stroke-[1.25]" />
        <h2 className="font-serif text-2xl text-primary-text mb-2">Access Restricted</h2>
        <p className="text-xs text-secondary-text max-w-sm mb-6 font-light leading-relaxed">
          Please log in to your account using your verified email address to view your order history, receipts, and live delivery updates.
        </p>
        <Link
          href="/"
          className="bg-forest-green hover:bg-[#1a2b24] text-primary-bg px-6 py-3 text-[10px] font-sans font-bold tracking-widest uppercase rounded-xs border border-muted-gold/20 transition-all duration-300"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-primary-bg py-32 font-sans select-none print:bg-white print:py-0 print:text-black">
      <div className="max-w-5xl mx-auto px-6 print:px-0">
        
        {/* Page Header */}
        <div className="border-b border-border-accent/30 pb-5 mb-8 flex justify-between items-center print:hidden">
          <div className="flex flex-col text-left">
            <h1 className="font-serif text-3xl md:text-4xl text-primary-text font-normal">
              My Orders &amp; Tracking
            </h1>
            <span className="text-[10px] uppercase tracking-widest text-muted-gold font-bold mt-1.5">
              Verified Profile: {user.email}
            </span>
          </div>
          <Link
            href="/catalog"
            className="text-[10px] uppercase tracking-wider font-semibold text-secondary-text hover:text-muted-gold flex items-center gap-1"
          >
            Continue Shopping <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="py-24 text-center">
            <p className="font-serif italic text-lg text-secondary-text animate-pulse">Loading orders history...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border-accent/40 rounded-3xl p-6 bg-card print:hidden">
            <Truck className="w-16 h-16 text-border-accent/70 mb-6 stroke-[1.25] mx-auto" />
            <h3 className="font-serif text-xl text-primary-text italic mb-2">No Orders Found</h3>
            <p className="text-xs text-secondary-text max-w-sm mx-auto font-light leading-relaxed mb-6">
              You haven't placed any purchases yet. Your completed boutique orders will be listed here with tracking and invoices.
            </p>
            <Link
              href="/catalog"
              className="bg-forest-green hover:bg-[#1a2b24] text-primary-bg px-6 py-3 text-[10px] font-sans font-bold tracking-widest uppercase rounded-xs border border-muted-gold/20"
            >
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6 print:hidden">
            {orders.map((order) => {
              const orderRef = `RL-${order.id.slice(0, 8).toUpperCase()}`;
              const orderDate = new Date(order.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              });

              return (
                <div key={order.id} className="bg-card border border-border-accent/30 rounded-3xl p-6 hover:border-muted-gold/40 transition-colors shadow-xs">
                  {/* Card Header Info */}
                  <div className="flex flex-wrap justify-between items-start gap-4 pb-4 border-b border-border-accent/25">
                    <div className="flex flex-col text-left gap-1">
                      <span className="font-serif text-base font-bold text-primary-text">
                        Order #{orderRef}
                      </span>
                      <span className="text-[10px] text-secondary-text font-medium flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 opacity-70" />
                        Placed on {orderDate}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedInvoice(order)}
                        className="flex items-center gap-1.5 px-4 py-2 border border-border-accent/40 rounded-full hover:border-muted-gold hover:text-muted-gold text-[9px] font-sans font-bold uppercase tracking-wider bg-[#FFFDF9]/65 transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Receipt Invoice
                      </button>

                      <div className="flex flex-col items-end">
                        <span className="text-[9px] uppercase tracking-wider text-secondary-text">Amount Paid</span>
                        <span className="font-sans text-sm font-bold text-chocolate">₹{order.total_amount.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="py-4 border-b border-border-accent/25 flex flex-col gap-4">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-14 bg-primary-bg rounded-xs border border-border-accent/30 overflow-hidden flex-shrink-0">
                            <img
                              src={item.products?.image_url || "/images/cat_lehengas.jpg"}
                              alt={item.products?.name || "Boutique Apparel"}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="text-xs font-semibold text-primary-text">
                              {item.products?.name || "Premium Design Ensemble"}
                            </span>
                            <span className="text-[9px] text-secondary-text uppercase tracking-wider mt-0.5">
                              {item.products?.category || "Artisan Craft"} • Qty: {item.quantity}
                            </span>
                          </div>
                        </div>

                        <span className="text-xs font-sans text-secondary-text">
                          ₹{item.price.toLocaleString("en-IN")} each
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Shipment Tracking Details (Powered by Shiprocket) */}
                  <div className="pt-4 flex flex-col gap-3">
                    <h4 className="font-serif text-[10px] text-muted-gold font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Truck className="w-4 h-4" />
                      Shiprocket Courier Status
                    </h4>

                    {order.shipping_status === "shipped" && order.shiprocket_awb_code ? (
                      <div className="bg-indigo-50/20 border border-indigo-100/50 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex flex-col text-left gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800">
                              Dispatched via {order.shiprocket_courier_name || "Shiprocket Partner"}
                            </span>
                            <span className="text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                              In Transit
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500">
                            AWB Tracking Code: <b className="font-semibold text-slate-800">{order.shiprocket_awb_code}</b>
                          </span>
                        </div>

                        {order.shiprocket_tracking_url && (
                          <a
                            href={order.shiprocket_tracking_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 text-[9px] font-sans font-bold tracking-widest uppercase rounded-full shadow-xs transition-colors flex items-center gap-1.5"
                          >
                            Track courier parcel &rarr;
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-secondary-text bg-[#FFFDF9]/60 border border-border-accent/25 rounded-2xl p-4">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
                        <span className="font-light">
                          Preparing order for dispatch. Our design artisans are completing tailorship crafting and quality controls.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Invoice Modal Overlay (Beautiful print layout) */}
      <AnimatePresence>
        {selectedInvoice && (
          <div className="fixed inset-0 z-50 overflow-y-auto no-scrollbar font-sans bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 print:relative print:bg-white print:p-0 print:z-0">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-primary-bg w-full max-w-2xl border border-border-accent/40 rounded-3xl p-8 shadow-luxury flex flex-col gap-6 print:border-none print:shadow-none print:rounded-none print:p-0"
            >
              {/* Modal controls */}
              <div className="flex justify-between items-center border-b border-border-accent/25 pb-4 print:hidden">
                <span className="font-serif text-sm text-primary-text font-semibold uppercase tracking-wider">Purchase Receipt Invoice</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrintInvoice}
                    className="p-2 border border-border-accent/40 hover:border-muted-gold rounded-full transition-colors hover:text-muted-gold cursor-pointer"
                    title="Print Receipt"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="px-4 py-2 border border-border-accent/45 hover:border-red-700 hover:text-red-700 text-[9px] uppercase font-bold rounded-full transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Printable Invoice Header */}
              <div className="flex justify-between items-start">
                <div className="flex flex-col text-left">
                  <span className="font-serif text-xl tracking-widest text-primary-text uppercase font-bold">RICH LADY</span>
                  <span className="text-[8px] uppercase tracking-[0.25em] text-muted-gold font-bold mt-0.5">The Luxury Atelier</span>
                  <p className="text-[9px] text-secondary-text mt-2 font-light">
                    Door No: 46-15-7, Danavaipeta<br />
                    Rajahmundry, Andhra Pradesh - 533103<br />
                    Tel: +91 90304 43306
                  </p>
                </div>

                <div className="flex flex-col items-end text-right">
                  <h2 className="font-serif text-lg font-bold text-chocolate uppercase tracking-wider">TAX INVOICE</h2>
                  <span className="text-xs font-semibold text-primary-text mt-1">Invoice #: RL-{selectedInvoice.id.slice(0, 8).toUpperCase()}</span>
                  <span className="text-[10px] text-secondary-text font-medium mt-0.5">Date: {new Date(selectedInvoice.created_at).toLocaleDateString("en-IN")}</span>
                </div>
              </div>

              {/* Billing Info */}
              <div className="grid grid-cols-2 gap-6 border-t border-b border-border-accent/25 py-4 my-2 text-xs">
                <div className="flex flex-col text-left gap-1">
                  <span className="text-[9px] uppercase tracking-wider text-muted-gold font-bold mb-1">Customer Details</span>
                  <span className="font-semibold text-primary-text">{selectedInvoice.customer_name}</span>
                  <span className="text-secondary-text">{selectedInvoice.customer_phone}</span>
                  <span className="text-secondary-text">{selectedInvoice.customer_email || "N/A"}</span>
                </div>

                <div className="flex flex-col text-left gap-1">
                  <span className="text-[9px] uppercase tracking-wider text-muted-gold font-bold mb-1">Shipping Destination</span>
                  <span className="text-secondary-text leading-relaxed font-light">
                    {selectedInvoice.shipping_address}<br />
                    {selectedInvoice.city} - {selectedInvoice.pincode}
                  </span>
                </div>
              </div>

              {/* Line Items Table */}
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border-accent/40 font-serif text-muted-gold font-bold">
                    <th className="py-2">Description</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Unit Price</th>
                    <th className="py-2 text-right">Total Price</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.order_items.map((item) => (
                    <tr key={item.id} className="border-b border-border-accent/15 text-secondary-text">
                      <td className="py-2.5 font-bold text-primary-text">
                        {item.products?.name || "Boutique Silks Apparel"}
                      </td>
                      <td className="py-2.5 text-center">{item.quantity}</td>
                      <td className="py-2.5 text-right">₹{item.price.toLocaleString("en-IN")}</td>
                      <td className="py-2.5 text-right font-semibold">₹{(item.price * item.quantity).toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals Section */}
              <div className="flex flex-col items-end gap-1.5 text-xs ml-auto w-64 pt-4 border-t border-border-accent/25">
                <div className="flex justify-between w-full text-secondary-text">
                  <span>Gross Total:</span>
                  <span>₹{selectedInvoice.total_amount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between w-full text-secondary-text">
                  <span>Shipping Fee:</span>
                  <span className="text-emerald-700 font-bold uppercase text-[9px] mt-0.5">Free</span>
                </div>
                <div className="flex justify-between w-full text-primary-text border-t border-border-accent/20 pt-2 font-bold">
                  <span className="uppercase tracking-wider text-[10px]">Net Payable Paid:</span>
                  <span className="text-chocolate">₹{selectedInvoice.total_amount.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Signatures / Terms */}
              <div className="flex justify-between items-end mt-4 text-[9px] text-secondary-text font-light">
                <div className="flex flex-col text-left gap-1 max-w-xs">
                  <span className="font-bold text-primary-text">Terms &amp; Conditions</span>
                  <p className="leading-relaxed">
                    All custom handloom weave details take 7-day exchange coverage. Dry clean recommended.
                  </p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-32 border-b border-border-accent/40 mb-1 h-8" />
                  <span className="font-bold text-primary-text">Authorized Signatory</span>
                  <span>Rich Lady Boutique</span>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
