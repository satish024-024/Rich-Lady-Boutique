import { z } from "zod";

// 1. Category Schema
export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(50, "Category name cannot exceed 50 characters"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  imageUrl: z.string().url("Cover image must be a valid URL").optional().or(z.literal("")),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  version: z.number().int().default(1)
});

// 2. Specifications Nested Schema
export const productSpecificationsSchema = z.object({
  fabric: z.string().max(100).optional().or(z.literal("")),
  dimensions: z.string().max(100).optional().or(z.literal("")),
  garmentCut: z.string().max(100).optional().or(z.literal("")),
  artisanOrigin: z.string().max(100).optional().or(z.literal("")),
  weavingStyle: z.string().max(100).optional().or(z.literal("")),
  craftTime: z.string().max(100).optional().or(z.literal("")),
  threadCount: z.string().max(50).optional().or(z.literal("")),
  washingStandard: z.string().max(100).optional().or(z.literal(""))
});

// 3. Product Schema
export const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(100, "Product name cannot exceed 100 characters"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  price: z.number().positive("Price must be a positive number"),
  description: z.string().max(1000).optional().or(z.literal("")),
  categoryId: z.string().uuid("Category ID must be a valid UUID").optional().or(z.literal("")),
  collectionId: z.string().uuid("Collection ID must be a valid UUID").optional().or(z.literal("")),
  quantityAvailable: z.number().int().nonnegative("Quantity must be a non-negative integer").default(10),
  trackInventory: z.boolean().default(true),
  allowBackorder: z.boolean().default(false),
  imageUrl: z.string().url("Image URL must be a valid URL").optional().or(z.literal("")),
  sideProfile1Url: z.string().url("Side Profile 1 image must be a valid URL").optional().or(z.literal("")),
  sideProfile2Url: z.string().url("Side Profile 2 image must be a valid URL").optional().or(z.literal("")),
  collectionTag: z.string().max(50).optional().or(z.literal("")),
  rating: z.number().min(1).max(5).default(5.0),
  reviewsCount: z.number().int().nonnegative().default(0),
  isNewArrival: z.boolean().default(true),
  isActive: z.boolean().default(true),
  specifications: productSpecificationsSchema.default({}),
  version: z.number().int().default(1)
});

// 4. Testimonial Schema
export const testimonialSchema = z.object({
  author: z.string().min(1, "Author name is required").max(50, "Author name cannot exceed 50 characters"),
  text: z.string().min(1, "Testimonial text is required").max(500, "Testimonial cannot exceed 500 characters"),
  rating: z.number().int().min(1).max(5).default(5),
  sortOrder: z.number().int().default(0),
  isEnabled: z.boolean().default(true)
});

// 5. FAQ Schema
export const faqSchema = z.object({
  category: z.string().min(1, "Category is required").max(50),
  question: z.string().min(1, "Question is required").max(200),
  answer: z.string().min(1, "Answer is required").max(1000),
  sortOrder: z.number().int().default(0),
  isEnabled: z.boolean().default(true)
});

// 6. Settings Registry Schema
export const cmsRegistrySchema = z.object({
  id: z.string().min(1, "Registry ID is required"),
  type: z.string().min(1, "Registry Type is required"),
  content: z.record(z.string(), z.any()),
  isEnabled: z.boolean().default(true),
  version: z.number().int().default(1)
});
