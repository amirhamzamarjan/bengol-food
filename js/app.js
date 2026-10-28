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
    const all = await window.USB_Supabase.getAllSiteContent();
    if (!all || Object.keys(all).length === 0) return;

    // 1. SECTION IMAGES
    const secImgs = all['section_images'];
    if (secImgs) {
      if (secImgs.hero_image) {
        const heroImg = document.getElementById('hero-main-img');
        if (heroImg) heroImg.src = secImgs.hero_image;
      }
      if (secImgs.story_image) {
        const storyImg = document.getElementById('story-main-img');
        if (storyImg) storyImg.src = secImgs.story_image;
      }
      if (secImgs.diet_image) {
        const dietImg = document.getElementById('diet-main-img');
        if (dietImg) dietImg.src = secImgs.diet_image;
      }
      if (secImgs.logo_image) {
        const topLogo = document.getElementById('site-brand-logo');
        if (topLogo) topLogo.src = secImgs.logo_image;
        const footerLogo = document.getElementById('site-footer-logo');
        if (footerLogo) footerLogo.src = secImgs.logo_image;
      }
    }

    // 2. GENERAL CONTENT & HERO
    const gen = all['general_content'];
    if (gen) {
      if (gen.hero_title) {
        const h1 = document.querySelector('.hero-title');
        if (h1) h1.innerHTML = gen.hero_title.replace(/\n/g, '<br>');
      }
      if (gen.hero_desc) {
        const lead = document.querySelector('.hero-lead');
        if (lead) lead.textContent = gen.hero_desc;
      }
      if (gen.hero_micro_tag) {
        const microBadge = document.querySelector('.hero-micro-tag .badge');
        if (microBadge) microBadge.innerHTML = gen.hero_micro_tag;
      }
      if (gen.hero_card_title) {
        const cardTitle = document.querySelector('.hero-floating-card strong');
        if (cardTitle) cardTitle.textContent = gen.hero_card_title;
      }
      if (gen.hero_card_subtitle) {
        const cardSubtitle = document.querySelector('.hero-floating-card span');
        if (cardSubtitle) cardSubtitle.textContent = gen.hero_card_subtitle;
      }
      if (gen.hero_chip) {
        const chip = document.querySelector('.hero-secondary-chip span:last-child');
        if (chip) chip.textContent = gen.hero_chip;
      }

      // WhatsApp & Phone update
      if (gen.phone) {
        if (window.US_BENGOL_CONFIG?.brand) {
          window.US_BENGOL_CONFIG.brand.phoneDisplay = gen.phone;
        }
        document.querySelectorAll('.footer-contact-item a').forEach(a => a.textContent = gen.phone);
        const contactBarPhone = document.querySelector('.final-contact-bar strong:first-of-type');
        if (contactBarPhone && contactBarPhone.parentElement) {
          contactBarPhone.parentElement.innerHTML = `<strong>WhatsApp:</strong> ${gen.phone}`;
        }
      }
      if (gen.whatsapp_digits) {
        if (window.US_BENGOL_CONFIG?.brand) {
          window.US_BENGOL_CONFIG.brand.whatsappNumber = gen.whatsapp_digits;
        }
        const floatWidget = document.querySelector('.floating-whatsapp-widget');
        if (floatWidget) {
          floatWidget.href = `https://wa.me/${gen.whatsapp_digits}?text=Hello%20US%20BENGOL,%20I%20would%20like%20to%20place%20an%20order.`;
        }
      }

      // Addresses & Delivery
      if (gen.factory_address) {
        const factoryItem = document.querySelectorAll('.footer-contact-item span')[0];
        if (factoryItem) factoryItem.textContent = gen.factory_address;
      }
      if (gen.address) {
        const dispatchItem = document.querySelectorAll('.footer-contact-item span')[1];
        if (dispatchItem) dispatchItem.textContent = gen.address;
        const originCity = document.querySelector('.origin-city');
        if (originCity) originCity.textContent = gen.address;
      }
      if (gen.delivery) {
        const scopeItem = document.querySelectorAll('.footer-contact-item span')[2];
        if (scopeItem) scopeItem.textContent = gen.delivery;
      }

      // Final CTA
      if (gen.final_title) {
        const finalTitle = document.querySelector('.final-title');
        if (finalTitle) finalTitle.textContent = gen.final_title;
      }
      if (gen.final_subline) {
        const finalSub = document.querySelector('.final-subline');
        if (finalSub) finalSub.textContent = gen.final_subline;
      }
    }

    // 3. HERITAGE STORY
    const story = all['heritage_story'];
    if (story) {
      if (story.kicker) {
        const kicker = document.querySelector('.story-kicker');
        if (kicker) kicker.textContent = story.kicker;
      }
      if (story.headline) {
        const hl = document.querySelector('.story-headline');
        if (hl) hl.textContent = story.headline;
      }
      const pElements = document.querySelectorAll('.story-content .story-text');
      if (pElements.length >= 3) {
        if (story.p1) pElements[0].textContent = story.p1;
        if (story.p2) pElements[1].textContent = story.p2;
        if (story.p3) pElements[2].textContent = story.p3;
      }
    }

    // 4. MINDFUL NUTRITION
    const diet = all['mindful_diet'];
    if (diet) {
      if (diet.badge) {
        const badge = document.querySelector('.diet-badge');
        if (badge) badge.textContent = diet.badge;
      }
      if (diet.headline) {
        const hl = document.querySelector('.diet-headline');
        if (hl) hl.textContent = diet.headline;
      }
      if (diet.desc) {
        const desc = document.querySelector('.diet-text');
        if (desc) desc.textContent = diet.desc;
      }
      const checkItems = document.querySelectorAll('.diet-check-item span:last-child');
      if (checkItems.length >= 3) {
        if (diet.p1) checkItems[0].textContent = diet.p1;
        if (diet.p2) checkItems[1].textContent = diet.p2;
        if (diet.p3) checkItems[2].textContent = diet.p3;
      }
    }

    // 5. WHY US BENGOL
    const why = all['why_us'];
    if (why) {
      if (why.title) {
        const t = document.querySelector('#why-us .section-title');
        if (t) t.textContent = why.title;
      }
      if (why.subtitle) {
        const sub = document.querySelector('#why-us .section-subtitle');
        if (sub) sub.textContent = why.subtitle;
      }
      if (why.pillars && Array.isArray(why.pillars) && why.pillars.length > 0) {
        const container = document.getElementById('why-us-grid');
        if (container) {
          container.innerHTML = why.pillars.map(p => `
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
      }
    }

    // 6. COMMITMENT & TRUST
    const trust = all['trust_commitment'];
    if (trust) {
      if (trust.kicker) {
        const k = document.querySelector('.trust-kicker');
        if (k) k.textContent = trust.kicker;
      }
      if (trust.headline) {
        const hl = document.querySelector('.trust-headline');
        if (hl) hl.textContent = trust.headline;
      }
      if (trust.copy) {
        const c = document.querySelector('.trust-copy');
        if (c) c.textContent = trust.copy;
      }
    }

    // 7. BRAND QUOTE
    const quote = all['brand_quote'];
    if (quote) {
      if (quote.text) {
        const qText = document.querySelector('.quote-statement');
        if (qText) qText.textContent = quote.text;
      }
      if (quote.sub) {
        const qSub = document.querySelector('.quote-subline');
        if (qSub) qSub.textContent = quote.sub;
      }
    }

    // 8. CERTIFICATIONS
    const cert = all['certifications'];
    if (cert) {
      if (cert.title) {
        const t = document.querySelector('.cert-title');
        if (t) t.textContent = cert.title;
      }
      if (cert.subtitle) {
        const sub = document.querySelector('.cert-subtitle');
        if (sub) sub.textContent = cert.subtitle;
      }
      if (cert.bsti) {
        const bstiName = document.querySelector('.cert-card-bsti .cert-name');
        if (bstiName && cert.bsti.title) bstiName.textContent = cert.bsti.title;
        const bstiDesc = document.querySelector('.cert-card-bsti .cert-desc');
        if (bstiDesc && cert.bsti.description) bstiDesc.textContent = cert.bsti.description;
        const bstiMeta = document.querySelector('.cert-card-bsti .cert-meta-info strong');
        if (bstiMeta && cert.bsti.status) bstiMeta.textContent = cert.bsti.status;
      }
      if (cert.ifst) {
        const ifstName = document.querySelector('.cert-card-ifst .cert-name');
        if (ifstName && cert.ifst.title) ifstName.textContent = cert.ifst.title;
        const ifstDesc = document.querySelector('.cert-card-ifst .cert-desc');
        if (ifstDesc && cert.ifst.description) ifstDesc.textContent = cert.ifst.description;
        const ifstMeta = document.querySelector('.cert-card-ifst .cert-meta-info strong');
        if (ifstMeta && cert.ifst.status) ifstMeta.textContent = cert.ifst.status;
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
