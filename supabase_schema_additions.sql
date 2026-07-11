-- =========================================================================
-- Supabase Schema Additions for Dynamic CMS & CSV Importer
-- Rich Lady Boutique
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables to align with production UUID specifications if necessary
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;

-- 1. Profiles Table (Role-Based Access Control)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Categories Table
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    version INTEGER DEFAULT 1 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Collections Table
CREATE TABLE public.collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    cover_image TEXT,
    sort_order INTEGER DEFAULT 0,
    is_enabled BOOLEAN DEFAULT TRUE,
    version INTEGER DEFAULT 1 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Products Table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    collection_id UUID REFERENCES public.collections(id) ON DELETE SET NULL,
    quantity_available INTEGER DEFAULT 10,
    track_inventory BOOLEAN DEFAULT TRUE,
    allow_backorder BOOLEAN DEFAULT FALSE,
    rating DECIMAL(2, 1) DEFAULT 5.0,
    reviews_count INTEGER DEFAULT 0,
    is_new_arrival BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    specifications JSONB DEFAULT '{}',
    collection_tag TEXT,
    version INTEGER DEFAULT 1 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Product Images Table
CREATE TABLE public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    alt_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Testimonials Table
CREATE TABLE public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author TEXT NOT NULL,
    text TEXT NOT NULL,
    rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    sort_order INTEGER DEFAULT 0,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. FAQs Table
CREATE TABLE public.faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. Media Library Table
CREATE TABLE public.media_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT UNIQUE NOT NULL,
    filename TEXT NOT NULL,
    size_bytes INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    folder TEXT DEFAULT 'public',
    tags TEXT[] DEFAULT '{}',
    is_deleted BOOLEAN DEFAULT FALSE,
    reference_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 9. CMS Registry Table
CREATE TABLE public.cms_registry (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    content JSONB NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    version INTEGER DEFAULT 1 NOT NULL,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 10. CMS Registry Versions Table
CREATE TABLE public.cms_registry_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registry_id TEXT REFERENCES public.cms_registry(id) ON DELETE CASCADE,
    content JSONB NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 11. CSV Import History Table
CREATE TABLE public.import_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    rows_processed INTEGER NOT NULL,
    rows_success INTEGER NOT NULL,
    rows_failed INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    error_summary JSONB,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 12. Audit Logs Table
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'ARCHIVE')),
    old_value JSONB,
    new_value JSONB,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =========================================================================
-- INDEXES & TRIGGERS
-- =========================================================================

-- Create Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_collection ON public.products(collection_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);

CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_sort ON public.categories(sort_order);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_settings_type ON public.cms_registry(type);

-- Create automatic update timestamp function
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER tr_products_timestamp BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER tr_categories_timestamp BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER tr_settings_timestamp BEFORE UPDATE ON public.cms_registry
    FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER tr_collections_timestamp BEFORE UPDATE ON public.collections
    FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER tr_testimonials_timestamp BEFORE UPDATE ON public.testimonials
    FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER tr_faqs_timestamp BEFORE UPDATE ON public.faqs
    FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_registry_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper Function to verify Admin privileges
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Public Read Access Policies
CREATE POLICY "Allow public read active categories" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read active products" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read active product images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Allow public read active collections" ON public.collections FOR SELECT USING (is_enabled = true);
CREATE POLICY "Allow public read active testimonials" ON public.testimonials FOR SELECT USING (is_enabled = true);
CREATE POLICY "Allow public read active faqs" ON public.faqs FOR SELECT USING (is_enabled = true);
CREATE POLICY "Allow public read active settings" ON public.cms_registry FOR SELECT USING (is_enabled = true);

-- Admin Mutation Permissions
CREATE POLICY "Allow admins write profiles" ON public.profiles FOR ALL USING (public.is_admin());
CREATE POLICY "Allow admins write categories" ON public.categories FOR ALL USING (public.is_admin());
CREATE POLICY "Allow admins write products" ON public.products FOR ALL USING (public.is_admin());
CREATE POLICY "Allow admins write product images" ON public.product_images FOR ALL USING (public.is_admin());
CREATE POLICY "Allow admins write collections" ON public.collections FOR ALL USING (public.is_admin());
CREATE POLICY "Allow admins write testimonials" ON public.testimonials FOR ALL USING (public.is_admin());
CREATE POLICY "Allow admins write faqs" ON public.faqs FOR ALL USING (public.is_admin());
CREATE POLICY "Allow admins write settings" ON public.cms_registry FOR ALL USING (public.is_admin());
CREATE POLICY "Allow admins write media library" ON public.media_library FOR ALL USING (public.is_admin());
CREATE POLICY "Allow admins write import history" ON public.import_history FOR ALL USING (public.is_admin());
CREATE POLICY "Allow admins write audit logs" ON public.audit_logs FOR ALL USING (public.is_admin());
CREATE POLICY "Allow admins write registry versions" ON public.cms_registry_versions FOR ALL USING (public.is_admin());
