/**
 * US BENGOL - Main Application Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  'use strict';

  // 1. Mobile Menu Drawer Controller
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileNavDrawer = document.getElementById('mobile-nav-drawer');
  const mobileNavBackdrop = document.getElementById('mobile-nav-backdrop');

  function openMobileMenu() {
    if (!mobileNavDrawer || !mobileMenuBtn) return;
    mobileNavDrawer.classList.add('open');
    if (mobileNavBackdrop) mobileNavBackdrop.classList.add('open');
    mobileMenuBtn.classList.add('active');
    mobileMenuBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('mobile-nav-open');
  }

  function closeMobileMenu() {
    if (!mobileNavDrawer || !mobileMenuBtn) return;
    mobileNavDrawer.classList.remove('open');
    if (mobileNavBackdrop) mobileNavBackdrop.classList.remove('open');
    mobileMenuBtn.classList.remove('active');
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('mobile-nav-open');
  }

  if (mobileMenuBtn && mobileNavDrawer) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = mobileNavDrawer.classList.contains('open');
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    if (mobileNavBackdrop) {
      mobileNavBackdrop.addEventListener('click', closeMobileMenu);
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNavDrawer.classList.contains('open')) {
        closeMobileMenu();
      }
    });

    // Close mobile drawer when clicking any link or CTA inside it
    mobileNavDrawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        closeMobileMenu();
      });
    });

    // Automatically close drawer when window resizes back to desktop (> 1024px)
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1024 && mobileNavDrawer.classList.contains('open')) {
        closeMobileMenu();
      }
    });
  }

  // 2. Render "How We Prepare" Steps from Central Configuration
  renderPreparationSteps();

  // 3. Render Why Us Pillars & Bulk Audiences from Central Configuration
  renderWhyUsPillars();
  renderBulkAudiences();

  // 4. Initialize Data & Products
  if (window.USB_Products) {
    await window.USB_Products.init();
  }

  // 5. Initialize Modals
  if (window.USB_Modal) {
    window.USB_Modal.init();
  }

  // 6. Initialize Motion & Scroll Observers
  if (window.USB_Animations) {
    window.USB_Animations.init();
  }

  // 7. Global WhatsApp Order Now buttons
  document.querySelectorAll('[data-action="open-bulk-modal"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const product = btn.getAttribute('data-product');
      window.USB_Modal.openBulkModal(product);
    });
  });

  document.querySelectorAll('[data-action="whatsapp-inquiry"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const msg = btn.getAttribute('data-msg');
      const url = window.USB_WhatsApp.createGeneralInquiryUrl(msg);
      window.USB_WhatsApp.open(url);
    });
  });
});

/**
 * Renders the 5 preparation steps configured in config/content.js
 */
function renderPreparationSteps() {
  const container = document.getElementById('prep-steps-container');
  if (!container || !window.US_BENGOL_CONFIG?.preparation) return;

  const steps = window.US_BENGOL_CONFIG.preparation;
  container.innerHTML = steps.map((item, idx) => `
    <div class="prep-step-card" data-step="${item.step}">
      <div class="prep-step-media">
        <img 
          src="${item.image}" 
          alt="${item.alt || item.title}" 
          class="prep-step-img"
          loading="lazy"
          onerror="this.onerror=null; this.src='${item.fallbackImage || 'images/prep/fallback-1.svg'}';"
        >
      </div>

      <div class="prep-step-content">
        <span class="step-num-pill">STAGE ${item.step}</span>
        <h3 class="step-title">${item.title}</h3>
        ${item.bengaliTitle ? `<div class="step-bengali-title bengali-accent">${item.bengaliTitle}</div>` : ''}
        <p class="step-desc">${item.description}</p>
      </div>
    </div>
  `).join('');
}

/**
 * Renders the 4 Why Us Pillars from config/content.js
 */
function renderWhyUsPillars() {
  const container = document.getElementById('why-us-grid');
  if (!container || !window.US_BENGOL_CONFIG?.whyUsPillars) return;

  const pillars = window.US_BENGOL_CONFIG.whyUsPillars;
  container.innerHTML = pillars.map(p => `
    <div class="why-card">
      <div class="why-card-top">
        <span class="why-number">${p.number}</span>
        ${p.subtitle ? `<span class="why-bengali-tag bengali-accent">${p.subtitle}</span>` : ''}
      </div>
      <h3 class="why-title">${p.title}</h3>
      <p class="why-desc">${p.description}</p>
    </div>
  `).join('');
}

/**
 * Renders Bulk Audiences from config/content.js
 */
function renderBulkAudiences() {
  const container = document.getElementById('bulk-audiences-cloud');
  if (!container || !window.US_BENGOL_CONFIG?.bulkAudiences) return;

  const list = window.US_BENGOL_CONFIG.bulkAudiences;
  container.innerHTML = list.map(item => `
    <span class="bulk-audience-chip">${item}</span>
  `).join('');
}
