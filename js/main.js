/* SHADOW — Advanced 15-System Spatial & Physics Animation Engine
   ═════════════════════════════════════════════════════════════════
   1.  🧊 3D Spatial Loader (Cube, Orbiters, Light Burst, Page Transition)
   2.  🧲 Physics Cursor (Inertia, Velocity Vector, Squash & Stretch, Shapes, Particle Wake)
   3.  🌀 Spatial Navigation (Glass Depth, Mouse Parallax, Active-Section Illumination)
   4.  🔤 True 3D Typography (Glyph Depth, Stagger, Perspective, Continuous Breathing)
   5.  🌌 Aurora Environment (4 Depth Planes, Parallax Stacking)
   6.  🎬 Cinematic Preview (Mouse-Controlled Camera Perspective, Glare Dynamics)
   7.  💎 Portfolio Cards (Holographic Specular Glare, Depth Layers, 3D Tilt)
   8.  🪄 Physically Springing Active Filter Pill (Dynamic Geometry & Spring Transition)
   9.  📊 Living Statistics (Mechanical 3D Odometer Rolling Digits)
   10. 🧬 Timeline (Living Laser Energy Beam Traveling with Scroll, Milestone Surge)
   11. ⚡ Skills (Miniature 3D Gyroscope Object Motion Language)
   12. 🧿 SVG System (Distinctive Motion Language per Tool Icon)
   13. 🫧 Contact Form (Depth-Responsive Glass Surface & Localized Flashlight Inputs)
   14. 🪐 Social Buttons (Miniature 3D Planetary Worlds & Colored Orbit Satellites)
   15. ✨ Footer (Ambient Stardust Generator & Depth-Reactive 3D Typography)
   ═════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ═══════════════════════════════════════════════════════════
  // 0. 🧈 SMOOTH INERTIA SCROLL ENGINE (Lenis-style)
  //    Intercepts native scroll and lerps position for buttery smoothness.
  //    All scroll-dependent systems read from smoothScrollY instead of window.scrollY.
  // ═══════════════════════════════════════════════════════════
  let smoothScrollY = window.scrollY;
  let targetScrollY = window.scrollY;
  const SCROLL_LERP = 0.088; // damping factor — lower = smoother/slower
  let scrollVelocity = 0;
  let isScrolling = false;

  // Intercept wheel events for momentum
  window.addEventListener('wheel', (e) => {
    e.preventDefault();
    targetScrollY += e.deltaY;
    targetScrollY = Math.max(0, Math.min(targetScrollY, document.documentElement.scrollHeight - window.innerHeight));
    if (!isScrolling) {
      isScrolling = true;
      requestAnimationFrame(smoothScrollLoop);
    }
  }, { passive: false });

  // Touch support — pass through native scroll on mobile
  let touchStartY = 0;
  window.addEventListener('touchstart', (e) => { touchStartY = e.touches[0].clientY; }, { passive: true });
  window.addEventListener('touchmove', (e) => {
    const dy = touchStartY - e.touches[0].clientY;
    touchStartY = e.touches[0].clientY;
    targetScrollY += dy;
    targetScrollY = Math.max(0, Math.min(targetScrollY, document.documentElement.scrollHeight - window.innerHeight));
    if (!isScrolling) {
      isScrolling = true;
      requestAnimationFrame(smoothScrollLoop);
    }
  }, { passive: true });

  // Keep targetScrollY in sync with programmatic scrollTo / anchor clicks
  window.addEventListener('scroll', () => {
    // Only sync if native scroll diverges significantly (e.g. anchor jump)
    if (Math.abs(window.scrollY - smoothScrollY) > 100) {
      targetScrollY = window.scrollY;
      smoothScrollY = window.scrollY;
    }
  }, { passive: true });
  requestAnimationFrame(onScroll);

  function smoothScrollLoop() {
    const prev = smoothScrollY;
    smoothScrollY += (targetScrollY - smoothScrollY) * SCROLL_LERP;
    scrollVelocity = smoothScrollY - prev;

    // Snap when close enough
    if (Math.abs(targetScrollY - smoothScrollY) < 0.5) {
      smoothScrollY = targetScrollY;
      scrollVelocity = 0;
    }

    window.scrollTo(0, smoothScrollY);

    if (Math.abs(targetScrollY - smoothScrollY) > 0.5) {
      requestAnimationFrame(smoothScrollLoop);
    } else {
      isScrolling = false;
    }
  }

  // ═══════════════════════════════════════════════════════════
  // 1. DIRECT PORTFOLIO INITIALIZATION (Loader Removed)
  // ═══════════════════════════════════════════════════════════
  window.addEventListener('DOMContentLoaded', () => {
    initAnimations();
    initSpatialSphere();
    initSplitText();
    initWaveform();
    initShowcaseControls();
    initSpringFilterPill();
    initTimelineBeam();
    initFooterStardust();
  });

  // Fallback trigger
  setTimeout(() => {
    if (typeof initAnimations === 'function') initAnimations();
    if (typeof initSpatialSphere === 'function') initSpatialSphere();
    if (typeof initSplitText === 'function') initSplitText();
  }, 100);

  // ═══════════════════════════════════════════════════════════
  // 2. 🧲 PHYSICS CURSOR (Velocity, Squash/Stretch, Shapes, Wake)
  // ═══════════════════════════════════════════════════════════
  const cursor = document.getElementById('cursor');
  const cursorRing = document.getElementById('cursorRing');
  const cursorTrail = document.getElementById('cursorTrail');

  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let lastMouseX = mouseX, lastMouseY = mouseY;
  let ringX = mouseX, ringY = mouseY;
  let velocityX = 0, velocityY = 0;
  let speed = 0;
  let wakeThrottle = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Velocity calculation for squash & stretch
    velocityX = mouseX - lastMouseX;
    velocityY = mouseY - lastMouseY;
    speed = Math.hypot(velocityX, velocityY);

    if (cursor) {
      cursor.style.left = mouseX + 'px';
      cursor.style.top = mouseY + 'px';

      // Kinetic squash & stretch along movement vector
      if (speed > 2) {
        const angle = Math.atan2(velocityY, velocityX) * (180 / Math.PI);
        const stretch = Math.min(1.45, 1 + speed * 0.015);
        const squash = Math.max(0.65, 1 - speed * 0.012);
        cursor.style.setProperty('--cursor-angle', angle.toFixed(1) + 'deg');
        cursor.style.setProperty('--cursor-scale-x', stretch.toFixed(2));
        cursor.style.setProperty('--cursor-scale-y', squash.toFixed(2));
      } else {
        cursor.style.setProperty('--cursor-angle', '0deg');
        cursor.style.setProperty('--cursor-scale-x', '1');
        cursor.style.setProperty('--cursor-scale-y', '1');
      }
    }

    // Hero mouse ambient glow
    const heroGlow = document.getElementById('mouseGlow');
    if (heroGlow) {
      heroGlow.style.left = mouseX + 'px';
      heroGlow.style.top = mouseY + 'px';
    }

    // Nav mouse sheen
    const nav = document.getElementById('nav');
    if (nav) {
      const rect = nav.getBoundingClientRect();
      if (mouseY <= rect.bottom + 40) {
        nav.style.setProperty('--nav-x', (mouseX - rect.left) + 'px');
      }
    }

    // Golden particle wake
    wakeThrottle++;
    if (cursorTrail && wakeThrottle % 2 === 0 && speed > 3) {
      createWakeParticle(mouseX, mouseY, velocityX, velocityY);
    }

    lastMouseX = mouseX;
    lastMouseY = mouseY;
  });

  function createWakeParticle(x, y, vx, vy) {
    const dot = document.createElement('div');
    dot.className = 'cursor-trail-dot';
    const scatterX = (Math.random() - 0.5) * 8 - vx * 0.15;
    const scatterY = (Math.random() - 0.5) * 8 - vy * 0.15;
    dot.style.left = (x + scatterX) + 'px';
    dot.style.top = (y + scatterY) + 'px';
    const size = 3 + Math.random() * 4;
    dot.style.width = size + 'px';
    dot.style.height = size + 'px';

    if (window._nebulaInstance && window._nebulaInstance.currentPalette) {
      const pal = window._nebulaInstance.currentPalette;
      if (pal.colHighlight) {
        const r = Math.round(pal.colHighlight[0] * 255);
        const g = Math.round(pal.colHighlight[1] * 255);
        const b = Math.round(pal.colHighlight[2] * 255);
        dot.style.background = `radial-gradient(circle, rgb(${r},${g},${b}), rgba(${r},${g},${b},0.15))`;
        dot.style.boxShadow = `0 0 12px rgba(${r},${g},${b},0.6)`;
      }
    }

    cursorTrail.appendChild(dot);
    setTimeout(() => dot.remove(), 600);
  }

  // Smooth elastic cursor ring physics
  function animateCursorRing() {
    const ease = 0.14;
    ringX += (mouseX - ringX) * ease;
    ringY += (mouseY - ringY) * ease;
    if (cursorRing) {
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top = ringY + 'px';
    }
    requestAnimationFrame(animateCursorRing);
  }
  animateCursorRing();

  // Cursor morph shapes based on element type
  function bindCursorShapes(root = document) {
    // Pill shape for filter buttons & hero actions
    root.querySelectorAll('.filter-btn, .hero-actions .btn-primary, .hero-actions .btn-ghost').forEach(el => {
      if (el.dataset.cursorPillBound) return;
      el.dataset.cursorPillBound = 'true';
      el.addEventListener('mouseenter', () => {
        if (cursorRing) {
          cursorRing.classList.add('hover', 'shape-pill');
        }
        if (cursor) cursor.classList.add('hover');
      });
      el.addEventListener('mouseleave', () => {
        if (cursorRing) {
          cursorRing.classList.remove('hover', 'shape-pill');
        }
        if (cursor) cursor.classList.remove('hover');
      });
    });

    // Diamond / rounded card shape for portfolio & skill cards
    root.querySelectorAll('.project-card, .skill-card, .stat-card').forEach(el => {
      if (el.dataset.cursorCardBound) return;
      el.dataset.cursorCardBound = 'true';
      el.addEventListener('mouseenter', () => {
        if (cursorRing) {
          cursorRing.classList.add('hover', 'shape-card');
        }
        if (cursor) cursor.classList.add('hover');
      });
      el.addEventListener('mouseleave', () => {
        if (cursorRing) {
          cursorRing.classList.remove('hover', 'shape-card');
        }
        if (cursor) cursor.classList.remove('hover');
      });
    });

    // Circular video target shape
    root.querySelectorAll('.hero-video-preview, .showcase-video-area').forEach(el => {
      if (el.dataset.cursorVideoBound) return;
      el.dataset.cursorVideoBound = 'true';
      el.addEventListener('mouseenter', () => {
        if (cursorRing) {
          cursorRing.classList.add('hover', 'shape-video');
        }
      });
      el.addEventListener('mouseleave', () => {
        if (cursorRing) {
          cursorRing.classList.remove('hover', 'shape-video');
        }
      });
    });

    // General hover for other links & social buttons
    root.querySelectorAll('a:not(.nav-cta), button:not(.filter-btn), .social-link').forEach(el => {
      if (el.dataset.cursorGeneralBound) return;
      el.dataset.cursorGeneralBound = 'true';
      el.addEventListener('mouseenter', () => {
        if (cursor) cursor.classList.add('hover');
        if (cursorRing) cursorRing.classList.add('hover');
      });
      el.addEventListener('mouseleave', () => {
        if (cursor) cursor.classList.remove('hover');
        if (cursorRing) cursorRing.classList.remove('hover');
      });
    });
  }
  bindCursorShapes();

  // ═══════════════════════════════════════════════════════════
  // 3. 🌀 SPATIAL NAVIGATION (Active Illumination & Scroll Spy)
  // ═══════════════════════════════════════════════════════════
  const navLinks = document.querySelectorAll('.nav-links a[data-target]');
  const sections = ['portfolio', 'showcase', 'about', 'skills', 'contact'];

  function updateActiveNavSection() {
    const scrollPos = window.scrollY + 200;
    let activeId = '';

    for (let i = sections.length - 1; i >= 0; i--) {
      const sec = document.getElementById(sections[i]);
      if (sec && sec.offsetTop <= scrollPos) {
        activeId = sections[i];
        break;
      }
    }

    navLinks.forEach(link => {
      if (link.dataset.target === activeId) {
        link.classList.add('active-section');
      } else {
        link.classList.remove('active-section');
      }
    });
  }

  // ═══════════════════════════════════════════════════════════
  // 4. 🔤 SUPER ADVANCED 3D TYPOGRAPHY (Word Flow + Magnetic 2-4 Letter Proximity)
  // ═══════════════════════════════════════════════════════════
  function initSplitText() {
    const title = document.getElementById('heroTitle');
    if (!title || title.dataset.splitDone) return;
    title.dataset.splitDone = 'true';

    const html = title.innerHTML;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    let wordIndex = 0;
    let globalLetterIndex = 0;
    const allLetterSpans = [];

    function processNode(node) {
      if (node.nodeType === 3) {
        const text = node.textContent;
        const tokens = text.split(/(\s+)/);
        const fragment = document.createDocumentFragment();

        tokens.forEach(token => {
          if (!token) return;
          if (/^\s+$/.test(token)) {
            fragment.appendChild(document.createTextNode(token));
          } else {
            // Word container (animates as a cohesive unit)
            const wordSpan = document.createElement('span');
            wordSpan.className = 'split-word';
            wordSpan.setAttribute('data-word', token);
            // Low attack whole-word entrance
            wordSpan.style.animationDelay = (0.2 + wordIndex * 0.14) + 's';
            // Smooth undulating breathing wave
            wordSpan.style.setProperty('--word-delay', (wordIndex * 0.4) + 's');

            // Individual letter spans inside the word for super-soft 2-4 letter mouse attraction
            for (let i = 0; i < token.length; i++) {
              const charSpan = document.createElement('span');
              charSpan.className = 'split-char';
              charSpan.textContent = token[i];
              charSpan.setAttribute('data-char', token[i]);
              
              // Physics state for silky smooth interpolation
              const letterObj = {
                el: charSpan,
                curZ: 0,
                curY: 0,
                curScale: 1,
                curGlow: 0,
                curBlur: 0,
                targetZ: 0,
                targetY: 0,
                targetScale: 1,
                targetGlow: 0,
                targetBlur: 0
              };
              allLetterSpans.push(letterObj);
              wordSpan.appendChild(charSpan);
              globalLetterIndex++;
            }

            fragment.appendChild(wordSpan);
            wordIndex++;
          }
        });
        return fragment;
      } else if (node.nodeType === 1) {
        const clone = node.cloneNode(false);
        const children = Array.from(node.childNodes);
        children.forEach(child => {
          clone.appendChild(processNode(child));
        });
        return clone;
      }
      return node.cloneNode(true);
    }

    const result = document.createDocumentFragment();
    Array.from(tempDiv.childNodes).forEach(child => {
      result.appendChild(processNode(child));
    });

    title.innerHTML = '';
    title.appendChild(result);

    // After word entrance cascade completes, smoothly activate continuous wave breath
    const revealDuration = (0.2 + wordIndex * 0.14 + 1.4) * 1000;
    setTimeout(() => {
      title.classList.add('split-revealed');
    }, revealDuration);

    // ── SUPER SMOOTH 2-4 LETTER PROXIMITY ATTRACTION ENGINE ──
    // When the mouse moves across the text, letters within a tight Gaussian radius
    // (affecting ~2 to 4 letters simultaneously) softly lift in 3D depth, clear their optical blur,
    // and radiate a warm specular glow with zero harshness.
    let mousePageX = -9999, mousePageY = -9999;
    let isMouseOverHero = false;

    const hero = document.getElementById('hero');
    if (hero) {
      let currentTiltX = 0, currentTiltY = 0;
      let targetTiltX = 0, targetTiltY = 0;

      hero.addEventListener('mousemove', (e) => {
        isMouseOverHero = true;
        mousePageX = e.clientX;
        mousePageY = e.clientY;

        const rect = hero.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width - 0.5;
        const ny = (e.clientY - rect.top) / rect.height - 0.5;
        targetTiltY = nx * 8; // silky perspective rotation
        targetTiltX = -ny * 6;
      });

      hero.addEventListener('mouseleave', () => {
        isMouseOverHero = false;
        mousePageX = -9999;
        mousePageY = -9999;
        targetTiltX = 0;
        targetTiltY = 0;
      });

      // Smooth 60fps RAF loop interpolating proximity and whole-title tilt
      function animateTypographyPhysics() {
        // Smooth title tilt interpolation
        currentTiltX += (targetTiltX - currentTiltX) * 0.05;
        currentTiltY += (targetTiltY - currentTiltY) * 0.05;
        title.style.transform = `perspective(1200px) rotateX(${currentTiltX.toFixed(2)}deg) rotateY(${currentTiltY.toFixed(2)}deg)`;

        // Proximity radius tailored for 2 to 4 letters (~60px to 90px radius)
        const radius = 80;
        const radiusSq = radius * radius;

        for (let i = 0; i < allLetterSpans.length; i++) {
          const item = allLetterSpans[i];
          if (!isMouseOverHero) {
            item.targetZ = 0;
            item.targetY = 0;
            item.targetScale = 1;
            item.targetGlow = 0;
          } else {
            const rect = item.el.getBoundingClientRect();
            const letterCenterX = rect.left + rect.width / 2;
            const letterCenterY = rect.top + rect.height / 2;

            const dx = mousePageX - letterCenterX;
            const dy = mousePageY - letterCenterY;
            const distSq = dx * dx + dy * dy;

            if (distSq < radiusSq) {
              const dist = Math.sqrt(distSq);
              // Ultra-smooth cosine falloff curve (soft high crest, gentle slope)
              const factor = Math.cos((dist / radius) * (Math.PI / 2));
              const intensity = Math.pow(factor, 1.6); // silky concentration on 2-4 closest letters

              item.targetZ = intensity * 34; // lift up to +34px toward viewer
              item.targetY = -intensity * 8; // gentle float upward
              item.targetScale = 1 + intensity * 0.12; // soft expansion
              item.targetGlow = intensity;
            } else {
              item.targetZ = 0;
              item.targetY = 0;
              item.targetScale = 1;
              item.targetGlow = 0;
            }
          }

          // Smooth lerp (soft spring physics, no abrupt jumps)
          item.curZ += (item.targetZ - item.curZ) * 0.09;
          item.curY += (item.targetY - item.curY) * 0.09;
          item.curScale += (item.targetScale - item.curScale) * 0.09;
          item.curGlow += (item.targetGlow - item.curGlow) * 0.09;

          // Apply transform & lighting when active
          if (Math.abs(item.curZ) > 0.1 || Math.abs(item.curY) > 0.1 || Math.abs(item.curScale - 1) > 0.002 || item.curGlow > 0.01) {
            item.el.style.transform = `perspective(1000px) translateZ(${item.curZ.toFixed(2)}px) translateY(${item.curY.toFixed(2)}px) scale(${item.curScale.toFixed(3)})`;
            
            const glowAlpha = (item.curGlow * 0.7).toFixed(2);
            const goldAlpha = (item.curGlow * 0.5).toFixed(2);
            item.el.style.textShadow = `0 0 16px rgba(255,255,255,${glowAlpha}), 0 0 32px rgba(201,168,76,${goldAlpha}), 0 6px 16px rgba(0,0,0,0.5)`;
          } else if (item.el.style.transform) {
            item.el.style.transform = '';
            item.el.style.textShadow = '';
          }
        }

        requestAnimationFrame(animateTypographyPhysics);
      }
      requestAnimationFrame(animateTypographyPhysics);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // 5A. 🌌 ULTRA-ADVANCED 3D ORGANIC FLUID NEBULA ENGINE (DOTONA ARCHITECTURE)
  // ═══════════════════════════════════════════════════════════
  function initSpatialSphere() {
    const canvas = document.getElementById('spatialSphereCanvas');
    if (!canvas) return;

    // Connect high-performance WebGL Fluid Nebula Engine
    if (typeof FluidNebulaEngine !== 'undefined') {
      if (window._nebulaInstance) {
        window._nebulaInstance.destroy();
      }
      // Choose quality once at load. The visual density stays premium without
      // forcing a half-million particles onto every phone or integrated GPU.
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const isMobile = window.matchMedia('(max-width: 759px)').matches;
      const isHighDensity = (window.devicePixelRatio || 1) > 1.5;
      const particleCount = prefersReducedMotion ? 12000 : isMobile ? 32000 : isHighDensity ? 90000 : 160000;

      window._nebulaInstance = new FluidNebulaEngine(canvas, {
        palette: 'cinematic',
        particleCount,
        morphSpeed: 0.00038,
        mouseInertia: prefersReducedMotion ? 0.025 : 0.065
      });

      // Bind Palette Switcher buttons if present
      const pills = document.querySelectorAll('.nebula-pill');
      pills.forEach(pill => {
        pill.addEventListener('click', () => {
          pills.forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          const palKey = pill.getAttribute('data-palette');
          if (window._nebulaInstance && palKey) {
            window._nebulaInstance.setPalette(palKey);
          }
        });
      });

      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0, height = 0, cx = 0, cy = 0;
    let baseRadius = 240;

    // 1. Core Sphere Points (Fibonacci distribution)
    const POINT_COUNT = 320;
    let points = [];
    let ring1 = [];
    let ring2 = [];

    // 2. Deep Field Ambient 3D Cosmic Dust (180 stars across the entire background)
    const DUST_COUNT = 180;
    let cosmicDust = [];

    // 3. 3D Expanding Shockwaves / Energy Ripples
    const RIPPLE_COUNT = 3;
    let shockwaves = [
      { progress: 0.1, maxR: 540, speed: 0.003 },
      { progress: 0.45, maxR: 540, speed: 0.003 },
      { progress: 0.8, maxR: 540, speed: 0.003 }
    ];

    // 4. Shooting Star / Meteor Engine
    let meteors = [];
    let nextMeteorTime = performance.now() + 2000;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      width = canvas.width = rect.width || window.innerWidth;
      height = canvas.height = rect.height || window.innerHeight;
      cx = width / 2;
      cy = Math.min(height * 0.44, 420);
      baseRadius = Math.min(width * 0.32, 280);
      initPoints();
      initCosmicDust();
    }

    function initPoints() {
      points = [];
      const phi = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < POINT_COUNT; i++) {
        const y = 1 - (i / (POINT_COUNT - 1)) * 2;
        const radiusAtY = Math.sqrt(1 - y * y);
        const theta = phi * i;
        const x = Math.cos(theta) * radiusAtY;
        const z = Math.sin(theta) * radiusAtY;

        points.push({
          ox: x,
          oy: y,
          oz: z,
          baseSize: 1.6 + (i % 3) * 0.8,
          isGold: (i % 5 !== 0)
        });
      }

      // Ring 1 (Tilted 35 deg)
      ring1 = [];
      const r1 = 1.45;
      for (let i = 0; i < 72; i++) {
        const a = (i / 72) * Math.PI * 2;
        ring1.push({
          ox: Math.cos(a) * r1,
          oy: Math.sin(a) * r1 * 0.32,
          oz: Math.sin(a) * r1 * 0.94
        });
      }

      // Ring 2 (Tilted -55 deg)
      ring2 = [];
      const r2 = 1.68;
      for (let i = 0; i < 72; i++) {
        const a = (i / 72) * Math.PI * 2;
        ring2.push({
          ox: Math.cos(a) * r2 * 0.82,
          oy: Math.sin(a) * r2 * 0.48,
          oz: -Math.cos(a) * r2 * 0.55 + Math.sin(a) * r2 * 0.65
        });
      }
    }

    function initCosmicDust() {
      cosmicDust = [];
      for (let i = 0; i < DUST_COUNT; i++) {
        cosmicDust.push({
          x: (Math.random() - 0.5) * width * 1.4,
          y: (Math.random() - 0.5) * height * 1.4,
          z: (Math.random() - 0.5) * 800,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          size: 0.8 + Math.random() * 1.8,
          baseAlpha: 0.15 + Math.random() * 0.55,
          twinkleSpeed: 0.002 + Math.random() * 0.003,
          twinklePhase: Math.random() * Math.PI * 2,
          isGold: Math.random() > 0.4
        });
      }
    }

    function spawnMeteor() {
      const startX = Math.random() * width * 0.9;
      const startY = -40;
      const angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.35;
      const length = 140 + Math.random() * 100;
      const speed = 12 + Math.random() * 8;
      meteors.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        length: length,
        life: 1.0,
        decay: 0.016 + Math.random() * 0.012
      });
    }

    resize();
    window.addEventListener('resize', resize);

    let rotX = 0.25, rotY = 0;
    let targetRotX = 0.25, targetRotY = 0;
    let mousePX = 0, mousePY = 0;

    window.addEventListener('mousemove', (e) => {
      const nx = (e.clientX / window.innerWidth) - 0.5;
      const ny = (e.clientY / window.innerHeight) - 0.5;
      targetRotY = nx * 1.6;
      targetRotX = -ny * 1.1 + 0.25;
      mousePX = e.clientX;
      mousePY = e.clientY;
    });

    let lastTimestamp = performance.now();

    function render(timestamp) {
      const time = timestamp || performance.now();
      const dt = (time - lastTimestamp) * 0.001;
      lastTimestamp = time;

      // Smooth camera orientation
      rotX += (targetRotX - rotX) * 0.05;
      rotY += (targetRotY - rotY) * 0.05;

      // Continuous slow 3D celestial spin
      targetRotY += 0.0035;

      ctx.clearRect(0, 0, width, height);

      const fov = 480;
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);

      // Living organic pulse
      const pulse = 1 + 0.055 * Math.sin(time * 0.0022);
      const radius = baseRadius * pulse;

      // ─── 1. RENDER DEEP FIELD 3D COSMIC DUST ───
      for (let i = 0; i < cosmicDust.length; i++) {
        const d = cosmicDust[i];
        d.x += d.vx;
        d.y += d.vy;

        // Wrap around bounds
        if (d.x < -width * 0.7) d.x = width * 0.7;
        if (d.x > width * 0.7) d.x = -width * 0.7;
        if (d.y < -height * 0.7) d.y = height * 0.7;
        if (d.y > height * 0.7) d.y = -height * 0.7;

        // 3D coordinate parallax
        const rx = d.x * cosY + d.z * sinY;
        const rz = -d.x * sinY + d.z * cosY;
        const ry = d.y * cosX - rz * sinX;
        const rz2 = d.y * sinX + rz * cosX;

        const scale = fov / (fov + rz2 + 400);
        if (scale <= 0) continue;

        const screenX = cx + rx * scale;
        const screenY = cy + ry * scale;

        const twinkle = 0.5 + 0.5 * Math.sin(time * d.twinkleSpeed + d.twinklePhase);
        const alpha = Math.min(1, d.baseAlpha * twinkle * scale);

        ctx.beginPath();
        ctx.arc(screenX, screenY, Math.max(0.6, d.size * scale), 0, Math.PI * 2);
        ctx.fillStyle = d.isGold
          ? `rgba(232, 201, 122, ${alpha.toFixed(2)})`
          : `rgba(180, 210, 255, ${(alpha * 0.85).toFixed(2)})`;
        ctx.fill();

        // Subtle constellation link to cursor if close
        if (mousePX && mousePY) {
          const mdx = screenX - mousePX;
          const mdy = screenY - mousePY;
          const mdistSq = mdx * mdx + mdy * mdy;
          if (mdistSq < 10000) {
            const mdist = Math.sqrt(mdistSq);
            const tetherAlpha = (1 - mdist / 100) * 0.18;
            ctx.beginPath();
            ctx.moveTo(screenX, screenY);
            ctx.lineTo(mousePX, mousePY);
            ctx.strokeStyle = `rgba(201, 168, 76, ${tetherAlpha.toFixed(2)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // ─── 2. RENDER EXPANDING 3D SHOCKWAVE ENERGY RIPPLES ───
      for (let i = 0; i < shockwaves.length; i++) {
        const sw = shockwaves[i];
        sw.progress += sw.speed;
        if (sw.progress >= 1.0) sw.progress = 0;

        const currentR = radius * (1.1 + sw.progress * 1.8);
        const ringAlpha = (1 - sw.progress) * 0.22;

        ctx.beginPath();
        for (let a = 0; a <= 48; a++) {
          const angle = (a / 48) * Math.PI * 2;
          const px0 = Math.cos(angle) * currentR;
          const pz0 = Math.sin(angle) * currentR;
          const py0 = Math.sin(angle * 3 + time * 0.003) * 12;

          const rx = px0 * cosY + pz0 * sinY;
          const rz = -px0 * sinY + pz0 * cosY;
          const ry = py0 * cosX - rz * sinX;
          const rz2 = py0 * sinX + rz * cosX;

          const scale = fov / (fov + rz2);
          const sx = cx + rx * scale;
          const sy = cy + ry * scale;

          if (a === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.strokeStyle = i % 2 === 0
          ? `rgba(201, 168, 76, ${ringAlpha.toFixed(3)})`
          : `rgba(120, 160, 255, ${(ringAlpha * 0.8).toFixed(3)})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // ─── 3. RENDER CENTRAL NEBULA VOLUMETRIC GLOW ───
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.95);
      coreGrad.addColorStop(0, 'rgba(201, 168, 76, 0.16)');
      coreGrad.addColorStop(0.35, 'rgba(201, 168, 76, 0.05)');
      coreGrad.addColorStop(0.7, 'rgba(120, 160, 255, 0.025)');
      coreGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.95, 0, Math.PI * 2);
      ctx.fill();

      // ─── 4. TRANSFORM & PROJECT 3D CORE SPHERE POINTS ───
      const projected = [];
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const px0 = p.ox * radius;
        const py0 = p.oy * radius;
        const pz0 = p.oz * radius;

        const x1 = px0 * cosY + pz0 * sinY;
        const z1 = -px0 * sinY + pz0 * cosY;
        const y2 = py0 * cosX - z1 * sinX;
        const z2 = py0 * sinX + z1 * cosX;

        const scale = fov / (fov + z2);
        const px = cx + x1 * scale;
        const py = cy + y2 * scale;
        const depthNorm = (z2 + radius) / (radius * 2);
        const alpha = Math.max(0.08, Math.min(1, 0.15 + depthNorm * 0.85));

        projected.push({
          x: px, y: py, z: z2, scale, alpha,
          size: p.baseSize * scale,
          isGold: p.isGold
        });
      }

      // Sort by Z (painter's algorithm)
      projected.sort((a, b) => a.z - b.z);

      // Draw constellation lines between nearby points in front
      for (let i = 0; i < projected.length; i += 2) {
        for (let j = i + 1; j < projected.length; j += 3) {
          const p1 = projected[i];
          const p2 = projected[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 2400 && p1.z > -radius * 0.35 && p2.z > -radius * 0.35) {
            const dist = Math.sqrt(distSq);
            const lineAlpha = (1 - dist / 48) * 0.24 * Math.min(p1.alpha, p2.alpha);
            ctx.strokeStyle = `rgba(201, 168, 76, ${lineAlpha.toFixed(3)})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Render 3D orbital rings
      [ring1, ring2].forEach((ring, rIdx) => {
        ctx.beginPath();
        let started = false;
        for (let i = 0; i < ring.length; i++) {
          const rp = ring[i];
          const rx1 = (rp.ox * radius) * cosY + (rp.oz * radius) * sinY;
          const rz1 = -(rp.ox * radius) * sinY + (rp.oz * radius) * cosY;
          const ry2 = (rp.oy * radius) * cosX - rz1 * sinX;
          const rz2 = (rp.oy * radius) * sinX + rz1 * cosX;
          const rScale = fov / (fov + rz2);
          const rpx = cx + rx1 * rScale;
          const rpy = cy + ry2 * rScale;
          if (!started) { ctx.moveTo(rpx, rpy); started = true; }
          else { ctx.lineTo(rpx, rpy); }
        }
        ctx.closePath();
        ctx.strokeStyle = rIdx === 0 ? 'rgba(201, 168, 76, 0.32)' : 'rgba(120, 160, 255, 0.24)';
        ctx.lineWidth = 1.3;
        ctx.stroke();
      });

      // Render 3D points
      for (let i = 0; i < projected.length; i++) {
        const pt = projected[i];
        if (pt.scale <= 0) continue;

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, Math.max(0.8, pt.size), 0, Math.PI * 2);

        if (pt.isGold) {
          ctx.fillStyle = `rgba(232, 201, 122, ${pt.alpha.toFixed(2)})`;
          if (pt.z > 0) {
            ctx.shadowColor = 'rgba(201, 168, 76, 0.9)';
            ctx.shadowBlur = 10 * pt.scale;
          } else {
            ctx.shadowBlur = 0;
          }
        } else {
          ctx.fillStyle = `rgba(244, 242, 238, ${(pt.alpha * 0.9).toFixed(2)})`;
          ctx.shadowBlur = 0;
        }
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // ─── 5. PERIODIC SHOOTING STARS / COMETS ───
      if (time > nextMeteorTime) {
        spawnMeteor();
        nextMeteorTime = time + 3000 + Math.random() * 4000;
      }

      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.x += m.vx;
        m.y += m.vy;
        m.life -= m.decay;

        if (m.life <= 0 || m.x > width + 100 || m.y > height + 100) {
          meteors.splice(i, 1);
          continue;
        }

        const tailX = m.x - (m.vx / Math.hypot(m.vx, m.vy)) * m.length;
        const tailY = m.y - (m.vy / Math.hypot(m.vx, m.vy)) * m.length;

        const meteorGrad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
        meteorGrad.addColorStop(0, 'rgba(201, 168, 76, 0)');
        meteorGrad.addColorStop(0.7, `rgba(201, 168, 76, ${(m.life * 0.4).toFixed(2)})`);
        meteorGrad.addColorStop(1, `rgba(255, 255, 255, ${(m.life * 0.9).toFixed(2)})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(m.x, m.y);
        ctx.strokeStyle = meteorGrad;
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Glowing head
        ctx.beginPath();
        ctx.arc(m.x, m.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${(m.life * 0.95).toFixed(2)})`;
        ctx.shadowColor = 'rgba(232, 201, 122, 1)';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
  }

  // ═══════════════════════════════════════════════════════════
  // 5. 🌌 AURORA ENVIRONMENT (Multi-Plane Cinematic Parallax)
  // ═══════════════════════════════════════════════════════════
  function updateAuroraParallax(scrolled) {
    const hero = document.getElementById('hero');
    if (!hero) return;

    // A shared scroll value lets the depth field glide with the page rather
    // than jumping between discrete animation states.
    const limitedScroll = Math.min(scrolled, 1200);
    hero.style.setProperty('--hero-scroll', `${limitedScroll}px`);
    hero.style.setProperty('--hero-grid-scroll', `${(limitedScroll * 0.06).toFixed(2)}px`);
    hero.style.setProperty('--hero-orbit-scroll', `${(limitedScroll * 0.025).toFixed(2)}px`);
    hero.style.setProperty('--hero-halo-scroll', `${(limitedScroll * 0.04).toFixed(2)}px`);

    // Cosmos deep background plane (0.04x)
    const cosmos = hero.querySelector('.aurora-cosmos');
    if (cosmos) {
      cosmos.style.transform = `translate3d(0, ${(scrolled * 0.04).toFixed(1)}px, -120px)`;
    }

    // Hero orbs with counter-rotation and differential speeds (0.12x - 0.22x)
    const orbs = hero.querySelectorAll('.hero-orb');
    orbs.forEach((orb, i) => {
      const speed = 0.12 + i * 0.05;
      const rotation = scrolled * 0.03 * (i % 2 === 0 ? 1 : -1);
      orb.style.transform = `translate3d(0, ${(scrolled * speed).toFixed(1)}px, 0) rotate(${rotation.toFixed(1)}deg)`;
    });

    // Flowing ribbon middle plane
    const ribbon = hero.querySelector('.aurora-ribbon');
    if (ribbon) {
      ribbon.style.transform = `translate3d(0, ${(scrolled * 0.14).toFixed(1)}px, 0)`;
    }

    // Hero title & content multi-plane parallax (0.28x with subtle fade)
    const heroContent = hero.querySelector('.hero-content');
    if (heroContent && scrolled < 900) {
      const contentFade = Math.max(0, 1 - (scrolled / 700));
      heroContent.style.transform = `translate3d(0, ${(scrolled * 0.28).toFixed(1)}px, 0)`;
      heroContent.style.opacity = contentFade.toFixed(2);
    }

    // Hero video preview depth scale down
    const videoPreview = hero.querySelector('.hero-video-preview');
    if (videoPreview && scrolled < 900) {
      const videoScale = Math.max(0.92, 1 - (scrolled / 4000));
      videoPreview.style.transform = `translate3d(0, ${(scrolled * 0.18).toFixed(1)}px, 0) scale(${videoScale.toFixed(3)})`;
    }
  }

  // ═══════════════════════════════════════════════════════════
  // 5B. ✦ KINETIC ATMOSPHERE — INERTIAL POINTER PARALLAX
  // ═══════════════════════════════════════════════════════════
  // The target follows the pointer immediately, while the rendered position
  // eases toward it. This gives the background a physical, camera-like drift.
  (function initKineticAtmosphere() {
    const hero = document.getElementById('hero');
    if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let targetX = 0, targetY = 0, currentX = 0, currentY = 0, rafId = 0;

    function render() {
      currentX += (targetX - currentX) * 0.055;
      currentY += (targetY - currentY) * 0.055;
      hero.style.setProperty('--hero-pointer-x', `${currentX.toFixed(2)}px`);
      hero.style.setProperty('--hero-pointer-y', `${currentY.toFixed(2)}px`);
      hero.style.setProperty('--hero-grid-x', `${(-currentX * 0.11).toFixed(2)}px`);
      hero.style.setProperty('--hero-grid-y', `${(-currentY * 0.08).toFixed(2)}px`);
      hero.style.setProperty('--hero-orbit-x', `${(currentX * 0.035).toFixed(2)}px`);
      hero.style.setProperty('--hero-orbit-y', `${(currentY * 0.025).toFixed(2)}px`);
      hero.style.setProperty('--hero-halo-x', `${(currentX * 0.14).toFixed(2)}px`);
      hero.style.setProperty('--hero-halo-y', `${(currentY * 0.11).toFixed(2)}px`);

      if (Math.abs(targetX - currentX) > 0.08 || Math.abs(targetY - currentY) > 0.08) {
        rafId = requestAnimationFrame(render);
      } else {
        rafId = 0;
      }
    }

    function move(event) {
      const rect = hero.getBoundingClientRect();
      targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 120;
      targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 90;
      if (!rafId) rafId = requestAnimationFrame(render);
    }

    hero.addEventListener('pointermove', move, { passive: true });
    hero.addEventListener('pointerleave', () => {
      targetX = 0;
      targetY = 0;
      if (!rafId) rafId = requestAnimationFrame(render);
    });
  })();

  // ═══════════════════════════════════════════════════════════
  // 6. 🎬 CINEMATIC PREVIEW (Mouse-Controlled Camera Perspective)
  // ═══════════════════════════════════════════════════════════
  const heroVideoPreview = document.querySelector('.hero-video-preview');
  if (heroVideoPreview) {
    let videoCamX = 0, videoCamY = 0;
    let targetCamX = 0, targetCamY = 0;
    let camRAF = null;

    function smoothVideoCamera() {
      videoCamX += (targetCamX - videoCamX) * 0.08;
      videoCamY += (targetCamY - videoCamY) * 0.08;

      heroVideoPreview.style.transform =
        `perspective(1000px) rotateX(${videoCamY.toFixed(2)}deg) rotateY(${videoCamX.toFixed(2)}deg) translateY(-4px) scale(1.008)`;

      if (Math.abs(targetCamX - videoCamX) > 0.01 || Math.abs(targetCamY - videoCamY) > 0.01) {
        camRAF = requestAnimationFrame(smoothVideoCamera);
      } else {
        camRAF = null;
      }
    }

    heroVideoPreview.addEventListener('mousemove', (e) => {
      const rect = heroVideoPreview.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      targetCamX = (x - 0.5) * 8;
      targetCamY = (y - 0.5) * -8;

      heroVideoPreview.style.setProperty('--video-glare-x', (x * 100).toFixed(1) + '%');
      heroVideoPreview.style.setProperty('--video-glare-y', (y * 100).toFixed(1) + '%');

      if (!camRAF) camRAF = requestAnimationFrame(smoothVideoCamera);
    });

    heroVideoPreview.addEventListener('mouseleave', () => {
      targetCamX = 0;
      targetCamY = 0;
      if (!camRAF) camRAF = requestAnimationFrame(smoothVideoCamera);
    });
  }

  // ═══════════════════════════════════════════════════════════
  // 7. 💎 3D MOTION SURFACES (Cards, Buttons, Gyroscope)
  // ═══════════════════════════════════════════════════════════
  function bindMotionSurfaces(root = document) {
    // 3D Tilt on Cards
    root.querySelectorAll('.project-card, .skill-card, .stat-card').forEach(el => {
      if (el.dataset.motionBound) return;
      el.dataset.motionBound = 'true';

      let currentTiltX = 0, currentTiltY = 0, targetTiltX = 0, targetTiltY = 0;
      let currentPX = 50, currentPY = 50, targetPX = 50, targetPY = 50;
      let tiltRAF = null;

      function smoothTilt() {
        const ease = 0.12;
        currentTiltX += (targetTiltX - currentTiltX) * ease;
        currentTiltY += (targetTiltY - currentTiltY) * ease;
        currentPX += (targetPX - currentPX) * ease;
        currentPY += (targetPY - currentPY) * ease;

        el.style.setProperty('--pointer-x', currentPX.toFixed(1) + '%');
        el.style.setProperty('--pointer-y', currentPY.toFixed(1) + '%');
        el.style.setProperty('--tilt-x', currentTiltX.toFixed(2) + 'deg');
        el.style.setProperty('--tilt-y', currentTiltY.toFixed(2) + 'deg');

        if (el.classList.contains('skill-card')) {
          const shift = 5;
          const ix = ((currentPX / 100) - 0.5) * shift;
          const iy = ((currentPY / 100) - 0.5) * shift;
          el.style.setProperty('--ix', ix.toFixed(2) + 'px');
          el.style.setProperty('--iy', iy.toFixed(2) + 'px');
        }

        if (Math.abs(targetTiltX - currentTiltX) > 0.01 ||
            Math.abs(targetTiltY - currentTiltY) > 0.01) {
          tiltRAF = requestAnimationFrame(smoothTilt);
        } else {
          tiltRAF = null;
        }
      }

      el.addEventListener('pointermove', (event) => {
        const rect = el.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        targetPX = (x / rect.width) * 100;
        targetPY = (y / rect.height) * 100;
        const maxAngle = el.classList.contains('skill-card') ? 16 : 14;
        targetTiltX = ((x / rect.width) - 0.5) * maxAngle;
        targetTiltY = ((y / rect.height) - 0.5) * -maxAngle;
        if (!tiltRAF) tiltRAF = requestAnimationFrame(smoothTilt);
      });

      el.addEventListener('pointerleave', () => {
        targetTiltX = 0;
        targetTiltY = 0;
        targetPX = 50;
        targetPY = 50;
        if (!tiltRAF) tiltRAF = requestAnimationFrame(smoothTilt);
      });
    });

    // Magnetic attraction with spring pull for buttons, filter pills, social buttons
    root.querySelectorAll('.btn-primary, .btn-ghost, .portfolio-filter .filter-btn, .social-link').forEach(el => {
      if (el.dataset.magneticBound) return;
      el.dataset.magneticBound = 'true';

      let magX = 0, magY = 0, targetMagX = 0, targetMagY = 0;
      let magRAF = null;

      function smoothMagnetic() {
        const ease = 0.16;
        magX += (targetMagX - magX) * ease;
        magY += (targetMagY - magY) * ease;
        el.style.setProperty('--magnetic-x', magX.toFixed(1) + 'px');
        el.style.setProperty('--magnetic-y', magY.toFixed(1) + 'px');
        el.style.transform = `translate(${magX.toFixed(1)}px, ${magY.toFixed(1)}px)`;

        if (Math.abs(targetMagX - magX) > 0.05 || Math.abs(targetMagY - magY) > 0.05) {
          magRAF = requestAnimationFrame(smoothMagnetic);
        } else {
          magRAF = null;
        }
      }

      el.addEventListener('pointermove', (event) => {
        const rect = el.getBoundingClientRect();
        const factorX = el.classList.contains('social-link') ? 0.35 : 0.24;
        const factorY = el.classList.contains('social-link') ? 0.35 : 0.28;
        targetMagX = (event.clientX - rect.left - rect.width / 2) * factorX;
        targetMagY = (event.clientY - rect.top - rect.height / 2) * factorY;
        if (!magRAF) magRAF = requestAnimationFrame(smoothMagnetic);
      });

      el.addEventListener('pointerleave', () => {
        targetMagX = 0;
        targetMagY = 0;
        if (!magRAF) magRAF = requestAnimationFrame(smoothMagnetic);
      });
    });
  }
  bindMotionSurfaces();

  // ═══════════════════════════════════════════════════════════
  // 8. 🪄 PHYSICALLY SPRINGING ACTIVE FILTER PILL
  // ═══════════════════════════════════════════════════════════
  function initSpringFilterPill() {
    const filterContainer = document.querySelector('.portfolio-filter');
    const pill = document.getElementById('filterSpringPill');
    if (!filterContainer || !pill) return;

    function movePillTo(btn) {
      if (!btn) return;
      const left = btn.offsetLeft;
      const width = btn.offsetWidth;
      const top = btn.offsetTop;
      const height = btn.offsetHeight;

      pill.style.transform = `translate3d(${left}px, ${top - 4}px, 0)`;
      pill.style.width = width + 'px';
      if (height > 0) pill.style.height = height + 'px';
    }

    const activeBtn = filterContainer.querySelector('.filter-btn.active') || filterContainer.querySelector('.filter-btn');
    if (activeBtn) {
      // Position instantly without animation on first load
      pill.style.transition = 'none';
      movePillTo(activeBtn);
      setTimeout(() => {
        pill.style.transition = 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)';
      }, 60);
    }

    filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        filterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        movePillTo(this);
        // Scroll button into comfortable view if on mobile overflow
        if (filterContainer.scrollWidth > filterContainer.clientWidth) {
          const scrollTarget = this.offsetLeft - (filterContainer.clientWidth / 2) + (this.offsetWidth / 2);
          filterContainer.scrollTo({ left: Math.max(0, scrollTarget), behavior: 'smooth' });
        }
      });
    });

    window.addEventListener('resize', () => {
      const currentActive = filterContainer.querySelector('.filter-btn.active');
      if (currentActive) movePillTo(currentActive);
    });
  }

  // ═══════════════════════════════════════════════════════════
  // 9. 📊 LIVING STATISTICS (Mechanical 3D Odometer Digits)
  // ═══════════════════════════════════════════════════════════
  function triggerMechanicalCounter(counter) {
    const target = parseInt(counter.dataset.target, 10);
    if (isNaN(target) || counter.dataset.counted) return;
    counter.dataset.counted = 'true';

    let current = 0;
    const duration = 1400; // ms
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextVal = Math.floor(eased * target);

      if (nextVal !== current) {
        current = nextVal;
        counter.textContent = current;
        counter.classList.add('rolling');
        setTimeout(() => counter.classList.remove('rolling'), 150);
      }

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        counter.textContent = target;
      }
    }

    requestAnimationFrame(step);
  }

  // ═══════════════════════════════════════════════════════════
  // 10. 🧬 TIMELINE LIVING SCROLLING ENERGY BEAM
  // ═══════════════════════════════════════════════════════════
  function initTimelineBeam() {
    const timeline = document.getElementById('timelineContainer');
    const beam = document.getElementById('timelineBeam');
    if (!timeline || !beam) return;

    const items = timeline.querySelectorAll('.timeline-item');

    function updateBeamOnScroll() {
      const rect = timeline.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Start activating when timeline enters bottom 70% of viewport
      const startTrigger = viewportHeight * 0.75;
      const endTrigger = viewportHeight * 0.25;

      const totalDist = rect.height;
      const currentDist = startTrigger - rect.top;
      let percent = (currentDist / totalDist) * 100;
      percent = Math.max(0, Math.min(100, percent));

      beam.style.height = percent + '%';

      // Light up nodes that beam head has passed
      items.forEach(item => {
        const itemRect = item.getBoundingClientRect();
        if (itemRect.top <= startTrigger - (percent / 100) * totalDist + 50 || itemRect.top < viewportHeight * 0.6) {
          item.classList.add('lit');
        } else {
          item.classList.remove('lit');
        }
      });
    }

    window.addEventListener('scroll', updateBeamOnScroll, { passive: true });
    updateBeamOnScroll();
  }

  // ═══════════════════════════════════════════════════════════
  // 11 & 12. ⚡ SKILLS & SVG DISTINCTIVE ANIMATIONS
  // ═══════════════════════════════════════════════════════════
  // Handled smoothly in CSS with hover transitions & transform-style: preserve-3d

  // ═══════════════════════════════════════════════════════════
  // 13. 🫧 CONTACT FORM (3D Depth & Localized Input Spotlight)
  // ═══════════════════════════════════════════════════════════
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('mousemove', (e) => {
      const rect = contactForm.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      contactForm.style.setProperty('--form-mouse-x', (x * 100).toFixed(1) + '%');
      contactForm.style.setProperty('--form-mouse-y', (y * 100).toFixed(1) + '%');

      const tiltX = (x - 0.5) * 6;
      const tiltY = (y - 0.5) * -6;
      contactForm.style.setProperty('--form-tilt-x', tiltX.toFixed(2) + 'deg');
      contactForm.style.setProperty('--form-tilt-y', tiltY.toFixed(2) + 'deg');
    });

    contactForm.addEventListener('mouseleave', () => {
      contactForm.style.setProperty('--form-tilt-x', '0deg');
      contactForm.style.setProperty('--form-tilt-y', '0deg');
    });

    // Localized flashlight per input
    contactForm.querySelectorAll('.form-group input, .form-group textarea').forEach(input => {
      input.addEventListener('mousemove', (e) => {
        const rect = input.getBoundingClientRect();
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;
        input.style.setProperty('--input-x', px + 'px');
        input.style.setProperty('--input-y', py + 'px');
      });
    });
  }

  // ═══════════════════════════════════════════════════════════
  // 14. 🪐 SOCIAL BUTTONS — BESPOKE PLATFORM ICON MOTION & CLICK ENGINES
  // ═══════════════════════════════════════════════════════════
  const socialContainer = document.querySelector('.social-links');
  const socialLinks = document.querySelectorAll('.social-link');

  // Proximity detection ("pashe niye jaibo" — activates pre-hover aura)
  if (socialContainer) {
    window.addEventListener('mousemove', (e) => {
      const containerRect = socialContainer.getBoundingClientRect();
      const distToContainer = Math.hypot(
        e.clientX - (containerRect.left + containerRect.width / 2),
        e.clientY - (containerRect.top + containerRect.height / 2)
      );

      if (distToContainer < 260) {
        socialLinks.forEach(link => {
          const rect = link.getBoundingClientRect();
          const dist = Math.hypot(
            e.clientX - (rect.left + rect.width / 2),
            e.clientY - (rect.top + rect.height / 2)
          );
          if (dist < 80) {
            link.classList.add('near-cursor');
          } else {
            link.classList.remove('near-cursor');
          }
        });
      } else {
        socialLinks.forEach(link => link.classList.remove('near-cursor'));
      }
    }, { passive: true });
  }

  socialLinks.forEach(link => {
    let curX = 0, curY = 0, curRotX = 0, curRotY = 0, curScale = 1;
    let targetX = 0, targetY = 0, targetRotX = 0, targetRotY = 0, targetScale = 1;
    let isHovered = false;
    let rafId = null;

    let mouseNx = 0, mouseNy = 0;
    let lastX = 0, lastY = 0;
    let mouseSpeed = 0;

    const svg = link.querySelector('svg');
    const isWhatsapp = link.classList.contains('social-whatsapp');
    const isFacebook = link.classList.contains('social-facebook');
    const isX = link.classList.contains('social-x');
    const isInstagram = link.classList.contains('social-instagram');
    const isTelegram = link.classList.contains('social-telegram');

    // ── CLICK ANIMATION ENGINE ("ba click kore oi icon e") ──
    link.addEventListener('click', (e) => {
      link.classList.remove('clicked');
      void link.offsetWidth; // Force reflow
      link.classList.add('clicked');

      // Spawn dynamic expanding click shockwave
      const rect = link.getBoundingClientRect();
      const x = e.clientX ? (e.clientX - rect.left) : (rect.width / 2);
      const y = e.clientY ? (e.clientY - rect.top) : (rect.height / 2);

      const wave = document.createElement('span');
      wave.className = 'social-click-wave';
      wave.style.left = `${x}px`;
      wave.style.top = `${y}px`;

      let waveColor = 'rgba(255,255,255,0.8)';
      if (isWhatsapp) waveColor = 'rgba(37,211,102,0.85)';
      else if (isFacebook) waveColor = 'rgba(24,119,242,0.85)';
      else if (isX) waveColor = 'rgba(255,255,255,0.9)';
      else if (isInstagram) waveColor = 'rgba(225,48,108,0.85)';
      else if (isTelegram) waveColor = 'rgba(0,229,255,0.85)';

      wave.style.background = `radial-gradient(circle, ${waveColor} 0%, transparent 70%)`;
      link.appendChild(wave);

      setTimeout(() => {
        if (wave && wave.parentNode) wave.remove();
      }, 550);

      setTimeout(() => {
        link.classList.remove('clicked');
      }, 600);
    });

    link.addEventListener('mouseenter', () => {
      isHovered = true;
      link.classList.add('mouse-active');
      targetScale = 1.12;
      if (!rafId) {
        rafId = requestAnimationFrame(updatePhysics);
      }
    });

    link.addEventListener('mousemove', (e) => {
      isHovered = true;
      link.classList.add('mouse-active');

      const rect = link.getBoundingClientRect();
      mouseNx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      mouseNy = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);

      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      mouseSpeed = Math.hypot(dx, dy);
      lastX = e.clientX;
      lastY = e.clientY;

      targetX = mouseNx * 6;
      targetY = mouseNy * 6 - 3;
      targetRotY = mouseNx * 14;
      targetRotX = -mouseNy * 14;
      targetScale = 1.12;

      if (!rafId) {
        rafId = requestAnimationFrame(updatePhysics);
      }
    });

    link.addEventListener('mouseleave', () => {
      isHovered = false;
      link.classList.remove('mouse-active');
      targetX = 0;
      targetY = 0;
      targetRotX = 0;
      targetRotY = 0;
      targetScale = 1;
      mouseNx = 0;
      mouseNy = 0;
      mouseSpeed = 0;
    });

    function updatePhysics() {
      // Cushioned spring interpolation
      curX += (targetX - curX) * 0.16;
      curY += (targetY - curY) * 0.16;
      curRotX += (targetRotX - curRotX) * 0.16;
      curRotY += (targetRotY - curRotY) * 0.16;
      curScale += (targetScale - curScale) * 0.16;

      link.style.transform = `perspective(600px) translate3d(${curX.toFixed(2)}px, ${curY.toFixed(2)}px, 10px) rotateX(${curRotX.toFixed(2)}deg) rotateY(${curRotY.toFixed(2)}deg) scale(${curScale.toFixed(3)})`;

      // Settle check
      const isSettled = !isHovered &&
        Math.abs(curX) < 0.04 &&
        Math.abs(curY) < 0.04 &&
        Math.abs(curRotX) < 0.04 &&
        Math.abs(curRotY) < 0.04 &&
        Math.abs(curScale - 1) < 0.004;

      if (!isSettled) {
        rafId = requestAnimationFrame(updatePhysics);
      } else {
        link.style.transform = '';
        rafId = null;
      }
    }
  });

  // ═══════════════════════════════════════════════════════════
  // 15. ✨ FOOTER (Ambient Stardust Generator & Reactive Typography)
  // ═══════════════════════════════════════════════════════════
  function initFooterStardust() {
    const container = document.getElementById('footerStardust');
    if (!container || container.children.length > 0) return;

    for (let i = 0; i < 24; i++) {
      const dot = document.createElement('div');
      dot.className = 'footer-stardust-dot';
      const size = 1.5 + Math.random() * 2.5;
      dot.style.width = size + 'px';
      dot.style.height = size + 'px';
      dot.style.left = (Math.random() * 100) + '%';
      dot.style.top = (Math.random() * 100) + '%';
      dot.style.animationDelay = (Math.random() * 4) + 's';
      dot.style.animationDuration = (3 + Math.random() * 3) + 's';
      dot.style.opacity = (0.2 + Math.random() * 0.5).toFixed(2);
      container.appendChild(dot);
    }
  }

  const mainFooter = document.getElementById('mainFooter');
  if (mainFooter) {
    mainFooter.addEventListener('mousemove', (e) => {
      const rect = mainFooter.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mainFooter.style.setProperty('--footer-tilt-x', (x * 12).toFixed(1) + 'deg');
      mainFooter.style.setProperty('--footer-tilt-y', (y * -12).toFixed(1) + 'deg');
    });
  }

  // ═══════════════════════════════════════════════════════════
  // SHOWCASE WAVEFORM
  // ═══════════════════════════════════════════════════════════
  function initWaveform() {
    const container = document.getElementById('showcaseWaveform');
    if (!container || container.children.length > 0) return;

    const barCount = 14;
    for (let i = 0; i < barCount; i++) {
      const bar = document.createElement('div');
      bar.className = 'showcase-waveform-bar';
      const h = 4 + Math.random() * 20;
      bar.style.setProperty('--wave-h', h + 'px');
      bar.style.height = '4px';
      bar.style.animationDelay = (i * 0.07) + 's';
      bar.style.animationDuration = (0.75 + Math.random() * 0.55) + 's';
      container.appendChild(bar);
    }
  }

  // FEATURED PROJECT CONTROLS — selector plus dynamic configuration & playback handoff.
  let dynamicShowcaseProjects = [
    {
      title: '<em>Urban</em><br>Mirage',
      assetId: 'asset-urban-mirage',
      file: 'uploaded-video/no-1.mp4',
      label: 'Urban Mirage',
      meta: 'Commercial · 4K HDR',
      time: '2:34 / 4:12',
      progress: '61%',
      description: 'An architectural visual symphony — this commercial campaign captured the interplay of light, glass, and geometric symmetry through precision cinematography and master color grading.',
      productionTime: '4 wks',
      locations: '2 cities',
      resolution: '4K HDR'
    },
    {
      title: '<em>Sun</em><br>Onlight',
      assetId: 'asset-sun-onlight',
      file: 'uploaded-video/no-2.mp4',
      label: 'SUN ONLIGHT',
      meta: 'Commercial · 4K HDR',
      time: '1:18 / 3:46',
      progress: '34%',
      description: 'A luminous solar-energy campaign built around warm horizons, precise pacing, and a hopeful sense of forward motion.',
      productionTime: '3 wks',
      locations: '3 deserts',
      resolution: '4K HDR'
    }
  ];

  let currentShowcaseIndex = 0;

  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function sanitizeShowcaseTitle(str) {
    if (typeof str !== 'string') return '';
    return escapeHtml(str)
      .replace(/&lt;em&gt;/gi, '<em>')
      .replace(/&lt;\/em&gt;/gi, '</em>')
      .replace(/&lt;br\s*\/?&gt;/gi, '<br>');
  }

  function updateShowcaseDisplay() {
    const title = document.getElementById('showcaseTitle');
    const description = document.getElementById('showcaseDescription');
    const progress = document.getElementById('showcaseProgress');
    const time = document.getElementById('showcaseTime');
    const watchBtn = document.getElementById('showcaseWatchBtn');
    const badgeEl = document.getElementById('showcaseBadge');
    const prodEl = document.getElementById('showcaseProdTime');
    const locEl = document.getElementById('showcaseLocations');
    const resEl = document.getElementById('showcaseResolution');
    const videoArea = document.querySelector('.showcase-video-area');

    if (!dynamicShowcaseProjects || dynamicShowcaseProjects.length === 0) return;
    const project = dynamicShowcaseProjects[currentShowcaseIndex % dynamicShowcaseProjects.length];

    if (title && project.title) title.innerHTML = sanitizeShowcaseTitle(project.title);
    if (description && project.description) description.textContent = project.description;
    if (time && project.time) time.textContent = project.time;
    if (progress && project.progress) progress.style.width = project.progress;
    if (badgeEl && project.badge) badgeEl.textContent = `◆ ${project.badge}`;

    if (prodEl && project.productionTime) {
      const parts = String(project.productionTime).split(' ');
      prodEl.innerHTML = '';
      prodEl.appendChild(document.createTextNode((parts[0] || '') + ' '));
      const s = document.createElement('span');
      s.style.color = 'var(--gold)';
      s.textContent = parts.slice(1).join(' ') || 'wks';
      prodEl.appendChild(s);
    }
    if (locEl && project.locations) {
      const parts = String(project.locations).split(' ');
      locEl.innerHTML = '';
      locEl.appendChild(document.createTextNode((parts[0] || '') + ' '));
      const s = document.createElement('span');
      s.style.color = 'var(--gold)';
      s.textContent = parts.slice(1).join(' ') || 'cities';
      locEl.appendChild(s);
    }
    if (resEl && project.resolution) {
      const parts = String(project.resolution).split(' ');
      resEl.innerHTML = '';
      resEl.appendChild(document.createTextNode((parts[0] || '') + ' '));
      const s = document.createElement('span');
      s.style.color = 'var(--gold)';
      s.textContent = parts.slice(1).join(' ') || 'HDR';
      resEl.appendChild(s);
    }

    if (watchBtn) {
      watchBtn.onclick = () => {
        if (typeof window.openModal === 'function') {
          window.openModal(project.label || project.plainTitle || 'Featured Project', project.meta || project.category || 'Commercial · 4K HDR', project.file || project.assetId);
        }
      };
    }

    // Optional background video playback in showcase video area if available
    if (videoArea) {
      let bgVideo = videoArea.querySelector('video.showcase-bg-video');
      const targetAsset = project.file || project.assetId || '';
      const targetSrc = targetAsset ? `/api/media/preview/${encodeURIComponent(targetAsset)}` : '';

      if (targetSrc) {
        if (!bgVideo) {
          bgVideo = document.createElement('video');
          bgVideo.className = 'showcase-bg-video';
          bgVideo.setAttribute('muted', 'true');
          bgVideo.muted = true;
          bgVideo.setAttribute('loop', 'true');
          bgVideo.loop = true;
          bgVideo.setAttribute('playsinline', 'true');
          bgVideo.setAttribute('aria-hidden', 'true');
          bgVideo.style.position = 'absolute';
          bgVideo.style.inset = '0';
          bgVideo.style.width = '100%';
          bgVideo.style.height = '100%';
          bgVideo.style.objectFit = 'cover';
          bgVideo.style.opacity = '0.45';
          bgVideo.style.zIndex = '1';
          bgVideo.style.transition = 'opacity 0.8s ease';
          videoArea.insertBefore(bgVideo, videoArea.firstChild);
        }
        if (bgVideo.getAttribute('src') !== targetSrc) {
          bgVideo.src = targetSrc;
          bgVideo.load();
          bgVideo.play().catch(() => {});
        }
      }
    }
  }

  function initShowcaseControls() {
    const previous = document.getElementById('showcasePrev');
    const play = document.getElementById('showcasePlay');
    const next = document.getElementById('showcaseNext');
    if (!previous || !play || !next || previous.dataset.bound) return;
    previous.dataset.bound = 'true';

    previous.addEventListener('click', () => {
      currentShowcaseIndex = (currentShowcaseIndex - 1 + dynamicShowcaseProjects.length) % dynamicShowcaseProjects.length;
      updateShowcaseDisplay();
    });

    next.addEventListener('click', () => {
      currentShowcaseIndex = (currentShowcaseIndex + 1) % dynamicShowcaseProjects.length;
      updateShowcaseDisplay();
    });

    play.addEventListener('click', () => {
      const project = dynamicShowcaseProjects[currentShowcaseIndex % dynamicShowcaseProjects.length];
      if (typeof window.openModal === 'function') {
        window.openModal(project.label || project.plainTitle || 'Featured Project', project.meta || project.category || 'Commercial · 4K HDR', project.file || project.assetId);
      }
    });

    updateShowcaseDisplay();
  }

  function applyShowcaseData(showcase) {
    if (!showcase) return;
    const baseProject = {
      title: showcase.title || '<em>Urban</em><br>Mirage',
      plainTitle: showcase.plainTitle || 'Urban Mirage',
      assetId: showcase.assetId || 'asset-urban-mirage',
      file: showcase.file || 'uploaded-video/no-1.mp4',
      label: showcase.plainTitle || 'Featured Showcase',
      meta: showcase.category || 'Commercial · 4K HDR',
      category: showcase.category || 'Commercial · 4K HDR',
      badge: showcase.badge || 'Featured',
      time: showcase.duration || '2:34 / 4:12',
      progress: showcase.progress || '61%',
      description: showcase.description || '',
      productionTime: showcase.productionTime || '4 wks',
      locations: showcase.locations || '2 cities',
      resolution: showcase.resolution || '4K HDR'
    };

    // Replace first project with the configured showcase from CMS
    dynamicShowcaseProjects[0] = baseProject;
    updateShowcaseDisplay();
  }

  // ═══════════════════════════════════════════════════════════
  // GLOBAL SCROLL ORCHESTRATOR
  // ═══════════════════════════════════════════════════════════
  let scrollTicking = false;

  function onScroll() {
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const progressEl = document.getElementById('scrollProgress');
    if (progressEl && total > 0) {
      progressEl.style.width = (scrolled / total * 100) + '%';
    }
    if (window._nebulaInstance && total > 0) {
      window._nebulaInstance.setScrollProgress(scrolled / total);
    }

    // NAV scrolled state
    const nav = document.getElementById('nav');
    if (nav) {
      nav.classList.toggle('scrolled', scrolled > 60);
    }

    // Active nav section spy
    updateActiveNavSection();

    // Aurora parallax
    updateAuroraParallax(scrolled);

    // Fallback reveal checker
    document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight + 80) {
        revealElement(el);
      }
    });

    scrollTicking = false;
  }

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(onScroll);
      scrollTicking = true;
    }
  }, { passive: true });

  // ═══════════════════════════════════════════════════════════
  // UNIFIED REVEAL SYSTEM
  // ═══════════════════════════════════════════════════════════
  let revealObserver = null;

  function revealElement(el) {
    if (el.classList.contains('visible')) return;
    el.classList.add('visible');

    // Skill bars
    const bar = el.querySelector('.skill-bar');
    if (bar && bar.dataset.width) {
      setTimeout(() => { bar.style.width = bar.dataset.width + '%'; }, 280);
    }

    // Mechanical 3D counters
    const counters = el.querySelectorAll('.count-up');
    counters.forEach(triggerMechanicalCounter);
  }

  function initAnimations() {
    const revealEls = document.querySelectorAll('.reveal');

    // Immediate check
    revealEls.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 100) {
        revealElement(el);
      }
    });

    if ('IntersectionObserver' in window) {
      if (revealObserver) revealObserver.disconnect();
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            revealElement(entry.target);
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.05, rootMargin: '80px 0px 40px 0px' });

      revealEls.forEach(el => {
        if (!el.classList.contains('visible')) {
          revealObserver.observe(el);
        }
      });
    } else {
      revealEls.forEach(revealElement);
    }
  }
  window.initAnimations = initAnimations;

  // ═══════════════════════════════════════════════════════════
  // VIDEO.JSON DRIVEN PORTFOLIO LOADER
  // ═══════════════════════════════════════════════════════════
  function buildGlowStyle(g) {
    let s = `width:${g.w}px;height:${g.h}px;background:radial-gradient(circle,${g.color},transparent);`;
    if (g.top !== undefined) s += `top:${g.top};`;
    if (g.bottom !== undefined) s += `bottom:${g.bottom};`;
    if (g.left !== undefined) s += `left:${g.left};`;
    if (g.right !== undefined) s += `right:${g.right};`;
    if (g.delay !== undefined) s += `animation-delay:${g.delay};`;
    return s;
  }

  function buildCard(v) {
    const glows = (v.thumb_glow || []).map(g =>
      `<div class="thumb-glow" style="${buildGlowStyle(g)}"></div>`
    ).join('');

    const thumbStyle = v.thumb
      ? ` style="background-image:url('${v.thumb}');background-size:cover;background-position:center;"`
      : '';
    const animOpacity = v.thumb ? ' style="opacity:0"' : '';

    // Resolve streamable preview URL via protected in-site media preview route
    const previewAssetId = v.file || v.assetId || v.id || '';
    const previewSrc = previewAssetId ? `/api/media/preview/${encodeURIComponent(previewAssetId)}` : '';

    // A muted, inline preview plays smoothly while this card is hovered. The full
    // project still opens in the secure viewer when the card is clicked.
    const videoEl = previewSrc
      ? `<video class="card-preview-video" src="${previewSrc}" muted loop playsinline preload="metadata" aria-hidden="true"></video>`
      : '';

    const safeModalTitle = escapeHtml(v.title || '');
    const safeModalMeta = escapeHtml(v.cat_label || '');
    const safeModalAssetId = escapeHtml(v.file || v.assetId || v.id || '');

    return `
    <div class="project-card ${escapeHtml(v.size || 'card-md')} reveal visible"
         data-category="${escapeHtml(v.category || '')}"
         data-video="${escapeHtml(previewSrc)}"
         data-modal-title="${safeModalTitle}"
         data-modal-meta="${safeModalMeta}"
         data-modal-asset="${safeModalAssetId}">
      <div class="card-video-wrap">
        <div class="card-thumb ${escapeHtml(v.thumb_color || 'thumb-1')}"${thumbStyle}>
          <div class="thumb-anim"${animOpacity}>${glows}</div>
        </div>
        ${videoEl}
        <div class="card-overlay"></div>
        <div class="card-play"><svg class="ui-icon" aria-hidden="true"><use href="#icon-play"></use></svg></div>
        <div class="card-info">
          <div class="card-cat">${escapeHtml(v.cat_label || '')}</div>
          <div class="card-title">${escapeHtml(v.title || '')}</div>
          <div class="card-meta">${escapeHtml(v.meta || '')}</div>
        </div>
      </div>
    </div>`;
  }

  const ITEMS_PER_PAGE = 6;
  let currentPortfolioData = [];
  let activeFilter = 'all';
  let activePage = 1;

  function renderPortfolio(data) {
    const grid = document.querySelector('.portfolio-grid');
    const paginationContainer = document.getElementById('portfolioPagination');
    if (!grid || !data.portfolio) return;

    if (!grid._hasModalListener) {
      grid.addEventListener('click', (e) => {
        const card = e.target.closest('.project-card');
        if (card && typeof window.openModal === 'function') {
          const mTitle = card.getAttribute('data-modal-title') || 'Featured Project';
          const mMeta = card.getAttribute('data-modal-meta') || 'Commercial · 4K HDR';
          const mAsset = card.getAttribute('data-modal-asset') || '';
          window.openModal(mTitle, mMeta, mAsset);
        }
      });
      grid._hasModalListener = true;
    }

    currentPortfolioData = data.portfolio;
    activeFilter = 'all';
    activePage = 1;

    function updatePortfolioDisplay(shouldScroll = false) {
      // 1. Filter items by active category
      const filtered = currentPortfolioData.filter(v => {
        if (activeFilter === 'all') return true;
        return (v.category || '').toLowerCase() === activeFilter;
      });

      const totalItems = filtered.length;
      const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

      if (activePage > totalPages) activePage = totalPages;
      if (activePage < 1) activePage = 1;

      // 2. Slice items for current active page
      const startIndex = (activePage - 1) * ITEMS_PER_PAGE;
      const pageItems = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

      // 3. Render grid with soft fade transition
      grid.innerHTML = pageItems.map(buildCard).join('');

      // 4. Re-bind card previews and 3D motion
      bindVideoHoverPreviews(grid);
      bindMotionSurfaces(grid);
      bindCursorShapes(grid);

      // 5. Render soft rounded pagination controls
      renderPagination(paginationContainer, totalPages, activePage);

      // 6. Smooth scroll gently to portfolio header when changing pages
      if (shouldScroll) {
        const portfolioSection = document.getElementById('portfolio');
        if (portfolioSection) {
          const targetY = portfolioSection.getBoundingClientRect().top + window.scrollY - 70;
          window.scrollTo({ top: targetY, behavior: 'smooth' });
        }
      }
    }

    function renderPagination(container, totalPages, currentPage) {
      if (!container) return;
      if (totalPages <= 1) {
        container.innerHTML = '';
        container.classList.add('is-hidden');
        return;
      }
      container.classList.remove('is-hidden');

      let html = '';

      // Soft rounded Prev button
      const prevDisabled = currentPage === 1 ? ' disabled' : '';
      html += `
        <button class="page-btn page-nav-btn" data-page="${currentPage - 1}"${prevDisabled} aria-label="Previous Page">
          <svg class="page-nav-icon page-nav-icon-prev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
          <span>Prev</span>
        </button>
      `;

      // Soft pill numbers
      for (let i = 1; i <= totalPages; i++) {
        const isActive = i === currentPage ? ' active' : '';
        html += `<button class="page-btn${isActive}" data-page="${i}" aria-label="Page ${i}">${i}</button>`;
      }

      // Soft rounded Next button
      const nextDisabled = currentPage === totalPages ? ' disabled' : '';
      html += `
        <button class="page-btn page-nav-btn" data-page="${currentPage + 1}"${nextDisabled} aria-label="Next Page">
          <span>Next</span>
          <svg class="page-nav-icon page-nav-icon-next" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      `;

      container.innerHTML = html;

      // Bind click handlers to pagination buttons
      container.querySelectorAll('.page-btn:not(:disabled)').forEach(btn => {
        btn.addEventListener('click', () => {
          const targetPage = parseInt(btn.dataset.page, 10);
          if (targetPage && targetPage !== activePage) {
            activePage = targetPage;
            updatePortfolioDisplay(true);
          }
        });
      });
    }

    // Bind category filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        const filter = this.textContent.trim().toLowerCase();
        if (activeFilter !== filter) {
          activeFilter = filter;
          activePage = 1; // Always reset to page 1 on new filter selection
          updatePortfolioDisplay(false);
        }
      });
    });

    // Initial render
    updatePortfolioDisplay(false);
  }

  function bindVideoHoverPreviews(root = document) {
    root.querySelectorAll('.project-card').forEach(card => {
      if (card.dataset.previewBound) return;
      const preview = card.querySelector('.card-preview-video');
      if (!preview) return;
      card.dataset.previewBound = 'true';
      let hovering = false;

      const stop = (reset = true) => {
        hovering = false;
        preview.pause();
        if (reset) {
          try { preview.currentTime = 0; } catch (_) {}
        }
        card.classList.remove('is-previewing');
      };

      card.addEventListener('pointerenter', () => {
        hovering = true;
        // Keep the page calm: only the card beneath the pointer may preview.
        document.querySelectorAll('.card-preview-video').forEach(video => {
          if (video !== preview) {
            video.pause();
            try { video.currentTime = 0; } catch (_) {}
            video.closest('.project-card')?.classList.remove('is-previewing');
          }
        });

        preview.play().then(() => {
          if (hovering && !preview.paused) {
            card.classList.add('is-previewing');
          }
        }).catch(() => {
          // If a browser blocks playback, leave the existing thumbnail visible.
          card.classList.remove('is-previewing');
        });
      });

      card.addEventListener('pointerleave', () => stop());
      card.addEventListener('pointerdown', () => stop(false));
    });
  }

  function renderHero(hero) {
    if (!hero) return;
    const inner = document.querySelector('.hero-video-preview-inner');
    if (!inner) return;

    const labelEl = inner.querySelector('.preview-label');
    const badgeEl = inner.querySelector('.preview-badge');
    if (labelEl && hero.label) labelEl.textContent = hero.label;
    if (badgeEl && hero.badge) badgeEl.textContent = hero.badge;

    const heroAssetId = hero.assetId || 'asset-hero-showreel';
    const targetSrc = `/api/media/preview/${encodeURIComponent(heroAssetId)}`;

    if (hero.type === 'video') {
      const existingVideo = inner.querySelector('video#heroMainVideo');
      if (existingVideo) {
        const curSrc = existingVideo.getAttribute('src');
        if (!curSrc || curSrc.includes('uploaded-video') || curSrc !== targetSrc) {
          existingVideo.src = targetSrc;
          existingVideo.load();
          existingVideo.play().catch(()=>{});
        }
      }
    }
  }

  const DEFAULT_DATA = {
    hero: {
      src: "uploaded-video/no-1.mp4",
      assetId: "asset-hero-showreel",
      type: "video",
      label: "Showreel 2025",
      badge: "◆ 4K HDR"
    },
    portfolio: [
      {
        id: "project-urban-mirage",
        assetId: "asset-urban-mirage",
        file: "uploaded-video/no-1.mp4",
        title: "Urban Mirage",
        category: "commercial",
        cat_label: "Commercial · 4K HDR",
        meta: "Real Estate Campaign — 2024",
        size: "card-lg",
        thumb_color: "thumb-1",
        thumb_glow: [
          { w: 220, h: 220, color: "rgba(64,100,200,0.4)", top: "20%", left: "30%" },
          { w: 140, h: 140, color: "rgba(100,150,255,0.3)", top: "60%", right: "20%", delay: "-2s" }
        ]
      },
      {
        id: "project-sun-onlight",
        assetId: "asset-sun-onlight",
        file: "uploaded-video/no-2.mp4",
        title: "SUN ONLIGHT",
        category: "commercial",
        cat_label: "Commercial · 4K HDR",
        meta: "Solar Energy Campaign — 2025",
        size: "card-sm",
        thumb_color: "thumb-2",
        thumb_glow: [
          { w: 220, h: 220, color: "rgba(201,168,76,0.4)", top: "20%", left: "30%" },
          { w: 140, h: 140, color: "rgba(255,200,80,0.3)", top: "60%", right: "20%", delay: "-2s" }
        ]
      },
      {
        id: "project-silent-waters",
        assetId: "asset-silent-waters",
        file: "uploaded-video/no-1.mp4",
        title: "Silent Waters",
        category: "film",
        cat_label: "Film · 4K DCI HDR",
        meta: "Nordic Narrative Short — 2025",
        size: "card-sm",
        thumb_color: "thumb-3",
        thumb_glow: [
          { w: 200, h: 200, color: "rgba(40,120,200,0.35)", top: "25%", left: "20%" },
          { w: 130, h: 130, color: "rgba(80,180,240,0.25)", bottom: "20%", right: "25%", delay: "-1.5s" }
        ]
      },
      {
        id: "project-amber-hours",
        assetId: "asset-amber-hours",
        file: "uploaded-video/no-2.mp4",
        title: "Amber Hours",
        category: "motion",
        cat_label: "Motion · 4K 60FPS",
        meta: "Luxury Horology Film — 2024",
        size: "card-lg",
        thumb_color: "thumb-4",
        thumb_glow: [
          { w: 210, h: 210, color: "rgba(235,140,40,0.4)", top: "15%", right: "25%" },
          { w: 130, h: 130, color: "rgba(255,180,70,0.3)", bottom: "20%", left: "25%", delay: "-2.5s" }
        ]
      },
      {
        id: "project-velocity",
        assetId: "asset-velocity",
        file: "uploaded-video/no-2.mp4",
        title: "Velocity",
        category: "vfx",
        cat_label: "VFX · Super Slow-Mo",
        meta: "Motorsport Launch — 2025",
        size: "card-md",
        thumb_color: "thumb-5",
        thumb_glow: [
          { w: 220, h: 220, color: "rgba(220,60,60,0.35)", top: "20%", left: "25%" },
          { w: 140, h: 140, color: "rgba(255,100,50,0.25)", bottom: "25%", right: "20%", delay: "-1s" }
        ]
      },
      {
        id: "project-neon-reverie",
        assetId: "asset-neon-reverie",
        file: "uploaded-video/no-1.mp4",
        title: "Neon Reverie",
        category: "motion",
        cat_label: "Motion · Cybernetic Flow",
        meta: "Tokyo Nocturne Showcase — 2025",
        size: "card-md",
        thumb_color: "thumb-6",
        thumb_glow: [
          { w: 200, h: 200, color: "rgba(180,60,220,0.4)", top: "30%", right: "25%" },
          { w: 120, h: 120, color: "rgba(100,60,240,0.3)", bottom: "20%", left: "25%", delay: "-3s" }
        ]
      }
    ]
  };

  function loadAndRender() {
    fetch('data/videos.json?t=' + Date.now(), { cache: 'no-store' })
      .then(r => {
        if (!r.ok) throw new Error('videos.json status ' + r.status);
        return r.json();
      })
      .then(data => {
        renderHero(data.hero);
        if (data.showcase && typeof applyShowcaseData === 'function') applyShowcaseData(data.showcase);
        renderPortfolio(data);
      })
      .catch(err => {
        console.info('[Shadow] videos.json fallback active:', err.message);
        renderHero(DEFAULT_DATA.hero);
        renderPortfolio(DEFAULT_DATA);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAndRender);
  } else {
    loadAndRender();
  }

})();
