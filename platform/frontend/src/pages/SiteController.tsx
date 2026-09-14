import React, { useState } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  RefreshCw,
  Eye
} from 'lucide-react';

export const SiteControllerPage: React.FC = () => {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [iframeKey, setIframeKey] = useState(Date.now());
  const [siteUrl, setSiteUrl] = useState(() => {
    if (typeof window !== 'undefined' && window.location.origin) {
      return window.location.origin;
    }
    return 'http://localhost:3000';
  });

  const viewportWidths = {
    desktop: 'w-full',
    tablet: 'max-w-3xl',
    mobile: 'max-w-sm'
  };

  const handleRefreshPreview = () => {
    setIframeKey(Date.now());
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <Eye className="w-5 h-5 text-brand-gold" />
            Live Website Controller & Responsive Preview
          </h1>
          <p className="text-xs text-slate-400">
            Preview, test, and control the live portfolio website across desktop, tablet, and mobile displays in real-time.
          </p>
        </div>

        {/* Viewport Selectors */}
        <div className="flex items-center gap-2 bg-dark-800 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewport('desktop')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              viewport === 'desktop'
                ? 'bg-brand-gold text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            Desktop
          </button>
          <button
            onClick={() => setViewport('tablet')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              viewport === 'tablet'
                ? 'bg-brand-gold text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            Tablet
          </button>
          <button
            onClick={() => setViewport('mobile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              viewport === 'mobile'
                ? 'bg-brand-gold text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Mobile
          </button>

          <div className="w-[1px] h-4 bg-slate-700 mx-1" />

          <button
            onClick={handleRefreshPreview}
            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-gold transition"
            title="Reload Preview"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <a
            href={siteUrl}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-gold transition"
            title="Open in New Tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Embedded Iframe Sandbox */}
      <div className="flex-1 flex justify-center bg-dark-950/60 rounded-2xl border border-slate-800/80 p-3 overflow-hidden">
        <div className={`h-full transition-all duration-300 rounded-xl overflow-hidden shadow-2xl border border-slate-700/50 flex flex-col bg-black ${viewportWidths[viewport]}`}>
          {/* Mock Browser Bar */}
          <div className="h-8 bg-dark-800 border-b border-slate-700/60 px-3 flex items-center justify-between text-[11px] font-mono text-slate-400 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
            </div>
            <input
              type="text"
              value={siteUrl}
              onChange={e => setSiteUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleRefreshPreview()}
              className="px-3 py-0.5 rounded-md bg-dark-900 border border-slate-700 text-slate-300 truncate w-72 focus:outline-none focus:border-brand-gold text-[11px] font-mono"
            />
            <span className="text-[10px] text-emerald-400">● LIVE</span>
          </div>

          {/* Iframe */}
          <iframe
            key={iframeKey}
            src={siteUrl}
            title="Live Portfolio Website Preview"
            className="w-full flex-1 border-none bg-black"
          />
        </div>
      </div>
    </div>
  );
};
