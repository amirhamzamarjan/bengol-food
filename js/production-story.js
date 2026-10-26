/**
 * US BENGOL - Enhanced Cinematic Production Story (v4)
 * 
 * Features:
 * 1. Pinned/Stuck Background Video with smooth scroll-scrubbing.
 * 2. Dedicated interactive scrubber slider & 6 clickable stage buttons (01-06).
 * 3. Mobile autoplay & Play/Pause toggle (solves mobile video freeze).
 * 4. Real-time synchronization between video time, scroll position, and stage captions.
 * 5. Paced scroll distances so PC scrolling doesn't fly past too fast.
 */

(function (window) {
  'use strict';

  let videoEl = null;
  let trackEl = null;
  let captionEls = [];
  let isReady = false;
  let ticking = false;
  let isPlaying = false;
  let isUserScrubbing = false;
  let captions = [];
  let duration = 0;
  const isMobile = window.innerWidth <= 768;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initProductionStory() {
    trackEl = document.getElementById('production-track') || document.getElementById('production-story');
    videoEl = document.getElementById('production-video');
    if (!trackEl || !videoEl) return;

    const captionContainer = document.getElementById('production-captions');
    captions = window.US_BENGOL_CONFIG?.productionCaptions || [];

    // Build stage caption cards
    if (captionContainer && captions.length > 0) {
      captionContainer.innerHTML = captions.map((cap, i) => `
        <article class="prod-caption ${i === 0 ? 'active' : ''}" data-index="${i}" data-start="${cap.startPercent}" data-end="${cap.endPercent}">
          <div class="prod-caption-header">
            <span class="prod-caption-stage-pill">STAGE ${String(i + 1).padStart(2, '0')}</span>
            <span class="prod-caption-facility">ULLAPARA PRODUCTION</span>
          </div>
          <h3 class="prod-caption-title">${cap.title}</h3>
          ${cap.bengaliTitle ? `<div class="prod-caption-bengali bengali-accent">${cap.bengaliTitle}</div>` : ''}
          <p class="prod-caption-desc">${cap.description}</p>
        </article>
      `).join('');
      captionEls = captionContainer.querySelectorAll('.prod-caption');
    }

    // Video preparation
    videoEl.muted = true;
    videoEl.playsInline = true;
    videoEl.setAttribute('playsinline', '');
    videoEl.setAttribute('webkit-playsinline', '');

    const onMeta = () => {
      isReady = true;
      duration = videoEl.duration || 1;
      updateTimeDisplay(videoEl.currentTime, duration);
      updateOnScroll();
    };

    videoEl.addEventListener('loadedmetadata', onMeta);
    if (videoEl.readyState >= 1) {
      onMeta();
    }

    // Interactive Stage Tick Buttons (01 - 06)
    const stageTicks = document.querySelectorAll('.stage-tick-btn');
    stageTicks.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const stageIdx = parseInt(btn.dataset.stage, 10);
        jumpToStage(stageIdx);
      });
    });

    // Interactive Scrubber Bar (click & drag)
    const scrubberBar = document.getElementById('production-scrubber-bar');
    if (scrubberBar) {
      const handleScrub = (clientX) => {
        const rect = scrubberBar.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        seekToRatio(ratio);
      };

      scrubberBar.addEventListener('mousedown', (e) => {
        isUserScrubbing = true;
        handleScrub(e.clientX);
        const onMouseMove = (ev) => {
          if (isUserScrubbing) handleScrub(ev.clientX);
        };
        const onMouseUp = () => {
          isUserScrubbing = false;
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
        };
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      });

      scrubberBar.addEventListener('touchstart', (e) => {
        isUserScrubbing = true;
        if (e.touches[0]) handleScrub(e.touches[0].clientX);
      }, { passive: true });

      scrubberBar.addEventListener('touchmove', (e) => {
        if (isUserScrubbing && e.touches[0]) handleScrub(e.touches[0].clientX);
      }, { passive: true });

      scrubberBar.addEventListener('touchend', () => {
        isUserScrubbing = false;
      });
    }

    // Play / Pause Toggle Button
    const playBtn = document.getElementById('btn-video-play');
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        togglePlay();
      });
    }

    // Timeupdate listener when video is playing
    videoEl.addEventListener('timeupdate', () => {
      if (isUserScrubbing) return;
      if (videoEl.duration) {
        const progress = videoEl.currentTime / videoEl.duration;
        updateUI(progress, videoEl.currentTime, videoEl.duration);
      }
    });

    videoEl.addEventListener('play', () => {
      isPlaying = true;
      updatePlayButtonUI(true);
    });

    videoEl.addEventListener('pause', () => {
      isPlaying = false;
      updatePlayButtonUI(false);
    });

    // Auto-play video smoothly when section is in view on mobile
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Unmute & auto-play in background to guarantee smooth streaming on mobile
            videoEl.play().catch(() => {
              // Browser may require user touch; will play on first click/scrub
            });
          } else {
            if (!videoEl.paused) videoEl.pause();
          }
        });
      }, { threshold: 0.15 });
      observer.observe(trackEl);
    }

    if (prefersReducedMotion) {
      trackEl.classList.add('reduced-motion');
      if (captionEls.length > 0) captionEls[0].classList.add('active');
      return;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    // Initial check
    setTimeout(updateOnScroll, 120);
  }

  function togglePlay() {
    if (!videoEl) return;
    if (videoEl.paused) {
      videoEl.play().then(() => {
        isPlaying = true;
        updatePlayButtonUI(true);
      }).catch((err) => {
        console.warn('Playback error:', err);
      });
    } else {
      videoEl.pause();
      isPlaying = false;
      updatePlayButtonUI(false);
    }
  }

  function updatePlayButtonUI(playing) {
    const playBtn = document.getElementById('btn-video-play');
    const playIcon = document.getElementById('play-toggle-icon');
    const playLabel = document.getElementById('play-toggle-label');
    if (!playBtn) return;

    if (playing) {
      playBtn.classList.add('playing');
      if (playLabel) playLabel.textContent = 'Pause';
      if (playIcon) {
        playIcon.innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
      }
    } else {
      playBtn.classList.remove('playing');
      if (playLabel) playLabel.textContent = 'Play Video';
      if (playIcon) {
        playIcon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>';
      }
    }
  }

  function jumpToStage(idx) {
    if (!captions[idx] || !videoEl) return;
    const startP = captions[idx].startPercent / 100;
    seekToRatio(startP);
  }

  function seekToRatio(ratio) {
    if (!videoEl) return;
    const safeRatio = Math.max(0, Math.min(1, ratio));
    const targetTime = safeRatio * (videoEl.duration || 1);
    
    videoEl.currentTime = targetTime;
    updateUI(safeRatio, targetTime, videoEl.duration || 1);
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateOnScroll);
      ticking = true;
    }
  }

  function updateOnScroll() {
    ticking = false;
    if (!trackEl || !videoEl || isUserScrubbing) return;

    const rect = trackEl.getBoundingClientRect();
    const windowH = window.innerHeight;
    const maxScroll = trackEl.offsetHeight - windowH;

    if (maxScroll <= 0) return;

    // scrollDistance is how far the top of the track has passed the top of the viewport
    const scrollDistance = -rect.top;
    let progress = scrollDistance / maxScroll;
    progress = Math.max(0, Math.min(1, progress));

    // Bulletproof Sticky Fallback for mobile devices where native sticky fails
    const stageEl = document.getElementById('production-sticky-stage') || trackEl.querySelector('.production-sticky-stage');
    if (stageEl) {
      if (rect.top <= 0 && rect.bottom >= windowH) {
        // Inside the active track: if native sticky failed to hold at top: 0, fix with JS
        const stageRect = stageEl.getBoundingClientRect();
        if (stageRect.top < -5) {
          stageEl.style.position = 'fixed';
          stageEl.style.top = '0px';
          stageEl.style.left = '0px';
          stageEl.style.width = '100%';
          stageEl.style.zIndex = '15';
        }
      } else if (rect.bottom < windowH) {
        // Scrolled past the track: release at the bottom of the track
        if (stageEl.style.position === 'fixed') {
          stageEl.style.position = 'absolute';
          stageEl.style.top = Math.max(0, trackEl.offsetHeight - windowH) + 'px';
          stageEl.style.left = '0px';
        }
      } else {
        // Scrolled above the track: release at top
        if (stageEl.style.position === 'fixed') {
          stageEl.style.position = 'absolute';
          stageEl.style.top = '0px';
          stageEl.style.left = '0px';
        }
      }
    }

    // If within the active pinned section, scrub video time
    if (rect.top <= 0 && rect.bottom >= windowH) {
      if (videoEl.duration && !isPlaying) {
        const targetTime = progress * videoEl.duration;
        if (Math.abs(videoEl.currentTime - targetTime) > 0.04) {
          videoEl.currentTime = targetTime;
        }
      }
      updateUI(progress, videoEl.currentTime, videoEl.duration || 1);
    }
  }

  function updateUI(progress, curTime, dur) {
    const progressPercent = Math.max(0, Math.min(100, progress * 100));

    // 1. Update Scrubber Progress Fill & Thumb
    const progressBar = document.getElementById('production-progress');
    const thumb = document.getElementById('production-thumb');
    if (progressBar) progressBar.style.width = `${progressPercent}%`;
    if (thumb) thumb.style.left = `${progressPercent}%`;

    // 2. Determine Active Stage Caption
    let currentIdx = 0;
    captionEls.forEach((el, idx) => {
      const start = parseFloat(el.dataset.start);
      const end = parseFloat(el.dataset.end);
      const isLast = (idx === captionEls.length - 1);
      const inRange = isLast 
        ? (progressPercent >= start) 
        : (progressPercent >= start && progressPercent < end);

      if (inRange) {
        el.classList.add('active');
        currentIdx = idx;
      } else {
        el.classList.remove('active');
      }
    });

    // 3. Update HUD Stage Counter (e.g. STAGE 03 / 06)
    const counterEl = document.getElementById('hud-stage-counter');
    if (counterEl && captions[currentIdx]) {
      counterEl.textContent = `STAGE ${String(currentIdx + 1).padStart(2, '0')} / ${String(captions.length).padStart(2, '0')}`;
    }

    // 4. Update Clickable Stage Ticks (highlight active)
    const stageTicks = document.querySelectorAll('.stage-tick-btn');
    stageTicks.forEach((btn, idx) => {
      if (idx === currentIdx) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // 5. Update Time Display
    updateTimeDisplay(curTime, dur);
  }

  function updateTimeDisplay(curTime, dur) {
    const timeDisplay = document.getElementById('hud-time-display');
    if (!timeDisplay) return;

    const formatTime = (secs) => {
      if (isNaN(secs) || secs < 0) return '0:00';
      const m = Math.floor(secs / 60);
      const s = Math.floor(secs % 60);
      return `${m}:${String(s).padStart(2, '0')}`;
    };

    timeDisplay.textContent = `${formatTime(curTime)} / ${formatTime(dur)}`;
  }

  window.USB_ProductionStory = {
    init: initProductionStory,
    togglePlay: togglePlay,
    jumpToStage: jumpToStage
  };
})(window);
