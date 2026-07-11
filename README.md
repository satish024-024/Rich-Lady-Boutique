# Rich Lady Boutique — CMS Overhaul (Testing-2)

> **Branch:** `Testing-2`  
> **Base:** `test`  
> **Status:** ✅ Build passing — zero TypeScript errors  
> **Stack:** Next.js 16 (Turbopack) · Supabase · TypeScript · Zod · pnpm

---

## What Is This Branch?

This branch represents a **complete architectural overhaul** of the Rich Lady Boutique admin panel and storefront data layer. Before this work, the site ran entirely on `localStorage` — meaning every product, category, and setting added by an admin was stored only in the browser and never reached the live website.

**The core problem we solved:**
> Admin changes were not appearing on the storefront. There was no real database. The site was a static prototype pretending to be a dynamic CMS.

This branch fixes that permanently by wiring every part of the site to a real **Supabase PostgreSQL database** with a clean, production-grade architecture.

---

## Why We Did This

The previous codebase had these critical issues:

| Problem | Impact |
|---------|--------|
| No real database — localStorage only | Admin edits never showed on the live site |
| Components queried Supabase directly | No single source of truth, hard to maintain |
| Monolithic `admin/page.tsx` (1600+ lines) | Impossible to navigate or debug |
| No input validation | Corrupt data could be saved to the DB |
| No cache invalidation | Even with a DB, stale pages would serve old data |
| No soft deletes | Deleting a product removed it permanently |
| No version history | No way to undo an admin mistake |

---

## What We Built

### 1. Supabase Database Schema (`supabase_schema_additions.sql`)

A production-grade PostgreSQL schema with **12 tables**:

| Table | Purpose |
|-------|---------|
| `profiles` | Admin role management (admin / editor / viewer) |
| `categories` | Product categories with slugs and sort order |
| `collections` | Curated collections (Wedding, Festive, Everyday) |
| `products` | Full product catalog with inventory tracking |
| `product_images` | Multiple images per product (primary + side profiles) |
| `testimonials` | Customer reviews managed from admin |
| `faqs` | FAQ entries managed from admin |
| `media_library` | Centralised image upload registry |
| `cms_registry` | Site-wide settings (hero text, contact info, branding) |
| `cms_registry_versions` | Full version history of every CMS change |
| `import_history` | Audit log of every CSV batch import |
| `audit_logs` | Full audit trail of all admin actions |

**Also includes:**
- UUID primary keys on every table
- Auto-updating `updated_at` timestamps via PostgreSQL triggers
- Performance indexes on frequently queried columns
- Row Level Security (RLS) policies:
  - Public can **read** active products, categories, settings
  - Only `admin` role can **write** to any table

---

### 2. Service Layer (`src/utils/services/`)

A strict rule was enforced: **no component is allowed to call Supabase directly.**

Every database read goes through one of these services:

#### `products.ts`
- `getProducts()` — fetch all active products with joined images and categories
- `getLocalProducts()` / `saveLocalProducts()` — offline localStorage fallback
- Gracefully falls back to local seed data if DB is unreachable

#### `categories.ts`
- `getCategories()` — fetch all active categories ordered by sort position
- Offline fallback to hardcoded category list

#### `settings.ts`
- `getSiteSettings(id)` — fetch a CMS registry entry by ID (e.g. `homepage_hero`)
- Handles `PGRST116` (no row found) silently — uses defaults without error spam
- Defaults are defined in code so the site always works even before DB is seeded

**Data flow:**
```
Storefront Component
        ↓
    Service Layer
        ↓
     Supabase
        ↓ (if error)
  localStorage fallback
```

---

### 3. Shared Zod Validation (`src/utils/validation.ts`)

All incoming API data is validated before it touches the database:

- `productSchema` — validates name, price, stock, slug, category, specs
- `categorySchema` — validates name, slug, sort order, version (optimistic locking)
- `collectionSchema` — validates collection entries
- `cmsRegistrySchema` — validates settings content blobs
- `csvProductRowSchema` — validates each row of a CSV import

---

### 4. API Routes

#### `POST/PATCH/DELETE /api/products`
- Creates, updates, and soft-archives products
- Generates URL-safe slugs server-side
- Validates with Zod before any DB write
- Invalidates Next.js cache tag `products` after every mutation

#### `GET/POST/PATCH/DELETE /api/categories`
- Full CRUD for categories
- Optimistic locking via `version` field (prevents two admins overwriting each other)
- Invalidates cache tag `categories`

#### `GET/PATCH /api/settings`
- Reads and writes CMS registry entries (hero text, contact info, etc.)
- Saves version snapshot to `cms_registry_versions` on every save
- Invalidates cache tag `cms`

#### `POST /api/import/products`
- Accepts a CSV file upload
- Validates every row with Zod
- Processes in batches of 100 rows
- Failed batches roll back independently — successful batches still commit
- Logs the full import run to `import_history`

---

### 5. Modular Admin Panel

The original `admin/page.tsx` was a 1,600+ line monolith. It has been split into clean, focused view components:

| Component | Location | Responsibility |
|-----------|----------|----------------|
| `DashboardView` | `admin/dashboard/` | Stats overview, quick links |
| `ProductsView` | `admin/products/` | Add, edit, archive products |
| `CategoriesView` | `admin/categories/` | Manage categories (DB-driven dropdowns) |
| `CSVImportView` | `admin/csv-import/` | Batch CSV import with progress |
| `HomepageView` | `admin/homepage/` | Edit hero text, taglines, links |
| `SettingsView` | `admin/settings/` | Backup/restore, system settings |

Each tab in the sidebar now renders exactly one focused component instead of thousands of lines of inline JSX.

---

### 6. Storefront Components (Now DB-Driven)

| Component | What Changed |
|-----------|-------------|
| `Hero.tsx` | Reads heading and tagline from `cms_registry` via `getSiteSettings()` |
| `Products.tsx` | Reads products from Supabase via `getProducts()` service |
| `Categories.tsx` | Reads categories from Supabase via `getCategories()` service |

---

## Bug Fixes Applied

| Bug | Fix |
|-----|-----|
| `revalidateTag()` only 1 arg | Next.js 16 requires 2 args: `revalidateTag(tag, "default")` |
| `validation.error.errors` | Zod v3 uses `.error.issues` not `.error.errors` |
| `z.record(z.any())` | Requires explicit key schema: `z.record(z.string(), z.any())` |
| `imageInserts` null filter | `.filter(Boolean)` does not narrow TypeScript types — replaced with typed predicate |
| `prod.stock` possibly undefined | Guarded with `prod.stock ?? 0` |
| Console error spam | `PGRST116` and `42P01` are now silent fallbacks, not errors |
| `collection_tag` missing from schema | Added `collection_tag TEXT` column to products table |

---

## Files Changed

### New Files Created

```
supabase_schema_additions.sql
src/utils/validation.ts
src/utils/services/products.ts
src/utils/services/categories.ts
src/utils/services/settings.ts
src/app/api/categories/route.ts
src/app/api/settings/route.ts
src/app/api/import/products/route.ts
src/app/(marketing)/admin/dashboard/DashboardView.tsx
src/app/(marketing)/admin/products/ProductsView.tsx
src/app/(marketing)/admin/categories/CategoriesView.tsx
src/app/(marketing)/admin/csv-import/CSVImportView.tsx
src/app/(marketing)/admin/homepage/HomepageView.tsx
src/app/(marketing)/admin/settings/SettingsView.tsx
```

### Modified Files

```
src/app/(marketing)/admin/page.tsx       ← Stripped inline JSX, wired modular views
src/app/api/products/route.ts            ← Zod validation, soft delete, cache revalidation
src/utils/db.ts                          ← Proxies all calls through service layer
src/components/hero/Hero.tsx             ← Now reads from settings service
src/components/products/Products.tsx     ← Now reads from products service
src/components/categories/Categories.tsx ← Now reads from categories service
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- pnpm (`npm install -g pnpm`)
- A Supabase project

### 1. Clone and install

```bash
git clone https://github.com/satish024-024/Rich-Lady-Boutique.git
cd Rich-Lady-Boutique
git checkout Testing-2
pnpm install
```

### 2. Create `.env.local`

Create a file called `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Get these from your Supabase dashboard → **Settings → API**.

### 3. Run the database migration

Open your Supabase project → **SQL Editor** → paste and run the full contents of `supabase_schema_additions.sql`.

Then seed the default CMS settings:

```sql
INSERT INTO public.cms_registry (id, type, content, is_enabled, version)
VALUES 
  ('homepage_hero', 'homepage', '{"heroHeading": "Timeless Indian Craftsmanship, Modern Grace", "heroSubheading": "Curated collections of premium sarees, bespoke kurtis, and wedding lehengas.", "whatsappLink": "https://wa.me/919030443306"}'::jsonb, true, 1),
  ('general_branding', 'branding', '{"boutiqueEmail": "admin@richladyboutique.com", "boutiqueAddress": "Godavari District, Andhra Pradesh, India", "instagramHandle": "@RichLadyBoutique"}'::jsonb, true, 1)
ON CONFLICT (id) DO NOTHING;
```

### 4. Promote yourself to admin

Sign in once through the app, then run in Supabase SQL Editor:

```sql
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'your-email@example.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

### 5. Run locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — admin panel at [http://localhost:3000/admin](http://localhost:3000/admin).

### 6. Build check

```bash
pnpm run build
```

Should complete with **zero TypeScript errors**.

---

## Architecture Decision Summary

| Decision | Reason |
|----------|--------|
| UUID primary keys | Slugs can change — foreign keys must never change |
| Service layer — no direct Supabase in components | One read path — easy to debug, swap, or cache |
| Zod validation on every API route | Reject corrupt data before it reaches the DB |
| Soft deletes (`is_active = false`) | Nothing is ever permanently lost |
| `cms_registry` for site settings | Single table for all site-wide settings, versioned |
| Separate `cms_registry_versions` table | Unlimited edit history without bloating a JSONB array |
| Tag-based cache revalidation | Admin saves instantly reflect on the storefront |
| RLS policies | Database-level security — data is protected even if the API is bypassed |

---

*Built with care. Every architectural decision was reviewed and refined through multiple iterations before implementation.*
