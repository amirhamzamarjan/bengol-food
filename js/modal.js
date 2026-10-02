/**
 * US BENGOL - Interactive Modal & Sheet Controller
 * 
 * Manages:
 * 1. Product Detail Modal with interactive Quantity Stepper & WhatsApp ordering
 * 2. Bulk & Institutional Order Modal with form validation and Supabase submission
 */

(function (window) {
  'use strict';

  let currentModalProduct = null;
  let currentQuantity = 1;

  function initModals() {
    // ESC key listener to close modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAllModals();
      }
    });

    // Close on backdrop click
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          closeAllModals();
        }
      });
    });

    // Attach bulk form submit listener
    const bulkForm = document.getElementById('bulk-order-form');
    if (bulkForm) {
      bulkForm.addEventListener('submit', handleBulkFormSubmit);
    }
  }

  /* ---------------------------------------------------------
     PRODUCT DETAIL MODAL
     --------------------------------------------------------- */
  function openProductModal(productId) {
    const product = window.USB_Products.getProductById(productId);
    if (!product) return;

    currentModalProduct = product;
    currentQuantity = 1;

    const modal = document.getElementById('product-modal');
    if (!modal) return;

    const imgEl = modal.querySelector('#modal-product-img');
    const titleEl = modal.querySelector('#modal-product-title');
    const bengaliEl = modal.querySelector('#modal-product-bengali');
    const descEl = modal.querySelector('#modal-product-desc');
    const priceEl = modal.querySelector('#modal-product-price');
    const qtyValEl = modal.querySelector('#modal-quantity-val');
    const totalRowEl = modal.querySelector('#modal-order-total-row');
    const totalValEl = modal.querySelector('#modal-total-val');
    const badgeEl = modal.querySelector('#modal-product-badge');
    const orderBtn = modal.querySelector('#modal-whatsapp-order-btn');

    if (imgEl) {
      imgEl.src = product.image_url;
      imgEl.alt = product.name;
    }
    if (titleEl) titleEl.textContent = product.name;
    if (bengaliEl) bengaliEl.textContent = product.bengali_name || product.bengaliName || '';
    if (descEl) descEl.textContent = product.description || '';
    if (priceEl) priceEl.textContent = window.USB_Products.formatPrice(product.price);
    if (qtyValEl) qtyValEl.textContent = currentQuantity;
    if (badgeEl) {
      badgeEl.textContent = product.badge || 'Fresh Everyday';
    }

    updateTotalDisplay(totalRowEl, totalValEl, product.price, currentQuantity);

    if (orderBtn) {
      orderBtn.onclick = () => {
        const orderUrl = window.USB_WhatsApp.createProductOrderUrl(
          product.name,
          currentQuantity,
          product.price
        );
        window.USB_WhatsApp.open(orderUrl);
      };
    }

    modal.classList.add('active');
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
  }

  function adjustQuantity(delta) {
    const newQty = currentQuantity + delta;
    if (newQty < 1) return;
    currentQuantity = newQty;

    const qtyValEl = document.querySelector('#modal-quantity-val');
    if (qtyValEl) qtyValEl.textContent = currentQuantity;

    if (currentModalProduct) {
      const totalRowEl = document.querySelector('#modal-order-total-row');
      const totalValEl = document.querySelector('#modal-total-val');
      updateTotalDisplay(totalRowEl, totalValEl, currentModalProduct.price, currentQuantity);
    }
  }

  function updateTotalDisplay(rowEl, valEl, price, qty) {
    const numPrice = parseFloat(price) || 0;
    if (numPrice > 0) {
      if (rowEl) rowEl.style.display = 'flex';
      if (valEl) valEl.textContent = `৳${(numPrice * qty).toFixed(2)}`;
    } else {
      if (rowEl) rowEl.style.display = 'flex';
      if (valEl) valEl.textContent = '৳0.00';
    }
  }

  /* ---------------------------------------------------------
     BULK ORDER MODAL
     --------------------------------------------------------- */
  function openBulkModal(preselectedProduct) {
    const modal = document.getElementById('bulk-modal');
    if (!modal) return;

    const form = document.getElementById('bulk-order-form');
    const successBanner = document.getElementById('bulk-success-banner');

    if (form) {
      form.style.display = 'grid';
      form.reset();
      if (preselectedProduct) {
        const prodSelect = form.querySelector('#bulk-product');
        if (prodSelect) prodSelect.value = preselectedProduct;
      }
    }
    if (successBanner) {
      successBanner.classList.remove('active');
    }

    modal.classList.add('active');
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
  }

  async function handleBulkFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');

    const formData = {
      full_name: form.elements['full_name'].value.trim(),
      organization: form.elements['organization'].value.trim(),
      phone: form.elements['phone'].value.trim(),
      email: form.elements['email'].value.trim(),
      product: form.elements['product'].value,
      quantity: form.elements['quantity'].value.trim(),
      delivery_location: form.elements['delivery_location'].value.trim(),
      preferred_schedule: form.elements['preferred_schedule'].value.trim(),
      message: form.elements['message'].value.trim()
    };

    if (!formData.full_name || !formData.phone || !formData.product || !formData.quantity || !formData.delivery_location) {
      alert('Please fill in all required fields.');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting Request...';
    }

    try {
      await window.USB_Supabase.submitBulkOrder(formData);

      // Show success screen
      form.style.display = 'none';
      const successBanner = document.getElementById('bulk-success-banner');
      if (successBanner) {
        successBanner.classList.add('active');
      }
    } catch (err) {
      console.error('Bulk submission error:', err);
      const phone = window.US_BENGOL_CONFIG?.brand?.phoneDisplay || '+880 1000-000000';
      alert(`An unexpected error occurred. Please reach us directly on WhatsApp at ${phone}.`);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Request';
      }
    }
  }

  function closeAllModals() {
    const modals = document.querySelectorAll('.modal-backdrop');
    modals.forEach(m => m.classList.remove('active'));
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    currentModalProduct = null;
  }

  window.USB_Modal = {
    init: initModals,
    openProductModal: openProductModal,
    openBulkModal: openBulkModal,
    adjustQuantity: adjustQuantity,
    close: closeAllModals
  };
})(window);
