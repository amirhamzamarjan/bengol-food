/**
 * US BENGOL - Gallery Section Controller
 * 
 * Loads gallery images from Supabase/local storage and renders
 * them in a premium editorial grid with "Explore More" progressive loading.
 */

(function (window) {
  'use strict';

  const INITIAL_COUNT = 6;
  const LOAD_MORE_COUNT = 6;
  let allGalleryItems = [];
  let displayedCount = 0;

  async function initGallery() {
    const gridEl = document.getElementById('gallery-grid');
    const loadMoreBtn = document.getElementById('gallery-load-more');
    if (!gridEl) return;

    try {
      allGalleryItems = await window.USB_Supabase.getGallery(false);
    } catch (e) {
      console.warn('[US BENGOL] Gallery load error:', e);
      allGalleryItems = [];
    }

    if (allGalleryItems.length === 0) {
      gridEl.innerHTML = `
        <div class="gallery-empty-state">
          <p>Gallery images are being prepared. Check back soon for a look inside our production journey.</p>
        </div>
      `;
      if (loadMoreBtn) loadMoreBtn.style.display = 'none';
      return;
    }

    displayedCount = 0;
    gridEl.innerHTML = '';
    loadMoreItems(gridEl, INITIAL_COUNT);
    updateLoadMoreButton(loadMoreBtn);

    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        loadMoreItems(gridEl, LOAD_MORE_COUNT);
        updateLoadMoreButton(loadMoreBtn);
      });
    }
  }

  function loadMoreItems(gridEl, count) {
    const end = Math.min(displayedCount + count, allGalleryItems.length);
    const fragment = document.createDocumentFragment();

    for (let i = displayedCount; i < end; i++) {
      const item = allGalleryItems[i];
      const card = createGalleryCard(item, i);
      fragment.appendChild(card);
    }

    gridEl.appendChild(fragment);
    displayedCount = end;

    // Trigger staggered animation
    requestAnimationFrame(() => {
      const cards = gridEl.querySelectorAll('.gallery-card:not(.visible)');
      cards.forEach((card, idx) => {
        setTimeout(() => card.classList.add('visible'), idx * 80);
      });
    });
  }

  function createGalleryCard(item, index) {
    const card = document.createElement('article');
    card.className = 'gallery-card';
    card.setAttribute('data-gallery-id', item.id);

    card.innerHTML = `
      <div class="gallery-card-media">
        <img 
          src="${item.image_url}" 
          alt="${item.title || 'US BENGOL Gallery'}" 
          class="gallery-card-img"
          loading="lazy"
          onerror="this.onerror=null; this.style.background='var(--color-cream)'; this.alt='Image unavailable';"
        >
      </div>
      ${(item.title || item.description) ? `
        <div class="gallery-card-info">
          ${item.title ? `<h3 class="gallery-card-title">${item.title}</h3>` : ''}
          ${item.description ? `<p class="gallery-card-desc">${item.description}</p>` : ''}
        </div>
      ` : ''}
    `;

    return card;
  }

  function updateLoadMoreButton(btn) {
    if (!btn) return;
    if (displayedCount >= allGalleryItems.length) {
      btn.style.display = 'none';
    } else {
      btn.style.display = 'inline-flex';
      const remaining = allGalleryItems.length - displayedCount;
      btn.textContent = `Explore More (${remaining} remaining)`;
    }
  }

  window.USB_Gallery = {
    init: initGallery
  };
})(window);
