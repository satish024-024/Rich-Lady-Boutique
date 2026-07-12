-- =========================================================================
-- Supabase Schema Additions for Email and SMS/OTP Integration
-- Rich Lady Boutique
-- =========================================================================

-- 1. OTP Verifications Table
CREATE TABLE IF NOT EXISTS public.otp_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT NOT NULL,
    otp_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified BOOLEAN DEFAULT FALSE NOT NULL,
    attempts INTEGER DEFAULT 0 NOT NULL,
    resend_count INTEGER DEFAULT 0 NOT NULL,
    last_resend_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT otp_attempts_limit CHECK (attempts <= 5)
);

-- Index for fast OTP verification lookups
CREATE INDEX IF NOT EXISTS idx_otp_phone_verified ON public.otp_verifications(phone, verified);

-- 2. Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status TEXT DEFAULT 'subscribed' NOT NULL CHECK (status IN ('subscribed', 'unsubscribed'))
);

-- 3. Email Logs Table
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT, -- References orders.id format if linked to checkout
    type TEXT NOT NULL, -- 'welcome', 'email_verification', 'order_confirmation', 'payment_success', 'shipping_confirmation', 'delivery_confirmation', 'contact_notification', 'newsletter_subscription', 'admin_new_order'
    recipient_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT, -- Stores the HTML body of the email for rendering/retries
    status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'sent', 'failed')),
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for searching and filtering logs
CREATE INDEX IF NOT EXISTS idx_email_recipient ON public.email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_status ON public.email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_order ON public.email_logs(order_id);

-- 4. SMS Logs Table
CREATE TABLE IF NOT EXISTS public.sms_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT, -- References orders.id format if linked to checkout
    type TEXT NOT NULL, -- 'otp', 'order_confirmation', 'shipping_confirmation', 'delivery_confirmation'
    recipient_phone TEXT NOT NULL,
    body TEXT NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'sent', 'failed')),
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for searching and filtering SMS logs
CREATE INDEX IF NOT EXISTS idx_sms_recipient ON public.sms_logs(recipient_phone);
CREATE INDEX IF NOT EXISTS idx_sms_status ON public.sms_logs(status);
CREATE INDEX IF NOT EXISTS idx_sms_order ON public.sms_logs(order_id);

-- 5. Notification Logs Table (Administrative Notifications)
CREATE TABLE IF NOT EXISTS public.notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- 'system', 'admin_alert', 'checkout'
    status TEXT DEFAULT 'unread' NOT NULL CHECK (status IN ('unread', 'read')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Orders and Order Items Tables
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    shipping_address TEXT NOT NULL,
    city TEXT NOT NULL,
    pincode TEXT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_status TEXT DEFAULT 'pending' NOT NULL CHECK (payment_status IN ('pending', 'paid', 'failed')),
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    shiprocket_order_id TEXT,
    shiprocket_shipment_id TEXT,
    shiprocket_awb_code TEXT,
    shiprocket_courier_name TEXT,
    shiprocket_tracking_url TEXT,
    shipping_status TEXT DEFAULT 'pending' NOT NULL CHECK (shipping_status IN ('pending', 'shipped', 'delivered', 'returned')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON public.orders(razorpay_payment_id);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    quantity INTEGER DEFAULT 1 NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON public.order_items(product_id);

-- 7. Users Table (Firebase Phone Auth integrated)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY, -- Firebase UID
    phone TEXT NOT NULL UNIQUE,
    name TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for searching users by phone
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);

-- 8. Alter products table to support side profile images
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS side_profile1_url TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS side_profile2_url TEXT;

-- 9. Alter products table to support occasion collection tags
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS collection_tag TEXT;

-- 10. Alter products table to support detailed specification fields
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS fabric TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS dimensions TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS garment_cut TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS artisan_origin TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS weaving_style TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS craft_time TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS thread_count TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS washing_standard TEXT;




