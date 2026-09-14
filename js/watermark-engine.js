/**
 * Dynamic Procedural Watermark Engine
 * Renders anti-tamper micro-shifting watermarks onto a hardware-accelerated canvas.
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.WatermarkEngine = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  class WatermarkEngine {
    constructor(canvas, options = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.options = Object.assign({
        sessionId: 'SES-ANONYMOUS',
        brand: 'SHADOW // VAULT PROTECTED',
        timestamp: new Date().toISOString(),
        tier: 'subtle-dynamic',
        fontSize: 12,
        opacity: 0.16,
        color: 'rgba(255, 255, 255,',
        driftSpeed: 0.25
      }, options);

      this.running = false;
      this.animId = null;
      this.offset = 0;
      this.lastTick = performance.now();

      this.resize();
      this.handleResize = this.resize.bind(this);
      window.addEventListener('resize', this.handleResize);
    }

    resize() {
      if (!this.canvas) return;
      const rect = this.canvas.parentElement ? this.canvas.parentElement.getBoundingClientRect() : { width: 640, height: 360 };
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.width = rect.width;
      this.height = rect.height;

      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      this.ctx.scale(dpr, dpr);
    }

    updateData(newOptions) {
      Object.assign(this.options, newOptions);
    }

    start() {
      if (this.running) return;
      this.running = true;
      this.lastTick = performance.now();
      this.render();
    }

    stop() {
      this.running = false;
      if (this.animId) {
        cancelAnimationFrame(this.animId);
        this.animId = null;
      }
    }

    render() {
      // Watermark completely disabled as requested: keep canvas transparent & clean
      if (this.ctx) {
        this.ctx.clearRect(0, 0, this.width || 1, this.height || 1);
      }
      this.stop();
    }

    destroy() {
      this.stop();
      window.removeEventListener('resize', this.handleResize);
    }
  }

  return WatermarkEngine;
});
