/**
 * US BENGOL - Floating Pill Navigation (v3 - Premium UI)
 * 
 * Elegant vertical floating pill dock on desktop with glowing active section
 * indicator, smooth tooltips, and click-to-expand.
 * Thumb-friendly, compact floating glass dock on mobile.
 */

(function (window) {
  'use strict';

  const ICON_MAP = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>',
    package: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
    film: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/><line x1="17" y1="17" x2="22" y2="17"/></svg>',
    image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>'
  };

  let activeSection = 'hero';
  let isExpanded = false;
  let pillEl = null;
  let indicatorEl = null;

  function initPillNav() {
    const sections = window.US_BENGOL_CONFIG?.navSections;
    if (!sections || sections.length === 0) return;

    // Check if nav already exists
    const existing = document.getElementById('pill-nav');
    if (existing) existing.remove();

    // Create nav container
    const nav = document.createElement('nav');
    nav.className = 'pill-nav';
    nav.setAttribute('aria-label', 'Section Navigation');
    nav.id = 'pill-nav';

    // Active indicator (separate glowing circular badge)
    indicatorEl = document.createElement('div');
    indicatorEl.className = 'pill-indicator';
    indicatorEl.innerHTML = ICON_MAP[sections[0].icon] || ICON_MAP.home;
    indicatorEl.setAttribute('title', 'Click to expand navigation');
    indicatorEl.setAttribute('aria-label', 'Current Section Indicator');

    // Main pill track
    pillEl = document.createElement('div');
    pillEl.className = 'pill-track';
    pillEl.setAttribute('role', 'list');

    sections.forEach((section, i) => {
      const btn = document.createElement('button');
      btn.className = `pill-item ${i === 0 ? 'active' : ''}`;
      btn.setAttribute('role', 'listitem');
      btn.setAttribute('aria-label', `Navigate to ${section.label}`);
      btn.setAttribute('data-section', section.id);
      btn.innerHTML = `
        <span class="pill-icon">${ICON_MAP[section.icon] || ''}</span>
        <span class="pill-label">${section.label}</span>
        <span class="pill-tooltip">${section.label}</span>
      `;

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.getElementById(section.id);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setActive(section.id, section.icon);
          closePill();
        }
      });

      pillEl.appendChild(btn);
    });

    // Expand toggle button (on desktop pill)
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'pill-toggle-btn';
    toggleBtn.setAttribute('aria-label', 'Expand or collapse navigation');
    toggleBtn.innerHTML = `
      <svg class="toggle-icon-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
      <svg class="toggle-icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
    `;
    toggleBtn.addEventListener('click', togglePill);

    nav.appendChild(indicatorEl);
    nav.appendChild(pillEl);
    nav.appendChild(toggleBtn);
    document.body.appendChild(nav);

    // Toggle on indicator click (desktop)
    indicatorEl.addEventListener('click', togglePill);

    // IntersectionObserver for active tracking
    setupSectionObserver(sections);

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (isExpanded && !nav.contains(e.target)) {
        closePill();
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isExpanded) closePill();
    });
  }

  function togglePill() {
    isExpanded = !isExpanded;
    pillEl.classList.toggle('expanded', isExpanded);
    const nav = document.getElementById('pill-nav');
    if (nav) nav.classList.toggle('expanded', isExpanded);
  }

  function closePill() {
    isExpanded = false;
    if (pillEl) pillEl.classList.remove('expanded');
    const nav = document.getElementById('pill-nav');
    if (nav) nav.classList.remove('expanded');
  }

  function setActive(sectionId, iconKey) {
    activeSection = sectionId;
    if (indicatorEl && iconKey && ICON_MAP[iconKey]) {
      indicatorEl.innerHTML = ICON_MAP[iconKey];
    }
    if (pillEl) {
      pillEl.querySelectorAll('.pill-item').forEach(item => {
        item.classList.toggle('active', item.dataset.section === sectionId);
      });
    }
  }

  function setupSectionObserver(sections) {
    const sectionElements = sections
      .map(s => ({ el: document.getElementById(s.id), ...s }))
      .filter(s => s.el);

    if (sectionElements.length === 0 || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const found = sectionElements.find(s => s.el === entry.target);
          if (found) {
            setActive(found.id, found.icon);
          }
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '-10% 0px -60% 0px'
    });

    sectionElements.forEach(s => observer.observe(s.el));
  }

  window.USB_PillNav = {
    init: initPillNav
  };
})(window);
