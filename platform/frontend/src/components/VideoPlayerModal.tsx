import React, { useEffect, useRef, useState } from 'react';
import { ApiClient } from '../services/api';
import { VideoItem } from '../types';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  AlertTriangle
} from 'lucide-react';

interface Props {
  video: VideoItem;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<Props> = ({ video, onClose }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [ticketError, setTicketError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [ttlSeconds, setTtlSeconds] = useState(90);

  // 1. Acquire and proactively renew cryptographic signed stream ticket
  useEffect(() => {
    let timer: any;
    let isCancelled = false;

    const fetchTicket = async (isRenewal = false) => {
      try {
        const res = await ApiClient.request<{ streamUrl: string; ttlSeconds: number }>(
          `/api/v1/videos/${video.id}/ticket`
        );

        if (isCancelled) return;

        if (res.success && res.data) {
          const newUrl = res.data.streamUrl;
          setTtlSeconds(res.data.ttlSeconds);

          if (!isRenewal) {
            setStreamUrl(newUrl);
          } else if (videoRef.current && streamUrl !== newUrl) {
            // Smoothly update source query parameter while preserving playback state
            const currentPos = videoRef.current.currentTime;
            const wasPlaying = !videoRef.current.paused;
            setStreamUrl(newUrl);
            setTimeout(() => {
              if (videoRef.current) {
                videoRef.current.currentTime = currentPos;
                if (wasPlaying) videoRef.current.play().catch(() => {});
              }
            }, 50);
          }
        } else if (!isRenewal) {
          setTicketError(res.error?.message || 'Access Ticket Authorization Denied');
        }
      } catch (err: any) {
        if (!isRenewal) {
          setTicketError(err.message || 'Failed to acquire streaming ticket');
        }
      }
    };

    fetchTicket(false);

    // Countdown and renew when 25 seconds remain before expiration
    timer = setInterval(() => {
      setTtlSeconds(prev => {
        if (prev <= 25 && prev > 20) {
          // Trigger silent background renewal
          fetchTicket(true);
        }
        if (prev <= 1) {
          fetchTicket(true);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      isCancelled = true;
      if (timer) clearInterval(timer);
    };
  }, [video.id]);

  // 2. Play/Pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // 3. Mute/Volume
  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  // 4. Time & Seek
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 0;
    setCurrentTime(curr);
    setDuration(dur);
    setProgress(dur ? (curr / dur) * 100 : 0);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    videoRef.current.currentTime = pos * duration;
  };

  // 5. Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div
        ref={containerRef}
        className="w-full max-w-4xl bg-dark-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col relative"
      >
        {/* Modal Top Bar */}
        <div className="h-14 px-6 border-b border-slate-800 flex items-center justify-between bg-dark-800/80">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-100 text-sm">{video.title}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-gold/15 text-brand-gold border border-brand-gold/30">
              AES-256 STREAM
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* TTL Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-[11px] font-mono text-slate-300">
              <span className={`w-1.5 h-1.5 rounded-full ${ttlSeconds > 15 ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
              <span>TTL: {ttlSeconds}s</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Screen Area */}
        <div className="aspect-video bg-black relative flex items-center justify-center group">
          {ticketError ? (
            <div className="text-center p-6 space-y-2">
              <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
              <p className="text-sm font-bold text-red-400">Stream Ticket Rejected</p>
              <p className="text-xs text-slate-500 font-mono">{ticketError}</p>
            </div>
          ) : streamUrl ? (
            <>
              <video
                ref={videoRef}
                src={streamUrl}
                playsInline
                autoPlay
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="w-full h-full object-contain cursor-pointer"
                onClick={togglePlay}
              />

              {/* Custom Controls Bar */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex flex-col gap-2 transition-opacity opacity-0 group-hover:opacity-100">
                {/* Progress Bar */}
                <div
                  onClick={handleSeek}
                  className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer hover:h-2.5 transition-all relative overflow-hidden"
                >
                  <div
                    className="h-full bg-gradient-to-r from-brand-gold to-yellow-300 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Buttons Row */}
                <div className="flex items-center justify-between text-slate-200">
                  <div className="flex items-center gap-3">
                    <button onClick={togglePlay} className="p-1.5 hover:text-brand-gold transition">
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>

                    <div className="flex items-center gap-2">
                      <button onClick={toggleMute} className="p-1.5 hover:text-brand-gold transition">
                        {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-16 h-1 bg-slate-700 rounded-lg accent-brand-gold cursor-pointer"
                      />
                    </div>

                    <span className="text-xs font-mono text-slate-400">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <button onClick={toggleFullscreen} className="p-1.5 hover:text-brand-gold transition">
                    {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 text-slate-400 text-sm font-mono">
              <div className="w-5 h-5 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
              <span>Verifying Cryptographic Ticket...</span>
            </div>
          )}
        </div>

        {/* Modal Info Footer */}
        <div className="p-4 bg-dark-800/40 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span>MIME: {video.mimeType}</span>
            <span>Duration: {video.duration ? `${Math.round(video.duration)}s` : 'N/A'}</span>
            <span>Status: <span className="font-semibold text-emerald-400">{video.status}</span></span>
          </div>
          <span className="font-mono text-[11px] text-slate-500">Storage: {video.storageKey}</span>
        </div>
      </div>
    </div>
  );
};
