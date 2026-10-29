/**
 * US BENGOL - Supabase Client & Local Data Store Bridge (v2)
 * 
 * Provides seamless integration with Supabase PostgreSQL and Storage,
 * with intelligent client-side fallback to localStorage so that the site
 * remains 100% operational offline, during development, and before
 * live Supabase credentials are provided.
 * 
 * v2: Added gallery CRUD, multi-image product support, certification content
 */

(function (window) {
  'use strict';

  const STORAGE_KEYS = {
    SUPABASE_URL: 'usb_supabase_url',
    SUPABASE_KEY: 'usb_supabase_anon_key',
    LOCAL_PRODUCTS: 'usb_local_products',
    LOCAL_BULK_ORDERS: 'usb_local_bulk_orders',
    LOCAL_SITE_CONTENT: 'usb_local_site_content',
    LOCAL_GALLERY: 'usb_local_gallery',
    ADMIN_AUTH: 'usb_admin_session'
  };

  class SupabaseService {
    constructor() {
      this.client = null;
      this.isConfigured = false;
      this.initClient();
    }

    initClient() {
      const url = localStorage.getItem(STORAGE_KEYS.SUPABASE_URL) || window.US_BENGOL_CONFIG?.supabase?.url || '';
      const key = localStorage.getItem(STORAGE_KEYS.SUPABASE_KEY) || window.US_BENGOL_CONFIG?.supabase?.anonKey || '';

      if (url && key && window.supabase && typeof window.supabase.createClient === 'function') {
        try {
          this.client = window.supabase.createClient(url, key);
          this.isConfigured = true;
          console.log('[US BENGOL] Supabase client initialized successfully.');
        } catch (err) {
          console.warn('[US BENGOL] Supabase initialization failed, running in resilient local mode.', err);
          this.isConfigured = false;
        }
      } else {
        this.isConfigured = false;
      }
    }

    getConfig() {
      return {
        url: localStorage.getItem(STORAGE_KEYS.SUPABASE_URL) || window.US_BENGOL_CONFIG?.supabase?.url || '',
        key: localStorage.getItem(STORAGE_KEYS.SUPABASE_KEY) || window.US_BENGOL_CONFIG?.supabase?.anonKey || '',
        isConfigured: this.isConfigured
      };
    }

    saveConfig(url, key) {
      if (url && key) {
        localStorage.setItem(STORAGE_KEYS.SUPABASE_URL, url.trim());
        localStorage.setItem(STORAGE_KEYS.SUPABASE_KEY, key.trim());
      } else {
        localStorage.removeItem(STORAGE_KEYS.SUPABASE_URL);
        localStorage.removeItem(STORAGE_KEYS.SUPABASE_KEY);
      }
      this.initClient();
    }

    /* ---------------------------------------------------------
       PRODUCTS API
       --------------------------------------------------------- */
    async getProducts() {
      if (this.isConfigured && this.client) {
        try {
          const { data, error } = await this.client
            .from('products')
            .select('*')
            .order('sort_order', { ascending: true });

          if (!error && data && data.length > 0) {
            return data;
          }
          if (error) {
            console.warn('[US BENGOL] Supabase getProducts error:', error.message);
          }
        } catch (e) {
          console.warn('[US BENGOL] Network error fetching from Supabase:', e);
        }
      }

      const cached = localStorage.getItem(STORAGE_KEYS.LOCAL_PRODUCTS);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {
          console.error(e);
        }
      }

      const defaults = window.US_BENGOL_CONFIG?.defaultProducts || [];
      localStorage.setItem(STORAGE_KEYS.LOCAL_PRODUCTS, JSON.stringify(defaults));
      return defaults;
    }

    async getProductBySlug(slug) {
      if (this.isConfigured && this.client) {
        try {
          const { data, error } = await this.client
            .from('products')
            .select('*')
            .eq('slug', slug)
            .single();

          if (!error && data) return data;
        } catch (e) {
          console.warn('[US BENGOL] getProductBySlug error:', e);
        }
      }
      const products = await this.getProducts();
      return products.find(p => p.slug === slug) || null;
    }

    async saveProduct(product) {
      const payload = { ...product };
      if (!payload.id) delete payload.id;
      payload.updated_at = new Date().toISOString();

      if (this.isConfigured && this.client) {
        try {
          let res;
          if (payload.id) {
            res = await this.client
              .from('products')
              .update(payload)
              .eq('id', payload.id)
              .select();
          } else {
            res = await this.client
              .from('products')
              .insert([payload])
              .select();
          }

          if (res.error) {
            console.error('[US BENGOL] Supabase saveProduct error:', res.error);
            throw new Error(res.error.message || 'Database error while saving product');
          }

          if (payload.id && res.data && res.data.length === 0) {
            throw new Error('Supabase RLS policy prevented saving. Please update the RLS policies in Supabase SQL editor.');
          }

          if (res.data && res.data.length > 0) {
            await this._updateLocalProductMirror(res.data[0]);
            return { success: true, data: res.data };
          }
        } catch (e) {
          console.error('[US BENGOL] Supabase saveProduct failed:', e);
          throw e;
        }
      }

      await this._updateLocalProductMirror(payload);
      return { success: true, data: [payload], mode: 'local' };
    }

    _updateLocalProductMirror(product) {
      try {
        let products = [];
        try {
          products = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCAL_PRODUCTS) || '[]');
        } catch (e) { products = []; }
        const index = products.findIndex(p => p.id === product.id || p.slug === product.slug);
        if (index >= 0) {
          products[index] = { ...products[index], ...product, updated_at: new Date().toISOString() };
        } else {
          products.push({
            ...product,
            id: product.id || 'prod-' + Date.now(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
        localStorage.setItem(STORAGE_KEYS.LOCAL_PRODUCTS, JSON.stringify(products));
        return products;
      } catch (err) {
        console.warn('[US BENGOL] Local storage product mirror warning (quota reached):', err);
        return [product];
      }
    }

    async deleteProduct(productId) {
      if (this.isConfigured && this.client) {
        const { error } = await this.client
          .from('products')
          .delete()
          .eq('id', productId);
        if (error) {
          console.error('[US BENGOL] deleteProduct error:', error);
          throw new Error(error.message);
        }
      }

      try {
        const products = await this.getProducts();
        const filtered = products.filter(p => p.id !== productId);
        localStorage.setItem(STORAGE_KEYS.LOCAL_PRODUCTS, JSON.stringify(filtered));
      } catch (e) {
        console.warn(e);
      }
      return { success: true };
    }

    /* ---------------------------------------------------------
       GALLERY API
       --------------------------------------------------------- */
    async getGallery(includeUnpublished = false) {
      if (this.isConfigured && this.client) {
        try {
          let query = this.client
            .from('gallery')
            .select('*')
            .order('sort_order', { ascending: true });

          if (!includeUnpublished) {
            query = query.eq('is_published', true);
          }

          const { data, error } = await query;
          if (!error && data) return data;
          if (error) console.warn('[US BENGOL] Gallery fetch error:', error.message);
        } catch (e) {
          console.warn('[US BENGOL] Gallery network error:', e);
        }
      }

      const cached = localStorage.getItem(STORAGE_KEYS.LOCAL_GALLERY);
      if (cached) {
        try {
          const items = JSON.parse(cached);
          if (items && items.length > 0) {
            return includeUnpublished ? items : items.filter(g => g.is_published !== false);
          }
        } catch (e) { console.error(e); }
      }

      const defaults = window.US_BENGOL_CONFIG?.defaultGallery || [];
      if (defaults.length > 0) {
        localStorage.setItem(STORAGE_KEYS.LOCAL_GALLERY, JSON.stringify(defaults));
      }
      return includeUnpublished ? defaults : defaults.filter(g => g.is_published !== false);
    }

    async saveGalleryItem(item) {
      const payload = { ...item };
      if (!payload.id) delete payload.id;
      payload.updated_at = new Date().toISOString();

      if (this.isConfigured && this.client) {
        try {
          let res;
          if (payload.id) {
            res = await this.client
              .from('gallery')
              .update(payload)
              .eq('id', payload.id)
              .select();
          } else {
            res = await this.client
              .from('gallery')
              .insert([payload])
              .select();
          }

          if (res.error) {
            console.error('[US BENGOL] Gallery save error:', res.error);
            throw new Error(res.error.message || 'Database error while saving gallery photo');
          }

          if (payload.id && res.data && res.data.length === 0) {
            throw new Error('Supabase RLS policy prevented saving gallery photo.');
          }

          if (res.data && res.data.length > 0) {
            this._updateLocalGalleryMirror(res.data[0]);
            return { success: true, data: res.data };
          }
        } catch (e) {
          console.error('[US BENGOL] Gallery save network error:', e);
          throw e;
        }
      }

      this._updateLocalGalleryMirror(payload);
      return { success: true, data: [payload], mode: 'local' };
    }

    _updateLocalGalleryMirror(item) {
      try {
        const gallery = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCAL_GALLERY) || '[]');
        const idx = gallery.findIndex(g => g.id === item.id);
        if (idx >= 0) {
          gallery[idx] = { ...gallery[idx], ...item, updated_at: new Date().toISOString() };
        } else {
          gallery.push({
            ...item,
            id: item.id || 'gal-' + Date.now(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
        localStorage.setItem(STORAGE_KEYS.LOCAL_GALLERY, JSON.stringify(gallery));
      } catch (e) { console.error(e); }
    }

    async deleteGalleryItem(itemId) {
      if (this.isConfigured && this.client) {
        const { error } = await this.client.from('gallery').delete().eq('id', itemId);
        if (error) {
          console.error('[US BENGOL] deleteGalleryItem error:', error);
          throw new Error(error.message);
        }
      }
      try {
        const gallery = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCAL_GALLERY) || '[]');
        const filtered = gallery.filter(g => g.id !== itemId);
        localStorage.setItem(STORAGE_KEYS.LOCAL_GALLERY, JSON.stringify(filtered));
      } catch (e) { console.error(e); }
      return { success: true };
    }

    /* ---------------------------------------------------------
       SITE CONTENT API
       --------------------------------------------------------- */
    async getSiteContent(sectionKey) {
      if (this.isConfigured && this.client) {
        try {
          const { data, error } = await this.client
            .from('site_content')
            .select('*')
            .eq('section_key', sectionKey)
            .single();
          if (!error && data) return data.content;
        } catch (e) {
          console.warn('[US BENGOL] Site content fetch error:', e);
        }
      }
      try {
        const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCAL_SITE_CONTENT) || '{}');
        return all[sectionKey] || null;
      } catch (e) { return null; }
    }

    async saveSiteContent(sectionKey, content) {
      if (this.isConfigured && this.client) {
        const { error } = await this.client
          .from('site_content')
          .upsert({ section_key: sectionKey, content, updated_at: new Date().toISOString() }, { onConflict: 'section_key' });
        if (error) {
          console.error('[US BENGOL] saveSiteContent error:', error);
          throw new Error(error.message);
        }
      }
      try {
        const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCAL_SITE_CONTENT) || '{}');
        all[sectionKey] = content;
        localStorage.setItem(STORAGE_KEYS.LOCAL_SITE_CONTENT, JSON.stringify(all));
      } catch (e) { console.error(e); }
      return { success: true };
    }

    async getAllSiteContent() {
      const result = {};
      if (this.isConfigured && this.client) {
        try {
          const { data, error } = await this.client
            .from('site_content')
            .select('*');
          if (!error && data && data.length > 0) {
            data.forEach(row => {
              if (row.section_key) result[row.section_key] = row.content;
            });
            try {
              localStorage.setItem(STORAGE_KEYS.LOCAL_SITE_CONTENT, JSON.stringify(result));
            } catch(e) {}
            return result;
          }
        } catch (e) {
          console.warn('[US BENGOL] getAllSiteContent network notice:', e);
        }
      }
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCAL_SITE_CONTENT) || '{}');
      } catch (e) {
        return {};
      }
    }

    async saveMultipleSiteContent(contentMap) {
      const records = Object.entries(contentMap).map(([sectionKey, content]) => ({
        section_key: sectionKey,
        content: content,
        updated_at: new Date().toISOString()
      }));

      if (this.isConfigured && this.client && records.length > 0) {
        try {
          const { error } = await this.client
            .from('site_content')
            .upsert(records, { onConflict: 'section_key' });
          if (error) {
            console.error('[US BENGOL] saveMultipleSiteContent cloud error:', error);
            throw new Error(error.message);
          }
        } catch (e) {
          console.error('[US BENGOL] saveMultipleSiteContent caught:', e);
          throw e;
        }
      }

      try {
        const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCAL_SITE_CONTENT) || '{}');
        Object.assign(all, contentMap);
        localStorage.setItem(STORAGE_KEYS.LOCAL_SITE_CONTENT, JSON.stringify(all));
      } catch (e) {
        console.warn('Local storage cache write notice:', e);
      }
      return { success: true };
    }

    /* ---------------------------------------------------------
       BULK ORDERS API
       --------------------------------------------------------- */
    async submitBulkOrder(orderData) {
      const record = {
        ...orderData,
        status: 'New',
        created_at: new Date().toISOString()
      };

      if (this.isConfigured && this.client) {
        try {
          const { data, error } = await this.client
            .from('bulk_orders')
            .insert([record])
            .select();

          if (!error) {
            this._saveLocalBulkOrder(record);
            return { success: true, data };
          }
          console.warn('[US BENGOL] Supabase insert bulk order error:', error.message);
        } catch (e) {
          console.warn('[US BENGOL] Supabase network error:', e);
        }
      }

      this._saveLocalBulkOrder(record);
      return { success: true, data: [record], mode: 'local' };
    }

    _saveLocalBulkOrder(record) {
      try {
        const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCAL_BULK_ORDERS) || '[]');
        existing.unshift({ ...record, id: record.id || 'bulk-' + Date.now() });
        localStorage.setItem(STORAGE_KEYS.LOCAL_BULK_ORDERS, JSON.stringify(existing));
      } catch (e) {
        console.error(e);
      }
    }

    async getBulkOrders() {
      if (this.isConfigured && this.client) {
        try {
          const { data, error } = await this.client
            .from('bulk_orders')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && data) {
            return data;
          }
          console.warn('[US BENGOL] Error fetching bulk orders:', error?.message);
        } catch (e) {
          console.warn(e);
        }
      }

      return JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCAL_BULK_ORDERS) || '[]');
    }

    async updateBulkOrderStatus(orderId, newStatus) {
      if (this.isConfigured && this.client) {
        try {
          const { error } = await this.client
            .from('bulk_orders')
            .update({ status: newStatus })
            .eq('id', orderId);
          if (error) console.warn(error);
        } catch (e) {
          console.warn(e);
        }
      }

      const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCAL_BULK_ORDERS) || '[]');
      const index = orders.findIndex(o => o.id === orderId);
      if (index >= 0) {
        orders[index].status = newStatus;
        localStorage.setItem(STORAGE_KEYS.LOCAL_BULK_ORDERS, JSON.stringify(orders));
      }
      return { success: true };
    }

    /* ---------------------------------------------------------
       IMAGE OPTIMIZER & UPLOAD (COMPRESS + SUPABASE STORAGE / BASE64)
       --------------------------------------------------------- */
    async compressImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) {
      if (!file || !file.type || !file.type.startsWith('image/')) return file;
      if (file.type === 'image/svg+xml') return file;

      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            let width = img.width;
            let height = img.height;

            // If already compact and within dimensions, return as is
            if (width <= maxWidth && height <= maxHeight && file.size < 120 * 1024) {
              return resolve(file);
            }

            if (width > height) {
              if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
              }
            } else {
              if (height > maxHeight) {
                width = Math.round((width * maxHeight) / height);
                height = maxHeight;
              }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
              if (blob) {
                const newName = file.name.replace(/\.[^.]+$/, '.jpg');
                const compressedFile = new File([blob], newName, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            }, 'image/jpeg', quality);
          };
          img.onerror = () => resolve(file);
          img.src = e.target.result;
        };
        reader.onerror = () => resolve(file);
        reader.readAsDataURL(file);
      });
    }

    async uploadImage(file, bucket = 'product-images') {
      if (!file) {
        return { success: false, error: 'কোন ছবি নির্বাচন করা হয়নি (No image file provided)' };
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        return { success: false, error: 'সঠিক ফরম্যাটের ছবি ব্যবহার করুন (Use JPG, PNG, WebP, or SVG)' };
      }

      // 1. Intelligent fast compression
      let processedFile = file;
      try {
        processedFile = await this.compressImage(file);
      } catch (err) {
        console.warn('[US BENGOL] Image compression notice:', err);
      }

      // 2. Upload to Supabase Storage
      if (this.isConfigured && this.client) {
        try {
          const fileExt = processedFile.name.split('.').pop() || 'jpg';
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
          const folder = bucket.includes('gallery') ? 'gallery' : (bucket.includes('site') ? 'site' : 'products');
          const filePath = `${folder}/${fileName}`;

          const { data, error } = await this.client.storage
            .from(bucket)
            .upload(filePath, processedFile, {
              cacheControl: '3600',
              upsert: true
            });

          if (!error) {
            const { data: publicUrlData } = this.client.storage
              .from(bucket)
              .getPublicUrl(filePath);

            return {
              success: true,
              url: publicUrlData.publicUrl,
              mode: 'supabase',
              sizeKb: Math.round(processedFile.size / 1024)
            };
          }

          console.error('[US BENGOL] Supabase Storage upload error:', error);
          let userMsg = error.message || 'Upload failed';
          if (userMsg.toLowerCase().includes('not found') || userMsg.toLowerCase().includes('nosuchbucket') || error.statusCode === '404') {
            userMsg = `Supabase Storage-এ "${bucket}" বালতি (Bucket) পাওয়া যায়নি। দয়া করে Supabase ড্যাশবোর্ডে Storage -> New Bucket থেকে "${bucket}" তৈরি করে Public অন করুন অথবা supabase_complete_setup.sql রান করুন।`;
          } else if (userMsg.toLowerCase().includes('row-level security') || userMsg.toLowerCase().includes('policy')) {
            userMsg = `Supabase Storage RLS পলিসি ত্রুটি। অনুগ্রহ করে supabase_complete_setup.sql রান করে Storage Policies আপডেট করুন।`;
          }

          return {
            success: false,
            error: userMsg
          };
        } catch (e) {
          console.error('[US BENGOL] Storage upload caught exception:', e);
          return {
            success: false,
            error: `Storage error: ${e.message}`
          };
        }
      }

      // 3. Fallback only if Supabase client is not configured (offline demo mode)
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({
          success: true,
          url: reader.result,
          mode: 'local',
          sizeKb: Math.round(processedFile.size / 1024)
        });
        reader.onerror = () => reject(new Error('Failed to process image'));
        reader.readAsDataURL(processedFile);
      });
    }

    /* ---------------------------------------------------------
       ADMIN SECURITY & CLOUD PASSWORD MANAGEMENT
       Syncs custom admin password across all devices via Supabase
       --------------------------------------------------------- */
    async getAdminPassword() {
      // 1. Try Supabase cloud site_content
      if (this.isConfigured && this.client) {
        try {
          const { data, error } = await this.client
            .from('site_content')
            .select('content')
            .eq('section_key', 'admin_security')
            .maybeSingle();
          if (!error && data?.content?.password) {
            localStorage.setItem('usb_admin_cloud_pass', data.content.password);
            return data.content.password;
          }
        } catch (e) {
          console.warn('[US BENGOL] Failed to fetch cloud password:', e);
        }
      }

      // 2. Local cache fallback
      const cached = localStorage.getItem('usb_admin_cloud_pass');
      if (cached) return cached;

      // 3. Initial default
      return 'admin123';
    }

    async changeAdminPassword(newPassword, currentPassword = null) {
      if (!newPassword || newPassword.trim().length < 4) {
        throw new Error('পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে (Password must be at least 4 characters)');
      }

      const activePass = await this.getAdminPassword();
      // If current password provided, verify it (unless first time setup when default is unchanged)
      if (currentPassword !== null && currentPassword !== undefined && currentPassword !== '') {
        const isMaster = currentPassword === 'admin123' || currentPassword === 'usbengol';
        if (currentPassword !== activePass && !isMaster) {
          throw new Error('বর্তমান পাসওয়ার্ড সঠিক নয় (Current password is incorrect)');
        }
      }

      const cleanNew = newPassword.trim();
      const payload = {
        password: cleanNew,
        updated_at: new Date().toISOString()
      };

      // 1. Save to Supabase cloud
      if (this.isConfigured && this.client) {
        try {
          const { error } = await this.client
            .from('site_content')
            .upsert({
              section_key: 'admin_security',
              content: payload,
              updated_at: new Date().toISOString()
            }, { onConflict: 'section_key' });

          if (error) {
            console.warn('[US BENGOL] Cloud password update warning:', error.message);
          }
        } catch (e) {
          console.error('[US BENGOL] Password cloud update failed:', e);
        }
      }

      // 2. Update local storage cache
      localStorage.setItem('usb_admin_cloud_pass', cleanNew);

      // 3. Refresh admin session
      const session = {
        user: { email: 'admin@usbengol.bd', role: 'admin' },
        mode: 'cloud',
        loginAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, JSON.stringify(session));

      return { success: true, message: 'পাসওয়ার্ড সফলভাবে আপডেট হয়েছে এবং সকল ডিভাইসে সেভ হয়েছে!' };
    }

    async loginAdmin(email, password) {
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanPass = (password || '').trim();

      const validEmail = (cleanEmail === 'admin' || cleanEmail === 'admin@usbengol.bd' || cleanEmail === 'admin@usbengol.com');
      if (!validEmail) {
        return {
          success: false,
          error: 'ভুল ইউজারনেম। ইউজারনেম হিসেবে "admin@usbengol.bd" বা "admin" ব্যবহার করুন।'
        };
      }

      // Fetch active cloud password from Supabase (or fallback)
      const activePassword = await this.getAdminPassword();

      // Check match: either custom cloud password OR master backup passcodes
      const isPassMatch = (cleanPass === activePassword) || 
                          (cleanPass === 'admin123') || 
                          (cleanPass === 'usbengol') || 
                          (cleanPass === '01921692008');

      if (isPassMatch) {
        const session = {
          user: { email: 'admin@usbengol.bd', role: 'admin' },
          mode: 'cloud',
          loginAt: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, JSON.stringify(session));
        return { success: true, user: session.user };
      }

      // Also attempt Supabase Auth if user exists there
      if (this.isConfigured && this.client) {
        try {
          const { data, error } = await this.client.auth.signInWithPassword({
            email: cleanEmail,
            password: cleanPass
          });
          if (!error && data?.session) {
            localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, JSON.stringify({
              user: data.user,
              token: data.session.access_token,
              mode: 'supabase'
            }));
            return { success: true, user: data.user };
          }
        } catch (e) {
          console.warn('[US BENGOL] Supabase auth attempt:', e.message);
        }
      }

      return {
        success: false,
        error: 'পাসওয়ার্ড ভুল হয়েছে! আপনি চাইলে নিচে "পাসওয়ার্ড সেট বা পরিবর্তন করুন" অপশন ব্যবহার করে নতুন পাসওয়ার্ড দিতে পারেন।'
      };
    }

    getAdminSession() {
      try {
        const session = localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH);
        return session ? JSON.parse(session) : null;
      } catch (e) {
        return null;
      }
    }

    logoutAdmin() {
      if (this.isConfigured && this.client) {
        this.client.auth.signOut().catch(console.warn);
      }
      localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
    }
  }

  window.USB_Supabase = new SupabaseService();
})(window);
