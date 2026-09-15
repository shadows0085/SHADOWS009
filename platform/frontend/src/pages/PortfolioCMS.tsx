import React, { useState, useEffect } from 'react';
import {
  PortfolioService,
  PortfolioProject,
  PortfolioHero,
  ShowcaseProject,
  NotificationItem,
  NotificationsData
} from '../services/portfolio.service';
import {
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Film,
  Save,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Layers,
  UploadCloud,
  Bell,
  BellOff,
  Radio,
  Eye,
  Power,
  X
} from 'lucide-react';

export const PortfolioCMSPage: React.FC = () => {
  const [hero, setHero] = useState<PortfolioHero | null>(null);
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [notifications, setNotifications] = useState<NotificationsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadingModalVideo, setUploadingModalVideo] = useState(false);
  const [uploadingHeroVideo, setUploadingHeroVideo] = useState(false);
  const [replacingCardId, setReplacingCardId] = useState<string | null>(null);
  const [uploadedNoticeFile, setUploadedNoticeFile] = useState<string | null>(null);
  const [savingProject, setSavingProject] = useState(false);

  // Form states for Add / Edit project
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('commercial');
  const [formFile, setFormFile] = useState('uploaded-video/no-1.mp4');
  const [formCatLabel, setFormCatLabel] = useState('');
  const [formMeta, setFormMeta] = useState('');
  const [formSize, setFormSize] = useState('card-md');

  // Hero form state
  const [heroSrc, setHeroSrc] = useState('uploaded-video/no-1.mp4');
  const [heroLabel, setHeroLabel] = useState('');
  const [heroBadge, setHeroBadge] = useState('');
  const [savingHero, setSavingHero] = useState(false);

  // Showcase form state
  const [_showcase, setShowcase] = useState<ShowcaseProject | null>(null);
  const [showcaseTitle, setShowcaseTitle] = useState('<em>Urban</em><br>Mirage');
  const [showcasePlainTitle, setShowcasePlainTitle] = useState('Urban Mirage');
  const [showcaseFile, setShowcaseFile] = useState('uploaded-video/no-1.mp4');
  const [showcaseCategory, setShowcaseCategory] = useState('Commercial · 4K HDR');
  const [showcaseBadge, setShowcaseBadge] = useState('Featured');
  const [showcaseDesc, setShowcaseDesc] = useState('An architectural visual symphony — this commercial campaign captured the interplay of light, glass, and geometric symmetry through precision cinematography and master color grading.');
  const [showcaseProdTime, setShowcaseProdTime] = useState('4 wks');
  const [showcaseLocations, setShowcaseLocations] = useState('2 cities');
  const [showcaseResolution, setShowcaseResolution] = useState('4K HDR');
  const [showcaseDuration, setShowcaseDuration] = useState('2:34 / 4:12');
  const [showcaseProgress, setShowcaseProgress] = useState('61%');
  const [uploadingShowcaseVideo, setUploadingShowcaseVideo] = useState(false);
  const [savingShowcase, setSavingShowcase] = useState(false);

  // Notification edit modal state
  const [editingNotif, setEditingNotif] = useState<NotificationItem | null>(null);
  const [savingNotif, setSavingNotif] = useState(false);

  const [availableVideos, setAvailableVideos] = useState<Array<{ label: string; path: string; filename?: string }>>([
    { label: 'Video 1 — Showreel / Urban Mirage (4K HDR)', path: 'uploaded-video/no-1.mp4' },
    { label: 'Video 2 — Amber Hours / SUN ONLIGHT (4K HDR)', path: 'uploaded-video/no-2.mp4' },
    { label: 'Custom 1 — Sunset Ocean Showreel (4K HDR)', path: 'uploaded-video/custom_mtyi0ot5_Man_looking_at_ocean_sunset_20260911231855.mp4' },
    { label: 'Custom 2 — Urban Mirage Showcase (1080p)', path: 'uploaded-video/custom_mtykrpr1_betufull_places_showing_1080p_20260912120058.mp4' },
    { label: 'Custom 3 — Motion Designer Creating Shadow (VFX)', path: 'uploaded-video/custom_mtycguww_Motion_designer_creating_Shadow_____20260910152753.mp4' },
    { label: 'Custom 4 — Silent Waters Nordic Reel (1080p)', path: 'uploaded-video/custom_mtxz93i8_betufull_places_showing_1080p_20260912120058.mp4' },
    { label: 'Custom 5 — Velocity Launch Campaign (1080p)', path: 'uploaded-video/custom_mtydc5of_betufull_places_showing_1080p_20260912120058.mp4' },
    { label: 'Custom 6 — Neon Reverie Tokyo Reel (4K)', path: 'uploaded-video/custom_mtxxwlrt_Man_looking_at_ocean_sunset_20260911231855.mp4' }
  ]);

  const resolveVideoSrc = (filePathOrUrl?: string) => {
    if (!filePathOrUrl) return '';
    if (filePathOrUrl.startsWith('http://') || filePathOrUrl.startsWith('https://')) return filePathOrUrl;
    const clean = filePathOrUrl.replace(/^\/+/, '').trim();

    // Map legacy dummy/sample paths to real active files
    if (clean === 'assets/hero.mp4') return '/uploaded-video/custom_mtyi0ot5_Man_looking_at_ocean_sunset_20260911231855.mp4';
    if (clean === 'assets/showcase.mp4') return '/uploaded-video/custom_mtykrpr1_betufull_places_showing_1080p_20260912120058.mp4';
    if (clean === 'uploaded-video/project1.mp4') return '/uploaded-video/no-1.mp4';
    if (clean === 'uploaded-video/project2.mp4') return '/uploaded-video/no-2.mp4';
    if (clean === 'uploaded-video/project3.mp4') return '/uploaded-video/custom_mtycguww_Motion_designer_creating_Shadow_____20260910152753.mp4';

    // Direct static path for uploaded videos
    if (clean.startsWith('uploaded-video/')) {
      return `/${clean}`;
    }

    if (clean.startsWith('api/media/preview/')) {
      return `/${clean}`;
    }

    return `/api/media/preview/${encodeURIComponent(clean)}`;
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, videosList] = await Promise.all([
        PortfolioService.getAll(),
        PortfolioService.getAvailableVideos().catch(() => [])
      ]);
      if (videosList && Array.isArray(videosList) && videosList.length > 0) {
        setAvailableVideos(videosList);
      }
      if (data) {
        let projList = data.portfolio || (data as any).projects || [];
        if (Array.isArray(projList)) {
          // Normalize any legacy dummy file paths in projects
          projList = projList.map((p: any) => {
            if (p.file === 'uploaded-video/project1.mp4') return { ...p, file: 'uploaded-video/no-1.mp4' };
            if (p.file === 'uploaded-video/project2.mp4') return { ...p, file: 'uploaded-video/no-2.mp4' };
            if (p.file === 'uploaded-video/project3.mp4') return { ...p, file: 'uploaded-video/custom_mtycguww_Motion_designer_creating_Shadow_____20260910152753.mp4' };
            return p;
          });
        }
        setProjects(Array.isArray(projList) ? projList : []);

        if (data.hero) {
          let hSrc = data.hero.src || 'uploaded-video/custom_mtyi0ot5_Man_looking_at_ocean_sunset_20260911231855.mp4';
          if (hSrc === 'assets/hero.mp4') hSrc = 'uploaded-video/custom_mtyi0ot5_Man_looking_at_ocean_sunset_20260911231855.mp4';
          setHero({ ...data.hero, src: hSrc });
          setHeroSrc(hSrc);
          setHeroLabel(data.hero.label || '');
          setHeroBadge(data.hero.badge || '');
        }

        if (data.showcase) {
          let scFile = data.showcase.file || 'uploaded-video/custom_mtykrpr1_betufull_places_showing_1080p_20260912120058.mp4';
          if (scFile === 'assets/showcase.mp4') scFile = 'uploaded-video/custom_mtykrpr1_betufull_places_showing_1080p_20260912120058.mp4';
          setShowcase({ ...data.showcase, file: scFile });
          setShowcaseTitle(data.showcase.title || '<em>Urban</em><br>Mirage');
          setShowcasePlainTitle(data.showcase.plainTitle || 'Urban Mirage');
          setShowcaseFile(scFile);
          setShowcaseCategory(data.showcase.category || 'Commercial · 4K HDR');
          setShowcaseBadge(data.showcase.badge || 'Featured');
          setShowcaseDesc(data.showcase.description || '');
          setShowcaseProdTime(data.showcase.productionTime || '4 wks');
          setShowcaseLocations(data.showcase.locations || '2 cities');
          setShowcaseResolution(data.showcase.resolution || '4K HDR');
          setShowcaseDuration(data.showcase.duration || '2:34 / 4:12');
          setShowcaseProgress(data.showcase.progress || '61%');
        }

        if (data.notifications) {
          setNotifications(data.notifications);
        } else {
          const notifData = await PortfolioService.getNotifications().catch(() => null);
          if (notifData) setNotifications(notifData);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load portfolio CMS data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // Notification Banner Handlers
  const handleToggleGlobalNotif = async () => {
    if (!notifications) return;
    const newGlobal = !notifications.globalEnabled;
    const updated = { ...notifications, globalEnabled: newGlobal };
    setNotifications(updated);
    try {
      await PortfolioService.updateNotifications(updated);
      triggerSuccess(
        newGlobal 
          ? 'Website Announcement Banner is now LIVE on the public site.'
          : 'Website Announcement Banner has been SILENCED / Turned OFF.'
      );
    } catch (err: any) {
      setError(err.message || 'Failed to update notification banner status');
    }
  };

  const handleSelectActivePreset = async (presetId: string) => {
    if (!notifications) return;
    const updated: NotificationsData = {
      ...notifications,
      activeId: presetId,
      globalEnabled: true,
      items: notifications.items.map(it => ({
        ...it,
        enabled: it.id === presetId
      }))
    };
    setNotifications(updated);
    try {
      await PortfolioService.updateNotifications(updated);
      triggerSuccess(`Preset "${presetId}" is now LIVE on your website!`);
    } catch (err: any) {
      setError(err.message || 'Failed to activate notification preset');
    }
  };

  const handleTurnOffNotif = async () => {
    if (!notifications) return;
    const updated: NotificationsData = {
      ...notifications,
      globalEnabled: false
    };
    setNotifications(updated);
    try {
      await PortfolioService.updateNotifications(updated);
      triggerSuccess('All website announcements turned OFF.');
    } catch (err: any) {
      setError(err.message || 'Failed to turn off notifications');
    }
  };

  const handleOpenEditNotif = (item: NotificationItem) => {
    setEditingNotif({ ...item });
  };

  const handleSaveNotifPreset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifications || !editingNotif) return;
    setSavingNotif(true);

    const updatedItems = notifications.items.map(it => it.id === editingNotif.id ? { ...editingNotif, updatedAt: new Date().toISOString() } : it);
    const updated: NotificationsData = {
      ...notifications,
      items: updatedItems
    };

    try {
      await PortfolioService.updateNotifications(updated);
      setNotifications(updated);
      setEditingNotif(null);
      triggerSuccess(`Announcement preset "${editingNotif.title}" updated.`);
    } catch (err: any) {
      setError(err.message || 'Failed to save announcement preset.');
    } finally {
      setSavingNotif(false);
    }
  };

  // Video Upload Handlers
  const handleModalVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingModalVideo(true);
    setError(null);
    try {
      const res = await PortfolioService.uploadVideo(file);
      setFormFile(res.filePath);
      setUploadedNoticeFile(file.name);
      triggerSuccess(`Video "${file.name}" uploaded successfully! Click "Save & Apply to Website" to publish.`);
    } catch (err: any) {
      setError(err.message || 'Failed to upload video.');
    } finally {
      setUploadingModalVideo(false);
      e.target.value = '';
    }
  };

  const handleQuickReplaceCardVideo = async (p: PortfolioProject, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReplacingCardId(p.id);
    setError(null);
    try {
      const res = await PortfolioService.uploadVideo(file);
      await PortfolioService.updateProject(p.id, {
        title: p.title,
        category: p.category,
        cat_label: p.cat_label,
        meta: p.meta,
        size: p.size,
        file: res.filePath
      });
      await loadData();
      triggerSuccess(`✓ Video for "${p.title}" replaced and published to live website!`);
    } catch (err: any) {
      setError(err.message || `Failed to replace video for "${p.title}".`);
    } finally {
      setReplacingCardId(null);
      e.target.value = '';
    }
  };

  const handleHeroVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingHeroVideo(true);
    setError(null);
    try {
      const res = await PortfolioService.uploadVideo(file);
      setHeroSrc(res.filePath);
      // Auto-apply immediately to live website so user doesn't have to manually click Apply
      await PortfolioService.updateHero({
        src: res.filePath,
        label: heroLabel || 'Showreel 2026',
        badge: heroBadge || '◆ 4K HDR'
      });
      await loadData();
      triggerSuccess(`✓ Hero video "${file.name}" uploaded and published live to website!`);
    } catch (err: any) {
      setError(err.message || 'Failed to upload hero video.');
    } finally {
      setUploadingHeroVideo(false);
      e.target.value = '';
    }
  };

  const handleShowcaseVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingShowcaseVideo(true);
    setError(null);
    try {
      const res = await PortfolioService.uploadVideo(file);
      setShowcaseFile(res.filePath);
      // Auto-apply immediately to live website so user doesn't have to manually click Apply
      await PortfolioService.updateShowcase({
        title: showcaseTitle,
        plainTitle: showcasePlainTitle,
        file: res.filePath,
        category: showcaseCategory,
        badge: showcaseBadge,
        description: showcaseDesc,
        productionTime: showcaseProdTime,
        locations: showcaseLocations,
        resolution: showcaseResolution,
        duration: showcaseDuration,
        progress: showcaseProgress
      });
      await loadData();
      triggerSuccess(`✓ Showcase video "${file.name}" uploaded and published live to website!`);
    } catch (err: any) {
      setError(err.message || 'Failed to upload showcase video.');
    } finally {
      setUploadingShowcaseVideo(false);
      e.target.value = '';
    }
  };

  // Project Add / Edit Handlers
  const handleOpenAdd = () => {
    setFormTitle('');
    setFormCategory('commercial');
    setFormFile('uploaded-video/no-1.mp4');
    setFormCatLabel('Commercial · 4K HDR');
    setFormMeta('Showcase Project — ' + new Date().getFullYear());
    setFormSize('card-md');
    setUploadedNoticeFile(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (p: PortfolioProject) => {
    setEditingProject(p);
    setFormTitle(p.title);
    setFormCategory(p.category);
    setFormFile(p.file);
    setFormCatLabel(p.cat_label);
    setFormMeta(p.meta);
    setFormSize(p.size || 'card-md');
    setUploadedNoticeFile(null);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSavingProject(true);
    try {
      if (editingProject) {
        await PortfolioService.updateProject(editingProject.id, {
          title: formTitle,
          category: formCategory,
          file: formFile,
          cat_label: formCatLabel,
          meta: formMeta,
          size: formSize
        });
        triggerSuccess(`Project "${formTitle}" updated & applied to website!`);
      } else {
        await PortfolioService.addProject({
          title: formTitle,
          category: formCategory,
          file: formFile,
          cat_label: formCatLabel,
          meta: formMeta,
          size: formSize
        });
        triggerSuccess(`Project "${formTitle}" created and added to showcase!`);
      }
      setIsAddModalOpen(false);
      setEditingProject(null);
      setUploadedNoticeFile(null);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to save project.');
    } finally {
      setSavingProject(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!deletingId) return;
    try {
      await PortfolioService.deleteProject(deletingId);
      triggerSuccess('Project removed from portfolio showcase.');
      setDeletingId(null);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete project.');
    }
  };

  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingHero(true);
    setError(null);
    try {
      const updated = await PortfolioService.updateHero({
        src: heroSrc,
        label: heroLabel,
        badge: heroBadge
      });
      setHero(updated);
      triggerSuccess('Hero background video and headline badge updated on live website!');
    } catch (err: any) {
      setError(err.message || 'Failed to update hero video.');
    } finally {
      setSavingHero(false);
    }
  };

  const handleSaveShowcase = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingShowcase(true);
    setError(null);
    try {
      const updated = await PortfolioService.updateShowcase({
        title: showcaseTitle,
        plainTitle: showcasePlainTitle,
        file: showcaseFile,
        category: showcaseCategory,
        badge: showcaseBadge,
        description: showcaseDesc,
        productionTime: showcaseProdTime,
        locations: showcaseLocations,
        resolution: showcaseResolution,
        duration: showcaseDuration,
        progress: showcaseProgress
      });
      setShowcase(updated);
      triggerSuccess('Featured Showcase video, waveform stats & copy updated on live website!');
    } catch (err: any) {
      setError(err.message || 'Failed to update featured showcase.');
    } finally {
      setSavingShowcase(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-brand-gold font-mono text-sm">
        <RefreshCw className="w-5 h-5 animate-spin mr-3" />
        LOADING PORTFOLIO CMS...
      </div>
    );
  }

  const activeNotifItem = notifications?.items.find(it => it.id === notifications.activeId) || notifications?.items[0];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-brand-gold" />
              Portfolio Content Manager (CMS)
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-gold/10 text-brand-gold border border-brand-gold/30 font-mono">
              data/videos.json
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Full control over website announcements, hero video, and portfolio showcase cards with live single-port syncing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Live Website
          </a>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-lg bg-brand-gold hover:bg-yellow-500 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(201,168,76,0.3)] transition"
          >
            <Plus className="w-4 h-4" />
            Add New Project
          </button>
        </div>
      </div>

      {/* Notifications Alerts */}
      {successMsg && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-3 animate-fadeIn">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3 animate-fadeIn">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 1: WEBSITE ANNOUNCEMENT & NOTIFICATION BANNER (3 PRESETS)
          ══════════════════════════════════════════════════════════════════════ */}
      <div className="p-6 rounded-xl bg-dark-800/80 border border-slate-800 shadow-xl backdrop-blur-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-brand-gold" />
              <h2 className="text-base font-semibold text-slate-100">
                1. Website Live Announcement Banner (3 Presets)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Easily toggle notices on/off on your live website. Choose from 3 customizable presets (Availability, Status, or Releases).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold ${
              notifications?.globalEnabled
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}>
              <span className={`w-2 h-2 rounded-full ${notifications?.globalEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <span>{notifications?.globalEnabled ? '● LIVE ON WEBSITE' : '● BANNER SILENCED / OFF'}</span>
            </span>

            <button
              onClick={handleToggleGlobalNotif}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono flex items-center gap-2 border transition ${
                notifications?.globalEnabled
                  ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30'
                  : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border-emerald-500/30'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{notifications?.globalEnabled ? 'Turn Banner OFF' : 'Turn Banner ON'}</span>
            </button>
          </div>
        </div>

        {/* 3 Preset Slots */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {notifications?.items.map((item, idx) => {
            const isLive = Boolean(notifications.globalEnabled && notifications.activeId === item.id);

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition flex flex-col justify-between relative ${
                  isLive
                    ? 'bg-brand-gold/10 border-brand-gold/60 shadow-[0_0_20px_rgba(201,168,76,0.15)]'
                    : 'bg-dark-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        SLOT #{idx + 1}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        item.type === 'alert' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        item.type === 'info' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' :
                        'bg-brand-gold/20 text-brand-gold border border-brand-gold/30'
                      }`}>
                        {item.badge}
                      </span>
                    </div>

                    {isLive && (
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        ACTIVE
                      </span>
                    )}
                  </div>

                  {/* Title & Text */}
                  <h3 className="text-sm font-bold text-slate-100 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {item.message}
                  </p>

                  {/* Target Link preview */}
                  <div className="mt-3 text-[10px] font-mono text-slate-500 flex items-center gap-1">
                    <span>Action:</span>
                    <span className="text-brand-gold">{item.actionText || 'None'}</span>
                    <span>→</span>
                    <span className="text-slate-400">{item.actionLink || 'None'}</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-800/80">
                  <button
                    onClick={() => handleOpenEditNotif(item)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition"
                    title="Customize title, message, badge & link"
                  >
                    <Edit2 className="w-3 h-3 text-brand-gold" />
                    <span>Edit</span>
                  </button>

                  {isLive ? (
                    <button
                      onClick={handleTurnOffNotif}
                      className="flex items-center gap-1 px-3 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-mono font-bold transition"
                      title="Turn this banner off from the website"
                    >
                      <BellOff className="w-3 h-3" />
                      <span>Turn Off</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSelectActivePreset(item.id)}
                      className="flex items-center gap-1 px-3 py-1 rounded bg-brand-gold hover:bg-brand-goldHover text-dark-900 text-xs font-mono font-bold transition shadow-sm"
                      title="Publish this preset live on website"
                    >
                      <Radio className="w-3 h-3" />
                      <span>Make Live</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Banner Preview */}
        {notifications?.globalEnabled && activeNotifItem && (
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-brand-gold" />
                Live Visitor Banner Rendering Preview
              </span>
              <span className="text-[10px] font-mono text-emerald-400">
                Visible at top of portfolio
              </span>
            </div>

            <div className="p-3 rounded-lg bg-dark-900/95 border border-brand-gold/30 flex items-center justify-between text-xs text-slate-200 gap-3 shadow-inner">
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse flex-shrink-0" />
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase flex-shrink-0 ${
                  activeNotifItem.type === 'alert' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                  activeNotifItem.type === 'info' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40' :
                  'bg-brand-gold/20 text-brand-gold border border-brand-gold/40'
                }`}>
                  {activeNotifItem.badge}
                </span>
                <span className="truncate text-slate-100 font-medium">
                  {activeNotifItem.message}
                </span>
              </div>

              {activeNotifItem.actionText && (
                <span className="px-2.5 py-1 rounded bg-brand-gold/15 text-brand-gold border border-brand-gold/30 font-semibold text-[11px] flex-shrink-0">
                  {activeNotifItem.actionText} →
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 2: HERO SECTION VIDEO CONTROLLER (WEBSITE HEADER)
          ══════════════════════════════════════════════════════════════════════ */}
      <div className="p-6 rounded-xl bg-dark-800/80 border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-brand-gold" />
            <h2 className="text-base font-semibold text-slate-100">
              2. Hero Section Video Controller (Website Header)
            </h2>
          </div>
          <span className="text-[11px] font-mono text-emerald-400">
            {hero ? `● Active: ${hero.label}` : '● Autoplay Header'}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Form */}
          <form onSubmit={handleSaveHero} className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Video File (Quick Replace)
                </label>
                <select
                  value={heroSrc}
                  onChange={e => setHeroSrc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-dark-900 border border-slate-700 text-slate-100 text-xs focus:border-brand-gold focus:outline-none mb-2"
                >
                  {availableVideos.map(v => (
                    <option key={v.path} value={v.path}>
                      {v.label}
                    </option>
                  ))}
                  {!availableVideos.some(v => v.path === heroSrc) && (
                    <option value={heroSrc}>Current: {heroSrc}</option>
                  )}
                </select>
                <input
                  type="text"
                  value={heroSrc}
                  onChange={e => setHeroSrc(e.target.value)}
                  placeholder="e.g. uploaded-video/my-new-cut.mp4"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-dark-900 border border-slate-700 text-slate-100 text-xs font-mono focus:border-brand-gold focus:outline-none"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Hero Label Title
                  </label>
                  <input
                    type="text"
                    value={heroLabel}
                    onChange={e => setHeroLabel(e.target.value)}
                    placeholder="e.g. Showreel 2025"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-dark-900 border border-slate-700 text-slate-100 text-xs focus:border-brand-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Badge Pill Text
                  </label>
                  <input
                    type="text"
                    value={heroBadge}
                    onChange={e => setHeroBadge(e.target.value)}
                    placeholder="e.g. ◆ 4K HDR"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-dark-900 border border-slate-700 text-slate-100 text-xs focus:border-brand-gold focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingHero}
                className="px-5 py-2.5 rounded-lg bg-brand-gold hover:bg-yellow-500 text-slate-950 text-xs font-bold flex items-center gap-2 transition disabled:opacity-50 shadow-md"
              >
                <Save className="w-4 h-4" />
                {savingHero ? 'Saving...' : 'Apply Hero Changes to Website'}
              </button>
            </div>
          </form>

          {/* Live Preview of Hero Video */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Hero Video Preview</span>
              <label className="cursor-pointer px-2.5 py-1 rounded-lg bg-brand-gold/15 hover:bg-brand-gold/25 border border-brand-gold/30 text-brand-gold text-[11px] font-bold flex items-center gap-1 transition">
                <UploadCloud className="w-3 h-3" />
                <span>{uploadingHeroVideo ? 'Uploading...' : 'Upload or Replace Video'}</span>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/ogg,video/*"
                  className="hidden"
                  disabled={uploadingHeroVideo}
                  onChange={handleHeroVideoUpload}
                />
              </label>
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-700/80 bg-black aspect-video flex flex-col justify-between relative shadow-lg">
              <video
                key={heroSrc}
                src={resolveVideoSrc(heroSrc)}
                controls
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-brand-gold border border-brand-gold/30 pointer-events-none">
                Live Preview
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 2B: FEATURED SHOWCASE CONTROLLER (WAVEFORM PLAYER SECTION)
          ══════════════════════════════════════════════════════════════════════ */}
      <div className="p-6 rounded-xl bg-dark-800/80 border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-brand-gold" />
            <div>
              <h2 className="text-base font-semibold text-slate-100">
                2B. Featured Showcase Player Controller (#showcase)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage the main Featured Showcase video, waveform stats, and project description with instant single-port live sync.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-brand-gold bg-brand-gold/10 px-3 py-1 rounded-full border border-brand-gold/30 flex items-center gap-1.5 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
            <span>Active: {showcasePlainTitle || 'Urban Mirage'}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Form */}
          <form onSubmit={handleSaveShowcase} className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select or Replace Showcase Video
                </label>
                <select
                  value={showcaseFile}
                  onChange={e => setShowcaseFile(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-dark-900 border border-slate-700 text-slate-100 text-xs focus:border-brand-gold focus:outline-none mb-2"
                >
                  {availableVideos.map(v => (
                    <option key={v.path} value={v.path}>
                      {v.label}
                    </option>
                  ))}
                  {!availableVideos.some(v => v.path === showcaseFile) && (
                    <option value={showcaseFile}>Current: {showcaseFile}</option>
                  )}
                </select>
                <input
                  type="text"
                  value={showcaseFile}
                  onChange={e => setShowcaseFile(e.target.value)}
                  placeholder="e.g. uploaded-video/no-1.mp4"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-dark-900 border border-slate-700 text-slate-100 text-xs font-mono focus:border-brand-gold focus:outline-none"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Showcase Title (Headline)
                  </label>
                  <input
                    type="text"
                    value={showcasePlainTitle}
                    onChange={e => {
                      const val = e.target.value;
                      setShowcasePlainTitle(val);
                      const parts = val.trim().split(/\s+/);
                      if (parts.length > 1) {
                        setShowcaseTitle(`<em>${parts[0]}</em><br>${parts.slice(1).join(' ')}`);
                      } else if (parts.length === 1 && parts[0]) {
                        setShowcaseTitle(`<em>${parts[0]}</em>`);
                      } else {
                        setShowcaseTitle('');
                      }
                    }}
                    placeholder="e.g. Urban Mirage"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-dark-900 border border-slate-700 text-slate-100 text-xs focus:border-brand-gold focus:outline-none"
                  />
                  <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                    <span>Preview: <strong className="text-brand-gold">{showcasePlainTitle || 'Untitled'}</strong></span>
                    <span className="text-slate-500 font-mono text-[10px]">Auto-formatted on website</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Showcase Description
              </label>
              <textarea
                rows={3}
                value={showcaseDesc}
                onChange={e => setShowcaseDesc(e.target.value)}
                placeholder="Describe the cinematic campaign, styling, and visual theme..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-dark-900 border border-slate-700 text-slate-100 text-xs focus:border-brand-gold focus:outline-none leading-relaxed"
              />
            </div>

            {/* Showcase Meta Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Category / Tag
                </label>
                <input
                  type="text"
                  value={showcaseCategory}
                  onChange={e => setShowcaseCategory(e.target.value)}
                  placeholder="Commercial · 4K HDR"
                  className="w-full px-3 py-2 rounded-lg bg-dark-900 border border-slate-700 text-slate-100 text-xs focus:border-brand-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Badge Text
                </label>
                <input
                  type="text"
                  value={showcaseBadge}
                  onChange={e => setShowcaseBadge(e.target.value)}
                  placeholder="Featured"
                  className="w-full px-3 py-2 rounded-lg bg-dark-900 border border-slate-700 text-slate-100 text-xs focus:border-brand-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Production Time
                </label>
                <input
                  type="text"
                  value={showcaseProdTime}
                  onChange={e => setShowcaseProdTime(e.target.value)}
                  placeholder="4 wks"
                  className="w-full px-3 py-2 rounded-lg bg-dark-900 border border-slate-700 text-slate-100 text-xs focus:border-brand-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Locations
                </label>
                <input
                  type="text"
                  value={showcaseLocations}
                  onChange={e => setShowcaseLocations(e.target.value)}
                  placeholder="2 cities"
                  className="w-full px-3 py-2 rounded-lg bg-dark-900 border border-slate-700 text-slate-100 text-xs focus:border-brand-gold focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Resolution
                </label>
                <input
                  type="text"
                  value={showcaseResolution}
                  onChange={e => setShowcaseResolution(e.target.value)}
                  placeholder="4K HDR"
                  className="w-full px-3 py-2 rounded-lg bg-dark-900 border border-slate-700 text-slate-100 text-xs focus:border-brand-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Waveform Duration
                </label>
                <input
                  type="text"
                  value={showcaseDuration}
                  onChange={e => setShowcaseDuration(e.target.value)}
                  placeholder="2:34 / 4:12"
                  className="w-full px-3 py-2 rounded-lg bg-dark-900 border border-slate-700 text-slate-100 text-xs focus:border-brand-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Progress Bar Width
                </label>
                <input
                  type="text"
                  value={showcaseProgress}
                  onChange={e => setShowcaseProgress(e.target.value)}
                  placeholder="61%"
                  className="w-full px-3 py-2 rounded-lg bg-dark-900 border border-slate-700 text-slate-100 text-xs focus:border-brand-gold focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingShowcase}
                className="px-5 py-2.5 rounded-lg bg-brand-gold hover:bg-yellow-500 text-slate-950 text-xs font-bold flex items-center gap-2 transition disabled:opacity-50 shadow-md"
              >
                <Save className="w-4 h-4" />
                {savingShowcase ? 'Saving...' : 'Apply Showcase Changes to Website'}
              </button>
            </div>
          </form>

          {/* Live Preview of Showcase Video */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Showcase Video Preview</span>
              <label className="cursor-pointer px-2.5 py-1 rounded-lg bg-brand-gold/15 hover:bg-brand-gold/25 border border-brand-gold/30 text-brand-gold text-[11px] font-bold flex items-center gap-1 transition">
                <UploadCloud className="w-3 h-3" />
                <span>{uploadingShowcaseVideo ? 'Uploading...' : 'Upload Video'}</span>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/ogg,video/*"
                  className="hidden"
                  disabled={uploadingShowcaseVideo}
                  onChange={handleShowcaseVideoUpload}
                />
              </label>
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-700/80 bg-black aspect-video flex flex-col justify-between relative shadow-lg">
              <video
                key={showcaseFile}
                src={resolveVideoSrc(showcaseFile)}
                controls
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-brand-gold border border-brand-gold/30 pointer-events-none">
                Showcase Video
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1 font-mono">
              <div className="flex justify-between">
                <span>Asset File:</span>
                <span className="text-slate-200 truncate max-w-[170px]">{showcaseFile}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="text-brand-gold">{showcaseDuration}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 3: SHOWCASE PROJECTS GRID
          ══════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-gold" />
            <h2 className="text-base font-semibold text-slate-100">
              3. Portfolio Showcase Cards ({(projects || []).length} Projects Live)
            </h2>
          </div>
          <button
            onClick={handleOpenAdd}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Card</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(projects || []).map(p => (
            <div
              key={p.id}
              className="rounded-xl border border-slate-800 bg-dark-800/60 overflow-hidden flex flex-col justify-between hover:border-slate-700 transition shadow-lg group"
            >
              {/* Card Video Header */}
              <div className="relative aspect-video bg-black overflow-hidden border-b border-slate-800">
                <video
                  src={resolveVideoSrc(p.file || p.assetId)}
                  muted
                  playsInline
                  loop
                  onMouseEnter={e => (e.target as HTMLVideoElement).play().catch(() => {})}
                  onMouseLeave={e => {
                    const v = e.target as HTMLVideoElement;
                    v.pause();
                    v.currentTime = 0;
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-slate-300 border border-slate-700">
                  {p.category.toUpperCase()}
                </div>
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-brand-gold/20 text-[10px] font-mono text-brand-gold border border-brand-gold/40">
                  {p.size || 'card-md'}
                </div>
              </div>

              {/* Card Info */}
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-sm text-slate-100">{p.title}</h3>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                    {p.cat_label}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{p.meta}</p>
                <div className="text-[10px] font-mono text-slate-500 truncate">
                  File: {p.file}
                </div>
              </div>

              {/* Card Actions */}
              <div className="p-3 bg-dark-900/80 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Edit2 className="w-3 h-3 text-brand-gold" />
                    <span>Edit</span>
                  </button>

                  <label className="cursor-pointer px-2.5 py-1.5 rounded-lg bg-brand-gold/15 hover:bg-brand-gold/25 border border-brand-gold/30 text-brand-gold text-xs font-semibold flex items-center gap-1.5 transition">
                    <UploadCloud className={`w-3.5 h-3.5 ${replacingCardId === p.id ? 'animate-bounce' : ''}`} />
                    <span>{replacingCardId === p.id ? 'Uploading...' : 'Replace Video'}</span>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/ogg,video/*"
                      className="hidden"
                      disabled={replacingCardId === p.id}
                      onChange={e => handleQuickReplaceCardVideo(p, e)}
                    />
                  </label>
                </div>

                <button
                  onClick={() => setDeletingId(p.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                  title="Remove card from portfolio"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL: EDIT ANNOUNCEMENT PRESET
          ══════════════════════════════════════════════════════════════════════ */}
      {editingNotif && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-dark-900 border border-slate-700 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-brand-gold" />
                <h3 className="text-base font-bold text-slate-100">
                  Customize Announcement Preset ({editingNotif.id})
                </h3>
              </div>
              <button
                onClick={() => setEditingNotif(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSaveNotifPreset} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-mono mb-1">PRESET TITLE</label>
                <input
                  type="text"
                  required
                  value={editingNotif.title}
                  onChange={e => setEditingNotif({ ...editingNotif, title: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-brand-gold/60"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-mono mb-1">ANNOUNCEMENT TEXT (Message displayed to visitors)</label>
                <textarea
                  rows={2}
                  required
                  value={editingNotif.message}
                  onChange={e => setEditingNotif({ ...editingNotif, message: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-brand-gold/60"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-mono mb-1">BADGE TAG</label>
                  <input
                    type="text"
                    required
                    value={editingNotif.badge}
                    onChange={e => setEditingNotif({ ...editingNotif, badge: e.target.value.toUpperCase() })}
                    placeholder="e.g. AVAILABLE, NOTICE"
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-brand-gold/60 uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-mono mb-1">STYLE THEME</label>
                  <select
                    value={editingNotif.type}
                    onChange={e => setEditingNotif({ ...editingNotif, type: e.target.value as any })}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-brand-gold/60 font-mono"
                  >
                    <option value="gold">Studio Gold (Standard)</option>
                    <option value="alert">Alert / Red (Off-duty / Notice)</option>
                    <option value="info">Cyan / Blue (New Release / Info)</option>
                    <option value="success">Emerald (Available)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-mono mb-1">ACTION BUTTON TEXT</label>
                  <input
                    type="text"
                    value={editingNotif.actionText || ''}
                    onChange={e => setEditingNotif({ ...editingNotif, actionText: e.target.value })}
                    placeholder="e.g. Get in Touch"
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-brand-gold/60"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-mono mb-1">ACTION LINK TARGET</label>
                  <input
                    type="text"
                    value={editingNotif.actionLink || ''}
                    onChange={e => setEditingNotif({ ...editingNotif, actionLink: e.target.value })}
                    placeholder="e.g. #contact, #portfolio"
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-brand-gold/60 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingNotif(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingNotif}
                  className="px-5 py-2 rounded-lg bg-brand-gold hover:bg-brand-goldHover text-dark-900 font-bold transition disabled:opacity-50"
                >
                  {savingNotif ? 'Saving...' : 'Save Preset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL: ADD / EDIT PROJECT
          ══════════════════════════════════════════════════════════════════════ */}
      {(isAddModalOpen || editingProject) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl bg-dark-800 border border-slate-700 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Film className="w-5 h-5 text-brand-gold" />
                {editingProject ? `Edit Project: ${editingProject.title}` : 'Add New Portfolio Project'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingProject(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSaveProject} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="e.g. Cyberpunk Nexus"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-dark-900 border border-slate-700 text-slate-100 focus:border-brand-gold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-dark-900 border border-slate-700 text-slate-100 focus:border-brand-gold focus:outline-none"
                  >
                    <option value="commercial">Commercial</option>
                    <option value="narrative">Narrative</option>
                    <option value="motion">Motion Design</option>
                    <option value="music">Music Video</option>
                    <option value="vfx">Visual Effects (VFX)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Card Layout Size</label>
                  <select
                    value={formSize}
                    onChange={e => setFormSize(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-dark-900 border border-slate-700 text-slate-100 focus:border-brand-gold focus:outline-none"
                  >
                    <option value="card-lg">Large (Wide 2-col)</option>
                    <option value="card-md">Medium (Standard)</option>
                    <option value="card-sm">Small (Compact)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Badge Tag</label>
                <input
                  type="text"
                  value={formCatLabel}
                  onChange={e => setFormCatLabel(e.target.value)}
                  placeholder="e.g. Commercial · 4K HDR"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-dark-900 border border-slate-700 text-slate-100 focus:border-brand-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Metadata Subtitle</label>
                <input
                  type="text"
                  value={formMeta}
                  onChange={e => setFormMeta(e.target.value)}
                  placeholder="e.g. Nike Campaign — 2025"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-dark-900 border border-slate-700 text-slate-100 focus:border-brand-gold focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-300 font-semibold">Video File</label>
                  <label className="cursor-pointer px-2 py-0.5 rounded bg-brand-gold/15 hover:bg-brand-gold/25 border border-brand-gold/30 text-brand-gold text-[10px] font-bold flex items-center gap-1">
                    <UploadCloud className="w-3 h-3" />
                    <span>{uploadingModalVideo ? 'Uploading...' : 'Upload Video File'}</span>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/ogg,video/*"
                      className="hidden"
                      disabled={uploadingModalVideo}
                      onChange={handleModalVideoUpload}
                    />
                  </label>
                </div>
                <select
                  value={formFile}
                  onChange={e => setFormFile(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-dark-900 border border-slate-700 text-slate-100 text-xs focus:border-brand-gold focus:outline-none mb-2"
                >
                  {availableVideos.map(v => (
                    <option key={v.path} value={v.path}>
                      {v.label}
                    </option>
                  ))}
                  {!availableVideos.some(v => v.path === formFile) && (
                    <option value={formFile}>Current: {formFile}</option>
                  )}
                </select>
                <input
                  type="text"
                  required
                  value={formFile}
                  onChange={e => setFormFile(e.target.value)}
                  placeholder="e.g. uploaded-video/no-1.mp4"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-dark-900 border border-slate-700 text-slate-100 font-mono text-xs focus:border-brand-gold focus:outline-none"
                />
              </div>

              {uploadedNoticeFile && (
                <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between gap-2 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Video file uploaded! Click <strong>"Save & Apply to Website"</strong> below to persist.</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400/80 truncate max-w-[140px]">{uploadedNoticeFile}</span>
                </div>
              )}

              <div className="rounded-lg overflow-hidden border border-slate-700 bg-black aspect-video relative mt-2">
                <video
                  key={formFile}
                  src={resolveVideoSrc(formFile)}
                  controls
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-brand-gold border border-brand-gold/30">
                  Preview
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingProject(null);
                    setUploadedNoticeFile(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProject || uploadingModalVideo}
                  className={`px-5 py-2 rounded-lg bg-brand-gold hover:bg-yellow-500 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg disabled:opacity-50 transition ${
                    uploadedNoticeFile ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-dark-900 shadow-emerald-500/20' : ''
                  }`}
                >
                  <Save className={`w-4 h-4 ${savingProject ? 'animate-spin' : ''}`} />
                  {savingProject
                    ? 'Saving & Applying...'
                    : uploadedNoticeFile
                    ? 'Save & Apply to Website (1 Video Ready)'
                    : editingProject
                    ? 'Save & Apply to Website'
                    : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-dark-800 border border-slate-700 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-100 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Remove Project?
            </h3>
            <p className="text-xs text-slate-300 mb-4">
              Are you sure you want to delete this project from the portfolio? This will remove the card from the public website immediately.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeletingId(null);
                  setError(null);
                }}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProject}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-2 transition shadow-lg"
              >
                <Trash2 className="w-4 h-4" />
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
