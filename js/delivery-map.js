/**
 * US BENGOL - Premium Bangladesh Delivery Map Visualization
 * 
 * Features:
 * - Accurate SVG delivery routes from Dhaka Central Dispatch Hub
 * - Custom animated food parcel indicator traveling along Bezier curves
 * - Smooth sequential loop through all 8 divisional hubs
 * - Interactive destination nodes with tooltips & touch support
 * - Divisional quick-select chips
 * - Viewport-aware IntersectionObserver (zero idle CPU usage)
 * - Accessibility: prefers-reduced-motion & ARIA support
 */

(function (window) {
  'use strict';

  // 8 Geographically mapped divisional destination hubs + Cumilla transit hub
  const DESTINATIONS = [
    { id: 'chattogram', name: 'Chattogram', bengali: 'চট্টগ্রাম', x: 705.7, y: 865.9 },
    { id: 'cumilla',    name: 'Cumilla',    bengali: 'কুমিল্লা', x: 599.0, y: 650.8 },
    { id: 'sylhet',     name: 'Sylhet',     bengali: 'সিলেট',   x: 720.8, y: 371.3 },
    { id: 'mymensingh', name: 'Mymensingh', bengali: 'ময়মনসিংহ', x: 464.2, y: 400.1 },
    { id: 'rajshahi',   name: 'Rajshahi',   bengali: 'রাজশাহী', x: 146.0, y: 474.8 },
    { id: 'rangpur',    name: 'Rangpur',    bengali: 'রংপুর',   x: 261.4, y: 205.8 },
    { id: 'khulna',     name: 'Khulna',     bengali: 'খুলনা',   x: 308.3, y: 770.6 },
    { id: 'barishal',   name: 'Barishal',   bengali: 'বরিশাল', x: 452.4, y: 798.8 }
  ];

  const DHAKA_ORIGIN = { x: 462.8, y: 582.6 };

  // Timing configuration (calm, elegant, premium pacing)
  const ROUTE_TRANSIT_DURATION = 2100; // ms travel time along curve
  const ARRIVAL_PAUSE_DURATION = 1400; // ms pause at destination
  const MANUAL_RESUME_DELAY    = 5000; // ms before auto-loop resumes after manual click

  let currentIndex = 0;
  let isAutoLooping = true;
  let isSectionInView = false;
  let prefersReducedMotion = false;
  let animationFrameId = null;
  let pauseTimeoutId = null;
  let resumeTimeoutId = null;
  let activeDestId = null;

  // DOM Elements
  let mapSection = null;
  let mapCard = null;
  let mapStage = null;
  let svgEl = null;
  let packageMarker = null;
  let statusLabel = null;
  let tooltip = null;
  let tooltipCity = null;
  let chipButtons = [];

  function initDeliveryMap() {
    mapSection = document.getElementById('delivery');
    mapCard = document.getElementById('delivery-map-card');
    mapStage = document.getElementById('delivery-map-stage');
    svgEl = document.getElementById('bd-delivery-map-svg');
    packageMarker = document.getElementById('delivery-package-marker');
    statusLabel = document.getElementById('delivery-status-label');
    tooltip = document.getElementById('delivery-tooltip');
    tooltipCity = document.getElementById('tooltip-city');
    chipButtons = Array.from(document.querySelectorAll('.dest-chip'));

    if (!mapSection || !svgEl) {
      return;
    }

    // Check accessibility preference
    prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Attach event listeners for nodes and chips
    bindInteractions();

    if (prefersReducedMotion) {
      setupReducedMotionState();
      return;
    }

    // Viewport-aware observer
    setupIntersectionObserver();
  }

  /**
   * Observe #delivery so animation only runs when visible to the user
   */
  function setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) {
      isSectionInView = true;
      startAutoSequence();
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          isSectionInView = true;
          if (mapCard) mapCard.classList.add('in-view');
          if (isAutoLooping && !animationFrameId && !pauseTimeoutId) {
            startAutoSequence();
          }
        } else {
          isSectionInView = false;
          stopAnimation();
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '50px 0px 50px 0px'
    });

    observer.observe(mapSection);
  }

  /**
   * Start or continue the continuous route loop
   */
  function startAutoSequence() {
    if (!isSectionInView || prefersReducedMotion) return;
    isAutoLooping = true;
    animateCurrentRoute();
  }

  /**
   * Stop active animations and clear pending timers
   */
  function stopAnimation() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    if (pauseTimeoutId) {
      clearTimeout(pauseTimeoutId);
      pauseTimeoutId = null;
    }
  }

  /**
   * Animate delivery from Dhaka to the destination
   */
  function animateRoute(dest, shouldContinueLoop = true) {
    stopAnimation();
    activeDestId = dest.id;

    const routePath = document.getElementById('route-' + dest.id);
    const destNode = document.getElementById('node-' + dest.id);

    if (!routePath || !packageMarker) return;

    // Clear previous active states on other nodes and routes
    clearActiveStates(dest.id);

    // Update status badge & active chip
    updateStatus(`Dispatched from Dhaka → ${dest.name}`);
    highlightChip(dest.id);

    // Prepare route stroke
    const totalLength = routePath.getTotalLength();
    routePath.style.strokeDasharray = `${totalLength}`;
    routePath.style.strokeDashoffset = `${totalLength}`;
    routePath.style.opacity = '1';

    // Position package marker at Dhaka origin
    packageMarker.setAttribute('transform', `translate(${DHAKA_ORIGIN.x}, ${DHAKA_ORIGIN.y})`);
    packageMarker.style.opacity = '1';

    let startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(1, elapsed / ROUTE_TRANSIT_DURATION);

      // Smooth cubic ease-in-out
      const ease = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      // Draw route line
      routePath.style.strokeDashoffset = `${totalLength * (1 - ease)}`;

      // Move parcel indicator along path
      const currentDist = ease * totalLength;
      const pt = routePath.getPointAtLength(currentDist);

      // Calculate tangent angle for natural travel orientation
      const sampleDist = Math.min(totalLength, currentDist + 2);
      const nextPt = routePath.getPointAtLength(sampleDist);
      const angle = Math.atan2(nextPt.y - pt.y, nextPt.x - pt.x) * (180 / Math.PI);

      packageMarker.setAttribute('transform', `translate(${pt.x}, ${pt.y}) rotate(${angle})`);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        // Destination Arrived!
        animationFrameId = null;
        onRouteArrived(dest, destNode, routePath, shouldContinueLoop);
      }
    }

    animationFrameId = requestAnimationFrame(step);
  }

  /**
   * Handle arrival at destination
   */
  function onRouteArrived(dest, destNode, routePath, shouldContinueLoop) {
    if (destNode) {
      destNode.classList.add('is-active');
    }

    updateStatus(`Arrived: ${dest.name} Hub`);

    // Pause briefly so user can appreciate arrival
    pauseTimeoutId = setTimeout(() => {
      // Soft fade parcel
      if (packageMarker) {
        packageMarker.style.opacity = '0';
      }

      // Soften route to a subtle background trace
      if (routePath) {
        routePath.style.opacity = '0.35';
      }

      if (shouldContinueLoop && isAutoLooping && isSectionInView) {
        // Advance to next destination
        currentIndex = (currentIndex + 1) % DESTINATIONS.length;
        animateRoute(DESTINATIONS[currentIndex], true);
      }
    }, ARRIVAL_PAUSE_DURATION);
  }

  function animateCurrentRoute() {
    const dest = DESTINATIONS[currentIndex];
    animateRoute(dest, true);
  }

  /**
   * Clear active visual states
   */
  function clearActiveStates(exceptDestId = null) {
    DESTINATIONS.forEach(d => {
      if (d.id !== exceptDestId) {
        const n = document.getElementById('node-' + d.id);
        if (n) n.classList.remove('is-active');

        const r = document.getElementById('route-' + d.id);
        if (r) {
          r.style.opacity = '0';
        }
      }
    });
  }

  /**
   * Update the status pill in the card header
   */
  function updateStatus(text) {
    if (statusLabel) {
      statusLabel.textContent = text;
    }
  }

  /**
   * Highlight the currently active division chip
   */
  function highlightChip(destId) {
    chipButtons.forEach(btn => {
      const target = btn.getAttribute('data-dest');
      const isActive = target === destId;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  /**
   * Show floating tooltip for a destination
   */
  function showTooltip(dest) {
    if (!tooltip || !tooltipCity || !svgEl || !mapStage) return;

    tooltipCity.textContent = dest.name;

    // Use SVG matrix transform to compute exact stage-relative pixel coordinates
    const pt = svgEl.createSVGPoint();
    pt.x = dest.x;
    pt.y = dest.y;

    const ctm = svgEl.getScreenCTM();
    if (ctm) {
      const screenPt = pt.matrixTransform(ctm);
      const stageRect = mapStage.getBoundingClientRect();
      const left = screenPt.x - stageRect.left;
      const top = screenPt.y - stageRect.top;

      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
      tooltip.classList.add('visible');
      tooltip.setAttribute('aria-hidden', 'false');
    }
  }

  /**
   * Hide floating tooltip
   */
  function hideTooltip() {
    if (tooltip) {
      tooltip.classList.remove('visible');
      tooltip.setAttribute('aria-hidden', 'true');
    }
  }

  /**
   * Setup click, hover, and touch listeners
   */
  function bindInteractions() {
    // 1. Destination SVG Nodes (Hover / Focus / Click / Tap)
    DESTINATIONS.forEach((dest, idx) => {
      const nodeEl = document.getElementById('node-' + dest.id);
      if (!nodeEl) return;

      // Mouse Hover
      nodeEl.addEventListener('mouseenter', () => {
        showTooltip(dest);
        previewDestination(dest, idx);
      });

      nodeEl.addEventListener('mouseleave', () => {
        hideTooltip();
        scheduleAutoResume();
      });

      // Focus for keyboard navigation
      nodeEl.addEventListener('focus', () => {
        showTooltip(dest);
        previewDestination(dest, idx);
      });

      nodeEl.addEventListener('blur', () => {
        hideTooltip();
        scheduleAutoResume();
      });

      // Click / Touch Tap
      nodeEl.addEventListener('click', (e) => {
        e.preventDefault();
        showTooltip(dest);
        previewDestination(dest, idx);
      });
    });

    // 2. Division Chip Buttons
    chipButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const destId = btn.getAttribute('data-dest');

        if (destId === 'all') {
          // Resume continuous route loop
          if (resumeTimeoutId) clearTimeout(resumeTimeoutId);
          hideTooltip();
          isAutoLooping = true;
          highlightChip('all');
          animateRoute(DESTINATIONS[currentIndex], true);
        } else {
          // Select specific destination
          const idx = DESTINATIONS.findIndex(d => d.id === destId);
          if (idx !== -1) {
            const dest = DESTINATIONS[idx];
            showTooltip(dest);
            previewDestination(dest, idx);
          }
        }
      });
    });

    // 3. Stage click outside hides tooltip
    if (mapStage) {
      mapStage.addEventListener('click', (e) => {
        if (!e.target.closest('.dest-node') && !e.target.closest('.dest-chip')) {
          hideTooltip();
        }
      });
    }

    // 4. Window resize repositioning
    window.addEventListener('resize', () => {
      if (tooltip && tooltip.classList.contains('visible') && activeDestId) {
        const currentDest = DESTINATIONS.find(d => d.id === activeDestId);
        if (currentDest) showTooltip(currentDest);
      }
    }, { passive: true });
  }

  /**
   * Preview a destination directly upon user interaction
   */
  function previewDestination(dest, idx) {
    if (resumeTimeoutId) clearTimeout(resumeTimeoutId);
    isAutoLooping = false;
    currentIndex = idx;

    // Directly animate to this destination without automatic continuation
    animateRoute(dest, false);
  }

  /**
   * Schedule auto-loop to resume after manual interaction ends
   */
  function scheduleAutoResume() {
    if (prefersReducedMotion) return;
    if (resumeTimeoutId) clearTimeout(resumeTimeoutId);

    resumeTimeoutId = setTimeout(() => {
      isAutoLooping = true;
      highlightChip('all');
      if (isSectionInView) {
        currentIndex = (currentIndex + 1) % DESTINATIONS.length;
        animateRoute(DESTINATIONS[currentIndex], true);
      }
    }, MANUAL_RESUME_DELAY);
  }

  /**
   * Reduced motion fallback for accessibility
   */
  function setupReducedMotionState() {
    // Show all routes gently without moving animations
    DESTINATIONS.forEach(dest => {
      const r = document.getElementById('route-' + dest.id);
      if (r) {
        r.style.strokeDasharray = 'none';
        r.style.strokeDashoffset = '0';
        r.style.opacity = '0.35';
      }
    });

    if (packageMarker) {
      packageMarker.style.display = 'none';
    }

    updateStatus('Nationwide Delivery Coverage from Dhaka');
  }

  // Export module to global scope
  window.USB_DeliveryMap = {
    init: initDeliveryMap
  };

  // Auto-init if DOM is already loaded or on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDeliveryMap);
  } else {
    initDeliveryMap();
  }

})(window);
