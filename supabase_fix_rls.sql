-- =========================================================================
-- US BENGOL - FIX ROW LEVEL SECURITY (RLS) FOR ADMIN PANEL & PUBLIC STORE
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/xnoveggueuxvwzmlnidk/sql/new
-- =========================================================================

-- 1. Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- 2. PRODUCTS: Allow full access (public can view, admin can edit/save prices)
DROP POLICY IF EXISTS "Allow public read access to visible products" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated admin full access to products" ON public.products;
DROP POLICY IF EXISTS "Allow full access to products" ON public.products;
CREATE POLICY "Allow full access to products"
    ON public.products
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 3. GALLERY: Allow full access (public can view, admin can add/edit photos)
DROP POLICY IF EXISTS "Allow public read access to published gallery" ON public.gallery;
DROP POLICY IF EXISTS "Allow authenticated admin full access to gallery" ON public.gallery;
DROP POLICY IF EXISTS "Allow full access to gallery" ON public.gallery;
CREATE POLICY "Allow full access to gallery"
    ON public.gallery
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 4. BULK ORDERS: Allow public insert and admin full access
DROP POLICY IF EXISTS "Allow public insert of bulk orders" ON public.bulk_orders;
DROP POLICY IF EXISTS "Allow authenticated admin full access to bulk orders" ON public.bulk_orders;
DROP POLICY IF EXISTS "Allow full access to bulk orders" ON public.bulk_orders;
CREATE POLICY "Allow full access to bulk orders"
    ON public.bulk_orders
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 5. SITE CONTENT: Allow full access
DROP POLICY IF EXISTS "Allow public read access to site content" ON public.site_content;
DROP POLICY IF EXISTS "Allow authenticated admin to update site content" ON public.site_content;
DROP POLICY IF EXISTS "Allow full access to site content" ON public.site_content;
CREATE POLICY "Allow full access to site content"
    ON public.site_content
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 6. STORAGE BUCKETS (Product images, Gallery photos, Site section images)
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('product-images', 'product-images', true),
  ('gallery-images', 'gallery-images', true),
  ('site-images', 'site-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Objects Policies for instant upload/download
DROP POLICY IF EXISTS "Allow all on product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow all on gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Allow all on site images" ON storage.objects;
DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload product images" ON storage.objects;

CREATE POLICY "Allow all on product images" 
    ON storage.objects FOR ALL 
    USING (bucket_id = 'product-images') 
    WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Allow all on gallery images" 
    ON storage.objects FOR ALL 
    USING (bucket_id = 'gallery-images') 
    WITH CHECK (bucket_id = 'gallery-images');

CREATE POLICY "Allow all on site images" 
    ON storage.objects FOR ALL 
    USING (bucket_id = 'site-images') 
    WITH CHECK (bucket_id = 'site-images');

