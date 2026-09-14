import React, { useEffect, useState } from 'react';
import { ApiClient } from '../services/api';
import { VideoItem, PaginationMeta, VideoStatus, VideoVisibility } from '../types';
import { VideoPlayerModal } from '../components/VideoPlayerModal';
import { useAuth } from '../context/AuthContext';
import {
  Play,
  Edit2,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Archive,
  Eye,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const VideosPage: React.FC = () => {
  const { hasPermission } = useAuth();

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);

  // Modals
  const [activePlayerVideo, setActivePlayerVideo] = useState<VideoItem | null>(null);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [deletingVideo, setDeletingVideo] = useState<VideoItem | null>(null);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editStatus, setEditStatus] = useState<VideoStatus>('DRAFT');
  const [editVisibility, setEditVisibility] = useState<VideoVisibility>('PRIVATE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchVideos = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '10'
    });
    if (search) params.append('search', search);
    if (statusFilter) params.append('status', statusFilter);

    const res = await ApiClient.request<VideoItem[]>(`/api/v1/videos?${params.toString()}`);
    if (res.success && res.data) {
      setVideos(res.data);
      if (res.meta) setMeta(res.meta);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVideos();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchVideos();
  };

  const handleOpenEdit = (video: VideoItem) => {
    setEditingVideo(video);
    setEditTitle(video.title);
    setEditDesc(video.description || '');
    setEditStatus(video.status);
    setEditVisibility(video.visibility);
    setModalError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;
    setIsSubmitting(true);
    setModalError(null);

    const res = await ApiClient.request(`/api/v1/videos/${editingVideo.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        title: editTitle,
        description: editDesc,
        status: editStatus,
        visibility: editVisibility
      })
    });

    if (res.success) {
      setEditingVideo(null);
      fetchVideos();
    } else {
      setModalError(res.error?.message || 'Failed to update video metadata.');
    }
    setIsSubmitting(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingVideo) return;
    setIsSubmitting(true);
    setModalError(null);

    const res = await ApiClient.request(`/api/v1/videos/${deletingVideo.id}`, {
      method: 'DELETE'
    });

    if (res.success) {
      setDeletingVideo(null);
      fetchVideos();
    } else {
      setModalError(res.error?.message || 'Failed to delete video asset.');
    }
    setIsSubmitting(false);
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Video Repository</h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">Encrypted Assets & Access Management</p>
        </div>

        <Link
          to="/upload"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-gold hover:bg-brand-goldHover text-dark-900 font-bold text-xs shadow-[0_0_15px_rgba(201,168,76,0.25)] transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Video Upload</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-96">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter by title, slug, keywords..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-gold/50"
            />
          </div>
          <button type="submit" className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 hover:bg-slate-700">
            Search
          </button>
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-gold/50"
          >
            <option value="">All Statuses</option>
            <option value="PUBLISHED">Published Only</option>
            <option value="DRAFT">Drafts Only</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Videos Data Table */}
      <div className="glass-panel rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 font-mono uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Asset</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Visibility</th>
                <th className="px-6 py-3.5">Size / Type</th>
                <th className="px-6 py-3.5">Uploaded By</th>
                <th className="px-6 py-3.5">Created</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-mono">
                    Querying encrypted repository records...
                  </td>
                </tr>
              ) : videos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-mono">
                    No matching video records found.
                  </td>
                </tr>
              ) : (
                videos.map(video => (
                  <tr key={video.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setActivePlayerVideo(video)}
                          className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-brand-gold hover:bg-brand-gold/15 transition group flex-shrink-0"
                          title="Stream Video"
                        >
                          <Play className="w-4 h-4 group-hover:scale-110 transition" />
                        </button>
                        <div>
                          <p className="font-semibold text-slate-200">{video.title}</p>
                          <p className="text-[10px] font-mono text-slate-500 truncate max-w-[200px]">{video.slug}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono ${
                        video.status === 'PUBLISHED'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : video.status === 'DRAFT'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-700/40 text-slate-400 border border-slate-600'
                      }`}>
                        {video.status === 'PUBLISHED' ? <CheckCircle2 className="w-3 h-3" /> :
                         video.status === 'DRAFT' ? <Clock className="w-3 h-3" /> :
                         <Archive className="w-3 h-3" />}
                        <span>{video.status}</span>
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-mono text-[11px] text-slate-400">
                        {video.visibility}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-mono">
                      <p>{formatFileSize(video.fileSize)}</p>
                      <p className="text-[10px] text-slate-500">{video.mimeType}</p>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-slate-300 font-medium">
                        {video.uploader?.name || 'Admin'}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-mono text-slate-400">
                      {new Date(video.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setActivePlayerVideo(video)}
                          title="Watch Stream"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-gold hover:bg-brand-gold/10 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(video)}
                          title="Edit Video"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {hasPermission('video:delete') && (
                          <button
                            onClick={() => setDeletingVideo(video)}
                            title="Delete Video"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Total: {meta.total} records · Page {meta.page} of {meta.totalPages || 1}</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= meta.totalPages}
              onClick={() => setPage(p => p + 1)}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: Video Player */}
      {activePlayerVideo && (
        <VideoPlayerModal
          video={activePlayerVideo}
          onClose={() => setActivePlayerVideo(null)}
        />
      )}

      {/* MODAL: Edit Video */}
      {editingVideo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-dark-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-brand-gold" />
                <span>Edit Video Metadata</span>
              </h2>
              <button onClick={() => setEditingVideo(null)} className="text-slate-500 hover:text-slate-300 text-xs">
                ✕
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-brand-gold/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-brand-gold/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value as VideoStatus)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-brand-gold/50"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Visibility</label>
                  <select
                    value={editVisibility}
                    onChange={e => setEditVisibility(e.target.value as VideoVisibility)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-brand-gold/50"
                  >
                    <option value="PUBLIC">Public</option>
                    <option value="PRIVATE">Private</option>
                    <option value="UNLISTED">Unlisted</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingVideo(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-brand-gold hover:bg-brand-goldHover text-dark-900 font-bold text-xs"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Confirm Delete (2-Step Verification) */}
      {deletingVideo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-dark-900 border border-red-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h2 className="text-base font-bold text-slate-100">Permanently Delete Asset?</h2>
              <p className="text-xs text-slate-400 mt-1">
                You are deleting <span className="text-slate-200 font-bold">"{deletingVideo.title}"</span>. This will destroy the encrypted file and remove all metadata. This action is irreversible.
              </p>
            </div>

            {modalError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingVideo(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
              >
                {isSubmitting ? 'Destroying...' : 'Yes, Delete Asset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
