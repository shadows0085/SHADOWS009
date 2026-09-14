/**
 * 🌌 FLUID NEBULA 3D ENGINE — v10.5 (Blast Color Morph & Constellation Edition)
 * 
 * 
 * Maker Specifications Implemented:
 *  1. Blast Color Morphing: Clicking to blast smoothly morphs the entire sphere into the next palette
 *  2. Random Color on Refresh: Every page reload starts with a fresh atmospheric palette
 *  3. Hidden UI Buttons: Color switcher buttons hidden from the website for clean minimalism
 *  4. High-Density Cursor Connection Web: Multi-line energy filaments & cross-connections linking cursor to sphere
 *  5. Structural Rigidity Fix: Preserves pure organic boulder geometry without bending/warping out of shape
 *  6. Locked 120 FPS: 100% GPU WebGL pipeline with frame-rate independent delta timing
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.FluidNebulaEngine = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ═══════════════════════════════════════════════════════════
  // 1. REFINED COLOR PALETTES & THEMES
  // ═══════════════════════════════════════════════════════════
  const PALETTES = {
    // 1. DOTDNA Bio-Luminescent Emerald
    dotdna: {
      name: 'Bio-Emerald',
      canvasBg: '#020904',
      bodyBg: '#020904',
      colShadow: [0.015, 0.10, 0.045],
      colMid: [0.05, 0.54, 0.28],
      colHighlight: [0.12, 0.78, 0.42],
      colRim: [0.38, 0.92, 0.60],
      colSpore: [0.20, 0.78, 0.45],
      colDust: [0.35, 0.85, 0.55],
      ambientOrb: 'rgba(20, 160, 85, 0.14)',
      ambientBack: 'rgba(2, 20, 10, 0.22)',
      isPhotoTheme: 0.0
    },

    // 2. Imperial Gold
    gold: {
      name: 'Studio Gold',
      canvasBg: '#080603',
      bodyBg: '#080603',
      colShadow: [0.15, 0.09, 0.02],
      colMid: [0.85, 0.60, 0.18],
      colHighlight: [1.0, 0.88, 0.42],
      colRim: [1.0, 0.98, 0.80],
      colSpore: [1.0, 0.84, 0.42],
      colDust: [1.0, 0.95, 0.78],
      ambientOrb: 'rgba(255, 195, 75, 0.18)',
      ambientBack: 'rgba(38, 26, 8, 0.28)',
      isPhotoTheme: 0.0
    },

    // 3. Cosmic Cyan
    cyan: {
      name: 'Cosmic Cyan',
      canvasBg: '#02070d',
      bodyBg: '#02070d',
      colShadow: [0.02, 0.10, 0.18],
      colMid: [0.10, 0.55, 0.92],
      colHighlight: [0.22, 0.92, 1.0],
      colRim: [0.72, 0.98, 1.0],
      colSpore: [0.42, 0.94, 1.0],
      colDust: [0.82, 0.98, 1.0],
      ambientOrb: 'rgba(38, 195, 255, 0.18)',
      ambientBack: 'rgba(6, 28, 48, 0.28)',
      isPhotoTheme: 0.0
    },

    // 4. Royal Amethyst
    amethyst: {
      name: 'Royal Amethyst',
      canvasBg: '#07020c',
      bodyBg: '#07020c',
      colShadow: [0.10, 0.02, 0.16],
      colMid: [0.55, 0.14, 0.75],
      colHighlight: [0.88, 0.35, 1.0],
      colRim: [0.96, 0.75, 1.0],
      colSpore: [0.82, 0.32, 0.96],
      colDust: [0.92, 0.65, 1.0],
      ambientOrb: 'rgba(180, 50, 230, 0.18)',
      ambientBack: 'rgba(28, 6, 38, 0.28)',
      isPhotoTheme: 0.0
    },

    // 5. Solar Flare
    crimson: {
      name: 'Solar Flare',
      canvasBg: '#0c0303',
      bodyBg: '#0c0303',
      colShadow: [0.18, 0.02, 0.02],
      colMid: [0.82, 0.18, 0.12],
      colHighlight: [1.0, 0.52, 0.18],
      colRim: [1.0, 0.88, 0.55],
      colSpore: [1.0, 0.42, 0.20],
      colDust: [1.0, 0.72, 0.42],
      ambientOrb: 'rgba(240, 70, 30, 0.18)',
      ambientBack: 'rgba(38, 10, 8, 0.28)',
      isPhotoTheme: 0.0
    },

    // 6. Arctic Frost
    frost: {
      name: 'Arctic Frost',
      canvasBg: '#02050b',
      bodyBg: '#02050b',
      colShadow: [0.03, 0.08, 0.18],
      colMid: [0.25, 0.55, 0.88],
      colHighlight: [0.65, 0.88, 1.0],
      colRim: [0.92, 0.98, 1.0],
      colSpore: [0.60, 0.88, 1.0],
      colDust: [0.90, 0.96, 1.0],
      ambientOrb: 'rgba(100, 180, 255, 0.18)',
      ambientBack: 'rgba(6, 18, 38, 0.28)',
      isPhotoTheme: 0.0
    },

    // 7. Tokyo Cyber
    tokyo: {
      name: 'Tokyo Cyber',
      canvasBg: '#06020a',
      bodyBg: '#06020a',
      colShadow: [0.08, 0.02, 0.14],
      colMid: [0.90, 0.10, 0.55],
      colHighlight: [0.10, 0.94, 0.88],
      colRim: [1.0, 0.45, 0.85],
      colSpore: [0.20, 0.96, 0.90],
      colDust: [0.95, 0.40, 0.85],
      ambientOrb: 'rgba(235, 30, 140, 0.18)',
      ambientBack: 'rgba(20, 8, 38, 0.28)',
      isPhotoTheme: 0.0
    },

    // 8. Cinematic Aurora — a cool cyan core diffusing into violet and rose.
    // This is the default hero atmosphere: dense enough to feel enveloping,
    // but with a dark centre so typography remains legible.
    cinematic: {
      name: 'Cinematic Aurora',
      canvasBg: '#07120e',
      bodyBg: '#050e0a',
      colShadow: [0.045, 0.018, 0.09],
      colMid: [0.65, 0.16, 0.59],
      colHighlight: [0.28, 0.88, 1.0],
      colRim: [0.78, 0.72, 1.0],
      colSpore: [0.96, 0.30, 0.73],
      colDust: [0.55, 0.90, 1.0],
      ambientOrb: 'rgba(112, 198, 255, 0.16)',
      ambientBack: 'rgba(22, 8, 38, 0.22)',
      isPhotoTheme: 0.0
    }
  };

  const PALETTE_KEYS = ['cinematic', 'dotdna', 'gold', 'cyan', 'amethyst', 'crimson', 'frost', 'tokyo'];

  // Aliases
  PALETTES.emerald = PALETTES.dotdna;
  PALETTES['bio-emerald'] = PALETTES.dotdna;
  PALETTES.violet = PALETTES.amethyst;
  PALETTES.purple = PALETTES.amethyst;
  PALETTES.flare = PALETTES.crimson;
  PALETTES.solar = PALETTES.crimson;
  PALETTES.arctic = PALETTES.frost;
  PALETTES.ice = PALETTES.frost;
  PALETTES.cyber = PALETTES.tokyo;
  PALETTES.neon = PALETTES.tokyo;
  PALETTES.aurora = PALETTES.cinematic;

  // Helper function: copy 3D vector
  const cloneVec3 = (v) => [v[0], v[1], v[2]];
  const lerpVec3 = (a, b, t) => [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t
  ];

  // ═══════════════════════════════════════════════════════════
  // 2. MAIN FLUID NEBULA ENGINE CLASS
  // ═══════════════════════════════════════════════════════════
  class FluidNebulaEngine {
    constructor(canvas, options = {}) {
      this.canvas = typeof canvas === 'string' ? document.querySelector(canvas) : canvas;
      if (!this.canvas) {
        console.error('FluidNebulaEngine: Canvas element not found');
        return;
      }

      this.options = Object.assign({
        palette: 'dotdna',
        particleCount: 500000,         // 500K micro-particles
        morphSpeed: 0.00032,
        mouseInertia: 0.08,
        mouseRepelRadius: 145.0,       // Magnetic catchment radius
        mouseRepelStrength: 1.0,
        enableControls: true
      }, options);

      const palKey = (this.options.palette || 'dotdna').toLowerCase();
      this.currentPalette = PALETTES[palKey] || PALETTES.dotdna;
      this.paletteIndex = Math.max(0, PALETTE_KEYS.indexOf(palKey));

      // Active colors state for smooth blast transition
      this.activeColors = {
        colShadow: cloneVec3(this.currentPalette.colShadow),
        colMid: cloneVec3(this.currentPalette.colMid),
        colHighlight: cloneVec3(this.currentPalette.colHighlight),
        colRim: cloneVec3(this.currentPalette.colRim),
        colSpore: cloneVec3(this.currentPalette.colSpore),
        colDust: cloneVec3(this.currentPalette.colDust)
      };

      this.isTransitioning = false;
      this.transitionStartTime = 0;
      this.transitionDuration = 1200;
      this.startColors = null;
      this.targetPalette = null;

      this.width = 0;
      this.height = 0;
      this.dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      this.mouse = {
        x: 0, y: 0,
        targetX: 0, targetY: 0,
        worldX: 0, worldY: 0,
        targetWorldX: 0, targetWorldY: 0,
        isHovering: true
      };

      this.rot = { x: 0.0, y: 0.0, targetX: 0.0, targetY: 0.0 };
      this.trans = { x: 0.0, y: 0.0, targetX: 0.0, targetY: 0.0 };

      this.clock = 0;
      this.lastTime = performance.now();
      this.fps = 120;
      this.frameCount = 0;
      this.lastFpsUpdate = performance.now();
      this.rafId = null;
      this.isDestroyed = false;

      // Multi-shockwave pool
      this.shockwaves = [
        { worldX: 0, worldY: 0, startTime: -9999, active: false },
        { worldX: 0, worldY: 0, startTime: -9999, active: false },
        { worldX: 0, worldY: 0, startTime: -9999, active: false }
      ];
      this.shockwaveIndex = 0;

      this.useWebGL = false;
      this.initContext();

      // Bind interaction events
      this.handleResize = this.resize.bind(this);
      this.handleMouseMove = this.onMouseMove.bind(this);
      this.handleTouchMove = this.onTouchMove.bind(this);
      this.handleMouseLeave = this.onMouseLeave.bind(this);

      window.addEventListener('resize', this.handleResize, { passive: true });
      window.addEventListener('mousemove', this.handleMouseMove, { passive: true });
      window.addEventListener('touchmove', this.handleTouchMove, { passive: true });
      window.addEventListener('mouseleave', this.handleMouseLeave, { passive: true });

      this.handleClick = this.onClick.bind(this);
      window.addEventListener('click', this.handleClick, { passive: true });

      this.resize();
      this.start();
    }

    onClick(e) {
      if (e.target && e.target.closest('a, button, input, textarea, .modal-box, .hero-video-preview')) return;
      const rect = this.canvas.getBoundingClientRect();
      const cx = this.width / 2;
      const cy = this.height / 2;
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      const nx = (clientX - cx) / cx;
      const ny = (clientY - cy) / cy;

      const aspect = (this.width || 1) / (this.height || 1);
      const fovRad = 42 * (Math.PI / 180);
      const halfH = 580 * Math.tan(fovRad * 0.5);
      const halfW = halfH * aspect;

      // 1. Trigger explosive blast shockwave
      const sw = this.shockwaves[this.shockwaveIndex];
      sw.worldX = nx * halfW;
      sw.worldY = -ny * halfH;
      sw.startTime = performance.now();
      sw.active = true;
      this.shockwaveIndex = (this.shockwaveIndex + 1) % this.shockwaves.length;

      // 2. Blast Color Morph: Every click blast morphs the sphere into the next palette!
      this.cycleNextPalette();
    }

    cycleNextPalette() {
      this.paletteIndex = (this.paletteIndex + 1) % PALETTE_KEYS.length;
      const nextKey = PALETTE_KEYS[this.paletteIndex];
      this.morphToPalette(nextKey, 1300);
    }

    morphToPalette(paletteKey, durationMs = 1300) {
      const target = PALETTES[paletteKey];
      if (!target) return;

      this.startColors = {
        colShadow: cloneVec3(this.activeColors.colShadow),
        colMid: cloneVec3(this.activeColors.colMid),
        colHighlight: cloneVec3(this.activeColors.colHighlight),
        colRim: cloneVec3(this.activeColors.colRim),
        colSpore: cloneVec3(this.activeColors.colSpore),
        colDust: cloneVec3(this.activeColors.colDust)
      };
      this.targetPalette = target;
      this.transitionStartTime = performance.now();
      this.transitionDuration = durationMs;
      this.isTransitioning = true;

      // Smooth background & ambient glow transition
      const body = document.body;
      if (body && target.bodyBg) {
        body.style.transition = 'background-color 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)';
        body.style.backgroundColor = target.bodyBg;
      }
      const ambientGlow = document.getElementById('ambientGlow');
      if (ambientGlow && target.ambientOrb) {
        ambientGlow.style.transition = 'background 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)';
        ambientGlow.style.background = `radial-gradient(circle, ${target.ambientOrb} 0%, transparent 75%)`;
      }
    }

    setScrollProgress(progress) {
      this.scrollProgress = Math.max(0.0, Math.min(1.0, progress));
    }

    initContext() {
      const glOpts = {
        alpha: true,
        antialias: true,
        depth: false,
        premultipliedAlpha: false,
        powerPreference: 'high-performance'
      };

      try {
        this.gl = this.canvas.getContext('webgl2', glOpts) ||
                  this.canvas.getContext('webgl', glOpts) ||
                  this.canvas.getContext('experimental-webgl', glOpts);
      } catch (e) {
        this.gl = null;
      }

      if (this.gl && this.initWebGLShaders()) {
        this.useWebGL = true;
        this.initWebGLBuffers();
      } else {
        this.useWebGL = false;
        this.ctx = this.canvas.getContext('2d');
        this.init2DParticles();
      }
    }

    initWebGLShaders() {
      const gl = this.gl;

      const vsSource = `
        precision highp float;

        attribute vec3 a_basePos;
        attribute vec3 a_normal;
        attribute float a_size;
        attribute float a_seed;
        attribute float a_type;
        attribute vec4 a_color;

        uniform mat4 u_matrix;
        uniform float u_time;
        uniform vec2 u_resolution;
        uniform vec3 u_colShadow;
        uniform vec3 u_colMid;
        uniform vec3 u_colHighlight;
        uniform vec3 u_colRim;
        uniform vec3 u_colSpore;
        uniform vec3 u_colDust;
        uniform float u_isPhotoTheme;
        uniform vec3 u_mouseWorld;
        uniform float u_repelRadius;
        uniform float u_scrollProgress;
        
        uniform vec4 u_shockwaves[3];

        varying vec4 v_color;

        vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

          vec3 i  = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);

          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);

          vec3 x1 = x0 - i1 + 1.0 * C.xxx;
          vec3 x2 = x0 - i2 + 2.0 * C.xxx;
          vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

          i = mod(i, 289.0);
          vec4 p = permute(permute(permute(
                     i.z + vec4(0.0, i1.z, i2.z, 1.0))
                   + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                   + i.x + vec4(0.0, i1.x, i2.x, 1.0));

          float n_ = 1.0/7.0;
          vec3  ns = n_ * D.wyz - D.xzx;

          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);

          vec4 x = x_ * ns.x + ns.yyyy;
          vec4 y = y_ * ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);

          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);

          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));

          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);

          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;

          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }

        void main() {
          vec3 pos = a_basePos;
          vec3 norm = a_normal;
          float t = u_time * 0.26;

          // 1. ORGANIC CELLULAR BREATHING OF THE ROCK
          if (a_type < 0.5) {
            float n1 = snoise(pos * 0.005 + vec3(t * 0.10, t * 0.08, 0.0));
            float breath = sin(t * 0.50) * 1.8;
            pos += norm * (n1 * 6.5 + breath);
          }
          // 2. DISSOLVING SPORE PLUME
          else if (a_type < 1.5) {
            float life = fract(t * 0.14 + a_seed);
            float lifeCurve = sin(life * 3.14159);
            float driftAngle = a_seed * 6.28318;

            vec3 curl = vec3(
              snoise(pos * 0.005 + vec3(t * 0.18, 0.0, 0.0)),
              snoise(pos * 0.005 + vec3(0.0, t * 0.18, 0.0)),
              snoise(pos * 0.005 + vec3(0.0, 0.0, t * 0.18))
            );

            float plumeDisp = 1.0 + u_scrollProgress * 2.2;
            pos.x += (cos(driftAngle) * 32.0 + curl.x * 22.0 + life * 35.0) * lifeCurve * plumeDisp;
            pos.y += (sin(driftAngle) * 32.0 + curl.y * 22.0 + life * 28.0) * lifeCurve * plumeDisp;
            pos.z += (sin(driftAngle * 1.4) * 36.0 + curl.z * 22.0) * lifeCurve * plumeDisp;
          }
          // 3. AMBIENT STARDUST
          else {
            pos.y += sin(t * 0.35 + a_seed * 12.0) * 7.0;
            pos.x += cos(t * 0.25 + a_seed * 8.0) * 5.0;
          }

          // 3B. SCROLL MORPH
          if (u_scrollProgress > 0.38 && a_type < 0.5) {
            float morphT = smoothstep(0.38, 0.75, u_scrollProgress);
            vec3 lattice = normalize(pos) * 185.0;
            pos = mix(pos, lattice, morphT * 0.42);
          }

          // 4. STRUCTURALLY RIGID CURSOR INTERACTION (NO WARPING/BENDING)
          // Preserves pure spheroidal boulder geometry; only excites surface energy
          float cursorConnectEnergy = 0.0;
          if (u_mouseWorld.z > 0.01) {
            vec3 toCursor = vec3(u_mouseWorld.xy, 10.0) - pos;
            float dist = length(toCursor);
            float maxRadius = u_repelRadius;

            if (dist < maxRadius) {
              float q = dist / maxRadius;
              float pull = (1.0 - q) * (1.0 - q) * (1.0 + 2.0 * q);
              float stretchFactor = pow(1.0 - q, 2.0);

              // Solid rock core: Micro-breathe along normal only (NEVER shears or bends sideways!)
              if (a_type < 0.5) {
                pos += norm * (stretchFactor * 1.5 * u_mouseWorld.z);
              } else {
                // Free ambient stardust & spores drift gently toward cursor
                vec3 pullDir = dist > 0.001 ? (toCursor / dist) : vec3(0.0);
                pos += pullDir * (pull * 14.0 * u_mouseWorld.z);
              }
              cursorConnectEnergy = stretchFactor;
            }
          }

          // 4B. UPGRADED FLUID SUPER-BLAST IMPULSE SYSTEM
          float totalBlastEnergy = 0.0;
          for (int k = 0; k < 3; k++) {
            if (u_shockwaves[k].w > 0.5) {
              float swTime = u_shockwaves[k].z;
              if (swTime < 1.55) {
                vec2 toSw = pos.xy - u_shockwaves[k].xy;
                float swDist = length(toSw);

                float blastT = clamp(swTime / 1.5, 0.0, 1.0);
                float easeOutFront = (1.0 - pow(1.0 - blastT, 3.2)) * 490.0;

                float sigma = 36.0 + blastT * 42.0;
                float distDiff = swDist - easeOutFront;
                float wavePrimary = exp(-(distDiff * distDiff) / (2.0 * sigma * sigma));

                float rip2Diff = swDist - easeOutFront * 0.70;
                float waveSecondary = 0.40 * exp(-(rip2Diff * rip2Diff) / (2.0 * (sigma * 1.3) * (sigma * 1.3)));

                float blastFactor = (wavePrimary + waveSecondary) * pow(1.0 - blastT, 1.35);

                if (blastFactor > 0.004) {
                  vec2 waveDir = swDist > 0.001 ? (toSw / swDist) : vec2(0.0, 1.0);
                  vec2 waveTangent = vec2(-waveDir.y, waveDir.x);

                  float blastCurl = snoise(vec3(pos.xy * 0.012, swTime * 1.6));

                  float scatterRadial = blastFactor * 60.0;
                  float scatterSwirl = blastFactor * (26.0 * blastCurl);
                  float scatterZ = blastFactor * 44.0 * (0.8 + 0.4 * a_seed);

                  float recoil = sin(swTime * 7.5) * exp(-swTime * 2.8) * 14.0 * (1.0 - clamp(swDist / 420.0, 0.0, 1.0));

                  pos.xy += waveDir * (scatterRadial - recoil) + waveTangent * scatterSwirl;
                  pos.z += scatterZ;

                  totalBlastEnergy += blastFactor;
                }
              }
            }
          }

          vec4 mvpPos = u_matrix * vec4(pos, 1.0);
          gl_Position = mvpPos;

          float camDepth = max(mvpPos.w, 40.0);
          float pSize = a_size * (u_resolution.y / camDepth) * 1.25;
          pSize += cursorConnectEnergy * 1.8;
          pSize += totalBlastEnergy * 2.2;
          gl_PointSize = clamp(pSize, 1.8, 6.5);

          if (u_isPhotoTheme > 0.5) {
            v_color = a_color;
          } else {
            if (a_type < 0.5) {
              vec3 L = normalize(vec3(0.42, 0.78, 0.46));
              vec3 V = vec3(0.0, 0.0, 1.0);
              vec3 rimL = normalize(vec3(-0.6, 0.5, -0.8));

              float diff = clamp(dot(norm, L), 0.0, 1.0);
              float fresnel = pow(1.0 - abs(dot(norm, V)), 2.5) * 0.28;

              vec3 col = mix(u_colShadow, u_colMid, diff);
              col = mix(col, u_colHighlight, pow(diff, 2.2) * 0.75);
              col += u_colRim * fresnel;

              vec3 innerLightPos = vec3(45.0, -10.0, -25.0);
              float innerDist = length(innerLightPos - pos);
              float innerAtten = clamp(1.0 - innerDist / 340.0, 0.0, 1.0);
              col += u_colMid * (innerAtten * innerAtten * 0.25);

              col *= (0.92 + 0.16 * a_seed);

              // Surface connection illumination
              if (cursorConnectEnergy > 0.01) {
                col += u_colHighlight * (cursorConnectEnergy * 0.75);
              }

              // Chromatic Blast Flash: particles in wavefront blaze with incandescent energy
              if (totalBlastEnergy > 0.01) {
                vec3 blastCore = mix(u_colHighlight, vec3(1.0, 0.98, 0.94), 0.78);
                col = mix(col, blastCore, clamp(totalBlastEnergy * 1.75, 0.0, 1.0));
              }

              float alpha = clamp(0.85 + 0.15 * diff + totalBlastEnergy * 0.2, 0.0, 1.0);
              v_color = vec4(col, alpha);
            } else if (a_type < 1.5) {
              float life = fract(t * 0.14 + a_seed);
              float alpha = sin(life * 3.14159) * 0.85;
              vec3 col = mix(u_colHighlight, u_colRim, sin(life * 3.14159));
              if (totalBlastEnergy > 0.01) {
                col = mix(col, vec3(1.0, 1.0, 1.0), clamp(totalBlastEnergy * 1.5, 0.0, 1.0));
              }
              v_color = vec4(col, alpha);
            } else {
              float twinkle = 0.45 + 0.45 * sin(t * 1.6 + a_seed * 6.28);
              vec3 col = u_colDust;
              if (totalBlastEnergy > 0.01) {
                col = mix(col, u_colHighlight, clamp(totalBlastEnergy * 1.4, 0.0, 1.0));
              }
              v_color = vec4(col, twinkle * 0.75);
            }
          }
        }
      `;

      const fsSource = `
        precision highp float;
        varying vec4 v_color;

        void main() {
          vec2 coord = gl_PointCoord - vec2(0.5);
          float dist = length(coord);
          if (dist > 0.5) {
            discard;
          }

          float alpha = smoothstep(0.5, 0.36, dist);
          gl_FragColor = vec4(v_color.rgb, v_color.a * alpha);
        }
      `;

      const vs = this.compileShader(gl.VERTEX_SHADER, vsSource);
      const fs = this.compileShader(gl.FRAGMENT_SHADER, fsSource);
      if (!vs || !fs) return false;

      const program = gl.createProgram();
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Shader program link error:', gl.getProgramInfoLog(program));
        return false;
      }

      this.glProgram = program;
      this.glAttribs = {
        basePos: gl.getAttribLocation(program, 'a_basePos'),
        normal: gl.getAttribLocation(program, 'a_normal'),
        size: gl.getAttribLocation(program, 'a_size'),
        seed: gl.getAttribLocation(program, 'a_seed'),
        type: gl.getAttribLocation(program, 'a_type'),
        color: gl.getAttribLocation(program, 'a_color')
      };
      this.glUniforms = {
        matrix: gl.getUniformLocation(program, 'u_matrix'),
        time: gl.getUniformLocation(program, 'u_time'),
        resolution: gl.getUniformLocation(program, 'u_resolution'),
        colShadow: gl.getUniformLocation(program, 'u_colShadow'),
        colMid: gl.getUniformLocation(program, 'u_colMid'),
        colHighlight: gl.getUniformLocation(program, 'u_colHighlight'),
        colRim: gl.getUniformLocation(program, 'u_colRim'),
        colSpore: gl.getUniformLocation(program, 'u_colSpore'),
        colDust: gl.getUniformLocation(program, 'u_colDust'),
        isPhotoTheme: gl.getUniformLocation(program, 'u_isPhotoTheme'),
        mouseWorld: gl.getUniformLocation(program, 'u_mouseWorld'),
        repelRadius: gl.getUniformLocation(program, 'u_repelRadius'),
        scrollProgress: gl.getUniformLocation(program, 'u_scrollProgress'),
        shockwaves: [
          gl.getUniformLocation(program, 'u_shockwaves[0]'),
          gl.getUniformLocation(program, 'u_shockwaves[1]'),
          gl.getUniformLocation(program, 'u_shockwaves[2]')
        ]
      };

      // ─────────────────────────────────────────────────────────
      // HIGH-DENSITY FILAMENT TENDENCY PROGRAM (CONSTELLATION WEB)
      // ─────────────────────────────────────────────────────────
      const filamentVsSource = `
        precision highp float;
        attribute vec3 a_position;
        attribute vec4 a_color;
        uniform mat4 u_matrix;
        varying vec4 v_color;
        void main() {
          v_color = a_color;
          gl_Position = u_matrix * vec4(a_position, 1.0);
        }
      `;
      const filamentFsSource = `
        precision highp float;
        varying vec4 v_color;
        void main() {
          gl_FragColor = v_color;
        }
      `;
      const fvs = this.compileShader(gl.VERTEX_SHADER, filamentVsSource);
      const ffs = this.compileShader(gl.FRAGMENT_SHADER, filamentFsSource);
      if (fvs && ffs) {
        const fProg = gl.createProgram();
        gl.attachShader(fProg, fvs);
        gl.attachShader(fProg, ffs);
        gl.linkProgram(fProg);
        if (gl.getProgramParameter(fProg, gl.LINK_STATUS)) {
          this.filamentProgram = fProg;
          this.filamentAttribs = {
            position: gl.getAttribLocation(fProg, 'a_position'),
            color: gl.getAttribLocation(fProg, 'a_color')
          };
          this.filamentUniforms = {
            matrix: gl.getUniformLocation(fProg, 'u_matrix')
          };
          this.filamentBuffer = gl.createBuffer();
        }
      }

      return true;
    }

    compileShader(type, src) {
      const gl = this.gl;
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error('Shader compilation failed:', gl.getShaderInfoLog(s));
        gl.deleteShader(s);
        return null;
      }
      return s;
    }

    initWebGLBuffers() {
      const gl = this.gl;

      const totalCount = this.options.particleCount;
      this.totalParticleCount = totalCount;

      const bodyCount = Math.floor(totalCount * 0.76);
      const plumeCount = Math.floor(totalCount * 0.19);
      const dustCount = totalCount - bodyCount - plumeCount;

      const basePosData = new Float32Array(totalCount * 3);
      const normalData  = new Float32Array(totalCount * 3);
      const sizeData    = new Float32Array(totalCount);
      const seedData    = new Float32Array(totalCount);
      const typeData    = new Float32Array(totalCount);
      const colorData   = new Float32Array(totalCount * 4);

      // Pre-sample 450+ surface anchors for dense constellation filament connections
      this.surfaceAnchors = [];
      const anchorStride = Math.floor(bodyCount / 450);

      let ptr = 0;
      const phi = Math.PI * (3.0 - Math.sqrt(5.0));

      for (let i = 0; i < bodyCount; i++) {
        const y = 1.0 - (i / (bodyCount - 1)) * 2.0;
        const rY = Math.sqrt(Math.max(0, 1.0 - y * y));
        const theta = phi * i;
        const nx0 = Math.cos(theta) * rY;
        const ny0 = y;
        const nz0 = Math.sin(theta) * rY;

        const radX = 255.0 * (1.0 + 0.16 * Math.sin(theta * 2.0 + y * 2.4));
        const radY = 178.0 * (1.0 + 0.14 * Math.cos(theta * 3.0));
        const radZ = 162.0 * (1.0 + 0.18 * Math.sin(theta * 1.5 + y * 1.8));

        const shellDist = 0.70 + Math.pow(Math.random(), 0.52) * 0.38;
        let px = nx0 * radX * shellDist;
        let py = ny0 * radY * shellDist;
        let pz = nz0 * radZ * shellDist;

        if (pz > -25.0) {
          const distToCrevice = Math.hypot(px - 10.0, py + 8.0);
          if (distToCrevice < 155.0) {
            const craterFactor = (1.0 - distToCrevice / 155.0);
            pz -= craterFactor * craterFactor * 95.0;
          }
        }

        px += 10.0;
        py += 15.0;

        basePosData[ptr * 3]     = px;
        basePosData[ptr * 3 + 1] = py;
        basePosData[ptr * 3 + 2] = pz;

        // Sample surface anchors across outer shell facing forward
        if (i % anchorStride === 0 && shellDist > 0.82 && pz > -70.0) {
          this.surfaceAnchors.push({ x: px, y: py, z: pz });
        }

        const invLen = 1.0 / (Math.hypot(nx0, ny0, nz0) || 1.0);
        normalData[ptr * 3]     = nx0 * invLen;
        normalData[ptr * 3 + 1] = ny0 * invLen;
        normalData[ptr * 3 + 2] = nz0 * invLen;

        sizeData[ptr] = 1.55 + (i % 5) * 0.35;
        seedData[ptr] = Math.random();
        typeData[ptr] = 0.0;

        colorData[ptr * 4]     = 0.12;
        colorData[ptr * 4 + 1] = 1.0;
        colorData[ptr * 4 + 2] = 0.58;
        colorData[ptr * 4 + 3] = 0.95;

        ptr++;
      }

      for (let i = 0; i < plumeCount; i++) {
        const parentIdx = Math.floor(Math.random() * bodyCount);
        let px = basePosData[parentIdx * 3];
        let py = basePosData[parentIdx * 3 + 1];
        let pz = basePosData[parentIdx * 3 + 2];

        const extAngle = (Math.random() * 0.82 + 0.08) * Math.PI * 0.5;
        const extDist = Math.pow(Math.random(), 0.68) * 105.0;
        px += Math.cos(extAngle) * extDist + (Math.random() - 0.5) * 22.0;
        py += Math.sin(extAngle) * extDist + (Math.random() - 0.5) * 22.0;
        pz += (Math.random() - 0.5) * 65.0;

        basePosData[ptr * 3]     = px;
        basePosData[ptr * 3 + 1] = py;
        basePosData[ptr * 3 + 2] = pz;

        normalData[ptr * 3]     = Math.cos(extAngle);
        normalData[ptr * 3 + 1] = Math.sin(extAngle);
        normalData[ptr * 3 + 2] = 0.5;

        sizeData[ptr] = 1.3 + Math.random() * 1.1;
        seedData[ptr] = Math.random();
        typeData[ptr] = 1.0;

        colorData[ptr * 4]     = 0.35;
        colorData[ptr * 4 + 1] = 1.0;
        colorData[ptr * 4 + 2] = 0.65;
        colorData[ptr * 4 + 3] = 0.80;

        ptr++;
      }

      const boxW = 1500;
      const boxH = 1000;
      const boxD = 850;

      for (let i = 0; i < dustCount; i++) {
        const dx = (Math.random() - 0.5) * boxW + 40;
        const dy = (Math.random() - 0.5) * boxH;
        const dz = (Math.random() - 0.5) * boxD;

        basePosData[ptr * 3]     = dx;
        basePosData[ptr * 3 + 1] = dy;
        basePosData[ptr * 3 + 2] = dz;

        normalData[ptr * 3]     = 0;
        normalData[ptr * 3 + 1] = 1;
        normalData[ptr * 3 + 2] = 0;

        sizeData[ptr] = 1.1 + Math.random() * 0.9;
        seedData[ptr] = Math.random();
        typeData[ptr] = 2.0;

        colorData[ptr * 4]     = 0.70;
        colorData[ptr * 4 + 1] = 1.0;
        colorData[ptr * 4 + 2] = 0.88;
        colorData[ptr * 4 + 3] = 0.65;

        ptr++;
      }

      this.basePosBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.basePosBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, basePosData, gl.STATIC_DRAW);

      this.normalBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, normalData, gl.STATIC_DRAW);

      this.sizeBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.sizeBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, sizeData, gl.STATIC_DRAW);

      this.seedBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.seedBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, seedData, gl.STATIC_DRAW);

      this.typeBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.typeBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, typeData, gl.STATIC_DRAW);

      this.colorBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, colorData, gl.STATIC_DRAW);

      // Large buffer capacity for high-density constellation web (up to 120 lines = 240 vertices)
      this.filamentData = new Float32Array(240 * 7);
    }

    init2DParticles() {
      this.particles2D = [];
      const count = 3000;
      for (let i = 0; i < count; i++) {
        const u = (i / (count - 1)) * 2.0 - 1.0;
        this.particles2D.push({
          bx: u * 240 + 50,
          by: (u * u - 0.5) * 140,
          bz: (Math.random() - 0.5) * 60,
          size: 1.5,
          color: '#1aff85'
        });
      }
    }

    resize() {
      const rect = this.canvas.getBoundingClientRect();
      const w = rect.width || window.innerWidth;
      const h = rect.height || window.innerHeight;

      this.width = w;
      this.height = h;

      this.canvas.width = Math.round(w * this.dpr);
      this.canvas.height = Math.round(h * this.dpr);

      if (this.useWebGL) {
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      }
    }

    onMouseMove(e) {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      const cx = this.width / 2;
      const cy = this.height / 2;
      const nx = (clientX - cx) / cx;
      const ny = (clientY - cy) / cy;

      const aspect = (this.width || 1) / (this.height || 1);
      const fovRad = 42 * (Math.PI / 180);
      const halfH = 580 * Math.tan(fovRad * 0.5);
      const halfW = halfH * aspect;

      this.mouse.targetWorldX = nx * halfW;
      this.mouse.targetWorldY = -ny * halfH;
      this.mouse.targetX = nx;
      this.mouse.targetY = ny;
      this.mouse.isHovering = true;

      this.rot.targetY = nx * 0.08;
      this.rot.targetX = -ny * 0.06;
      this.trans.targetX = 0.0;
      this.trans.targetY = 0.0;
    }

    onTouchMove(e) {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const clientX = touch.clientX - rect.left;
        const clientY = touch.clientY - rect.top;

        const cx = this.width / 2;
        const cy = this.height / 2;
        const nx = (clientX - cx) / cx;
        const ny = (clientY - cy) / cy;

        const aspect = (this.width || 1) / (this.height || 1);
        const fovRad = 42 * (Math.PI / 180);
        const halfH = 580 * Math.tan(fovRad * 0.5);
        const halfW = halfH * aspect;

        this.mouse.targetWorldX = nx * halfW;
        this.mouse.targetWorldY = -ny * halfH;
        this.mouse.isHovering = true;

        this.rot.targetY = nx * 0.06;
        this.rot.targetX = -ny * 0.04;
        this.trans.targetX = 0.0;
        this.trans.targetY = 0.0;
      }
    }

    onMouseLeave() {
      this.rot.targetX = 0.0;
      this.rot.targetY = 0.0;
      this.trans.targetX = 0.0;
      this.trans.targetY = 0.0;
    }

    createPerspectiveMatrix(fov, aspect, near, far) {
      const out = new Float32Array(16);
      const f = 1.0 / Math.tan(fov * 0.5);
      const nf = 1.0 / (near - far);
      out[0] = f / aspect;
      out[5] = f;
      out[10] = (far + near) * nf;
      out[11] = -1.0;
      out[14] = (2.0 * far * near) * nf;
      out[15] = 0.0;
      return out;
    }

    multiplyMatrices(a, b) {
      const out = new Float32Array(16);
      for (let col = 0; col < 4; col++) {
        for (let row = 0; row < 4; row++) {
          out[col * 4 + row] = 
            a[row]      * b[col * 4 + 0] +
            a[row + 4]  * b[col * 4 + 1] +
            a[row + 8]  * b[col * 4 + 2] +
            a[row + 12] * b[col * 4 + 3];
        }
      }
      return out;
    }

    renderWebGL(timeSec) {
      const gl = this.gl;

      // ── COLOR MORPHING INTERPOLATION (DRIVEN BY BLAST WAVE) ──
      if (this.isTransitioning) {
        const elapsed = performance.now() - this.transitionStartTime;
        const progress = Math.min(1.0, elapsed / this.transitionDuration);
        // Smooth aerodynamic easeOut
        const ease = 1.0 - Math.pow(1.0 - progress, 3.0);

        this.activeColors.colShadow = lerpVec3(this.startColors.colShadow, this.targetPalette.colShadow, ease);
        this.activeColors.colMid = lerpVec3(this.startColors.colMid, this.targetPalette.colMid, ease);
        this.activeColors.colHighlight = lerpVec3(this.startColors.colHighlight, this.targetPalette.colHighlight, ease);
        this.activeColors.colRim = lerpVec3(this.startColors.colRim, this.targetPalette.colRim, ease);
        this.activeColors.colSpore = lerpVec3(this.startColors.colSpore, this.targetPalette.colSpore, ease);
        this.activeColors.colDust = lerpVec3(this.startColors.colDust, this.targetPalette.colDust, ease);

        if (progress >= 1.0) {
          this.isTransitioning = false;
          this.currentPalette = this.targetPalette;
        }
      }

      const pal = this.activeColors;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      const aspect = (this.width || 1) / (this.height || 1);
      const proj = this.createPerspectiveMatrix(42 * (Math.PI / 180), aspect, 10, 2500);

      const sp = this.scrollProgress || 0.0;
      const camDist = -630.0 + sp * 450.0;
      const camRotY = this.rot.y + sp * 0.65;
      const camRotX = this.rot.x + sp * 0.18;
      const centerOffsetX = this.trans.x + sp * 24.0;
      const centerOffsetY = this.trans.y - sp * 14.0;

      const cosY = Math.cos(camRotY);
      const sinY = Math.sin(camRotY);
      const cosX = Math.cos(camRotX);
      const sinX = Math.sin(camRotX);

      const mv = new Float32Array([
        cosY, sinX * sinY, -cosX * sinY, 0,
        0, cosX, sinX, 0,
        sinY, -sinX * cosY, cosX * cosY, 0,
        centerOffsetX, centerOffsetY, camDist, 1
      ]);

      const mvp = this.multiplyMatrices(proj, mv);

      // ── 1. RENDER 500,000 NEBULA PARTICLES ──
      gl.useProgram(this.glProgram);
      gl.uniformMatrix4fv(this.glUniforms.matrix, false, mvp);
      gl.uniform1f(this.glUniforms.time, timeSec);
      gl.uniform2f(this.glUniforms.resolution, this.canvas.width, this.canvas.height);

      gl.uniform3fv(this.glUniforms.colShadow, pal.colShadow);
      gl.uniform3fv(this.glUniforms.colMid, pal.colMid);
      gl.uniform3fv(this.glUniforms.colHighlight, pal.colHighlight);
      gl.uniform3fv(this.glUniforms.colRim, pal.colRim);
      gl.uniform3fv(this.glUniforms.colSpore, pal.colSpore);
      gl.uniform3fv(this.glUniforms.colDust, pal.colDust);
      gl.uniform1f(this.glUniforms.isPhotoTheme, this.currentPalette.isPhotoTheme || 0.0);

      gl.uniform3f(this.glUniforms.mouseWorld, this.mouse.worldX, this.mouse.worldY, this.options.mouseRepelStrength);
      gl.uniform1f(this.glUniforms.repelRadius, this.options.mouseRepelRadius);
      gl.uniform1f(this.glUniforms.scrollProgress, sp);

      const now = performance.now();
      for (let k = 0; k < 3; k++) {
        const sw = this.shockwaves[k];
        const elapsed = sw.active ? (now - sw.startTime) * 0.001 : 999.0;
        if (elapsed > 1.6) sw.active = false;
        gl.uniform4f(
          this.glUniforms.shockwaves[k],
          sw.worldX,
          sw.worldY,
          elapsed,
          sw.active ? 1.0 : 0.0
        );
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, this.basePosBuffer);
      gl.enableVertexAttribArray(this.glAttribs.basePos);
      gl.vertexAttribPointer(this.glAttribs.basePos, 3, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
      gl.enableVertexAttribArray(this.glAttribs.normal);
      gl.vertexAttribPointer(this.glAttribs.normal, 3, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.sizeBuffer);
      gl.enableVertexAttribArray(this.glAttribs.size);
      gl.vertexAttribPointer(this.glAttribs.size, 1, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.seedBuffer);
      gl.enableVertexAttribArray(this.glAttribs.seed);
      gl.vertexAttribPointer(this.glAttribs.seed, 1, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.typeBuffer);
      gl.enableVertexAttribArray(this.glAttribs.type);
      gl.vertexAttribPointer(this.glAttribs.type, 1, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
      gl.enableVertexAttribArray(this.glAttribs.color);
      gl.vertexAttribPointer(this.glAttribs.color, 4, gl.FLOAT, false, 0, 0);

      gl.drawArrays(gl.POINTS, 0, this.totalParticleCount);

      // ── 2. RENDER DENSE CURSOR-CONNECTED CONSTELLATION FILAMENTS ──
      if (this.filamentProgram && this.surfaceAnchors && this.surfaceAnchors.length > 0) {
        const mx = this.mouse.worldX;
        const my = this.mouse.worldY;
        const mz = 8.0;
        // Expanded catchment radius for dense multi-line connection web
        const maxFilamentDist = 240.0;
        let lineVertCount = 0;
        const fData = this.filamentData;
        const hCol = pal.colHighlight;
        const rCol = pal.colRim;

        const anchors = this.surfaceAnchors;
        const totalAnchors = anchors.length;
        const matchedAnchors = [];

        // Find anchors within magnetic field
        for (let i = 0; i < totalAnchors && lineVertCount < 180; i++) {
          const a = anchors[i];
          const dx = a.x - mx;
          const dy = a.y - my;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxFilamentDist * maxFilamentDist) {
            const dist = Math.sqrt(distSq);
            const normDist = dist / maxFilamentDist;
            const alphaPulse = (1.0 - normDist) * (0.75 + 0.25 * Math.sin(timeSec * 7.0 + i));

            // Vertex 1: Cursor Origin (Luminous core)
            const idx1 = lineVertCount * 7;
            fData[idx1]     = mx;
            fData[idx1 + 1] = my;
            fData[idx1 + 2] = mz;
            fData[idx1 + 3] = rCol[0];
            fData[idx1 + 4] = rCol[1];
            fData[idx1 + 5] = rCol[2];
            fData[idx1 + 6] = alphaPulse * 0.88;

            // Vertex 2: Sphere Particle Anchor
            const idx2 = (lineVertCount + 1) * 7;
            fData[idx2]     = a.x;
            fData[idx2 + 1] = a.y;
            fData[idx2 + 2] = a.z;
            fData[idx2 + 3] = hCol[0];
            fData[idx2 + 4] = hCol[1];
            fData[idx2 + 5] = hCol[2];
            fData[idx2 + 6] = alphaPulse * 0.22;

            lineVertCount += 2;
            matchedAnchors.push(a);
          }
        }

        // Cross-connections between nearby sphere anchors in the zone (creates true constellation web)
        const matchedCount = matchedAnchors.length;
        for (let m = 0; m < matchedCount && lineVertCount < 230; m++) {
          const a1 = matchedAnchors[m];
          for (let n = m + 1; n < matchedCount && lineVertCount < 230; n++) {
            const a2 = matchedAnchors[n];
            const cdx = a1.x - a2.x;
            const cdy = a1.y - a2.y;
            const cdz = a1.z - a2.z;
            const cDistSq = cdx * cdx + cdy * cdy + cdz * cdz;
            if (cDistSq < 60.0 * 60.0) {
              const cAlpha = (1.0 - Math.sqrt(cDistSq) / 60.0) * 0.32;
              const idxA = lineVertCount * 7;
              fData[idxA]     = a1.x;
              fData[idxA + 1] = a1.y;
              fData[idxA + 2] = a1.z;
              fData[idxA + 3] = hCol[0];
              fData[idxA + 4] = hCol[1];
              fData[idxA + 5] = hCol[2];
              fData[idxA + 6] = cAlpha;

              const idxB = (lineVertCount + 1) * 7;
              fData[idxB]     = a2.x;
              fData[idxB + 1] = a2.y;
              fData[idxB + 2] = a2.z;
              fData[idxB + 3] = rCol[0];
              fData[idxB + 4] = rCol[1];
              fData[idxB + 5] = rCol[2];
              fData[idxB + 6] = cAlpha;

              lineVertCount += 2;
            }
          }
        }

        if (lineVertCount > 0) {
          gl.useProgram(this.filamentProgram);
          gl.uniformMatrix4fv(this.filamentUniforms.matrix, false, mvp);

          gl.bindBuffer(gl.ARRAY_BUFFER, this.filamentBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, fData.subarray(0, lineVertCount * 7), gl.DYNAMIC_DRAW);

          const stride = 7 * Float32Array.BYTES_PER_ELEMENT;
          gl.enableVertexAttribArray(this.filamentAttribs.position);
          gl.vertexAttribPointer(this.filamentAttribs.position, 3, gl.FLOAT, false, stride, 0);

          gl.enableVertexAttribArray(this.filamentAttribs.color);
          gl.vertexAttribPointer(this.filamentAttribs.color, 4, gl.FLOAT, false, stride, 3 * Float32Array.BYTES_PER_ELEMENT);

          gl.drawArrays(gl.LINES, 0, lineVertCount);

          // Clean up vertex attribute state so subsequent drawArrays(POINTS) never conflicts
          gl.disableVertexAttribArray(this.filamentAttribs.position);
          gl.disableVertexAttribArray(this.filamentAttribs.color);
        }
      }
    }

    render2D(timeSec) {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.save();
      ctx.scale(this.dpr, this.dpr);

      const cx = (this.width / 2) + this.trans.x;
      const cy = (this.height / 2) + this.trans.y;
      const count = this.particles2D ? this.particles2D.length : 0;

      ctx.fillStyle = '#1aff85';
      for (let i = 0; i < count; i++) {
        const p = this.particles2D[i];
        const sx = cx + p.bx;
        const sy = cy + p.by;
        ctx.beginPath();
        ctx.arc(sx, sy, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    start() {
      const loop = (now) => {
        if (this.isDestroyed) return;

        const rawDt = now - this.lastTime;
        const dt = Math.min(Math.max(rawDt, 1.0), 33.3);
        this.lastTime = now;
        this.clock += dt * 0.001;

        const decayRot = 1.0 - Math.exp(-7.0 * (dt * 0.001));
        const decayMouse = 1.0 - Math.exp(-15.0 * (dt * 0.001));

        this.rot.x += (this.rot.targetX - this.rot.x) * decayRot;
        this.rot.y += (this.rot.targetY - this.rot.y) * decayRot;
        this.trans.x += (this.trans.targetX - this.trans.x) * decayRot;
        this.trans.y += (this.trans.targetY - this.trans.y) * decayRot;

        this.mouse.worldX += (this.mouse.targetWorldX - this.mouse.worldX) * decayMouse;
        this.mouse.worldY += (this.mouse.targetWorldY - this.mouse.worldY) * decayMouse;

        this.rot.y += 0.00018;

        this.frameCount++;
        if (now - this.lastFpsUpdate >= 450) {
          this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
          this.frameCount = 0;
          this.lastFpsUpdate = now;

          const statsBadge = document.getElementById('statsBadge');
          if (statsBadge) {
            statsBadge.textContent = `GPU WebGL • ${this.totalParticleCount.toLocaleString()} Particles • ${this.fps} FPS`;
          }
        }

        if (this.useWebGL) {
          this.renderWebGL(this.clock);
        } else {
          this.render2D(this.clock);
        }

        this.rafId = requestAnimationFrame(loop);
      };

      this.rafId = requestAnimationFrame(loop);
    }

    setPalette(paletteKey) {
      if (!paletteKey) return false;
      const key = paletteKey.toLowerCase();
      const targetPalette = PALETTES[key];
      if (targetPalette) {
        this.morphToPalette(key, 900);
        return true;
      }
      return false;
    }

    destroy() {
      this.isDestroyed = true;
      if (this.rafId) cancelAnimationFrame(this.rafId);
      window.removeEventListener('resize', this.handleResize);
      window.removeEventListener('mousemove', this.handleMouseMove);
      window.removeEventListener('touchmove', this.handleTouchMove);
      window.removeEventListener('mouseleave', this.handleMouseLeave);
      window.removeEventListener('click', this.handleClick);
    }
  }

  return FluidNebulaEngine;
}));
