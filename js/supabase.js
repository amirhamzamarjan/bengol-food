/**
 * US BENGOL - Supabase Client & Local Data Store Bridge
 * 
 * Provides seamless integration with Supabase PostgreSQL and Storage,
 * with intelligent client-side fallback to localStorage so that the site
 * remains 100% operational offline, during development, and before
 * live Supabase credentials are provided.
 */

(function (window) {
  'use strict';

  const STORAGE_KEYS = {
    SUPABASE_URL: 'usb_supabase_url',
    SUPABASE_KEY: 'usb_supabase_anon_key',
    LOCAL_PRODUCTS: 'usb_local_products',
    LOCAL_BULK_ORDERS: 'usb_local_bulk_orders',
    LOCAL_SITE_CONTENT: 'usb_local_site_content',
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
      // 1. Try Supabase if configured
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

      // 2. Resilient local fallback from localStorage or config/content.js
      const cached = localStorage.getItem(STORAGE_KEYS.LOCAL_PRODUCTS);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {
          console.error(e);
        }
      }

      const defaults = window.US_BENGOL_CONFIG?.defaultProducts || [];
      // Persist defaults to local store
      localStorage.setItem(STORAGE_KEYS.LOCAL_PRODUCTS, JSON.stringify(defaults));
      return defaults;
    }

    async saveProduct(product) {
      // If configured in Supabase:
      if (this.isConfigured && this.client) {
        try {
          const { data, error } = await this.client
            .from('products')
            .upsert(product)
            .select();

          if (!error) {
            // Also update local mirror
            await this._updateLocalProductMirror(product);
            return { success: true, data };
          }
          console.warn('[US BENGOL] Supabase saveProduct error:', error.message);
        } catch (e) {
          console.warn('[US BENGOL] Supabase save error:', e);
        }
      }

      // Fallback: save to local mirror
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
       BULK ORDERS API
       --------------------------------------------------------- */
    async submitBulkOrder(orderData) {
      const record = {
        ...orderData,
        status: 'New',
        created_at: new Date().toISOString()
      };

      // 1. Try Supabase
      if (this.isConfigured && this.client) {
        try {
          const { data, error } = await this.client
            .from('bulk_orders')
            .insert([record])
            .select();

          if (!error) {
            // Also save copy locally for convenience
            this._saveLocalBulkOrder(record);
            return { success: true, data };
          }
          console.warn('[US BENGOL] Supabase insert bulk order error:', error.message);
        } catch (e) {
          console.warn('[US BENGOL] Supabase network error:', e);
        }
      }

      // 2. Save locally
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
    async uploadImage(file) {
      if (this.isConfigured && this.client) {
        try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
          const filePath = `products/${fileName}`;

          const { data, error } = await this.client.storage
            .from('product-images')
            .upload(filePath, file);

          if (!error) {
            const { data: publicUrlData } = this.client.storage
              .from('product-images')
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
      // If user enters 'admin' or 'admin@usbengol.com' and password 'admin123' or 'usbengol'
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
