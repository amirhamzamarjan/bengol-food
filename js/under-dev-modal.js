/**
 * ============================================================================
 * US BENGOL - Under-Development Isometric 3D Popup Engine
 * 
 * High-performance, lightweight, self-contained isometric production studio.
 * Visual concept: Miniature digital creative factory building the website in real-time.
 * 
 * Features:
 * - Central Glass Development Dome with tumbling 3D cubes & spheres
 * - Server Racks with rhythmic teal/emerald blinking status LED arrays
 * - Smooth rotating Satellite Dish with telemetry signal pulses
 * - Looping Conveyor Belt system with laser scanner gate & glowing cubes
 * - Angled Diagnostic Dashboard with live animated bar charts & oscilloscope
 * - Snapping & floating UI interface cards (assembly in real-time)
 * - Flowing energy conduits & metallic pipes
 * - Subtle desktop mouse parallax tilt with spring dampening
 * - Zero external libraries/dependencies (<35KB total)
 * - Auto-pauses RAF loop when closed or offscreen (IntersectionObserver + VisibilityAPI)
 * ============================================================================
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. MASTER CONFIGURATION (EASY PER-WEBSITE CUSTOMIZATION)
  // Edit these values freely to rebrand or customize for any demo website!
  // ==========================================================================
  const UDM_DEFAULT_CONFIG = {
    // Copy & Text Content
    eyebrow: "DIGITAL EXPERIENCE IN PROGRESS",
    heading: "Something Great Is Taking Shape.",
    description: "Our team is working behind the scenes to bring this digital experience to life. Some sections, information, images, or features may still be incomplete or updated as development continues.",
    statusText: "Currently under development · Preview available",
    badgeText: "STUDIO ENGINE • ACTIVE BUILD",
    primaryButtonText: "Explore Website",
    secondaryButtonText: "Maybe Later",
    showSecondaryButton: true,

    // Visual Palette
    colors: {
      background: "#1c1e21",
      cardBg: "rgba(28, 30, 33, 0.94)",
      teal: "#1de9b6",
      tealGlow: "rgba(29, 233, 182, 0.4)",
      copper: "#d98c4a",
      copperGlow: "rgba(217, 140, 74, 0.35)",
      text: "#f8fafc",
      textMuted: "#94a3b8",
      border: "rgba(255, 255, 255, 0.09)",
      platformFloor: "#15181c",
      platformBorder: "rgba(29, 233, 182, 0.35)"
    },

    // Proportions & Layout
    sceneHeightDesktop: 350,
    sceneHeightMobile: 260,
    modalMaxWidth: "740px",

    // Motion & Physics
    animationSpeed: 1.0,         // Multiplier: 0.5 = slow, 1.0 = standard, 1.5 = fast
    enableMouseParallax: true,    // Gentle tilt on desktop
    parallaxStrength: 1.0,

    // Display & Session Behavior
    showOnLoad: true,
    displayMode: "always",       // "always" | "session" | "once"
    storageKey: "udm_preview_dismissed",
    autoOpenDelayMs: 300,        // Smooth entrance delay after DOM load
  };

  // Merge runtime options from global configuration objects if present
  let config = Object.assign({}, UDM_DEFAULT_CONFIG);
  const runtimeConfig = window.UnderDevModalConfig || window.UDM_CUSTOM_CONFIG;
  if (runtimeConfig && typeof runtimeConfig === 'object') {
    if (runtimeConfig.colors) {
      config.colors = Object.assign({}, UDM_DEFAULT_CONFIG.colors, runtimeConfig.colors);
    }
    Object.assign(config, runtimeConfig);
  }

  function applyCustomTheme(el) {
    if (!el) return;
    const c = config.colors || {};
    if (c.background) el.style.setProperty('--udm-bg', c.background);
    if (c.cardBg) el.style.setProperty('--udm-card-bg', c.cardBg);
    if (c.teal) {
      el.style.setProperty('--udm-teal', c.teal);
      el.style.setProperty('--udm-teal-glow', c.tealGlow || `rgba(29, 233, 182, 0.4)`);
    }
    if (c.copper) {
      el.style.setProperty('--udm-copper', c.copper);
      el.style.setProperty('--udm-copper-glow', c.copperGlow || `rgba(217, 140, 74, 0.35)`);
    }
    if (c.text) el.style.setProperty('--udm-text', c.text);
    if (c.textMuted) el.style.setProperty('--udm-text-muted', c.textMuted);
    if (c.border) el.style.setProperty('--udm-border', c.border);
    if (config.modalMaxWidth) el.style.setProperty('--udm-dialog-max-width', config.modalMaxWidth);
    if (config.sceneHeightDesktop) el.style.setProperty('--udm-scene-height', `${config.sceneHeightDesktop}px`);
  }

  // State
  let modalRoot = null;
  let canvas = null;
  let ctx = null;
  let animFrameId = null;
  let isRunning = false;
  let isVisible = false;
  let lastActiveElement = null;

  // Parallax state
  let mouseX = 0;
  let mouseY = 0;
  let targetTiltX = 0;
  let targetTiltY = 0;
  let currentTiltX = 0;
  let currentTiltY = 0;

  // Time tracking
  let sceneTime = 0;
  let lastTimestamp = 0;

  // ==========================================================================
  // 2. DOM CREATION & FOCUS MANAGEMENT
  // ==========================================================================
  function createModalDOM() {
    if (document.getElementById('under-dev-modal')) {
      return document.getElementById('under-dev-modal');
    }

    const modal = document.createElement('div');
    modal.id = 'under-dev-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'udm-modal-title');
    modal.setAttribute('aria-describedby', 'udm-modal-desc');

    modal.innerHTML = `
      <div class="udm-backdrop" aria-hidden="true" title="Click to dismiss"></div>
      <div class="udm-dialog">
        <!-- Close button (44x44px accessible touch target) -->
        <button type="button" class="udm-close-btn" id="udm-btn-close" aria-label="Close dialog" title="Close (Esc)">
          <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <!-- Animation-first Isometric Scene (~65% visual weight) -->
        <div class="udm-scene-container" id="udm-scene-container">
          <div class="udm-scene-corner tl"></div>
          <div class="udm-scene-corner tr"></div>
          <div class="udm-scene-corner bl"></div>
          <div class="udm-scene-corner br"></div>

          <div class="udm-scene-badge">
            <span class="udm-live-dot"></span>
            <span>${config.badgeText}</span>
          </div>

          <canvas class="udm-canvas" id="udm-canvas"></canvas>
        </div>

        <!-- Content Area (~35% visual weight) -->
        <div class="udm-content">
          <div class="udm-eyebrow">
            <span class="udm-eyebrow-line"></span>
            <span>${config.eyebrow}</span>
          </div>

          <h2 class="udm-heading" id="udm-modal-title">${config.heading}</h2>

          <p class="udm-description" id="udm-modal-desc">${config.description}</p>

          <div class="udm-footer">
            <div class="udm-status-pill">
              <svg class="udm-status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <circle cx="12" cy="12" r="9"></circle>
                <path d="M12 7v5l3 3"></path>
              </svg>
              <span>${config.statusText}</span>
            </div>

            <div class="udm-actions">
              ${config.showSecondaryButton ? `
                <button type="button" class="udm-btn-secondary" id="udm-btn-secondary">
                  ${config.secondaryButtonText}
                </button>
              ` : ''}
              
              <!-- Prominent Teal CTA -->
              <button type="button" class="udm-btn-primary" id="udm-btn-primary">
                <span>${config.primaryButtonText}</span>
                <svg viewBox="0 0 24 24" fill="none"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    applyCustomTheme(modal);
    return modal;
  }

  // ==========================================================================
  // 3. ISOMETRIC 3D RENDER ENGINE
  // Math: 30° isometric projection with depth sorting & lighting
  // ==========================================================================
  const ISO_COS = Math.cos(Math.PI / 6); // ~0.866
  const ISO_SIN = Math.sin(Math.PI / 6); // ~0.500

  function projectIso(x, y, z, originX, originY, tiltX, tiltY) {
    // Apply parallax tilt to 3D axes
    const px = x + tiltX * (z * 0.12);
    const py = y + tiltY * (z * 0.12);
    return {
      x: originX + (px - py) * ISO_COS,
      y: originY + (px + py) * ISO_SIN - z
    };
  }

  // Pre-configured equipment state
  const serverLeds = Array.from({ length: 18 }, () => ({
    speed: 0.8 + Math.random() * 2.2,
    offset: Math.random() * 10,
    color: Math.random() > 0.35 ? config.colors.teal : config.colors.copper
  }));

  const conveyorCubes = [
    { t: 0.1, color: config.colors.copper },
    { t: 0.45, color: config.colors.teal },
    { t: 0.8, color: config.colors.copper }
  ];

  const ambientDust = Array.from({ length: 16 }, () => ({
    x: (Math.random() - 0.5) * 260,
    y: (Math.random() - 0.5) * 200,
    z: 20 + Math.random() * 140,
    vz: 0.2 + Math.random() * 0.5,
    size: 1 + Math.random() * 1.8,
    alpha: 0.2 + Math.random() * 0.5
  }));

  // ==========================================================================
  // DRAWING PRIMITIVES
  // ==========================================================================
  function drawIsoCube(x, y, z, sizeX, sizeY, sizeZ, colors, originX, originY, tiltX, tiltY) {
    // 8 vertices in 3D
    const p0 = projectIso(x, y, z, originX, originY, tiltX, tiltY);
    const p1 = projectIso(x + sizeX, y, z, originX, originY, tiltX, tiltY);
    const p2 = projectIso(x + sizeX, y + sizeY, z, originX, originY, tiltX, tiltY);
    const p3 = projectIso(x, y + sizeY, z, originX, originY, tiltX, tiltY);

    const p4 = projectIso(x, y, z + sizeZ, originX, originY, tiltX, tiltY);
    const p5 = projectIso(x + sizeX, y, z + sizeZ, originX, originY, tiltX, tiltY);
    const p6 = projectIso(x + sizeX, y + sizeY, z + sizeZ, originX, originY, tiltX, tiltY);
    const p7 = projectIso(x, y + sizeY, z + sizeZ, originX, originY, tiltX, tiltY);

    // Top Face (p4, p5, p6, p7)
    ctx.beginPath();
    ctx.moveTo(p4.x, p4.y);
    ctx.lineTo(p5.x, p5.y);
    ctx.lineTo(p6.x, p6.y);
    ctx.lineTo(p7.x, p7.y);
    ctx.closePath();
    ctx.fillStyle = colors.top;
    ctx.fill();
    if (colors.stroke) {
      ctx.strokeStyle = colors.stroke;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Left Face (p0, p3, p7, p4)
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.lineTo(p7.x, p7.y);
    ctx.lineTo(p4.x, p4.y);
    ctx.closePath();
    ctx.fillStyle = colors.left;
    ctx.fill();
    if (colors.stroke) {
      ctx.strokeStyle = colors.stroke;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Right Face (p3, p2, p6, p7)
    ctx.beginPath();
    ctx.moveTo(p3.x, p3.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p6.x, p6.y);
    ctx.lineTo(p7.x, p7.y);
    ctx.closePath();
    ctx.fillStyle = colors.right;
    ctx.fill();
    if (colors.stroke) {
      ctx.strokeStyle = colors.stroke;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  // Tumbling Free 3D Cube with Roll / Pitch / Yaw
  function drawTumblingCube(cx, cy, cz, size, rotX, rotY, rotZ, colorHex, originX, originY, tiltX, tiltY) {
    const half = size / 2;
    const rawVerts = [
      [-half, -half, -half], [half, -half, -half], [half, half, -half], [-half, half, -half],
      [-half, -half, half],  [half, -half, half],  [half, half, half],  [-half, half, half]
    ];

    // Euler rotation
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    const cosZ = Math.cos(rotZ), sinZ = Math.sin(rotZ);

    const rotVerts = rawVerts.map(v => {
      // Rot X
      let y1 = v[1] * cosX - v[2] * sinX;
      let z1 = v[1] * sinX + v[2] * cosX;
      // Rot Y
      let x2 = v[0] * cosY + z1 * sinY;
      let z2 = -v[0] * sinY + z1 * cosY;
      // Rot Z
      let x3 = x2 * cosZ - y1 * sinZ;
      let y3 = x2 * sinZ + y1 * cosZ;
      return [x3 + cx, y3 + cy, z2 + cz];
    });

    const faces = [
      { v: [4, 5, 6, 7], shade: 1.15 }, // Top
      { v: [0, 3, 2, 1], shade: 0.65 }, // Bottom
      { v: [0, 1, 5, 4], shade: 0.85 }, // Front
      { v: [2, 3, 7, 6], shade: 0.95 }, // Back
      { v: [0, 4, 7, 3], shade: 0.75 }, // Left
      { v: [1, 2, 6, 5], shade: 1.05 }  // Right
    ];

    // Project vertices
    const proj = rotVerts.map(v => projectIso(v[0], v[1], v[2], originX, originY, tiltX, tiltY));

    // Sort faces by average screen Y depth
    faces.sort((a, b) => {
      const depthA = (rotVerts[a.v[0]][2] + rotVerts[a.v[2]][2]) * 0.5;
      const depthB = (rotVerts[b.v[0]][2] + rotVerts[b.v[2]][2]) * 0.5;
      return depthA - depthB;
    });

    faces.forEach(face => {
      ctx.beginPath();
      ctx.moveTo(proj[face.v[0]].x, proj[face.v[0]].y);
      for (let i = 1; i < face.v.length; i++) {
        ctx.lineTo(proj[face.v[i]].x, proj[face.v[i]].y);
      }
      ctx.closePath();

      ctx.fillStyle = colorHex;
      ctx.globalAlpha = 0.88;
      ctx.fill();
      ctx.globalAlpha = 1.0;

      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  }

  // ==========================================================================
  // SCENE COMPOSITION & RENDER CYCLE
  // ==========================================================================
  function renderScene(now) {
    if (!ctx || !canvas) return;

    if (!lastTimestamp) lastTimestamp = now;
    const delta = Math.min((now - lastTimestamp) / 1000, 0.1);
    lastTimestamp = now;

    const speed = config.animationSpeed;
    sceneTime += delta * speed;

    // Smooth lerp mouse parallax tilt
    currentTiltX += (targetTiltX - currentTiltX) * 0.08;
    currentTiltY += (targetTiltY - currentTiltY) * 0.08;

    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);

    ctx.save();
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    ctx.clearRect(0, 0, width, height);

    const originX = width * 0.5;
    const originY = height * 0.62; // Center lower portion for good isometric elevation
    const tiltX = currentTiltX;
    const tiltY = currentTiltY;

    // ------------------------------------------------------------------------
    // A. AMBIENT SHADOW & FLOATING ISOMETRIC PLATFORM
    // ------------------------------------------------------------------------
    const shadowCenter = projectIso(0, 0, 0, originX, originY, tiltX, tiltY);
    const shadowGrad = ctx.createRadialGradient(
      shadowCenter.x, shadowCenter.y + 25, 10,
      shadowCenter.x, shadowCenter.y + 25, 220
    );
    shadowGrad.addColorStop(0, "rgba(0, 0, 0, 0.65)");
    shadowGrad.addColorStop(0.5, "rgba(0, 0, 0, 0.35)");
    shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.ellipse(shadowCenter.x, shadowCenter.y + 25, 240, 110, 0, 0, Math.PI * 2);
    ctx.fill();

    // Octagonal Platform Base
    const platR = 145;
    const platPoints3D = [
      [-platR, -platR * 0.6, 0], [-platR * 0.6, -platR, 0],
      [platR * 0.6, -platR, 0],  [platR, -platR * 0.6, 0],
      [platR, platR * 0.6, 0],   [platR * 0.6, platR, 0],
      [-platR * 0.6, platR, 0],  [-platR, platR * 0.6, 0]
    ];

    // Thickness / Edge drop of platform
    const edgeDepth = 14;
    for (let i = 0; i < platPoints3D.length; i++) {
      const nextIdx = (i + 1) % platPoints3D.length;
      const pA = projectIso(platPoints3D[i][0], platPoints3D[i][1], 0, originX, originY, tiltX, tiltY);
      const pB = projectIso(platPoints3D[nextIdx][0], platPoints3D[nextIdx][1], 0, originX, originY, tiltX, tiltY);
      const pAd = projectIso(platPoints3D[i][0], platPoints3D[i][1], -edgeDepth, originX, originY, tiltX, tiltY);
      const pBd = projectIso(platPoints3D[nextIdx][0], platPoints3D[nextIdx][1], -edgeDepth, originX, originY, tiltX, tiltY);

      // Only draw forward-facing bevels
      if (pA.x > pB.x || pA.y < pB.y) {
        ctx.beginPath();
        ctx.moveTo(pA.x, pA.y);
        ctx.lineTo(pB.x, pB.y);
        ctx.lineTo(pBd.x, pBd.y);
        ctx.lineTo(pAd.x, pAd.y);
        ctx.closePath();
        ctx.fillStyle = "#121417";
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Top Platform Surface
    ctx.beginPath();
    const pStart = projectIso(platPoints3D[0][0], platPoints3D[0][1], 0, originX, originY, tiltX, tiltY);
    ctx.moveTo(pStart.x, pStart.y);
    for (let i = 1; i < platPoints3D.length; i++) {
      const p = projectIso(platPoints3D[i][0], platPoints3D[i][1], 0, originX, originY, tiltX, tiltY);
      ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.fillStyle = "#171a1f";
    ctx.fill();
    ctx.strokeStyle = "rgba(29, 233, 182, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Subtle Isometric Floor Grid Lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    ctx.lineWidth = 1;
    for (let gx = -120; gx <= 120; gx += 40) {
      const g1 = projectIso(gx, -120, 0.5, originX, originY, tiltX, tiltY);
      const g2 = projectIso(gx, 120, 0.5, originX, originY, tiltX, tiltY);
      ctx.beginPath();
      ctx.moveTo(g1.x, g1.y);
      ctx.lineTo(g2.x, g2.y);
      ctx.stroke();
    }
    for (let gy = -120; gy <= 120; gy += 40) {
      const g1 = projectIso(-120, gy, 0.5, originX, originY, tiltX, tiltY);
      const g2 = projectIso(120, gy, 0.5, originX, originY, tiltX, tiltY);
      ctx.beginPath();
      ctx.moveTo(g1.x, g1.y);
      ctx.lineTo(g2.x, g2.y);
      ctx.stroke();
    }

    // Glowing Motherboard Circuit Traces on Floor
    const traceGrad = ctx.createLinearGradient(originX - 100, originY, originX + 100, originY);
    traceGrad.addColorStop(0, "rgba(29, 233, 182, 0.15)");
    traceGrad.addColorStop(0.5, "rgba(29, 233, 182, 0.6)");
    traceGrad.addColorStop(1, "rgba(217, 140, 74, 0.4)");
    ctx.strokeStyle = traceGrad;
    ctx.lineWidth = 1.2;

    const circuitNodes = [
      [[-90, -30], [-40, -30], [-25, -15]],
      [[70, -70], [30, -70], [15, -45]],
      [[-70, 70], [-35, 70], [-20, 40]]
    ];
    circuitNodes.forEach(path => {
      ctx.beginPath();
      const pt0 = projectIso(path[0][0], path[0][1], 0.5, originX, originY, tiltX, tiltY);
      ctx.moveTo(pt0.x, pt0.y);
      for (let i = 1; i < path.length; i++) {
        const pt = projectIso(path[i][0], path[i][1], 0.5, originX, originY, tiltX, tiltY);
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
    });

    // ------------------------------------------------------------------------
    // B. REAR LEFT: SERVER RACKS (DATA INFRASTRUCTURE)
    // ------------------------------------------------------------------------
    const rackX = -110;
    const rackY = -25;
    const rackW = 28;
    const rackD = 34;
    const rackH = 68;

    // Rack Tower 1
    drawIsoCube(rackX, rackY, 0, rackW, rackD, rackH, {
      top: "#232830",
      left: "#16191e",
      right: "#1a1e24",
      stroke: "rgba(255, 255, 255, 0.08)"
    }, originX, originY, tiltX, tiltY);

    // Rack Tower 2 (side-by-side cluster)
    drawIsoCube(rackX + 32, rackY - 12, 0, rackW - 4, rackD - 4, rackH - 12, {
      top: "#22272e",
      left: "#15181c",
      right: "#181c22",
      stroke: "rgba(255, 255, 255, 0.08)"
    }, originX, originY, tiltX, tiltY);

    // Animated Server Activity LEDs (Right Face of Rack 1)
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 3; c++) {
        const ledIndex = (r * 3 + c) % serverLeds.length;
        const led = serverLeds[ledIndex];
        const pulse = Math.sin(sceneTime * led.speed * 4 + led.offset);
        if (pulse > 0.2) {
          const ledPos = projectIso(
            rackX + rackW + 0.5,
            rackY + 6 + c * 9,
            8 + r * 8,
            originX, originY, tiltX, tiltY
          );
          ctx.beginPath();
          ctx.arc(ledPos.x, ledPos.y, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = led.color;
          ctx.shadowColor = led.color;
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0; // reset
        }
      }
    }

    // Server rack exhaust heat/air glow
    const ventPos = projectIso(rackX + rackW * 0.5, rackY + rackD * 0.5, rackH + 2, originX, originY, tiltX, tiltY);
    ctx.beginPath();
    ctx.arc(ventPos.x, ventPos.y - 4, 12, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(29, 233, 182, 0.06)";
    ctx.fill();

    // ------------------------------------------------------------------------
    // C. REAR RIGHT: ROTATING SATELLITE DISH (DEPLOYMENT/SYNC)
    // ------------------------------------------------------------------------
    const dishBaseX = 85;
    const dishBaseY = -65;
    const dishBaseH = 26;

    // Dish Stand Pedestal
    drawIsoCube(dishBaseX - 10, dishBaseY - 10, 0, 20, 20, dishBaseH, {
      top: "#2a2f38",
      left: "#181a20",
      right: "#1f232b",
      stroke: "rgba(255, 255, 255, 0.1)"
    }, originX, originY, tiltX, tiltY);

    // Articulated gimbal arm
    const gimbalTop = projectIso(dishBaseX, dishBaseY, dishBaseH + 16, originX, originY, tiltX, tiltY);
    const gimbalPivot = projectIso(dishBaseX, dishBaseY, dishBaseH + 6, originX, originY, tiltX, tiltY);
    ctx.beginPath();
    ctx.moveTo(gimbalPivot.x, gimbalPivot.y);
    ctx.lineTo(gimbalTop.x, gimbalTop.y);
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Rotating Parabolic Ellipse Dish
    const dishAngle = sceneTime * 1.2;
    const dishRadiusX = 22;
    const dishRadiusY = 11;
    ctx.save();
    ctx.translate(gimbalTop.x, gimbalTop.y);
    ctx.rotate(Math.sin(dishAngle * 0.4) * 0.2); // subtle oscillation

    // Parabolic back
    ctx.beginPath();
    ctx.ellipse(0, -6, dishRadiusX, dishRadiusY, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#1e242d";
    ctx.fill();
    ctx.strokeStyle = config.colors.copper;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Parabolic inner bowl with rotating sheen
    ctx.beginPath();
    ctx.ellipse(0, -6, dishRadiusX * 0.75, dishRadiusY * 0.75, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#27303d";
    ctx.fill();

    // Feed horn & beacon pulse
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(0, -18);
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2;
    ctx.stroke();

    const beaconPulse = (Math.sin(sceneTime * 6) + 1) * 0.5;
    ctx.beginPath();
    ctx.arc(0, -19, 2.8 + beaconPulse * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = config.colors.teal;
    ctx.shadowColor = config.colors.teal;
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Expanding broadcast wave ring
    const ringProgress = (sceneTime * 0.8) % 1;
    const ringR = 8 + ringProgress * 32;
    ctx.beginPath();
    ctx.arc(0, -19, ringR, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(29, 233, 182, ${Math.max(0, (1 - ringProgress) * 0.4)})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.restore();

    // ------------------------------------------------------------------------
    // D. CONNECTED METALLIC CONDUIT PIPES & FLOWING ORBS
    // ------------------------------------------------------------------------
    const pipes = [
      // Server Rack to Central Dome
      { from: [-80, -10, 6], to: [-35, -5, 6], color: config.colors.teal },
      // Satellite Dish to Central Dome
      { from: [70, -50, 4], to: [30, -20, 4], color: config.colors.copper }
    ];

    pipes.forEach((p, idx) => {
      const p1 = projectIso(p.from[0], p.from[1], p.from[2], originX, originY, tiltX, tiltY);
      const p2 = projectIso(p.to[0], p.to[1], p.to[2], originX, originY, tiltX, tiltY);

      // Pipe line
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Traveling light energy orb
      const orbT = ((sceneTime * 0.7) + idx * 0.5) % 1;
      const orbX = p1.x + (p2.x - p1.x) * orbT;
      const orbY = p1.y + (p2.y - p1.y) * orbT;

      ctx.beginPath();
      ctx.arc(orbX, orbY, 3, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 9;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // ------------------------------------------------------------------------
    // E. FRONT RIGHT: CONVEYOR SYSTEM & SCANNER GATE
    // ------------------------------------------------------------------------
    const convStartX = 45;
    const convStartY = 25;
    const convEndX = 110;
    const convEndY = 75;

    // Conveyor rails
    const r1a = projectIso(convStartX, convStartY, 4, originX, originY, tiltX, tiltY);
    const r1b = projectIso(convEndX, convEndY, 4, originX, originY, tiltX, tiltY);
    const r2a = projectIso(convStartX + 12, convStartY - 12, 4, originX, originY, tiltX, tiltY);
    const r2b = projectIso(convEndX + 12, convEndY - 12, 4, originX, originY, tiltX, tiltY);

    // Conveyor track surface
    ctx.beginPath();
    ctx.moveTo(r1a.x, r1a.y);
    ctx.lineTo(r1b.x, r1b.y);
    ctx.lineTo(r2b.x, r2b.y);
    ctx.lineTo(r2a.x, r2a.y);
    ctx.closePath();
    ctx.fillStyle = "#1b2027";
    ctx.fill();
    ctx.strokeStyle = "#374151";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Conveyor Rollers (rotating notches)
    for (let i = 0.1; i < 0.95; i += 0.15) {
      const notchT = (i + (sceneTime * 0.25)) % 1;
      const ptA = { x: r1a.x + (r1b.x - r1a.x) * notchT, y: r1a.y + (r1b.y - r1a.y) * notchT };
      const ptB = { x: r2a.x + (r2b.x - r2a.x) * notchT, y: r2a.y + (r2b.y - r2a.y) * notchT };
      ctx.beginPath();
      ctx.moveTo(ptA.x, ptA.y);
      ctx.lineTo(ptB.x, ptB.y);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Scanner Arch Gate (at mid conveyor)
    const scanGateX = (convStartX + convEndX) * 0.5 + 4;
    const scanGateY = (convStartY + convEndY) * 0.5 - 4;
    const archP1 = projectIso(scanGateX - 6, scanGateY + 6, 4, originX, originY, tiltX, tiltY);
    const archP2 = projectIso(scanGateX - 6, scanGateY + 6, 26, originX, originY, tiltX, tiltY);
    const archP3 = projectIso(scanGateX + 16, scanGateY - 16, 26, originX, originY, tiltX, tiltY);
    const archP4 = projectIso(scanGateX + 16, scanGateY - 16, 4, originX, originY, tiltX, tiltY);

    ctx.beginPath();
    ctx.moveTo(archP1.x, archP1.y);
    ctx.lineTo(archP2.x, archP2.y);
    ctx.lineTo(archP3.x, archP3.y);
    ctx.lineTo(archP4.x, archP4.y);
    ctx.strokeStyle = config.colors.copper;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Laser scanning beam sheet
    const scanPulse = (Math.sin(sceneTime * 8) + 1) * 0.5;
    ctx.beginPath();
    ctx.moveTo(archP2.x, archP2.y);
    ctx.lineTo(archP3.x, archP3.y);
    ctx.lineTo(archP4.x, archP4.y);
    ctx.lineTo(archP1.x, archP1.y);
    ctx.closePath();
    ctx.fillStyle = `rgba(29, 233, 182, ${0.08 + scanPulse * 0.12})`;
    ctx.fill();

    // Mini cubes moving on conveyor
    conveyorCubes.forEach((cube, idx) => {
      const travelT = (cube.t + sceneTime * 0.18) % 1;
      const c3dX = convEndX + (convStartX - convEndX) * travelT + 4;
      const c3dY = convEndY + (convStartY - convEndY) * travelT - 4;

      // When passing through the scanner gate, cube glows intensely
      const isUnderScanner = Math.abs(travelT - 0.5) < 0.12;
      const glowColor = isUnderScanner ? "#ffffff" : cube.color;

      drawIsoCube(c3dX, c3dY, 6, 12, 12, 12, {
        top: isUnderScanner ? "#ffffff" : glowColor,
        left: isUnderScanner ? config.colors.teal : "#1f2937",
        right: isUnderScanner ? config.colors.copper : "#111827",
        stroke: "rgba(255, 255, 255, 0.4)"
      }, originX, originY, tiltX, tiltY);
    });

    // ------------------------------------------------------------------------
    // F. FRONT LEFT: DIAGNOSTIC DASHBOARD (TELEMETRY & WAVEFORM)
    // ------------------------------------------------------------------------
    const dashX = -60;
    const dashY = 65;
    const dashW = 34;
    const dashH = 24;

    // Monitor Stand
    const standBase = projectIso(dashX, dashY, 0, originX, originY, tiltX, tiltY);
    const standTop = projectIso(dashX, dashY, 14, originX, originY, tiltX, tiltY);
    ctx.beginPath();
    ctx.moveTo(standBase.x, standBase.y);
    ctx.lineTo(standTop.x, standTop.y);
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Angled Monitor Body
    drawIsoCube(dashX - 16, dashY, 14, dashW, 6, dashH, {
      top: "#2a323d",
      left: "#15181d",
      right: "#0f1216",
      stroke: "rgba(29, 233, 182, 0.3)"
    }, originX, originY, tiltX, tiltY);

    // Screen face content (live animated equalizers)
    const scrCorner = projectIso(dashX - 14, dashY, 16, originX, originY, tiltX, tiltY);
    for (let b = 0; b < 5; b++) {
      const barH = 4 + Math.abs(Math.sin(sceneTime * 4 + b * 1.3)) * 14;
      const barP = projectIso(dashX - 12 + b * 6, dashY + 1, 16, originX, originY, tiltX, tiltY);
      const barTop = projectIso(dashX - 12 + b * 6, dashY + 1, 16 + barH, originX, originY, tiltX, tiltY);

      ctx.beginPath();
      ctx.moveTo(barP.x, barP.y);
      ctx.lineTo(barTop.x, barTop.y);
      ctx.strokeStyle = b % 2 === 0 ? config.colors.teal : config.colors.copper;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    // ------------------------------------------------------------------------
    // G. CENTER: CENTRAL GLASS DEVELOPMENT DOME & TUMBLING 3D PRIMITIVES
    // ------------------------------------------------------------------------
    const domeBaseX = 0;
    const domeBaseY = 0;
    const domeRadius = 58;
    const domeHeight = 72;

    // Octagonal Metallic Pedestal Base
    drawIsoCube(-40, -40, 0, 80, 80, 16, {
      top: "#1f242c",
      left: "#14171c",
      right: "#181c22",
      stroke: "rgba(255, 255, 255, 0.08)"
    }, originX, originY, tiltX, tiltY);

    // Glowing Copper Ring Trim on pedestal
    const copperRingPos = projectIso(0, 0, 16.5, originX, originY, tiltX, tiltY);
    ctx.beginPath();
    ctx.ellipse(copperRingPos.x, copperRingPos.y, 48, 24, 0, 0, Math.PI * 2);
    ctx.strokeStyle = config.colors.copper;
    ctx.lineWidth = 2;
    ctx.shadowColor = config.colors.copper;
    ctx.shadowBlur = 7;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Upward Hologram Projector Light inside base
    const lightGlow = ctx.createRadialGradient(
      copperRingPos.x, copperRingPos.y - 10, 5,
      copperRingPos.x, copperRingPos.y - 25, 60
    );
    lightGlow.addColorStop(0, "rgba(29, 233, 182, 0.35)");
    lightGlow.addColorStop(0.5, "rgba(217, 140, 74, 0.15)");
    lightGlow.addColorStop(1, "rgba(28, 30, 33, 0)");
    ctx.fillStyle = lightGlow;
    ctx.beginPath();
    ctx.ellipse(copperRingPos.x, copperRingPos.y - 25, 52, 40, 0, 0, Math.PI * 2);
    ctx.fill();

    // ------------------------------------------------------------------------
    // H. TUMBLING OBJECTS INSIDE DOME (WEBSITE ASSEMBLED IN REAL-TIME)
    // ------------------------------------------------------------------------
    // Cube 1 (Teal Glowing Core)
    const floatBob1 = Math.sin(sceneTime * 2.2) * 8;
    drawTumblingCube(
      -12, -10, 38 + floatBob1,
      18,
      sceneTime * 1.4,
      sceneTime * 1.8,
      sceneTime * 0.9,
      config.colors.teal,
      originX, originY, tiltX, tiltY
    );

    // Cube 2 (Copper Brushed Core)
    const floatBob2 = Math.cos(sceneTime * 2.0 + 1.2) * 7;
    drawTumblingCube(
      14, 8, 44 + floatBob2,
      15,
      -sceneTime * 1.2,
      sceneTime * 1.5,
      -sceneTime * 1.1,
      config.colors.copper,
      originX, originY, tiltX, tiltY
    );

    // Floating Glass Sphere 1
    const sphPos1 = projectIso(-6, 18, 52 + Math.sin(sceneTime * 2.6) * 6, originX, originY, tiltX, tiltY);
    ctx.beginPath();
    ctx.arc(sphPos1.x, sphPos1.y, 7, 0, Math.PI * 2);
    const sphGrad = ctx.createRadialGradient(sphPos1.x - 2, sphPos1.y - 2, 1, sphPos1.x, sphPos1.y, 7);
    sphGrad.addColorStop(0, "#ffffff");
    sphGrad.addColorStop(0.4, config.colors.teal);
    sphGrad.addColorStop(1, "#0d3930");
    ctx.fillStyle = sphGrad;
    ctx.shadowColor = config.colors.teal;
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Floating Glass Sphere 2 (Copper mini)
    const sphPos2 = projectIso(16, -14, 30 + Math.cos(sceneTime * 2.8) * 5, originX, originY, tiltX, tiltY);
    ctx.beginPath();
    ctx.arc(sphPos2.x, sphPos2.y, 5, 0, Math.PI * 2);
    const sphGrad2 = ctx.createRadialGradient(sphPos2.x - 1.5, sphPos2.y - 1.5, 1, sphPos2.x, sphPos2.y, 5);
    sphGrad2.addColorStop(0, "#ffffff");
    sphGrad2.addColorStop(0.5, config.colors.copper);
    sphGrad2.addColorStop(1, "#451a03");
    ctx.fillStyle = sphGrad2;
    ctx.shadowColor = config.colors.copper;
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.shadowBlur = 0;

    // ------------------------------------------------------------------------
    // I. TRANSPARENT GLASS DOME OVERLAY (BELIEVABLE SPECULAR HIGHLIGHTS)
    // ------------------------------------------------------------------------
    const domeApex = projectIso(0, 0, 16 + domeHeight, originX, originY, tiltX, tiltY);
    const domeCenter = projectIso(0, 0, 16, originX, originY, tiltX, tiltY);

    // Glass Outer Silhouette (Curved Bell Dome)
    ctx.save();
    ctx.beginPath();
    // Base ellipse half
    ctx.ellipse(domeCenter.x, domeCenter.y, domeRadius, domeRadius * 0.5, 0, 0, Math.PI);
    // Smooth Bezier curve upward to apex
    ctx.bezierCurveTo(
      domeCenter.x + domeRadius * 0.95, domeCenter.y - domeHeight * 0.45,
      domeApex.x + domeRadius * 0.45, domeApex.y + 4,
      domeApex.x, domeApex.y
    );
    ctx.bezierCurveTo(
      domeApex.x - domeRadius * 0.45, domeApex.y + 4,
      domeCenter.x - domeRadius * 0.95, domeCenter.y - domeHeight * 0.45,
      domeCenter.x - domeRadius, domeCenter.y
    );
    ctx.closePath();

    // Translucent glass gradient fill
    const glassFill = ctx.createLinearGradient(domeCenter.x - domeRadius, domeApex.y, domeCenter.x + domeRadius, domeCenter.y);
    glassFill.addColorStop(0, "rgba(29, 233, 182, 0.08)");
    glassFill.addColorStop(0.5, "rgba(255, 255, 255, 0.04)");
    glassFill.addColorStop(1, "rgba(29, 233, 182, 0.12)");
    ctx.fillStyle = glassFill;
    ctx.fill();

    // Primary Specular Reflection Curve Arc (Left shoulder)
    ctx.beginPath();
    ctx.ellipse(
      domeCenter.x - domeRadius * 0.48,
      domeCenter.y - domeHeight * 0.48,
      domeRadius * 0.32,
      domeHeight * 0.42,
      -Math.PI / 5,
      0,
      Math.PI * 0.8
    );
    ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Secondary Specular Crown Accent
    ctx.beginPath();
    ctx.ellipse(domeApex.x, domeApex.y + 7, 14, 5, 0, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Glass Rim Edge Glow
    ctx.strokeStyle = "rgba(29, 233, 182, 0.35)";
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.restore();

    // ------------------------------------------------------------------------
    // J. FLOATING UI INTERFACE CARDS (ASSEMBLING LIVE IN SPACE)
    // ------------------------------------------------------------------------
    // Card 1: Miniature Webpage Header Component (Floating above scene)
    const card1T = Math.sin(sceneTime * 1.6) * 4;
    const c1Pos = projectIso(-75, -60, 95 + card1T, originX, originY, tiltX, tiltY);

    ctx.save();
    ctx.translate(c1Pos.x, c1Pos.y);
    // Card drop shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.beginPath();
    ctx.roundRect(-42, -14 + 10, 84, 28, 6);
    ctx.fill();

    // Glass UI Card
    ctx.fillStyle = "rgba(24, 28, 34, 0.88)";
    ctx.strokeStyle = "rgba(29, 233, 182, 0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(-42, -14, 84, 28, 6);
    ctx.fill();
    ctx.stroke();

    // Mini UI Nav Elements
    // Logo Pill
    ctx.fillStyle = config.colors.teal;
    ctx.beginPath();
    ctx.roundRect(-36, -7, 12, 14, 3);
    ctx.fill();

    // Mini nav menu lines
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.fillRect(-18, -4, 14, 2.5);
    ctx.fillRect(0, -4, 14, 2.5);
    ctx.fillStyle = config.colors.copper;
    ctx.fillRect(18, -4, 14, 2.5);
    ctx.restore();

    // Card 2: Interactive Product Card (Transitioning Wireframe -> Polished)
    const card2T = Math.cos(sceneTime * 1.8) * 5;
    const c2Pos = projectIso(70, 30, 90 + card2T, originX, originY, tiltX, tiltY);

    ctx.save();
    ctx.translate(c2Pos.x, c2Pos.y);
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.beginPath();
    ctx.roundRect(-36, -24 + 10, 72, 48, 6);
    ctx.fill();

    ctx.fillStyle = "rgba(22, 26, 32, 0.9)";
    ctx.strokeStyle = "rgba(217, 140, 74, 0.45)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(-36, -24, 72, 48, 6);
    ctx.fill();
    ctx.stroke();

    // Miniature image preview slot
    ctx.fillStyle = "rgba(29, 233, 182, 0.15)";
    ctx.fillRect(-30, -18, 60, 18);
    // Roti / Product silhouette preview icon
    ctx.strokeStyle = config.colors.teal;
    ctx.lineWidth = 1;
    ctx.strokeRect(-30, -18, 60, 18);

    // Text skeleton bars
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fillRect(-30, 6, 38, 3);
    ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
    ctx.fillRect(-30, 12, 26, 2.5);

    // Mini CTA button pill on the card
    ctx.fillStyle = config.colors.copper;
    ctx.beginPath();
    ctx.roundRect(14, 7, 16, 9, 3);
    ctx.fill();
    ctx.restore();

    // ------------------------------------------------------------------------
    // K. FLOATING ATMOSPHERIC MICRO-DUST PARTICLES
    // ------------------------------------------------------------------------
    ambientDust.forEach(dust => {
      dust.z += dust.vz * speed;
      if (dust.z > 170) dust.z = 15;

      const dPos = projectIso(dust.x, dust.y, dust.z, originX, originY, tiltX, tiltY);
      ctx.beginPath();
      ctx.arc(dPos.x, dPos.y, dust.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(29, 233, 182, ${dust.alpha * 0.6})`;
      ctx.fill();
    });

    ctx.restore();

    if (isRunning) {
      const raf = window.requestAnimationFrame || function (cb) { return setTimeout(cb, 16); };
      animFrameId = raf(renderScene);
    }
  }

  // ==========================================================================
  // 4. ANIMATION LIFECYCLE (START / STOP / RESIZE / VISIBILITY)
  // ==========================================================================
  function startAnimation() {
    if (isRunning) return;
    isRunning = true;
    lastTimestamp = (window.performance && window.performance.now) ? window.performance.now() : Date.now();
    const raf = window.requestAnimationFrame || function (cb) { return setTimeout(cb, 16); };
    animFrameId = raf(renderScene);
  }

  function stopAnimation() {
    isRunning = false;
    if (animFrameId) {
      const caf = window.cancelAnimationFrame || window.clearTimeout;
      caf(animFrameId);
      animFrameId = null;
    }
  }

  function handleResize() {
    if (!canvas) return;
    const container = canvas.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    if (!isRunning && isVisible) {
      renderScene(performance.now());
    }
  }

  function handleMouseMove(e) {
    if (!config.enableMouseParallax || !canvas) return;
    // Check prefers-reduced-motion
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;

    targetTiltX = nx * 1.2 * config.parallaxStrength;
    targetTiltY = ny * 1.0 * config.parallaxStrength;
  }

  function handleMouseLeave() {
    targetTiltX = 0;
    targetTiltY = 0;
  }

  // ==========================================================================
  // 5. MODAL OPEN & CLOSE CONTROLLER (SAFE & ISOLATED)
  // ==========================================================================
  function openModal() {
    if (!modalRoot) {
      initDOM();
    }

    if (isVisible) return;

    // Check displayMode rules
    if (config.displayMode === 'session' && sessionStorage.getItem(config.storageKey)) {
      return;
    }
    if (config.displayMode === 'once' && localStorage.getItem(config.storageKey)) {
      return;
    }

    lastActiveElement = document.activeElement;
    isVisible = true;

    // Prevent background scrolling safely
    document.body.classList.add('udm-scroll-locked');

    // Show modal
    modalRoot.classList.add('udm-visible');

    // Handle canvas dimensions
    setTimeout(() => {
      handleResize();
      startAnimation();
      // Set focus to the primary CTA
      const primaryBtn = document.getElementById('udm-btn-primary');
      if (primaryBtn) primaryBtn.focus();
    }, 50);

    if (typeof config.onOpen === 'function') {
      config.onOpen();
    }
  }

  function closeModal() {
    if (!isVisible) return;
    isVisible = false;

    // Reverse transition
    if (modalRoot) {
      modalRoot.classList.remove('udm-visible');
    }

    // Stop animation loop to save 100% CPU/GPU resources
    stopAnimation();

    // Restore background scrolling
    document.body.classList.remove('udm-scroll-locked');

    // Mark dismissed in storage if configured
    try {
      if (config.displayMode === 'session') {
        sessionStorage.setItem(config.storageKey, 'true');
      } else if (config.displayMode === 'once') {
        localStorage.setItem(config.storageKey, 'true');
      }
    } catch (e) {
      // Ignore private browsing storage restrictions
    }

    // Restore focus
    if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
      lastActiveElement.focus();
    }

    if (typeof config.onClose === 'function') {
      config.onClose();
    }
  }

  // ==========================================================================
  // 6. EVENT BINDINGS & KEYBOARD DISMISSAL
  // ==========================================================================
  function bindEvents() {
    // Keyboard listeners (Escape dismiss & Tab focus trapping)
    document.addEventListener('keydown', function (e) {
      if (!isVisible) return;
      if (e.key === 'Escape') {
        closeModal();
        return;
      }
      if (e.key === 'Tab' && modalRoot) {
        const focusable = modalRoot.querySelectorAll(
          'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length < 2) return;
        const firstEl = focusable[0];
        const lastEl = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            lastEl.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastEl) {
            firstEl.focus();
            e.preventDefault();
          }
        }
      }
    });

    // Page visibility API (pause animation when tab is inactive)
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stopAnimation();
      } else if (isVisible) {
        startAnimation();
      }
    });

    // Resize observer
    window.addEventListener('resize', handleResize);

    // Modal buttons & backdrop
    const closeBtn = document.getElementById('udm-btn-close');
    const primaryBtn = document.getElementById('udm-btn-primary');
    const secondaryBtn = document.getElementById('udm-btn-secondary');
    const backdrop = modalRoot.querySelector('.udm-backdrop');
    const sceneContainer = document.getElementById('udm-scene-container');

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (primaryBtn) primaryBtn.addEventListener('click', closeModal);
    if (secondaryBtn) secondaryBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);

    // Parallax mouse listeners
    if (sceneContainer) {
      sceneContainer.addEventListener('mousemove', handleMouseMove);
      sceneContainer.addEventListener('mouseleave', handleMouseLeave);
    }

    // IntersectionObserver to pause rendering when scrolled out of view
    if ('IntersectionObserver' in window && sceneContainer) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && isVisible) {
            startAnimation();
          } else {
            stopAnimation();
          }
        });
      }, { threshold: 0.1 });
      observer.observe(sceneContainer);
    }
  }

  // ==========================================================================
  // 7. INITIALIZATION
  // ==========================================================================
  function initDOM() {
    modalRoot = createModalDOM();
    canvas = document.getElementById('udm-canvas');
    if (canvas) {
      ctx = canvas.getContext('2d');
    }
    bindEvents();
    handleResize();
  }

  function init() {
    initDOM();

    if (config.showOnLoad) {
      // Check displayMode restrictions before auto-opening
      const skipSession = config.displayMode === 'session' && sessionStorage.getItem(config.storageKey);
      const skipOnce = config.displayMode === 'once' && localStorage.getItem(config.storageKey);

      if (!skipSession && !skipOnce) {
        setTimeout(openModal, config.autoOpenDelayMs);
      }
    }
  }

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ==========================================================================
  // 8. PUBLIC API EXPORT
  // Allows manual reopening, runtime re-theming, or testing via window.UnderDevModal
  // ==========================================================================
  window.UnderDevModal = {
    open: openModal,
    close: closeModal,
    isOpen: function () { return isVisible; },
    configure: function (newOpts) {
      if (newOpts && typeof newOpts === 'object') {
        if (newOpts.colors) {
          config.colors = Object.assign({}, config.colors, newOpts.colors);
        }
        Object.assign(config, newOpts);

        if (modalRoot) {
          applyCustomTheme(modalRoot);
          const heading = document.getElementById('udm-modal-title');
          const desc = document.getElementById('udm-modal-desc');
          const primaryBtn = document.getElementById('udm-btn-primary');
          const secondaryBtn = document.getElementById('udm-btn-secondary');
          const eyebrow = modalRoot.querySelector('.udm-eyebrow span:last-child');
          const badge = modalRoot.querySelector('.udm-scene-badge span:last-child');
          const status = modalRoot.querySelector('.udm-status-pill span');

          if (heading && config.heading) heading.textContent = config.heading;
          if (desc && config.description) desc.textContent = config.description;
          if (eyebrow && config.eyebrow) eyebrow.textContent = config.eyebrow;
          if (badge && config.badgeText) badge.textContent = config.badgeText;
          if (status && config.statusText) status.textContent = config.statusText;
          if (primaryBtn && config.primaryButtonText) {
            const span = primaryBtn.querySelector('span');
            if (span) span.textContent = config.primaryButtonText;
          }
          if (secondaryBtn && config.secondaryButtonText) {
            secondaryBtn.textContent = config.secondaryButtonText;
          }
          handleResize();
        }
      }
      return config;
    },
    getConfig: function () { return Object.assign({}, config); },
    resetSession: function () {
      try {
        sessionStorage.removeItem(config.storageKey);
        localStorage.removeItem(config.storageKey);
      } catch (e) {}
    }
  };

})();
