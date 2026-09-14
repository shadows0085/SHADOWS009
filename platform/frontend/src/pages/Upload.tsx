import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiClient } from '../services/api';
import {
  UploadCloud,
  FileVideo,
  CheckCircle2,
  X,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [visibility, setVisibility] = useState('PRIVATE');

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const getDeclaredMimeType = (file: File): 'video/mp4' | 'video/webm' | 'video/quicktime' => {
    if (file.type === 'video/webm' || file.name.toLowerCase().endsWith('.webm')) return 'video/webm';
    if (file.type === 'video/quicktime' || file.name.toLowerCase().endsWith('.mov')) return 'video/quicktime';
    return 'video/mp4';
  };

  const getUploadSessionKey = (file: File) =>
    `shadow-upload-session:${file.name}:${file.size}:${file.lastModified}`;

  const uploadInChunks = async (file: File) => {
    const chunkSize = 8 * 1024 * 1024;
    const totalChunks = Math.ceil(file.size / chunkSize);
    const sessionKey = getUploadSessionKey(file);
    let sessionId: string | null = null;
    let startChunk = 0;

    // A file cannot be retained across a browser refresh, but the selected
    // matching file can continue its server-side session instead of creating
    // another partial upload on disk.
    const storedSessionId = localStorage.getItem(sessionKey);
    if (storedSessionId) {
      const statusRes = await ApiClient.request<{
        fileName: string;
        fileSize: number;
        chunksUploaded: number;
        status: string;
      }>(`/api/v1/uploads/chunked/${storedSessionId}/status`);

      const status = statusRes.data;
      if (
        statusRes.success &&
        status &&
        status.fileName === file.name &&
        status.fileSize === file.size &&
        ['INITIATED', 'UPLOADING'].includes(status.status) &&
        status.chunksUploaded <= totalChunks
      ) {
        sessionId = storedSessionId;
        startChunk = status.chunksUploaded;
        setUploadProgress(10 + Math.round((startChunk / totalChunks) * 60));
      } else {
        localStorage.removeItem(sessionKey);
      }
    }

    if (!sessionId) {
      const initRes = await ApiClient.request<{ id: string }>(
        '/api/v1/uploads/chunked/initiate',
        {
          method: 'POST',
          body: JSON.stringify({
            fileName: file.name,
            mimeType: getDeclaredMimeType(file),
            fileSize: file.size
          })
        }
      );

      if (!initRes.success || !initRes.data?.id) {
        throw new Error(initRes.error?.message || 'Unable to start the upload session');
      }

      sessionId = initRes.data.id;
      localStorage.setItem(sessionKey, sessionId);
    }

    for (let chunkIndex = startChunk; chunkIndex < totalChunks; chunkIndex += 1) {
      const chunk = file.slice(chunkIndex * chunkSize, Math.min(file.size, (chunkIndex + 1) * chunkSize));
      const formData = new FormData();
      formData.append('chunk', chunk, file.name);

      const chunkRes = await ApiClient.request(
        `/api/v1/uploads/chunked/${sessionId}?chunkIndex=${chunkIndex}`,
        { method: 'PUT', body: formData }
      );
      if (!chunkRes.success) {
        throw new Error(chunkRes.error?.message || `Upload failed at chunk ${chunkIndex + 1}`);
      }

      setUploadProgress(10 + Math.round(((chunkIndex + 1) / totalChunks) * 60));
    }

    const completeRes = await ApiClient.request<{ storageKey: string; fileSize: number; mimeType: string }>(
      `/api/v1/uploads/chunked/${sessionId}/complete`,
      { method: 'POST' }
    );
    if (!completeRes.success || !completeRes.data) {
      throw new Error(completeRes.error?.message || 'Unable to finalize the uploaded video');
    }
    localStorage.removeItem(sessionKey);
    return completeRes.data;
  };

  const handleFileSelect = (file: File) => {
    setErrorMessage(null);

    // Client-side MIME check
    const allowed = ['video/mp4', 'video/webm', 'video/quicktime'];
    const fileName = file.name.toLowerCase();
    if (!allowed.includes(file.type) && !fileName.endsWith('.mp4') && !fileName.endsWith('.webm') && !fileName.endsWith('.mov')) {
      setErrorMessage('Unsupported file format. Only verified MP4 and WebM video files are permitted.');
      return;
    }

    // Size limit check (2GB)
    if (file.size > 2 * 1024 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 2 GB limit.');
      return;
    }

    setSelectedFile(file);
    if (!title) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUploadAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Please select a video file to upload.');
      return;
    }

    setUploading(true);
    setUploadProgress(10);
    setErrorMessage(null);

    try {
      // Large video files are uploaded sequentially in bounded chunks, avoiding
      // browser and server memory limits while retaining resumable API support.
      const uploadedAsset = await uploadInChunks(selectedFile);

      setUploadProgress(70);

      // Step 2: Register video in database
      const videoRes = await ApiClient.request('/api/v1/videos', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          storageKey: uploadedAsset.storageKey,
          mimeType: uploadedAsset.mimeType,
          fileSize: uploadedAsset.fileSize,
          status,
          visibility
        })
      });

      if (!videoRes.success) {
        throw new Error(videoRes.error?.message || 'Failed to register video metadata');
      }

      setUploadProgress(100);
      setSuccessMessage('Video successfully encrypted and registered in vault.');

      setTimeout(() => {
        navigate('/videos');
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Upload Media Asset</h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Multi-Stage Magic Byte Inspection & Isolated Storage Vaulting
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleUploadAndRegister} className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
        {/* Dropzone Area */}
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            selectedFile
              ? 'border-brand-gold/60 bg-brand-gold/5'
              : 'border-slate-700/80 hover:border-brand-gold/40 hover:bg-slate-800/20'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            accept="video/mp4,video/webm,video/quicktime"
            className="hidden"
          />

          {selectedFile ? (
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-gold/15 border border-brand-gold/30 flex items-center justify-center text-brand-gold">
                <FileVideo className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-100">{selectedFile.name}</p>
                <p className="text-xs font-mono text-slate-400">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · {selectedFile.type || 'video'}
                </p>
              </div>
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-red-400 ml-4"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  Click to browse or drag and drop video file
                </p>
                <p className="text-xs font-mono text-slate-500 mt-1">
                  Supported: MP4, WebM (Max size: 2 GB)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Upload Progress Bar */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>Vault Processing & Upload</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-gold to-yellow-300 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Form Metadata */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5">ASSET TITLE</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Urban Mirage — Commercial Cut 2026"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-gold/60"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5">DESCRIPTION & NOTES</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Color grading specifications, client notes, project details..."
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-gold/60"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5">PUBLICATION STATUS</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-brand-gold/60"
              >
                <option value="DRAFT">Draft (Unpublished)</option>
                <option value="PUBLISHED">Published (Ready for Distribution)</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5">ACCESS VISIBILITY</label>
              <select
                value={visibility}
                onChange={e => setVisibility(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-brand-gold/60"
              >
                <option value="PRIVATE">Private (Requires Signed Ticket)</option>
                <option value="PUBLIC">Public</option>
                <option value="UNLISTED">Unlisted</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={uploading || !selectedFile}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-gold hover:bg-brand-goldHover text-dark-900 font-bold text-sm shadow-[0_0_20px_rgba(201,168,76,0.3)] disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {uploading ? (
              <span>Validating & Uploading...</span>
            ) : (
              <>
                <span>Process & Secure Asset</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
