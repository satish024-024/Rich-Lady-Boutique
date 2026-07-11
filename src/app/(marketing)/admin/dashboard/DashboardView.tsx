"use client";

import React from "react";
import { FolderHeart, Sliders, Plus, MessageSquare, Globe, CheckCircle2, DollarSign, ShoppingBag, Mail } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";

interface DashboardViewProps {
  totalRevenue: number;
  totalOrdersCount: number;
  totalProductsCount: number;
  totalCommunicationsCount: number;
  orders: any[];
  setActiveTab: (tab: any) => void;
}

export function DashboardView({
  totalRevenue,
  totalOrdersCount,
  totalProductsCount,
  totalCommunicationsCount,
  orders,
  setActiveTab
}: DashboardViewProps) {
  return (
    <FadeIn className="flex flex-col gap-10">
      {/* Metrics cards grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Sales Revenue", val: `₹${totalRevenue.toLocaleString("en-IN")}`, icon: DollarSign, color: "text-emerald-700 bg-emerald-500/5 border-emerald-500/20" },
          { label: "Orders Placed", val: totalOrdersCount, icon: FolderHeart, color: "text-muted-gold bg-muted-gold/5 border-muted-gold/20" },
          { label: "Catalog Products", val: totalProductsCount, icon: ShoppingBag, color: "text-chocolate bg-chocolate/5 border-chocolate/20" },
          { label: "Communications Logs", val: totalCommunicationsCount, icon: Mail, color: "text-forest-green bg-forest-green/5 border-forest-green/20" }
        ].map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className={`p-6 border rounded-2xl flex items-center gap-5 shadow-xs ${m.color}`}>
              <div className="p-3 bg-primary-bg rounded-xl border border-border-accent/30 shadow-xs">
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-wider text-secondary-text/80 font-bold mb-1">{m.label}</span>
                <span className="text-xl md:text-2xl font-serif text-primary-text font-semibold">{m.val}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Access section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Orders Overview */}
        <div className="lg:col-span-2 bg-card border border-border-accent/45 p-6 rounded-2xl shadow-xs">
          <h3 className="font-serif text-lg text-primary-text mb-5 flex items-center gap-2 border-b border-border-accent/20 pb-3">
            <FolderHeart className="w-5 h-5 text-muted-gold" />
            Recent Placed Orders
          </h3>
          {orders.length === 0 ? (
            <div className="py-10 text-center font-serif italic text-xs text-secondary-text">No orders placed recently.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border-accent/25 text-secondary-text uppercase tracking-wider font-bold">
                    <th className="py-3">Reference</th>
                    <th className="py-3">Customer</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((ord) => (
                    <tr key={ord.id} className="border-b border-border-accent/15 text-primary-text hover:bg-[#FAF8F3]/50 transition-colors">
                      <td className="py-3.5 font-mono">{ord.id.slice(0, 8)}...</td>
                      <td className="py-3.5">{ord.customer_name}</td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${
                          ord.status === "completed" ? "bg-emerald-500/10 text-emerald-700" : "bg-amber-500/10 text-amber-700"
                        }`}>
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3.5 font-bold">₹{Number(ord.total).toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Mini Settings Shortcuts */}
        <div className="bg-card border border-border-accent/45 p-6 rounded-2xl shadow-xs flex flex-col gap-5 justify-between">
          <div>
            <h3 className="font-serif text-lg text-primary-text mb-4 flex items-center gap-2 border-b border-border-accent/20 pb-3">
              <Sliders className="w-5 h-5 text-muted-gold" />
              Quick Actions
            </h3>
            <p className="text-xs text-secondary-text font-light leading-relaxed mb-4">
              Use these shortcut actions to jump straight into different sub-modules of the boutique system.
            </p>
            <div className="flex flex-col gap-2.5">
              <button onClick={() => setActiveTab("catalog")} className="w-full py-2.5 border border-border-accent/40 bg-primary-bg hover:border-muted-gold text-left px-4 rounded-xl text-xs flex items-center justify-between cursor-pointer">
                <span>Add new styles</span> <Plus className="w-4 h-4 text-muted-gold" />
              </button>
              <button onClick={() => setActiveTab("testimonials")} className="w-full py-2.5 border border-border-accent/40 bg-primary-bg hover:border-muted-gold text-left px-4 rounded-xl text-xs flex items-center justify-between cursor-pointer">
                <span>Manage Testimonials</span> <MessageSquare className="w-4 h-4 text-muted-gold" />
              </button>
              <button onClick={() => setActiveTab("site_copy")} className="w-full py-2.5 border border-border-accent/40 bg-primary-bg hover:border-muted-gold text-left px-4 rounded-xl text-xs flex items-center justify-between cursor-pointer">
                <span>Edit homepage hero</span> <Globe className="w-4 h-4 text-muted-gold" />
              </button>
            </div>
          </div>
          <div className="bg-muted-gold/5 p-4 rounded-xl border border-muted-gold/15 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-forest-green flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-secondary-text/90 leading-relaxed font-sans">
              <strong>Local System Sync Status</strong>: Seeding offline localStorage buffers active. Product lists synced with local database tables successfully.
            </p>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
