/**
 * US BENGOL - Restrained Premium Motion & Scroll Animations
 * 
 * Powered by native IntersectionObserver and performant CSS transforms.
 * Honors prefers-reduced-motion.
 */

(function (window) {
  'use strict';

  function initAnimations() {
    // Check user accessibility preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      document.querySelectorAll('.prep-step-card').forEach(el => el.classList.add('in-view'));
      return;
    }

    // 1. Scroll-triggered reveal for "How We Prepare" steps
    const stepCards = document.querySelectorAll('.prep-step-card');
    if ('IntersectionObserver' in window && stepCards.length > 0) {
      const stepObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      }, {
        threshold: 0.2,
        rootMargin: '0px 0px -40px 0px'
      });

      stepCards.forEach(card => stepObserver.observe(card));
    } else {
      stepCards.forEach(card => card.classList.add('in-view'));
    }

    // 2. Generic scroll reveals for editorial cards
    const revealElements = document.querySelectorAll('.scroll-reveal');
    if ('IntersectionObserver' in window && revealElements.length > 0) {
      const generalObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            generalObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(24px)';
        el.style.transition = 'opacity 0.7s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1)';
        generalObserver.observe(el);
      });
    }

    // 3. Navbar scroll listener
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }, { passive: true });
    }
  }

  window.USB_Animations = {
    init: initAnimations
  };
})(window);
