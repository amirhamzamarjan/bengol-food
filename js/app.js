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

  // 3. Render Why Us Pillars & Bulk Audiences from Central Configuration
  renderWhyUsPillars();
  renderBulkAudiences();

  // 4. Initialize Data & Products
  if (window.USB_Products) {
    await window.USB_Products.init();
  }

  // 4b. Initialize Pill Navigation
  if (window.USB_PillNav) {
    window.USB_PillNav.init();
  }

  // 4c. Initialize Scroll-Driven Production Story
  if (window.USB_ProductionStory) {
    window.USB_ProductionStory.init();
  }

  // 4d. Initialize Gallery
  if (window.USB_Gallery) {
    await window.USB_Gallery.init();
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

  // 8. Dynamic Cloud Content sync (from Supabase site_content)
  loadDynamicSiteContent();
});

async function loadDynamicSiteContent() {
  if (!window.USB_Supabase) return;
  try {
    const general = await window.USB_Supabase.getSiteContent('general_content');
    if (general) {
      if (general.hero_title) {
        const h1 = document.querySelector('.hero-title');
        if (h1) h1.innerHTML = general.hero_title.replace(/\n/g, '<br>');
      }
      if (general.hero_desc) {
        const lead = document.querySelector('.hero-lead');
        if (lead) lead.textContent = general.hero_desc;
      }
      if (general.phone && window.US_BENGOL_CONFIG?.contact) {
        window.US_BENGOL_CONFIG.contact.phone = general.phone;
      }
    }
  } catch (e) {
    console.warn('Site content dynamic load notice:', e);
  }
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
