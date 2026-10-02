/**
 * US BENGOL - Product Showcase Controller
 * 
 * Handles rendering the core products:
 * 01 - Atta Roti
 * 02 - Maida Roti
 * 03 - Parota
 * 
 * Dynamically binds prices from database with initial default ৳0.00.
 */

(function (window) {
  'use strict';

  let currentProducts = [];

  function formatPrice(val) {
    const num = parseFloat(val) || 0;
    return `৳${num.toFixed(2)}`;
  }

  async function loadAndRenderProducts() {
    const gridEl = document.getElementById('products-grid');
    if (!gridEl) return;

    try {
      currentProducts = await window.USB_Supabase.getProducts();
    } catch (e) {
      console.warn('Error loading products from data layer:', e);
      currentProducts = window.US_BENGOL_CONFIG?.defaultProducts || [];
    }

    // Filter visible only
    const visibleProducts = currentProducts.filter(p => p.is_visible !== false);

    if (visibleProducts.length === 0) {
      gridEl.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--color-brown-muted);">
          <p>Fresh daily batches are being prepared. Please check back shortly or contact us on WhatsApp.</p>
        </div>
      `;
      return;
    }

    gridEl.innerHTML = visibleProducts.map((prod, index) => {
      const isAvail = prod.is_available !== false;
      const priceText = formatPrice(prod.price);
      const safeId = prod.id || `prod-${index}`;

      return `
        <article class="product-tile" data-product-id="${safeId}">
          <div class="tile-media" onclick="window.USB_Modal.openProductModal('${safeId}')" role="button" tabindex="0" aria-label="View details for ${prod.name}">
            <img 
              src="${prod.image_url}" 
              alt="${prod.name} - Fresh Bangladeshi Roti" 
              class="tile-img" 
              loading="lazy"
              onerror="this.onerror=null; this.src='images/ataruti.png';"
            >
            ${prod.badge ? `<span class="tile-badge">${prod.badge}</span>` : ''}
            <span class="tile-availability ${isAvail ? '' : 'unavailable'}">
              <span class="status-pip"></span>
              ${isAvail ? 'Available' : 'Unavailable'}
            </span>
          </div>

          <div class="tile-content">
            <div class="tile-title-group">
              <h3 class="tile-name">
                <span>${prod.name}</span>
                ${prod.bengali_name || prod.bengaliName ? `<span class="tile-bengali-name bengali-accent">${prod.bengali_name || prod.bengaliName}</span>` : ''}
              </h3>
            </div>

            <p class="tile-desc">${prod.shortDescription || prod.description || ''}</p>

            <div class="tile-footer">
              <div class="tile-price-block">
                <span class="price-label">Price per pack</span>
                <span class="tile-price" data-price="${prod.price}">${priceText}</span>
              </div>

              <button 
                type="button" 
                class="btn btn-primary tile-order-btn"
                onclick="window.USB_Modal.openProductModal('${safeId}')"
                aria-label="Order ${prod.name}"
              >
                Order
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  function getProductById(id) {
    return currentProducts.find(p => p.id === id || p.slug === id);
  }

  window.USB_Products = {
    init: loadAndRenderProducts,
    getProductById: getProductById,
    formatPrice: formatPrice,
    getAll: () => currentProducts
  };
})(window);
