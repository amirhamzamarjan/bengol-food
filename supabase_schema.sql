-- =========================================================================
-- US BENGOL - Supabase PostgreSQL Schema & Security Policies
-- Production-Ready Database Setup (v2 — Gallery, Multi-Image Products)
-- =========================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------------------------
-- 1. PRODUCTS TABLE (Updated with gallery_images, detail_image)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    bengali_name VARCHAR(255),
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    image_url TEXT,
    gallery_images JSONB DEFAULT '[]'::jsonb,
    detail_image TEXT,
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
-- 2. GALLERY TABLE
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_url TEXT NOT NULL,
    title VARCHAR(255) NOT NULL DEFAULT '',
    description TEXT DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_gallery_published ON public.gallery (is_published, sort_order);

-- -------------------------------------------------------------------------
-- 3. BULK ORDERS TABLE
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
-- 4. SITE CONTENT TABLE
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_key VARCHAR(100) UNIQUE NOT NULL,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- -------------------------------------------------------------------------
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Products: Everyone can view visible products
DROP POLICY IF EXISTS "Allow public read access to visible products" ON public.products;
CREATE POLICY "Allow public read access to visible products"
    ON public.products
    FOR SELECT
    USING (is_visible = true OR auth.role() = 'authenticated');

-- Products: Only authenticated admin can insert, update, delete
DROP POLICY IF EXISTS "Allow authenticated admin full access to products" ON public.products;
CREATE POLICY "Allow authenticated admin full access to products"
    ON public.products
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Gallery: Everyone can view published gallery items
DROP POLICY IF EXISTS "Allow public read access to published gallery" ON public.gallery;
CREATE POLICY "Allow public read access to published gallery"
    ON public.gallery
    FOR SELECT
    USING (is_published = true OR auth.role() = 'authenticated');

-- Gallery: Only authenticated admin can insert, update, delete
DROP POLICY IF EXISTS "Allow authenticated admin full access to gallery" ON public.gallery;
CREATE POLICY "Allow authenticated admin full access to gallery"
    ON public.gallery
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Bulk Orders: Anyone can submit a bulk order request
DROP POLICY IF EXISTS "Allow public insert of bulk orders" ON public.bulk_orders;
CREATE POLICY "Allow public insert of bulk orders"
    ON public.bulk_orders
    FOR INSERT
    WITH CHECK (true);

-- Bulk Orders: Only authenticated admin can view or modify bulk requests
DROP POLICY IF EXISTS "Allow authenticated admin full access to bulk orders" ON public.bulk_orders;
CREATE POLICY "Allow authenticated admin full access to bulk orders"
    ON public.bulk_orders
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Site Content: Public can view content
DROP POLICY IF EXISTS "Allow public read access to site content" ON public.site_content;
CREATE POLICY "Allow public read access to site content"
    ON public.site_content
    FOR SELECT
    USING (true);

-- Site Content: Only authenticated admin can edit site content
DROP POLICY IF EXISTS "Allow authenticated admin to update site content" ON public.site_content;
CREATE POLICY "Allow authenticated admin to update site content"
    ON public.site_content
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- -------------------------------------------------------------------------
-- 6. INITIAL SEED DATA FOR CORE PRODUCTS
-- Initial prices set to 0.00 until updated in Admin Panel
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
-- 7. SEED CERTIFICATION CONTENT (Placeholder until verified details provided)
-- -------------------------------------------------------------------------
INSERT INTO public.site_content (section_key, content)
VALUES (
    'certifications',
    '{"bsti": {"title": "BSTI Approved", "description": "Bangladesh Standards and Testing Institution approval for food safety and quality standards.", "certificate_number": "", "status": "placeholder"}, "ifst": {"title": "IFST Recognized", "description": "Institute of Food Science and Technology recognition for production practices.", "certificate_number": "", "status": "placeholder"}}'::jsonb
)
ON CONFLICT (section_key) DO NOTHING;

-- -------------------------------------------------------------------------
-- 8. INITIAL SEED DATA FOR GALLERY (8 authentic kitchen/production moments)
-- -------------------------------------------------------------------------
INSERT INTO public.gallery (id, title, description, image_url, sort_order, is_published)
VALUES
    ('b1111111-1111-4111-8111-111111111111', 'Finest Grain Selection', 'Pristine whole wheat and refined flours selected for natural aroma and taste.', 'images/prep/prep-1-quality.jpg', 1, true),
    ('b2222222-2222-4222-8222-222222222222', 'Gentle Kneading Process', 'Hydrated and kneaded to exact consistency to ensure softness in every bite.', 'images/prep/prep-2-dough.jpg', 2, true),
    ('b3333333-3333-4333-8333-333333333333', 'Artisanal Rolling Technique', 'Delicate and round flatbreads shaped with traditional hand-guided technique.', 'images/prep/prep-3-rolling.jpg', 3, true),
    ('b4444444-4444-4444-8444-444444444444', 'Traditional Baking Heat', 'Slow-toasted over controlled flame until naturally puffed and aromatic.', 'images/prep/prep-4-cooking.png', 4, true),
    ('b5555555-5555-4555-8555-555555555555', 'Fresh Warm Stacks', 'Hot rotis layered carefully to retain moisture and authentic comforting texture.', 'images/prep/prep-5-serving.png', 5, true),
    ('b6666666-6666-4666-8666-666666666666', 'Wholesome Atta Roti', 'Whole wheat goodness ready to anchor daily breakfast and dinner tables.', 'images/ataruti.png', 6, true),
    ('b7777777-7777-4777-8777-777777777777', 'Tender Maida Roti', 'Silky, tender white flour roti for effortless folding and pairing.', 'images/moydaruti.png', 7, true),
    ('b8888888-8888-4888-8888-888888888888', 'Flaky Golden Parota', 'Multi-layered with signature golden crispness outside and tender inside folds.', 'images/porota.png', 8, true)
ON CONFLICT (id) DO UPDATE
SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    image_url = EXCLUDED.image_url,
    sort_order = EXCLUDED.sort_order;

-- -------------------------------------------------------------------------
-- 9. STORAGE BUCKET CONFIGURATION
-- Run these in the Supabase SQL Editor after creating buckets in Storage UI
-- -------------------------------------------------------------------------
-- Step 1: Create buckets via Supabase Dashboard → Storage → New Bucket
--   Bucket name: "product-images" (Public: Yes)
--   Bucket name: "gallery-images" (Public: Yes)
--
-- Step 2: Run these policies:
--
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT (id) DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('gallery-images', 'gallery-images', true) ON CONFLICT (id) DO NOTHING;
--
-- CREATE POLICY "Public read product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
-- CREATE POLICY "Admin upload product images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
-- CREATE POLICY "Admin update product images" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
-- CREATE POLICY "Admin delete product images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
--
-- CREATE POLICY "Public read gallery images" ON storage.objects FOR SELECT USING (bucket_id = 'gallery-images');
-- CREATE POLICY "Admin upload gallery images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gallery-images' AND auth.role() = 'authenticated');
-- CREATE POLICY "Admin update gallery images" ON storage.objects FOR UPDATE USING (bucket_id = 'gallery-images' AND auth.role() = 'authenticated');
-- CREATE POLICY "Admin delete gallery images" ON storage.objects FOR DELETE USING (bucket_id = 'gallery-images' AND auth.role() = 'authenticated');
