-- =========================================================================
-- US BENGOL - Supabase PostgreSQL Schema & Security Policies
-- Production-Ready Database Setup
-- =========================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------------------------
-- 1. PRODUCTS TABLE
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    bengali_name VARCHAR(255),
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    image_url TEXT,
    badge VARCHAR(100),
    is_available BOOLEAN NOT NULL DEFAULT true,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for speedy ordering & public visibility filtering
CREATE INDEX IF NOT EXISTS idx_products_visibility ON public.products (is_visible, sort_order);

-- -------------------------------------------------------------------------
-- 2. BULK ORDERS TABLE
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bulk_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    organization VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    product VARCHAR(255) NOT NULL,
    quantity VARCHAR(100) NOT NULL,
    delivery_location TEXT NOT NULL,
    preferred_schedule VARCHAR(255),
    message TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for ordering requests by date
CREATE INDEX IF NOT EXISTS idx_bulk_orders_created ON public.bulk_orders (created_at DESC);

-- -------------------------------------------------------------------------
-- 3. SITE CONTENT TABLE
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_key VARCHAR(100) UNIQUE NOT NULL,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- -------------------------------------------------------------------------
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Products: Everyone can view visible products
CREATE POLICY "Allow public read access to visible products"
    ON public.products
    FOR SELECT
    USING (is_visible = true OR auth.role() = 'authenticated');

-- Products: Only authenticated admin can insert, update, delete
CREATE POLICY "Allow authenticated admin full access to products"
    ON public.products
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Bulk Orders: Anyone can submit a bulk order request
CREATE POLICY "Allow public insert of bulk orders"
    ON public.bulk_orders
    FOR INSERT
    WITH CHECK (true);

-- Bulk Orders: Only authenticated admin can view or modify bulk requests
CREATE POLICY "Allow authenticated admin full access to bulk orders"
    ON public.bulk_orders
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Site Content: Public can view content
CREATE POLICY "Allow public read access to site content"
    ON public.site_content
    FOR SELECT
    USING (true);

-- Site Content: Only authenticated admin can edit site content
CREATE POLICY "Allow authenticated admin to update site content"
    ON public.site_content
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- -------------------------------------------------------------------------
-- 5. INITIAL SEED DATA FOR CORE PRODUCTS
-- Initial prices set to 0.00 as specified in requirement 13 & 53.
-- -------------------------------------------------------------------------
INSERT INTO public.products (id, name, bengali_name, slug, description, price, image_url, badge, is_available, is_visible, sort_order)
VALUES
    ('c1111111-1111-4111-8111-111111111111', 'Atta Roti', 'আটা রুটি', 'atta-roti', 'Wholesome, soft, and puffed whole wheat roti made with traditional care. A daily staple that feels naturally comforting, wholesome, and familiar at every family breakfast and dinner table.', 0.00, 'images/ataruti.png', 'Everyday Staple', true, true, 1),
    ('c2222222-2222-4222-8222-222222222222', 'Maida Roti', 'ময়দা রুটি', 'maida-roti', 'Delicate, tender white-flour roti with a smooth, pliable texture. Thoughtfully rolled and cooked for effortless rolling, dipping, and pairing with savory curries and dal.', 0.00, 'images/moydaruti.png', 'Traditional Soft', true, true, 2),
    ('c3333333-3333-4333-8333-333333333333', 'Parota', 'পরোটা', 'parota', 'Traditional flaky layered parota with signature golden crispness outside and soft, tender multi-folds inside. Brings authentic morning nostalgia to your breakfast plate.', 0.00, 'images/porota.png', 'Morning Classic', true, true, 3)
ON CONFLICT (slug) DO UPDATE
SET 
    name = EXCLUDED.name,
    bengali_name = EXCLUDED.bengali_name,
    description = EXCLUDED.description,
    badge = EXCLUDED.badge,
    sort_order = EXCLUDED.sort_order;

-- -------------------------------------------------------------------------
-- 6. STORAGE BUCKET CONFIGURATION (Execute in Supabase Storage UI or SQL)
-- -------------------------------------------------------------------------
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT (id) DO NOTHING;
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
-- CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
