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

-- 6. Alter orders table to link customer emails
-- Check if column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'orders' 
          AND column_name = 'customer_email'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN customer_email TEXT;
    END IF;
END $$;
