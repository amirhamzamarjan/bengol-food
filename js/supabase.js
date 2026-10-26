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
        url: localStorage.getItem(STORAGE_KEYS.SUPABASE_URL) || '',
        key: localStorage.getItem(STORAGE_KEYS.SUPABASE_KEY) || '',
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
      if (this.isConfigured && this.client) {
        try {
          const { data, error } = await this.client
            .from('products')
            .upsert(product)
            .select();

          if (!error) {
            await this._updateLocalProductMirror(product);
            return { success: true, data };
          }
          console.warn('[US BENGOL] Supabase saveProduct error:', error.message);
        } catch (e) {
          console.warn('[US BENGOL] Supabase save error:', e);
        }
      }

      await this._updateLocalProductMirror(product);
      return { success: true, data: [product], mode: 'local' };
    }

    async _updateLocalProductMirror(product) {
      const products = await this.getProducts();
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
    }

    async deleteProduct(productId) {
      if (this.isConfigured && this.client) {
        try {
          const { error } = await this.client
            .from('products')
            .delete()
            .eq('id', productId);
          if (error) console.warn(error);
        } catch (e) {
          console.warn(e);
        }
      }

      const products = await this.getProducts();
      const filtered = products.filter(p => p.id !== productId);
      localStorage.setItem(STORAGE_KEYS.LOCAL_PRODUCTS, JSON.stringify(filtered));
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
      if (this.isConfigured && this.client) {
        try {
          const { data, error } = await this.client
            .from('gallery')
            .upsert(item)
            .select();
          if (!error) {
            this._updateLocalGalleryMirror(item);
            return { success: true, data };
          }
          console.warn('[US BENGOL] Gallery save error:', error.message);
        } catch (e) {
          console.warn('[US BENGOL] Gallery save network error:', e);
        }
      }

      this._updateLocalGalleryMirror(item);
      return { success: true, data: [item], mode: 'local' };
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
        try {
          const { error } = await this.client.from('gallery').delete().eq('id', itemId);
          if (error) console.warn(error);
        } catch (e) { console.warn(e); }
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
        try {
          const { error } = await this.client
            .from('site_content')
            .upsert({ section_key: sectionKey, content, updated_at: new Date().toISOString() });
          if (error) console.warn(error);
        } catch (e) { console.warn(e); }
      }
      try {
        const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCAL_SITE_CONTENT) || '{}');
        all[sectionKey] = content;
        localStorage.setItem(STORAGE_KEYS.LOCAL_SITE_CONTENT, JSON.stringify(all));
      } catch (e) { console.error(e); }
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
       IMAGE UPLOAD (SUPABASE STORAGE + BASE64 FALLBACK)
       --------------------------------------------------------- */
    async uploadImage(file, bucket = 'product-images') {
      // Validate file
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        return { success: false, error: 'Invalid file type. Use JPG, PNG, WebP, or GIF.' };
      }
      if (file.size > 5 * 1024 * 1024) {
        return { success: false, error: 'File too large. Maximum 5 MB.' };
      }

      if (this.isConfigured && this.client) {
        try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
          const folder = bucket === 'gallery-images' ? 'gallery' : 'products';
          const filePath = `${folder}/${fileName}`;

          const { data, error } = await this.client.storage
            .from(bucket)
            .upload(filePath, file);

          if (!error) {
            const { data: publicUrlData } = this.client.storage
              .from(bucket)
              .getPublicUrl(filePath);

            return { success: true, url: publicUrlData.publicUrl };
          }
          console.warn('[US BENGOL] Storage upload error:', error.message);
        } catch (e) {
          console.warn('[US BENGOL] Storage upload failed:', e);
        }
      }

      // Local fallback: read as Data URL
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ success: true, url: reader.result, mode: 'local' });
        reader.onerror = () => reject(new Error('Failed to read image file'));
        reader.readAsDataURL(file);
      });
    }

    /* ---------------------------------------------------------
       ADMIN AUTHENTICATION
       --------------------------------------------------------- */
    async loginAdmin(email, password) {
      // 1. If Supabase configured, attempt real auth
      if (this.isConfigured && this.client) {
        try {
          const { data, error } = await this.client.auth.signInWithPassword({
            email,
            password
          });
          if (!error && data?.session) {
            localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, JSON.stringify({
              user: data.user,
              token: data.session.access_token,
              mode: 'supabase'
            }));
            return { success: true, user: data.user };
          }
          if (error) {
            return { success: false, error: error.message };
          }
        } catch (e) {
          return { success: false, error: e.message };
        }
      }

      // 2. Demo Mode / Passcode Access
      if (
        (email === 'admin' || email === 'admin@usbengol.com') &&
        (password === 'admin123' || password === 'usbengol' || password === '01921692008')
      ) {
        const session = {
          user: { email: 'admin@usbengol.com', role: 'admin' },
          mode: 'demo',
          loginAt: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, JSON.stringify(session));
        return { success: true, user: session.user, mode: 'demo' };
      }

      return {
        success: false,
        error: 'Invalid credentials. For quick demo access, use: admin@usbengol.com / admin123'
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
