"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getProducts, addProduct, deleteProduct, updateProductPhoto, updateProductStock, updateProductCollectionTag, updateProductSpecs } from "@/utils/db";
import { Product } from "@/types/product";
import { FadeIn } from "@/components/motion/FadeIn";
import { 
  Plus, Trash2, Edit3, Image as ImageIcon, Sparkles, ShoppingBag, FolderHeart, 
  Mail, Phone, RefreshCw, Search, Tag, Sliders, DollarSign, MessageSquare, 
  HelpCircle, Settings, Download, Upload, CheckCircle2, User, Globe, AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/providers/AuthProvider";
import { isAdmin } from "@/utils/auth";
import { useRouter } from "next/navigation";

// Modular subviews
import { DashboardView } from "./dashboard/DashboardView";
import { ProductsView } from "./products/ProductsView";
import { CategoriesView } from "./categories/CategoriesView";
import { CSVImportView } from "./csv-import/CSVImportView";
import { HomepageView } from "./homepage/HomepageView";
import { SettingsView } from "./settings/SettingsView";

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Tab State
  const [activeTab, setActiveTab] = useState<"overview" | "catalog" | "categories" | "csv-import" | "homepage" | "testimonials" | "faqs" | "site_copy" | "orders" | "notifications" | "settings">("overview");

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Sarees");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("/images/cat_sarees.jpg");
  const [sideProfile1, setSideProfile1] = useState("");
  const [sideProfile2, setSideProfile2] = useState("");
  const [activeImageSlot, setActiveImageSlot] = useState<"main" | "side1" | "side2">("main");
  const [isUploading, setIsUploading] = useState(false);
  const [collectionTag, setCollectionTag] = useState("");
  const [stock, setStock] = useState("10");

  // Specifications for new product
  const [fabric, setFabric] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [garmentCut, setGarmentCut] = useState("");
  const [artisanOrigin, setArtisanOrigin] = useState("");
  const [weavingStyle, setWeavingStyle] = useState("");
  const [craftTime, setCraftTime] = useState("");
  const [threadCount, setThreadCount] = useState("");
  const [washingStandard, setWashingStandard] = useState("");
  const [showEditorialSpecs, setShowEditorialSpecs] = useState(false);

  // Specifications Editor Modal State
  const [editingSpecsProduct, setEditingSpecsProduct] = useState<Product | null>(null);
  const [editSpecsData, setEditSpecsData] = useState({
    fabric: "",
    dimensions: "",
    garmentCut: "",
    artisanOrigin: "",
    weavingStyle: "",
    craftTime: "",
    threadCount: "",
    washingStandard: "",
  });

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Communications Logs State
  const [logs, setLogs] = useState<any[]>([]);
  const [totalLogsCount, setTotalLogsCount] = useState(0);
  const [currentLogsPage, setCurrentLogsPage] = useState(1);
  const [filterType, setFilterType] = useState<"all" | "email" | "sms">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "sent" | "failed" | "pending">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [logsSearchInput, setLogsSearchInput] = useState("");
  const [logCounters, setLogCounters] = useState({
    sentEmails: 0,
    failedEmails: 0,
    sentSms: 0,
    failedSms: 0,
  });
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Testimonials/Reviews CMS State
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReviewAuthor, setNewReviewAuthor] = useState("");
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewRating, setNewReviewRating] = useState("5");
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  // FAQs CMS State
  const [faqs, setFaqs] = useState<any[]>([]);
  const [newFaqQuestion, setNewFaqQuestion] = useState("");
  const [newFaqAnswer, setNewFaqAnswer] = useState("");
  const [newFaqCategory, setNewFaqCategory] = useState("Orders");
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);

  // Site Copy States
  const [heroHeading, setHeroHeading] = useState("");
  const [heroSubheading, setHeroSubheading] = useState("");
  const [whatsappLink, setWhatsappLink] = useState("");
  const [boutiqueAddress, setBoutiqueAddress] = useState("");
  const [boutiqueEmail, setBoutiqueEmail] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");

  // Bulk Product Uploader States
  const [bulkPresetFolder, setBulkPresetFolder] = useState("/images");
  const [bulkPrefixCode, setBulkPrefixCode] = useState("RL");
  const [bulkBaseTitle, setBulkBaseTitle] = useState("");
  const [bulkBasePrice, setBulkBasePrice] = useState("");
  const [bulkCategory, setBulkCategory] = useState("Sarees");
  const [bulkFabric, setBulkFabric] = useState("");
  const [bulkDescription, setBulkDescription] = useState("");
  const [bulkCollectionTag, setBulkCollectionTag] = useState("");
  const [bulkStock, setBulkStock] = useState("10");
  const [bulkSelectedPresetImages, setBulkSelectedPresetImages] = useState<string[]>([]);
  const [bulkStartCodeNum, setBulkStartCodeNum] = useState("");
  const [isBulkUploading, setIsBulkUploading] = useState(false);

  // Preloaded boutique stock categories
  const categories = ["Sarees", "Kurtis", "Lehengas", "Gowns", "Western Wear", "Kids Wear"];

  // Preset stock images
  const imagePresets = [
    { label: "Saree Silk", path: "/images/cat_sarees.jpg" },
    { label: "Saree Details", path: "/images/prod_silk_saree.jpg" },
    { label: "Kurti Embroidered", path: "/images/cat_kurtis.jpg" },
    { label: "Kurti Yellow", path: "/images/prod_anarkali_kurti.jpg" },
    { label: "Lehenga Heavy", path: "/images/cat_lehengas.jpg" },
    { label: "Lehenga Velvet Maroon", path: "/images/prod_velvet_lehenga.jpg" },
    { label: "Gown Emerald Organza", path: "/images/prod_party_gown.jpg" },
    { label: "Western Wear Dress", path: "/images/cat_western.jpg" },
    { label: "Kids Wear Traditional", path: "/images/cat_kids.jpg" },
    { label: "Kids Sherwani Gold", path: "/images/prod_kids_sherwani.jpg" }
  ];

  // Auth Guards & Init
  useEffect(() => {
    if (!isLoading) {
      if (!user || !isAdmin(user)) {
        toast.error("Access Denied: You do not have administrator permissions.");
        router.push("/");
      }
    }
  }, [user, isLoading, router]);

  // Load Products & Orders
  useEffect(() => {
    getProducts().then(setProducts);
    fetchOrders();
    fetchLogs();
  }, []);

  // Load CMS data on mount
  useEffect(() => {
    // 1. Testimonials
    const savedReviews = localStorage.getItem("rich-lady-reviews");
    if (savedReviews) {
      setReviews(JSON.parse(savedReviews));
    } else {
      const defaultReviews = [
        { id: "review-1", author: "Rama Krishna", rating: 5, text: "Nice collection, best quality highly recommend." },
        { id: "review-2", author: "Prasad Phani", rating: 5, text: "Wide variety of collections and excellent service. Value for money!" },
        { id: "review-3", author: "Sree Vani", rating: 5, text: "Wow nice collection... reasonable prices." },
        { id: "review-4", author: "Outtule Laxmi", rating: 5, text: "Superb and Excellent collection with reasonable cost..." }
      ];
      setReviews(defaultReviews);
      localStorage.setItem("rich-lady-reviews", JSON.stringify(defaultReviews));
    }

    // 2. FAQs
    const savedFaqs = localStorage.getItem("rich-lady-faqs");
    if (savedFaqs) {
      setFaqs(JSON.parse(savedFaqs));
    } else {
      const defaultFaqs = [
        { id: "faq-1", category: "Shipping", question: "Do you ship worldwide?", answer: "Yes, we ship our luxury designer wear globally. Transit times vary from 5-10 business days." },
        { id: "faq-2", category: "Customization", question: "Can I customize sizes or fabric?", answer: "Absolutely! Since we run a specialized luxury atelier, you can connect with our designers on WhatsApp to specify custom measurements, neck cuts, and sleeve lengths." },
        { id: "faq-3", category: "Orders", question: "How do I track my order?", answer: "Once your design is shipped, you will receive a WhatsApp and email confirmation containing your Shiprocket tracking number." }
      ];
      setFaqs(defaultFaqs);
      localStorage.setItem("rich-lady-faqs", JSON.stringify(defaultFaqs));
    }

    // 3. Site Copy Customization
    const savedCopy = localStorage.getItem("rich-lady-site-copy");
    if (savedCopy) {
      const copy = JSON.parse(savedCopy);
      setHeroHeading(copy.heroHeading || "Timeless Indian Craftsmanship, Modern Grace");
      setHeroSubheading(copy.heroSubheading || "Curated collections of premium sarees, bespoke kurtis, and wedding lehengas handcrafted by master artisans.");
      setWhatsappLink(copy.whatsappLink || "https://wa.me/919030443306");
      setBoutiqueAddress(copy.boutiqueAddress || "Godavari District, Andhra Pradesh, India");
      setBoutiqueEmail(copy.boutiqueEmail || "admin@richladyboutique.com");
      setInstagramHandle(copy.instagramHandle || "@RichLadyBoutique");
    } else {
      setHeroHeading("Timeless Indian Craftsmanship, Modern Grace");
      setHeroSubheading("Curated collections of premium sarees, bespoke kurtis, and wedding lehengas handcrafted by master artisans.");
      setWhatsappLink("https://wa.me/919030443306");
      setBoutiqueAddress("Godavari District, Andhra Pradesh, India");
      setBoutiqueEmail("admin@richladyboutique.com");
      setInstagramHandle("@RichLadyBoutique");
    }
  }, []);

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const query = new URLSearchParams({
        page: String(currentLogsPage),
        limit: "10",
        type: filterType,
        status: filterStatus,
        search: searchTerm,
      });
      const res = await fetch(`/api/admin/notifications?${query}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
        setTotalLogsCount(data.totalCount);
        setLogCounters(data.counters);
      }
    } catch (err) {
      console.error("Error loading notification logs:", err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const handleRetryNotification = async (logId: string, type: "email" | "sms") => {
    const toastId = toast.loading(`Retrying notification dispatch...`);
    try {
      const res = await fetch("/api/admin/notifications/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logId, type }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Notification resent successfully!", { id: toastId });
        await fetchLogs();
      } else {
        throw new Error(data.error || "Retry failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Resend failed", { id: toastId });
    }
  };

  const handleShipOrder = async (orderId: string) => {
    const toastId = toast.loading("Connecting to Shiprocket logistics...");
    try {
      const res = await fetch("/api/admin/ship-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Shipment created successfully!", { id: toastId });
        await fetchOrders();
      } else {
        throw new Error(data.error || "Failed to create shipment");
      }
    } catch (err: any) {
      toast.error(err.message || "Logistics booking failed", { id: toastId });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPEG, PNG, WEBP, etc.)");
      return;
    }

    const toastId = toast.loading("Uploading photo to storage...");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Upload failed");
      }

      if (activeImageSlot === "main") {
        setImageUrl(result.url);
      } else if (activeImageSlot === "side1") {
        setSideProfile1(result.url);
      } else if (activeImageSlot === "side2") {
        setSideProfile2(result.url);
      }

      toast.success("Image uploaded successfully!", { id: toastId });
    } catch (err: any) {
      toast.error(`Upload error: ${err.message}`, { id: toastId });
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  // Add Product Submit
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a product name");
      return;
    }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    const newProduct: Product = {
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name,
      price: Number(price),
      imageUrl: imageUrl.trim(),
      sideProfile1Url: sideProfile1.trim() !== "" ? sideProfile1.trim() : undefined,
      sideProfile2Url: sideProfile2.trim() !== "" ? sideProfile2.trim() : undefined,
      category,
      collectionTag: collectionTag.trim() !== "" ? collectionTag.trim() : undefined,
      rating: 5.0,
      reviewsCount: 1,
      isNewArrival: true,
      description: description.trim() !== "" ? description.trim() : `Premium quality boutique design. Woven using traditional handloom methods, offering total style and comfort.`,
      stock: Number(stock) || 0,
      fabric: fabric.trim() !== "" ? fabric.trim() : undefined,
      dimensions: dimensions.trim() !== "" ? dimensions.trim() : undefined,
      garmentCut: garmentCut.trim() !== "" ? garmentCut.trim() : undefined,
      artisanOrigin: artisanOrigin.trim() !== "" ? artisanOrigin.trim() : undefined,
      weavingStyle: weavingStyle.trim() !== "" ? weavingStyle.trim() : undefined,
      craftTime: craftTime.trim() !== "" ? craftTime.trim() : undefined,
      threadCount: threadCount.trim() !== "" ? threadCount.trim() : undefined,
      washingStandard: washingStandard.trim() !== "" ? washingStandard.trim() : undefined,
    };

    const toastId = toast.loading("Adding product to store...");
    try {
      await addProduct(newProduct);
      const updated = await getProducts();
      setProducts(updated);
      
      // Reset Form
      setName("");
      setPrice("");
      setDescription("");
      setImageUrl("/images/cat_sarees.jpg");
      setSideProfile1("");
      setSideProfile2("");
      setStock("10");
      setActiveImageSlot("main");
      setCollectionTag("");
      setFabric("");
      setDimensions("");
      setGarmentCut("");
      setArtisanOrigin("");
      setWeavingStyle("");
      setCraftTime("");
      setThreadCount("");
      setWashingStandard("");
      toast.success(`"${name}" successfully added to the catalog!`, { id: toastId });
    } catch (err: any) {
      toast.error(`Failed to add: ${err.message}`, { id: toastId });
    }
  };

  // Bulk Product Uploader Submit
  const handleBulkUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (bulkSelectedPresetImages.length === 0) {
      toast.error("Please select at least one preset image for bulk creation");
      return;
    }
    if (!bulkBaseTitle.trim()) {
      toast.error("Please enter a base title");
      return;
    }
    if (!bulkBasePrice || isNaN(Number(bulkBasePrice))) {
      toast.error("Please enter a valid price");
      return;
    }

    // Determine starting code suffix
    let currentStartCode = Number(bulkStartCodeNum);
    if (isNaN(currentStartCode) || currentStartCode <= 0) {
      // Auto-Increment calculation: Scan current products for code numbers
      let maxNum = 1000;
      products.forEach((p) => {
        if (p.collectionTag) {
          const match = p.collectionTag.match(/\d+/);
          if (match) {
            const num = Number(match[0]);
            if (num > maxNum) maxNum = num;
          }
        }
      });
      currentStartCode = maxNum + 1;
    }

    const toastId = toast.loading(`Sequential uploading of ${bulkSelectedPresetImages.length} products in progress...`);
    setIsBulkUploading(true);

    try {
      for (let i = 0; i < bulkSelectedPresetImages.length; i++) {
        const imagePath = bulkSelectedPresetImages[i];
        const codeNum = currentStartCode + i;
        const codeString = `${bulkPrefixCode}-${codeNum}`;
        const newTitle = `${bulkBaseTitle} - Code ${codeString}`;
        const newId = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-");

        const newProd: Product = {
          id: newId,
          name: newTitle,
          price: Number(bulkBasePrice),
          imageUrl: imagePath,
          category: bulkCategory,
          collectionTag: codeString,
          rating: 4.8,
          reviewsCount: 3,
          isNewArrival: true,
          description: bulkDescription.trim() !== "" ? bulkDescription.trim() : `Exquisite ${bulkCategory} design, catalog code ${codeString}. Features premium artisanal details.`,
          stock: Number(bulkStock) || 10,
          fabric: bulkFabric.trim() !== "" ? bulkFabric.trim() : undefined,
        };

        await addProduct(newProd);
      }

      toast.success(`Successfully uploaded ${bulkSelectedPresetImages.length} products sequentially!`, { id: toastId });
      setBulkSelectedPresetImages([]);
      setBulkBaseTitle("");
      setBulkBasePrice("");
      setBulkFabric("");
      setBulkDescription("");
      const updated = await getProducts();
      setProducts(updated);
    } catch (err: any) {
      toast.error(`Bulk upload failed: ${err.message}`, { id: toastId });
    } finally {
      setIsBulkUploading(false);
    }
  };

  // Specs Editor Form Submission
  const handleUpdateSpecs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSpecsProduct) return;

    const toastId = toast.loading("Updating specifications...");
    try {
      await updateProductSpecs(editingSpecsProduct.id, editSpecsData);
      const updated = await getProducts();
      setProducts(updated);
      setEditingSpecsProduct(null);
      toast.success("Specifications updated successfully!", { id: toastId });
    } catch (err: any) {
      toast.error(`Update failed: ${err.message}`, { id: toastId });
    }
  };

  // Stock update
  const handleStockChange = async (id: string, newStock: number) => {
    try {
      await updateProductStock(id, newStock);
      setProducts(current => current.map(p => p.id === id ? { ...p, stock: newStock } : p));
      toast.success("Stock level updated");
    } catch (err) {
      toast.error("Failed to update stock");
    }
  };

  // Product Delete
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    const toastId = toast.loading("Removing product from catalog...");
    try {
      await deleteProduct(id);
      setProducts(current => current.filter(p => p.id !== id));
      toast.success("Product removed successfully!", { id: toastId });
    } catch (err) {
      toast.error("Failed to delete product", { id: toastId });
    }
  };

  // Testimonials CMS submit
  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewText.trim()) {
      toast.error("Please fill in reviewer name and quote text");
      return;
    }

    let updatedReviews = [...reviews];
    if (editingReviewId) {
      updatedReviews = updatedReviews.map((rev) =>
        rev.id === editingReviewId
          ? { ...rev, author: newReviewAuthor, text: newReviewText, rating: Number(newReviewRating) }
          : rev
      );
      toast.success("Testimonial updated successfully!");
    } else {
      const newRev = {
        id: `review-${Date.now()}`,
        author: newReviewAuthor,
        text: newReviewText,
        rating: Number(newReviewRating),
      };
      updatedReviews.unshift(newRev);
      toast.success("New testimonial added!");
    }

    setReviews(updatedReviews);
    localStorage.setItem("rich-lady-reviews", JSON.stringify(updatedReviews));
    setNewReviewAuthor("");
    setNewReviewText("");
    setNewReviewRating("5");
    setEditingReviewId(null);
  };

  const handleDeleteReview = (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    const filtered = reviews.filter((rev) => rev.id !== id);
    setReviews(filtered);
    localStorage.setItem("rich-lady-reviews", JSON.stringify(filtered));
    toast.success("Review deleted successfully");
  };

  // FAQs CMS submit
  const handleSaveFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaqQuestion.trim() || !newFaqAnswer.trim()) {
      toast.error("Please enter a question and an answer");
      return;
    }

    let updatedFaqs = [...faqs];
    if (editingFaqId) {
      updatedFaqs = updatedFaqs.map((faq) =>
        faq.id === editingFaqId
          ? { ...faq, category: newFaqCategory, question: newFaqQuestion, answer: newFaqAnswer }
          : faq
      );
      toast.success("FAQ updated successfully!");
    } else {
      const newFaq = {
        id: `faq-${Date.now()}`,
        category: newFaqCategory,
        question: newFaqQuestion,
        answer: newFaqAnswer,
      };
      updatedFaqs.push(newFaq);
      toast.success("New FAQ added!");
    }

    setFaqs(updatedFaqs);
    localStorage.setItem("rich-lady-faqs", JSON.stringify(updatedFaqs));
    setNewFaqQuestion("");
    setNewFaqAnswer("");
    setNewFaqCategory("Orders");
    setEditingFaqId(null);
  };

  const handleDeleteFaq = (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;
    const filtered = faqs.filter((faq) => faq.id !== id);
    setFaqs(filtered);
    localStorage.setItem("rich-lady-faqs", JSON.stringify(filtered));
    toast.success("FAQ deleted successfully");
  };

  // Site Copy Save
  const handleSaveSiteCopy = (e: React.FormEvent) => {
    e.preventDefault();
    const copyData = {
      heroHeading,
      heroSubheading,
      whatsappLink,
      boutiqueAddress,
      boutiqueEmail,
      instagramHandle,
    };
    localStorage.setItem("rich-lady-site-copy", JSON.stringify(copyData));
    toast.success("Boutique copy and metadata saved successfully!");
  };

  // Backups CMS Operations
  const handleExportBackup = () => {
    const backupData = {
      products,
      reviews,
      faqs,
      siteCopy: {
        heroHeading,
        heroSubheading,
        whatsappLink,
        boutiqueAddress,
        boutiqueEmail,
        instagramHandle,
      },
      exportedAt: new Date().toISOString(),
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `rich-lady-boutique-backup-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("Boutique library backup exported!");
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.products && Array.isArray(parsed.products)) {
          // Restore Products
          localStorage.setItem("rich-lady-products", JSON.stringify(parsed.products));
          setProducts(parsed.products);
        }
        if (parsed.reviews && Array.isArray(parsed.reviews)) {
          localStorage.setItem("rich-lady-reviews", JSON.stringify(parsed.reviews));
          setReviews(parsed.reviews);
        }
        if (parsed.faqs && Array.isArray(parsed.faqs)) {
          localStorage.setItem("rich-lady-faqs", JSON.stringify(parsed.faqs));
          setFaqs(parsed.faqs);
        }
        if (parsed.siteCopy) {
          localStorage.setItem("rich-lady-site-copy", JSON.stringify(parsed.siteCopy));
          setHeroHeading(parsed.siteCopy.heroHeading || "");
          setHeroSubheading(parsed.siteCopy.heroSubheading || "");
          setWhatsappLink(parsed.siteCopy.whatsappLink || "");
          setBoutiqueAddress(parsed.siteCopy.boutiqueAddress || "");
          setBoutiqueEmail(parsed.siteCopy.boutiqueEmail || "");
          setInstagramHandle(parsed.siteCopy.instagramHandle || "");
        }
        toast.success("Boutique library restored successfully!");
      } catch (err) {
        toast.error("Invalid backup file format");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleResetToDefaults = () => {
    if (!confirm("Are you sure you want to reset everything back to seed defaults? This will erase custom products, reviews, and edits.")) return;
    localStorage.removeItem("rich-lady-products");
    localStorage.removeItem("rich-lady-reviews");
    localStorage.removeItem("rich-lady-faqs");
    localStorage.removeItem("rich-lady-site-copy");
    window.location.reload();
  };

  if (isLoading || !user || !isAdmin(user)) {
    return (
      <div className="w-full min-h-screen bg-primary-bg py-32 flex flex-col items-center justify-center text-center select-none font-sans">
        <div className="w-12 h-12 rounded-full border-4 border-muted-gold border-t-transparent animate-spin mb-4" />
        <p className="text-sm text-secondary-text font-light animate-pulse">Verifying security credentials...</p>
      </div>
    );
  }

  // Calculate overview metrics
  const totalProductsCount = products.length;
  const totalOrdersCount = orders.length;
  const totalRevenue = orders.reduce((sum, ord) => sum + Number(ord.total || 0), 0);
  const totalCommunicationsCount = logs.length;

  return (
    <div className="w-full min-h-screen bg-primary-bg py-32 font-sans select-none">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Page Header */}
        <FadeIn className="flex flex-col items-center text-center mb-12">
          <span className="font-serif text-[10px] md:text-xs tracking-[0.25em] text-muted-gold font-medium uppercase mb-2">
            Control Center
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-primary-text font-normal mb-4">
            Boutique Admin Panel
          </h1>
          <p className="text-xs text-secondary-text max-w-md font-light leading-relaxed">
            Manage your boutique catalog, orders, testimonials, FAQs, and site contents. Authenticated as: <span className="font-semibold text-primary-text">{user.email}</span>
          </p>
          <div className="ornament-line mt-6">
            <span className="ornament-diamond" />
          </div>
        </FadeIn>

        {/* Dynamic Navigation Tabs Strip */}
        <FadeIn className="flex flex-wrap justify-center gap-3 mb-10">
          {[
            { id: "overview", label: "Overview", icon: Sliders },
            { id: "catalog", label: "Products", icon: ShoppingBag },
            { id: "categories", label: "Categories", icon: FolderHeart },
            { id: "csv-import", label: "CSV Import", icon: Upload },
            { id: "homepage", label: "Homepage Copy", icon: Globe },
            { id: "testimonials", label: "Testimonials", icon: MessageSquare },
            { id: "faqs", label: "FAQs CMS", icon: HelpCircle },
            { id: "orders", label: "Orders Log", icon: FolderHeart },
            { id: "notifications", label: "Communications", icon: Mail },
            { id: "settings", label: "Settings", icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-2.5 text-[10px] font-sans font-bold uppercase tracking-wider rounded-full border transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? "bg-forest-green text-primary-bg border-forest-green"
                    : "border-border-accent/40 text-secondary-text hover:border-muted-gold"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </FadeIn>

        {/* 1. OVERVIEW DASHBOARD */}
        {activeTab === "overview" && (
          <DashboardView
            totalRevenue={totalRevenue}
            totalOrdersCount={totalOrdersCount}
            totalProductsCount={totalProductsCount}
            totalCommunicationsCount={totalCommunicationsCount}
            orders={orders}
            setActiveTab={setActiveTab}
          />
        )}

        {/* 2. MANAGE CATALOG (PRODUCTS CMS) */}
        {activeTab === "catalog" && <ProductsView />}

        {/* 2B. CURATED CATEGORIES */}
        {activeTab === "categories" && <CategoriesView />}

        {/* 2C. CSV BATCH IMPORT */}
        {activeTab === "csv-import" && <CSVImportView />}

        {/* 2D. HOMEPAGE MANAGER */}
        {activeTab === "homepage" && <HomepageView />}

        {/* 3. TESTIMONIALS CMS */}
        {activeTab === "testimonials" && (
          <FadeIn className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Form */}
            <div className="lg:col-span-1 bg-card border border-border-accent/40 p-6 rounded-2xl shadow-xs">
              <h3 className="font-serif text-lg text-primary-text mb-5 flex items-center gap-2 border-b border-border-accent/20 pb-3">
                <MessageSquare className="w-5 h-5 text-muted-gold" />
                {editingReviewId ? "Edit Testimonial" : "Create Testimonial"}
              </h3>
              <form onSubmit={handleSaveReview} className="flex flex-col gap-4 text-xs text-secondary-text">
                <div className="flex flex-col gap-1.5">
                  <label className="uppercase tracking-wider font-semibold">Author Name</label>
                  <input
                    type="text"
                    required
                    value={newReviewAuthor}
                    onChange={(e) => setNewReviewAuthor(e.target.value)}
                    placeholder="e.g. Sita Lakshmi"
                    className="bg-primary-bg border border-border-accent p-2.5 rounded-lg text-primary-text"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="uppercase tracking-wider font-semibold">Review Quote</label>
                  <textarea
                    required
                    rows={4}
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    placeholder="Nice boutique, highly satisfied..."
                    className="bg-primary-bg border border-border-accent p-2.5 rounded-lg text-primary-text outline-none focus:border-muted-gold resize-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="uppercase tracking-wider font-semibold">Rating (1-5 stars)</label>
                  <select
                    value={newReviewRating}
                    onChange={(e) => setNewReviewRating(e.target.value)}
                    className="bg-primary-bg border border-border-accent p-2.5 rounded-lg text-primary-text"
                  >
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="flex-1 bg-forest-green text-primary-bg py-3 text-[10px] uppercase font-bold tracking-widest rounded-lg cursor-pointer">
                    Save Testimonial
                  </button>
                  {editingReviewId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingReviewId(null);
                        setNewReviewAuthor("");
                        setNewReviewText("");
                        setNewReviewRating("5");
                      }}
                      className="bg-card text-secondary-text border border-border-accent/40 py-3 text-[10px] uppercase font-bold tracking-widest px-4 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* List */}
            <div className="lg:col-span-2 bg-card border border-border-accent/40 p-6 rounded-2xl shadow-xs">
              <h3 className="font-serif text-lg text-primary-text mb-5 flex items-center gap-2 border-b border-border-accent/20 pb-3">
                <Sliders className="w-5 h-5 text-muted-gold" />
                Active Testimonials Registry
              </h3>
              <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto no-scrollbar">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-4 border border-border-accent/30 rounded-xl bg-primary-bg flex justify-between items-start gap-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-sans font-bold text-xs text-primary-text">{rev.author}</span>
                        <span className="text-[8px] bg-muted-gold/15 text-muted-gold px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-bold">★ {rev.rating}</span>
                      </div>
                      <p className="font-serif italic text-xs text-secondary-text">"{rev.text}"</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingReviewId(rev.id);
                          setNewReviewAuthor(rev.author);
                          setNewReviewText(rev.text);
                          setNewReviewRating(String(rev.rating));
                        }}
                        className="text-muted-gold hover:text-forest-green p-1.5 hover:bg-card border border-transparent hover:border-border-accent/45 rounded-md transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteReview(rev.id)}
                        className="text-red-700 hover:text-red-900 p-1.5 hover:bg-card border border-transparent hover:border-border-accent/45 rounded-md transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        )}

        {/* 4. FAQs CMS */}
        {activeTab === "faqs" && (
          <FadeIn className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Form */}
            <div className="lg:col-span-1 bg-card border border-border-accent/40 p-6 rounded-2xl shadow-xs">
              <h3 className="font-serif text-lg text-primary-text mb-5 flex items-center gap-2 border-b border-border-accent/20 pb-3">
                <HelpCircle className="w-5 h-5 text-muted-gold" />
                {editingFaqId ? "Edit FAQ" : "Create FAQ"}
              </h3>
              <form onSubmit={handleSaveFaq} className="flex flex-col gap-4 text-xs text-secondary-text">
                <div className="flex flex-col gap-1.5">
                  <label className="uppercase tracking-wider font-semibold">Category</label>
                  <select
                    value={newFaqCategory}
                    onChange={(e) => setNewFaqCategory(e.target.value)}
                    className="bg-primary-bg border border-border-accent p-2.5 rounded-lg text-primary-text"
                  >
                    <option value="Orders">Orders</option>
                    <option value="Shipping">Shipping</option>
                    <option value="Customization">Customization</option>
                    <option value="Returns">Returns</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="uppercase tracking-wider font-semibold">FAQ Question</label>
                  <input
                    type="text"
                    required
                    value={newFaqQuestion}
                    onChange={(e) => setNewFaqQuestion(e.target.value)}
                    placeholder="e.g. Do you customize sizing?"
                    className="bg-primary-bg border border-border-accent p-2.5 rounded-lg text-primary-text"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="uppercase tracking-wider font-semibold">FAQ Answer</label>
                  <textarea
                    required
                    rows={4}
                    value={newFaqAnswer}
                    onChange={(e) => setNewFaqAnswer(e.target.value)}
                    placeholder="Yes, all designs can be customized..."
                    className="bg-primary-bg border border-border-accent p-2.5 rounded-lg text-primary-text outline-none resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="flex-1 bg-forest-green text-primary-bg py-3 text-[10px] uppercase font-bold tracking-widest rounded-lg cursor-pointer">
                    Save FAQ
                  </button>
                  {editingFaqId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingFaqId(null);
                        setNewFaqQuestion("");
                        setNewFaqAnswer("");
                        setNewFaqCategory("Orders");
                      }}
                      className="bg-card text-secondary-text border border-border-accent/40 py-3 text-[10px] uppercase font-bold tracking-widest px-4 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* List */}
            <div className="lg:col-span-2 bg-card border border-border-accent/40 p-6 rounded-2xl shadow-xs">
              <h3 className="font-serif text-lg text-primary-text mb-5 flex items-center gap-2 border-b border-border-accent/20 pb-3">
                <Sliders className="w-5 h-5 text-muted-gold" />
                Frequently Asked Questions Registry
              </h3>
              <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto no-scrollbar">
                {faqs.map((faq) => (
                  <div key={faq.id} className="p-4 border border-border-accent/30 rounded-xl bg-primary-bg flex justify-between items-start gap-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] bg-chocolate/15 text-chocolate px-2 py-0.5 rounded-sm uppercase tracking-wider font-bold">{faq.category}</span>
                        <h4 className="font-sans font-bold text-xs text-primary-text">{faq.question}</h4>
                      </div>
                      <p className="font-sans text-[11px] text-secondary-text font-light leading-relaxed">{faq.answer}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingFaqId(faq.id);
                          setNewFaqCategory(faq.category);
                          setNewFaqQuestion(faq.question);
                          setNewFaqAnswer(faq.answer);
                        }}
                        className="text-muted-gold hover:text-forest-green p-1.5 hover:bg-card border border-transparent hover:border-border-accent/45 rounded-md transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteFaq(faq.id)}
                        className="text-red-700 hover:text-red-900 p-1.5 hover:bg-card border border-transparent hover:border-border-accent/45 rounded-md transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        )}

        {/* 5. SITE CONTENT SETTINGS (SITE COPY) */}
        {activeTab === "site_copy" && <HomepageView />}

        {/* 6. ORDERS LOG TAB */}
        {activeTab === "orders" && (
          <FadeIn className="bg-card border border-border-accent/40 p-8 rounded-2xl shadow-xs">
            <h2 className="font-serif text-xl text-primary-text mb-6 flex items-center gap-2 border-b border-border-accent/20 pb-3">
              <FolderHeart className="w-5 h-5 text-muted-gold" />
              Incoming Boutique Orders Log
            </h2>

            {isLoadingOrders ? (
              <div className="py-20 text-center select-none font-serif italic text-secondary-text animate-pulse">Querying database transaction logs...</div>
            ) : orders.length === 0 ? (
              <div className="py-20 text-center font-serif italic text-secondary-text select-none">No client orders placed yet. Seed database using /api/seed first.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border-accent/25 text-secondary-text uppercase tracking-wider font-bold">
                      <th className="py-3">Order ID</th>
                      <th className="py-3">Customer Name</th>
                      <th className="py-3">Contact details</th>
                      <th className="py-3 text-center">Date</th>
                      <th className="py-3">Total Cost</th>
                      <th className="py-3">Payment</th>
                      <th className="py-3">Logistics</th>
                      <th className="py-3 text-right">Delivery Fulfillment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((ord) => (
                      <tr key={ord.id} className="border-b border-border-accent/15 text-primary-text hover:bg-[#FAF8F3]/50 transition-colors">
                        <td className="py-4 font-mono font-bold text-muted-gold">{ord.id.slice(0, 8)}...</td>
                        <td className="py-4 font-serif font-medium">{ord.customer_name}</td>
                        <td className="py-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-sans font-bold text-[10px]">{ord.customer_phone}</span>
                            <span className="text-[9px] text-secondary-text/80">{ord.customer_email || "N/A"}</span>
                          </div>
                        </td>
                        <td className="py-4 text-center text-secondary-text">{new Date(ord.created_at).toLocaleDateString()}</td>
                        <td className="py-4 font-sans font-bold">₹{Number(ord.total).toLocaleString("en-IN")}</td>
                        <td className="py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-sans font-bold uppercase tracking-wider border ${
                            ord.payment_status === "paid" ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" : "bg-red-500/10 text-red-700 border-red-500/20"
                          }`}>
                            {ord.payment_status}
                          </span>
                        </td>
                        <td className="py-4">
                          {ord.shiprocket_shipment_id ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[9px] bg-forest-green/15 text-forest-green px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-bold w-fit">Shiprocket Active</span>
                              <span className="text-[8px] text-secondary-text font-mono">ID: {ord.shiprocket_shipment_id}</span>
                            </div>
                          ) : (
                            <span className="text-[8px] bg-secondary-bg text-secondary-text/80 px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-bold">Offline Dispatch</span>
                          )}
                        </td>
                        <td className="py-4 text-right flex justify-end gap-2.5">
                          {ord.status !== "shipped" && ord.status !== "completed" && !ord.shiprocket_shipment_id && (
                            <button
                              onClick={() => handleShipOrder(ord.id)}
                              className="bg-forest-green hover:bg-[#1a2b24] text-primary-bg px-3.5 py-1.5 text-[8px] font-sans font-bold tracking-wider uppercase rounded-md cursor-pointer border border-muted-gold/25"
                            >
                              Dispatch Logistics
                            </button>
                          )}
                          <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-sans font-bold uppercase tracking-wider border ${
                            ord.status === "completed" || ord.status === "shipped" ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" : "bg-amber-500/10 text-amber-700 border-amber-500/20"
                          }`}>
                            {ord.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </FadeIn>
        )}

        {/* 7. COMMUNICATIONS TAB */}
        {activeTab === "notifications" && (
          <FadeIn className="bg-card border border-border-accent/45 p-8 rounded-2xl shadow-xs">
            <h2 className="font-serif text-xl text-primary-text mb-4 flex items-center gap-2 border-b border-border-accent/20 pb-3">
              <Mail className="w-5 h-5 text-muted-gold" />
              Notifications Log center (Email & SMS dispatches)
            </h2>

            {/* Counters grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Emails Sent", val: logCounters.sentEmails, color: "text-emerald-700 border-emerald-500/20 bg-emerald-500/5" },
                { label: "Emails Failed", val: logCounters.failedEmails, color: "text-red-700 border-red-500/20 bg-red-500/5" },
                { label: "SMS Sent", val: logCounters.sentSms, color: "text-emerald-700 border-emerald-500/20 bg-emerald-500/5" },
                { label: "SMS Failed", val: logCounters.failedSms, color: "text-red-700 border-red-500/20 bg-red-500/5" }
              ].map((cnt, idx) => (
                <div key={idx} className={`p-4 border rounded-xl flex flex-col items-center text-center ${cnt.color}`}>
                  <span className="text-[8px] uppercase tracking-wider text-secondary-text/80 font-bold mb-1">{cnt.label}</span>
                  <span className="text-lg font-bold">{cnt.val}</span>
                </div>
              ))}
            </div>

            {/* Search filter panel */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6 text-xs text-secondary-text">
              <div className="flex gap-2">
                <select value={filterType} onChange={(e) => setFilterType(e.target.value as any)} className="bg-primary-bg border border-border-accent/40 p-2 rounded-lg">
                  <option value="all">All Channels</option>
                  <option value="email">Emails Only</option>
                  <option value="sms">SMS Only</option>
                </select>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="bg-primary-bg border border-border-accent/40 p-2 rounded-lg">
                  <option value="all">All Statuses</option>
                  <option value="sent">Sent Successfully</option>
                  <option value="failed">Failed Delivery</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-text/60" />
                <input
                  type="text"
                  value={logsSearchInput}
                  onChange={(e) => setLogsSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && setSearchTerm(logsSearchInput)}
                  placeholder="Recipient search (Press Enter)..."
                  className="w-full pl-9 pr-4 py-2 bg-primary-bg border border-border-accent/40 rounded-lg outline-none focus:border-muted-gold"
                />
              </div>
            </div>

            {/* Logs Table */}
            {isLoadingLogs ? (
              <div className="py-20 text-center select-none font-serif italic text-secondary-text animate-pulse">Running diagnostics logs query...</div>
            ) : logs.length === 0 ? (
              <div className="py-20 text-center font-serif italic text-secondary-text select-none">No notifications dispatched. Test checkout to trigger logs.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border-accent/25 text-secondary-text uppercase tracking-wider font-bold">
                      <th className="py-3">Channel</th>
                      <th className="py-3">Recipient</th>
                      <th className="py-3">Notification Type</th>
                      <th className="py-3">Message Snippet</th>
                      <th className="py-3">Date</th>
                      <th className="py-3">Status</th>
                      <th className="py-3 text-right">Logistics Retry</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b border-border-accent/15 text-primary-text hover:bg-[#FAF8F3]/50 transition-colors">
                        <td className="py-4 uppercase tracking-widest font-bold text-[8px] text-muted-gold">{log.channel_type}</td>
                        <td className="py-4 font-sans font-bold">{log.recipient}</td>
                        <td className="py-4 uppercase tracking-wider text-[8px] text-secondary-text">{log.type}</td>
                        <td className="py-4 text-secondary-text font-light max-w-[200px] truncate" title={log.subject || log.body}>{log.subject || log.body}</td>
                        <td className="py-4 text-secondary-text font-light">{new Date(log.created_at).toLocaleString()}</td>
                        <td className="py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${
                            log.status === "sent" ? "bg-emerald-500/10 text-emerald-700" : "bg-red-500/10 text-red-700"
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="py-4 text-right flex justify-end gap-2">
                          {log.status === "failed" && (
                            <button
                              onClick={() => handleRetryNotification(log.id, log.channel_type)}
                              className="text-forest-green hover:text-primary-bg hover:bg-forest-green p-1.5 border border-border-accent/40 rounded-md transition-colors cursor-pointer"
                              title="Resend Dispatch"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </FadeIn>
        )}

        {/* 8. SYSTEM SETTINGS TAB */}
        {activeTab === "settings" && <SettingsView />}

      </div>

      {/* Specifications Editor Modal */}
      {editingSpecsProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-6">
          <FadeIn className="bg-card border border-border-accent/40 p-8 rounded-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto no-scrollbar shadow-luxury">
            <h3 className="font-serif text-xl text-primary-text mb-2">Edit Specifications</h3>
            <p className="text-[10px] text-muted-gold font-bold uppercase tracking-wider font-sans mb-6">Product: {editingSpecsProduct.name}</p>
            
            <form onSubmit={handleUpdateSpecs} className="flex flex-col gap-4 text-xs text-secondary-text">
              {[
                { label: "Fabric details", val: editSpecsData.fabric, key: "fabric", placeholder: "e.g. Handloom Silk" },
                { label: "Product Dimensions", val: editSpecsData.dimensions, key: "dimensions", placeholder: "e.g. length: 5.5m" },
                { label: "Garment Silhouette Cut", val: editSpecsData.garmentCut, key: "garmentCut", placeholder: "e.g. straight cut" },
                { label: "Artisan Loom Origin", val: editSpecsData.artisanOrigin, key: "artisanOrigin", placeholder: "e.g. Jaipur, Rajasthan" },
                { label: "Weaving Craft Style", val: editSpecsData.weavingStyle, key: "weavingStyle", placeholder: "e.g. block printed" },
                { label: "Handcraft Time Spent", val: editSpecsData.craftTime, key: "craftTime", placeholder: "e.g. 10 hours" },
                { label: "Loom Thread Count", val: editSpecsData.threadCount, key: "threadCount", placeholder: "e.g. 80s count" },
                { label: "Washing & Care Guideline", val: editSpecsData.washingStandard, key: "washingStandard", placeholder: "e.g. Dry Clean Only" }
              ].map((f) => (
                <div key={f.key} className="flex flex-col gap-1.5">
                  <label className="uppercase tracking-wider font-semibold text-secondary-text">{f.label}</label>
                  <input
                    type="text"
                    value={f.val}
                    onChange={(e) => setEditSpecsData(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="bg-primary-bg border border-border-accent p-2.5 rounded-lg text-primary-text outline-none"
                  />
                </div>
              ))}

              <div className="flex gap-4 mt-4">
                <button type="submit" className="flex-1 bg-forest-green text-primary-bg py-3 text-[10px] uppercase font-bold tracking-widest rounded-lg cursor-pointer">
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingSpecsProduct(null)}
                  className="bg-card text-secondary-text border border-border-accent/40 py-3 text-[10px] uppercase font-bold tracking-widest px-6 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </FadeIn>
        </div>
      )}
    </div>
  );
}
