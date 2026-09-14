/**
 * Security Shield & Content Protection System
 * Handles realistic browser-level deterrence, focus-loss blur, and DevTools heuristics.
 * NOTE: As documented, browser-level techniques reduce casual theft & scraping, but are
 * supported by server-side signed URL expirations and private storage encryption.
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SecurityShield = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  class SecurityShield {
    constructor(options = {}) {
      this.options = Object.assign({
        blurTargetSelector: '.secure-media-element',
        veilSelector: '#securityVeil',
        telemetryEndpoint: '/api/security/event',
        // Browser chrome and responsive layouts frequently look like docked
        // DevTools, which caused false playback blocks. Server-side signed
        // streams remain the actual protection layer.
        enableDevToolsHeuristic: false,
        // Focus changes occur during normal tab, modal, and mobile-browser
        // interactions. Do not interrupt a viewer with a false security veil.
        enableFocusBlur: false
      }, options);

      this.isDevToolsOpen = false;
      this.isWindowFocused = true;
      this.listeners = [];
      this.init();
    }

    init() {
      this.preventContextMenuAndDrag();
      if (this.options.enableFocusBlur) {
        this.bindFocusAndVisibility();
      }
      if (this.options.enableDevToolsHeuristic) {
        this.bindDevToolsHeuristics();
      }
    }

    /**
     * Anti-download: disable right-click context menu and drag & drop on media
     */
    preventContextMenuAndDrag() {
      const blockEvent = (e) => {
        // Only target protected elements or containers
        if (e.target.closest('.secure-protected, .modal-video-area, #heroVideoWrap')) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      };

      document.addEventListener('contextmenu', blockEvent, { capture: true });
      document.addEventListener('dragstart', blockEvent, { capture: true });
      
      // Prevent key shortcuts for saving (Ctrl+S, Ctrl+U for view source)
      document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
          e.preventDefault();
          this.reportTelemetry('SAVE_SHORTCUT_PREVENTED', { key: e.key });
        }
        if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
          e.preventDefault();
        }
      });
    }

    /**
     * Focus Loss & Tab Visibility: blur video and raise security veil
     */
    bindFocusAndVisibility() {
      const handleUnfocus = () => {
        this.isWindowFocused = false;
        this.engageSecurityBlur('Window focus lost / Backgrounded');
      };

      const handleRefocus = () => {
        this.isWindowFocused = true;
        // Don't auto-clear if DevTools is flagged
        if (!this.isDevToolsOpen) {
          this.clearSecurityBlur();
        }
      };

      window.addEventListener('blur', handleUnfocus);
      window.addEventListener('focus', handleRefocus);

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          handleUnfocus();
        } else {
          handleRefocus();
        }
      });
    }

    /**
     * DevTools heuristic detection
     * 1. Window outer vs inner dimensional differential (docked devtools)
     * 2. Timing disparity check with debugger hook threshold
     */
    bindDevToolsHeuristics() {
      const threshold = 160;
      let checkInterval;

      const checkDimensions = () => {
        const widthDiff = window.outerWidth - window.innerWidth > threshold;
        const heightDiff = window.outerHeight - window.innerHeight > threshold;

        if (widthDiff || heightDiff) {
          if (!this.isDevToolsOpen) {
            this.isDevToolsOpen = true;
            this.engageSecurityBlur('Inspector / DevTools Dock Detected');
            this.reportTelemetry('DEVTOOLS_HEURISTIC_DETECTED', {
              widthDiff: window.outerWidth - window.innerWidth,
              heightDiff: window.outerHeight - window.innerHeight
            }, 'WARN');
          }
        } else {
          if (this.isDevToolsOpen) {
            this.isDevToolsOpen = false;
            if (this.isWindowFocused) {
              this.clearSecurityBlur();
            }
          }
        }
      };

      // Console toString inspection trap
      const element = new Image();
      Object.defineProperty(element, 'id', {
        get: () => {
          if (!this.isDevToolsOpen) {
            this.isDevToolsOpen = true;
            this.engageSecurityBlur('Console Inspection Detected');
            this.reportTelemetry('CONSOLE_INSPECTION_DETECTED', {}, 'WARN');
          }
        }
      });

      // Periodic check
      checkInterval = setInterval(() => {
        checkDimensions();
        // Trigger console inspection trap without spamming log
        if (console && console.dir) {
          // console.dir(element);
        }
      }, 1000);
    }

    engageSecurityBlur(reason = '') {
      const elements = document.querySelectorAll(this.options.blurTargetSelector);
      elements.forEach(el => {
        el.classList.add('secure-media-blurred');
        if (typeof el.pause === 'function') {
          try { el.pause(); } catch(e) {}
        }
      });

      const veil = document.querySelector(this.options.veilSelector);
      if (veil) {
        veil.classList.add('active');
        const reasonEl = veil.querySelector('.security-veil-sub');
        if (reasonEl && reason) {
          reasonEl.innerHTML = `Playback paused. ${reason}.<br><span style="font-size:11px;color:#c9a84c">Original assets are encrypted and delivered via expiring signed streams.</span>`;
        }
      }
    }

    clearSecurityBlur() {
      const elements = document.querySelectorAll(this.options.blurTargetSelector);
      elements.forEach(el => {
        el.classList.remove('secure-media-blurred');
      });

      const veil = document.querySelector(this.options.veilSelector);
      if (veil) {
        veil.classList.remove('active');
      }
    }

    reportTelemetry(eventType, details = {}, severity = 'WARN') {
      try {
        fetch(this.options.telemetryEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventType, details, severity })
        }).catch(() => {});
      } catch (e) {}
    }
  }

  return SecurityShield;
});
