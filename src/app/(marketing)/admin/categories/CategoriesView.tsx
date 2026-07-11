"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit3, RefreshCw, FolderHeart, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { FadeIn } from "@/components/motion/FadeIn";
import { Category } from "@/types/category";

export function CategoriesView() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (err) {
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, imageUrl })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Category added successfully");
        setName("");
        setImageUrl("");
        fetchCategories();
      } else {
        toast.error(data.error?.message || "Failed to add category");
      }
    } catch (err) {
      toast.error("Error creating category");
    }
  };

  const handleArchiveCategory = async (id: string) => {
    if (!confirm("Are you sure you want to archive this category?")) return;
    try {
      const res = await fetch(`/api/categories?id=${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Category archived");
        fetchCategories();
      } else {
        toast.error(data.error?.message || "Failed to archive");
      }
    } catch (err) {
      toast.error("Error archiving category");
    }
  };

  const handleReorder = async (id: string, direction: "up" | "down", index: number) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const newCategories = [...categories];
    const [moved] = newCategories.splice(index, 1);
    newCategories.splice(targetIndex, 0, moved);
    setCategories(newCategories);

    try {
      // Persist order
      await Promise.all(
        newCategories.map((cat, idx) => 
          fetch("/api/categories", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: cat.id, sort_order: idx })
          })
        )
      );
      toast.success("Categories order updated");
    } catch (err) {
      toast.error("Failed to persist order changes");
    }
  };

  return (
    <FadeIn className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Columns: Categories List Table */}
      <div className="lg:col-span-2 bg-card border border-border-accent/45 p-6 rounded-2xl shadow-xs">
        <div className="flex justify-between items-center mb-5 border-b border-border-accent/20 pb-3">
          <h3 className="font-serif text-lg text-primary-text flex items-center gap-2">
            <FolderHeart className="w-5 h-5 text-muted-gold" />
            Curated Categories
          </h3>
          <button 
            onClick={fetchCategories} 
            disabled={loading}
            className="p-1.5 rounded-full border border-border-accent/30 text-secondary-text hover:text-muted-gold transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {categories.length === 0 ? (
          <div className="py-10 text-center font-serif italic text-xs text-secondary-text">No categories defined yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border-accent/25 text-secondary-text uppercase tracking-wider font-bold">
                  <th className="py-3">Cover</th>
                  <th className="py-3">Name</th>
                  <th className="py-3 text-center">Order</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, idx) => (
                  <tr key={cat.id} className="border-b border-border-accent/15 text-primary-text hover:bg-[#FAF8F3]/50 transition-colors">
                    <td className="py-2">
                      <img src={cat.imageUrl} alt={cat.title} className="w-10 h-10 object-cover rounded-md border border-border-accent/20" />
                    </td>
                    <td className="py-2 font-medium">{cat.title}</td>
                    <td className="py-2 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => handleReorder(cat.id, "up", idx)} disabled={idx === 0} className="p-1 hover:text-muted-gold disabled:opacity-30">
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleReorder(cat.id, "down", idx)} disabled={idx === categories.length - 1} className="p-1 hover:text-muted-gold disabled:opacity-30">
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="py-2 text-right">
                      <button onClick={() => handleArchiveCategory(cat.id)} className="p-1.5 text-red-600 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Right Column: Add Category Form */}
      <div className="bg-card border border-border-accent/45 p-6 rounded-2xl shadow-xs">
        <h3 className="font-serif text-lg text-primary-text mb-4 border-b border-border-accent/20 pb-3">
          Add Curated Category
        </h3>
        <form onSubmit={handleAddCategory} className="flex flex-col gap-4">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-secondary-text font-bold mb-1">Category Title</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Silk Sarees"
              className="w-full p-2.5 text-xs bg-primary-bg border border-border-accent/40 rounded-xl focus:border-muted-gold outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-secondary-text font-bold mb-1">Cover Photo URL</label>
            <input 
              type="text" 
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full p-2.5 text-xs bg-primary-bg border border-border-accent/40 rounded-xl focus:border-muted-gold outline-none"
            />
          </div>
          <button type="submit" className="w-full py-3 bg-forest-green text-primary-bg text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-forest-green/90 transition-colors">
            Create Category
          </button>
        </form>
      </div>
    </FadeIn>
  );
}
