-- =========================================================================
-- US BENGOL - ALL-IN-ONE SUPABASE SETUP & STORAGE CONFIGURATION
-- Run this entire script in Supabase Dashboard -> SQL Editor -> New Query
-- Project: https://supabase.com/dashboard/project/xnoveggueuxvwzmlnidk/sql/new
-- =========================================================================

-- Enable UUID extension
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
    gallery_images JSONB DEFAULT '[]'::jsonb,
    detail_image TEXT,
    badge VARCHAR(100),
    is_available BOOLEAN NOT NULL DEFAULT true,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

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
-- 5. ROW LEVEL SECURITY (RLS) POLICIES FOR DATABASE TABLES
-- -------------------------------------------------------------------------
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow full access to products" ON public.products;
CREATE POLICY "Allow full access to products" ON public.products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access to gallery" ON public.gallery;
CREATE POLICY "Allow full access to gallery" ON public.gallery FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access to bulk orders" ON public.bulk_orders;
CREATE POLICY "Allow full access to bulk orders" ON public.bulk_orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access to site content" ON public.site_content;
CREATE POLICY "Allow full access to site content" ON public.site_content FOR ALL USING (true) WITH CHECK (true);

-- -------------------------------------------------------------------------
-- 6. STORAGE BUCKETS (Product images, Gallery photos, Site section images)
-- Automatically provisions the 3 public storage buckets required for photo uploads
-- -------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('product-images', 'product-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']),
  ('gallery-images', 'gallery-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']),
  ('site-images', 'site-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'])
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Storage Read Policies (Public CDN access)
DROP POLICY IF EXISTS "Allow public read on product images" ON storage.objects;
CREATE POLICY "Allow public read on product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Allow public read on gallery images" ON storage.objects;
CREATE POLICY "Allow public read on gallery images" ON storage.objects FOR SELECT USING (bucket_id = 'gallery-images');

DROP POLICY IF EXISTS "Allow public read on site images" ON storage.objects;
CREATE POLICY "Allow public read on site images" ON storage.objects FOR SELECT USING (bucket_id = 'site-images');

-- Storage Upload Policies (Allow admin / storefront uploads)
DROP POLICY IF EXISTS "Allow upload to product images" ON storage.objects;
CREATE POLICY "Allow upload to product images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Allow upload to gallery images" ON storage.objects;
CREATE POLICY "Allow upload to gallery images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gallery-images');

DROP POLICY IF EXISTS "Allow upload to site images" ON storage.objects;
CREATE POLICY "Allow upload to site images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'site-images');

-- Storage Update Policies
DROP POLICY IF EXISTS "Allow update to product images" ON storage.objects;
CREATE POLICY "Allow update to product images" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Allow update to gallery images" ON storage.objects;
CREATE POLICY "Allow update to gallery images" ON storage.objects FOR UPDATE USING (bucket_id = 'gallery-images');

DROP POLICY IF EXISTS "Allow update to site images" ON storage.objects;
CREATE POLICY "Allow update to site images" ON storage.objects FOR UPDATE USING (bucket_id = 'site-images');

-- Storage Delete Policies
DROP POLICY IF EXISTS "Allow delete from product images" ON storage.objects;
CREATE POLICY "Allow delete from product images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Allow delete from gallery images" ON storage.objects;
CREATE POLICY "Allow delete from gallery images" ON storage.objects FOR DELETE USING (bucket_id = 'gallery-images');

DROP POLICY IF EXISTS "Allow delete from site images" ON storage.objects;
CREATE POLICY "Allow delete from site images" ON storage.objects FOR DELETE USING (bucket_id = 'site-images');

-- -------------------------------------------------------------------------
-- 7. CLEANUP OLD SEED / BASE64 STRINGS IN GALLERY & PRODUCTS
-- -------------------------------------------------------------------------
DELETE FROM public.gallery WHERE image_url LIKE 'data:%' OR image_url LIKE 'images/%';

-- -------------------------------------------------------------------------
-- 8. CORE PRODUCTS STRUCTURE (Clean state ready for Admin photo uploads)
-- -------------------------------------------------------------------------
INSERT INTO public.products (id, name, bengali_name, slug, description, price, image_url, badge, is_available, is_visible, sort_order)
VALUES
    ('c1111111-1111-4111-8111-111111111111', 'Atta Roti', 'আটা রুটি', 'atta-roti', 'Wholesome, soft, and puffed whole wheat roti made with traditional care. A daily staple that feels naturally comforting, wholesome, and familiar at every family breakfast and dinner table.', 0.00, '', 'Everyday Staple', true, true, 1),
    ('c2222222-2222-4222-8222-222222222222', 'Maida Roti', 'ময়দা রুটি', 'maida-roti', 'Delicate, tender white-flour roti with a smooth, pliable texture. Thoughtfully rolled and cooked for effortless rolling, dipping, and pairing with savory curries and dal.', 0.00, '', 'Traditional Soft', true, true, 2),
    ('c3333333-3333-4333-8333-333333333333', 'Parota', 'পরোটা', 'parota', 'Traditional flaky layered parota with signature golden crispness outside and soft, tender multi-folds inside. Brings authentic morning nostalgia to your breakfast plate.', 0.00, '', 'Morning Classic', true, true, 3)
ON CONFLICT (slug) DO UPDATE
SET 
    name = EXCLUDED.name,
    bengali_name = EXCLUDED.bengali_name,
    description = EXCLUDED.description,
    badge = EXCLUDED.badge,
    sort_order = EXCLUDED.sort_order;

-- -------------------------------------------------------------------------
-- 9. INITIAL SEED FOR SITE CONTENT
-- -------------------------------------------------------------------------
INSERT INTO public.site_content (section_key, content)
VALUES (
    'certifications',
    '{"bsti": {"title": "BSTI Approved", "description": "Bangladesh Standards and Testing Institution approval for food safety and quality standards.", "certificate_number": "", "status": "placeholder"}, "ifst": {"title": "IFST Recognized", "description": "Institute of Food Science and Technology recognition for production practices.", "certificate_number": "", "status": "placeholder"}}'::jsonb
)
ON CONFLICT (section_key) DO NOTHING;

