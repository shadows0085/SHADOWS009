/**
 * Secure Media Viewer Controller
 * Interacts with backend /api/media/ticket to stream encrypted vault assets
 * via short-lived signed URLs with dynamic canvas watermark overlay.
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SecureViewer = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  class SecureViewer {
    constructor(modalId = 'modal') {
      this.modal = document.getElementById(modalId);
      this.video = document.getElementById('modalVideo');
      this.canvas = document.getElementById('watermarkCanvas');
      this.ttlBadge = document.getElementById('tokenTtlBadge');
      this.ttlCounter = document.getElementById('tokenTtlSeconds');
      this.titleEl = document.getElementById('modalTitle');
      this.metaEl = document.getElementById('modalMeta');

      this.currentAssetId = null;
      this.currentTicket = null;
      this.countdownTimer = null;
      this.watermarkEngine = null;
      this.openRequestId = 0;
      this.pausedBackgroundVideos = [];

      this.initWatermark();
      this.bindCustomControls();
    }

    initWatermark() {
      if (this.canvas && window.WatermarkEngine) {
        this.watermarkEngine = new window.WatermarkEngine(this.canvas, {
          brand: 'SHADOW SECURED PREVIEW',
          tier: 'subtle-dynamic'
        });
      }
    }

    bindCustomControls() {
      // Play/Pause button
      const playBtn = document.getElementById('securePlayBtn');
      if (playBtn && this.video) {
        playBtn.addEventListener('click', () => {
          if (this.video.paused) {
            this.video.play();
          } else {
            this.video.pause();
          }
        });

        // Keyboard shortcut: Space = play/pause, M = mute, F = fullscreen
        this.video.addEventListener('play', () => {
          playBtn.innerHTML = '<svg class="ui-icon" aria-hidden="true"><use href="#icon-pause" xlink:href="#icon-pause"></use></svg>';
        });

        this.video.addEventListener('pause', () => {
          playBtn.innerHTML = '<svg class="ui-icon" aria-hidden="true"><use href="#icon-play" xlink:href="#icon-play"></use></svg>';
        });
      }

      // Progress bar scrubbing
      const track = document.getElementById('secureProgressTrack');
      const fill = document.getElementById('secureProgressFill');
      const timeLabel = document.getElementById('secureTimeLabel');

      if (track && fill && this.video) {
        this.video.addEventListener('timeupdate', () => {
          if (this.video.duration) {
            const percent = (this.video.currentTime / this.video.duration) * 100;
            fill.style.width = percent + '%';
            if (timeLabel) {
              timeLabel.textContent = `${this.formatTime(this.video.currentTime)} / ${this.formatTime(this.video.duration)}`;
            }
          }
        });

        let isScrubbing = false;
        const seekFromEvent = (e) => {
          const rect = track.getBoundingClientRect();
          const clientX = e.touches ? e.touches[0].clientX : e.clientX;
          const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
          if (this.video.duration) {
            this.video.currentTime = pos * this.video.duration;
          }
        };

        track.addEventListener('pointerdown', (e) => {
          e.stopPropagation();
          isScrubbing = true;
          seekFromEvent(e);
        });

        window.addEventListener('pointermove', (e) => {
          if (isScrubbing) seekFromEvent(e);
        });

        window.addEventListener('pointerup', () => {
          isScrubbing = false;
        });

        track.addEventListener('click', (e) => {
          e.stopPropagation();
          seekFromEvent(e);
        });
      }

      // Unique Sound Control Suite (Volume Slider & Mute Toggle)
      const muteBtn = document.getElementById('secureMuteBtn');
      const volumeIcon = document.getElementById('secureVolumeIcon');
      const volBarWrap = document.getElementById('secureVolumeBarWrap');
      const volFill = document.getElementById('secureVolumeFill');

      const updateVolumeUi = () => {
        if (!this.video) return;
        const isMuted = this.video.muted || this.video.volume === 0;
        const currentVol = isMuted ? 0 : this.video.volume;
        if (volFill) {
          volFill.style.width = (currentVol * 100) + '%';
        }
        if (volumeIcon) {
          const iconId = isMuted ? '#icon-volume-muted' : '#icon-volume-high';
          volumeIcon.innerHTML = `<use href="${iconId}" xlink:href="${iconId}"></use>`;
        }
      };

      if (this.video) {
        this.video.addEventListener('volumechange', updateVolumeUi);
      }

      if (muteBtn && this.video) {
        const toggleMute = (e) => {
          if (e) {
            e.stopPropagation();
            e.preventDefault();
          }
          if (this.video.muted || this.video.volume === 0) {
            this.video.muted = false;
            if (this.video.volume === 0) this.video.volume = 0.85;
            if (this.video.paused) {
              this.video.play().catch(() => {});
            }
          } else {
            this.video.muted = true;
          }
          updateVolumeUi();
        };

        muteBtn.addEventListener('click', toggleMute);
        muteBtn.addEventListener('touchend', (e) => {
          toggleMute(e);
        }, { passive: false });
      }

      if (volBarWrap && this.video) {
        let isAdjustingVolume = false;
        const setVolumeFromPointer = (e) => {
          const rect = volBarWrap.getBoundingClientRect();
          const clientX = e.touches ? e.touches[0].clientX : e.clientX;
          const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
          this.video.volume = ratio;
          this.video.muted = (ratio === 0);
          if (this.video.paused && ratio > 0) {
            this.video.play().catch(() => {});
          }
          updateVolumeUi();
        };

        volBarWrap.addEventListener('pointerdown', (e) => {
          e.stopPropagation();
          isAdjustingVolume = true;
          setVolumeFromPointer(e);
        });

        window.addEventListener('pointermove', (e) => {
          if (isAdjustingVolume) setVolumeFromPointer(e);
        });

        window.addEventListener('pointerup', () => {
          isAdjustingVolume = false;
        });

        volBarWrap.addEventListener('click', (e) => {
          e.stopPropagation();
          setVolumeFromPointer(e);
        });
      }

      // Fullscreen Toggle Option
      const fullscreenBtn = document.getElementById('secureFullscreenBtn');
      const fullscreenIcon = document.getElementById('secureFullscreenIcon');
      const videoArea = this.modal ? this.modal.querySelector('.modal-video-area') : null;

      const getFsElement = () =>
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement ||
        null;

      const updateFullscreenUi = () => {
        const isFs = !!getFsElement();
        if (fullscreenIcon) {
          const iconId = isFs ? '#icon-fullscreen-exit' : '#icon-fullscreen';
          fullscreenIcon.innerHTML = `<use href="${iconId}" xlink:href="${iconId}"></use>`;
        }
      };

      const toggleFullscreen = async (e) => {
        if (e) {
          e.stopPropagation();
          e.preventDefault();
        }
        const activeFs = getFsElement();
        if (!activeFs) {
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

          if (isIOS && this.video && typeof this.video.webkitEnterFullscreen === 'function') {
            try {
              this.video.webkitEnterFullscreen();
              return;
            } catch (err) {
              console.warn('[SecureViewer] iOS webkitEnterFullscreen fallback:', err);
            }
          }

          const target = videoArea || this.video || this.modal;
          try {
            if (target.requestFullscreen) {
              await target.requestFullscreen({ navigationUI: 'hide' });
            } else if (target.webkitRequestFullscreen) {
              target.webkitRequestFullscreen();
            } else if (this.video && this.video.requestFullscreen) {
              await this.video.requestFullscreen();
            } else if (this.video && this.video.webkitEnterFullscreen) {
              this.video.webkitEnterFullscreen();
            }

            // If 1920x1080 landscape video, request landscape orientation lock
            const isLandscape = this.video && (this.video.videoWidth > this.video.videoHeight);
            if (isLandscape && screen.orientation && typeof screen.orientation.lock === 'function') {
              screen.orientation.lock('landscape').catch(() => {});
            }
          } catch (err) {
            if (this.video && typeof this.video.webkitEnterFullscreen === 'function') {
              try { this.video.webkitEnterFullscreen(); } catch (e) {}
            }
          }
        } else {
          try {
            if (screen.orientation && typeof screen.orientation.unlock === 'function') {
              screen.orientation.unlock().catch(() => {});
            }
            if (document.exitFullscreen) {
              await document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
              document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
              document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
              document.msExitFullscreen();
            }
          } catch (err) {}
        }
        setTimeout(updateFullscreenUi, 100);
      };

      if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', toggleFullscreen);
        fullscreenBtn.addEventListener('touchend', (e) => {
          toggleFullscreen(e);
        }, { passive: false });
      }

      ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(evt => {
        document.addEventListener(evt, updateFullscreenUi);
      });

      // Dynamic video aspect ratio adaptation (1920x1080 landscape vs Facebook 1:1 or 9:16 vertical)
      if (this.video) {
        this.video.addEventListener('loadedmetadata', () => {
          const w = this.video.videoWidth || 16;
          const h = this.video.videoHeight || 9;
          const ratio = w / h;
          const modalBox = this.modal ? this.modal.querySelector('.modal-box') : null;

          if (ratio >= 1.35) {
            // Widescreen 16:9 (1920x1080)
            if (videoArea) videoArea.style.aspectRatio = '16 / 9';
            if (modalBox) modalBox.style.maxWidth = '1000px';
          } else if (ratio >= 0.85 && ratio < 1.35) {
            // Square / Facebook feed (1:1 / 4:5)
            if (videoArea) videoArea.style.aspectRatio = '1 / 1';
            if (modalBox) modalBox.style.maxWidth = '560px';
          } else {
            // Vertical / Reels / Stories (9:16)
            if (videoArea) videoArea.style.aspectRatio = '9 / 16';
            if (modalBox) modalBox.style.maxWidth = '420px';
          }
        });

        // Mobile orientation change listener: rotating phone into landscape for 16:9
        window.addEventListener('orientationchange', () => {
          if (!this.modal || !this.modal.classList.contains('open')) return;
          setTimeout(() => {
            const isLandscapeVideo = this.video && (this.video.videoWidth > this.video.videoHeight);
            if (isLandscapeVideo && this.video) {
              this.video.style.objectFit = 'contain';
            }
          }, 150);
        });

        // Initialize sound state
        this.video.muted = false;
        this.video.volume = 1.0;
        updateVolumeUi();
      }
    }

    formatTime(seconds) {
      if (isNaN(seconds)) return '0:00';
      const m = Math.floor(seconds / 60);
      const s = Math.floor(seconds % 60);
      return `${m}:${s < 10 ? '0' : ''}${s}`;
    }

    // A portfolio film is viewed in the modal only. Pause any video playing on
    // the page so its audio/video never competes with the selected project.
    pauseBackgroundVideos() {
      Array.from(document.querySelectorAll('video'))
        .filter(video => video !== this.video && !video.paused)
        .forEach(video => {
          video.pause();
          if (!this.pausedBackgroundVideos.includes(video)) {
            this.pausedBackgroundVideos.push(video);
          }
        });
    }

    resumeBackgroundVideos() {
      this.pausedBackgroundVideos.forEach(video => {
        if (video.isConnected) video.play().catch(() => {});
      });
      this.pausedBackgroundVideos = [];
    }

    clearVideoSource() {
      if (!this.video) return;
      this.video.pause();
      this.video.removeAttribute('src');
      this.video.load();
    }

    /**
     * Request ticket from backend and initiate secure stream
     */
    async openSecureAsset(assetId, title = '', meta = '') {
      // Every open has an ID. This prevents a late response from an earlier
      // click from mounting its stream over the video most recently selected.
      const requestId = ++this.openRequestId;
      this.currentAssetId = assetId;

      this.pauseBackgroundVideos();

      if (this.titleEl) this.titleEl.textContent = title || 'Protected Portfolio Project';
      if (this.metaEl) this.metaEl.textContent = meta || 'Encrypted AES-256 Media Stream';

      // Open modal UI immediately
      this.modal.classList.add('open');
      document.body.style.overflow = 'hidden';

      // Show loading indicator
      this.clearVideoSource();

      const resolveDirectVideo = (id) => {
        if (!id) return '/uploaded-video/no-1.mp4';
        const c = String(id).replace(/^\/+/, '').trim();
        if (c.startsWith('uploaded-video/')) return '/' + c;
        if (c.startsWith('http://') || c.startsWith('https://')) return c;
        if (c.includes('sun-onlight')) return '/uploaded-video/custom_mtycguww_Motion_designer_creating_Shadow_____20260910152753.mp4';
        if (c.includes('silent-waters')) return '/uploaded-video/custom_mtxz93i8_betufull_places_showing_1080p_20260912120058.mp4';
        if (c.includes('amber-hours')) return '/uploaded-video/no-2.mp4';
        if (c.includes('velocity')) return '/uploaded-video/custom_mtydc5of_betufull_places_showing_1080p_20260912120058.mp4';
        if (c.includes('neon-reverie')) return '/uploaded-video/custom_mtxxwlrt_Man_looking_at_ocean_sunset_20260911231855.mp4';
        if (c.includes('showcase')) return '/uploaded-video/custom_mtykrpr1_betufull_places_showing_1080p_20260912120058.mp4';
        return '/uploaded-video/no-1.mp4';
      };

      try {
        const response = await fetch('/api/media/ticket', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assetId })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP ${response.status}`);
        }

        const data = await response.json();
        if (requestId !== this.openRequestId || !this.modal.classList.contains('open')) return;
        this.currentTicket = data;

        // Configure watermark with ticket session metadata
        if (this.watermarkEngine && data.watermark) {
          this.watermarkEngine.updateData({
            sessionId: data.watermark.sessionLabel || 'SES-AUTHENTICATED',
            brand: data.watermark.brand || 'SHADOW SECURE VAULT',
            tier: data.watermark.tier || 'subtle-dynamic',
            timestamp: data.watermark.timestamp
          });
          this.watermarkEngine.start();
        }

        // Mount signed stream URL
        if (this.video) {
          this.video.src = data.streamUrl || resolveDirectVideo(assetId);
          this.video.load();
          this.video.play().catch(() => {
            console.log('[SecureViewer] Autoplay prevented by browser; waiting for click.');
          });
        }

        // Start Token TTL Countdown
        this.startTtlCountdown(data.expiresAt || (Date.now() + 86400000));
      } catch (err) {
        if (requestId !== this.openRequestId) return;
        console.warn('[SecureViewer] Live ticket gateway fallback activated:', err.message);
        const fallbackUrl = resolveDirectVideo(assetId);
        if (this.video) {
          this.video.src = fallbackUrl;
          this.video.load();
          this.video.play().catch(() => {});
        }
        this.startTtlCountdown(Date.now() + 86400000);
      }
    }

    startTtlCountdown(expiresAt) {
      if (this.countdownTimer) clearInterval(this.countdownTimer);

      const updateCountdown = () => {
        const remainingMs = expiresAt - Date.now();
        const seconds = Math.max(0, Math.floor(remainingMs / 1000));

        if (this.ttlCounter) {
          this.ttlCounter.textContent = `${seconds}s`;
        }

        const dot = this.modal.querySelector('.token-ttl-dot');
        if (dot) {
          if (seconds < 15) {
            dot.className = 'token-ttl-dot danger';
          } else if (seconds < 35) {
            dot.className = 'token-ttl-dot warning';
          } else {
            dot.className = 'token-ttl-dot';
          }
        }

        if (seconds <= 0) {
          clearInterval(this.countdownTimer);
          // Token expired: refresh ticket silently if video is actively playing, or notify
          this.refreshTicketOrHalt();
        }
      };

      updateCountdown();
      this.countdownTimer = setInterval(updateCountdown, 1000);
    }

    async refreshTicketOrHalt() {
      // If user is actively watching, smoothly request ticket extension
      if (this.modal.classList.contains('open') && this.currentAssetId) {
        try {
          const res = await fetch('/api/media/ticket', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ assetId: this.currentAssetId })
          });
          if (res.ok) {
            const data = await res.json();
            this.currentTicket = data;
            this.startTtlCountdown(data.expiresAt);
          }
        } catch (e) {
          console.warn('[SecureViewer] Ticket extension failed');
        }
      }
    }

    close() {
      // Invalidate any fetch still in progress before the modal is hidden.
      ++this.openRequestId;
      if (this.countdownTimer) {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
      }
      if (this.watermarkEngine) {
        this.watermarkEngine.stop();
      }
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      }
      this.clearVideoSource();
      this.modal.classList.remove('open');
      document.body.style.overflow = '';
      this.currentAssetId = null;
      this.currentTicket = null;
      this.resumeBackgroundVideos();
    }
  }

  return SecureViewer;
});
