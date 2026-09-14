import React, { useState, useEffect } from 'react';
import { FileEditorService, FileNode } from '../services/fileEditor.service';
import {
  Code2,
  Folder,
  FolderOpen,
  Save,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  Terminal,
  FileCode,
  FileText
} from 'lucide-react';

interface FileTreeItemProps {
  node: FileNode;
  selectedPath: string;
  onSelectFile: (path: string) => void;
  level?: number;
}

const FileTreeItem: React.FC<FileTreeItemProps> = ({
  node,
  selectedPath,
  onSelectFile,
  level = 0
}) => {
  const [expanded, setExpanded] = useState(level === 0);

  if (node.isDir) {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={`w-full flex items-center gap-1.5 px-2 py-1 rounded text-left text-xs font-mono text-slate-300 hover:bg-slate-800/60 transition`}
          style={{ paddingLeft: `${level * 14 + 8}px` }}
        >
          {expanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          )}
          {expanded ? (
            <FolderOpen className="w-3.5 h-3.5 text-brand-gold" />
          ) : (
            <Folder className="w-3.5 h-3.5 text-brand-gold/70" />
          )}
          <span className="truncate">{node.name}</span>
        </button>

        {expanded && node.children && (
          <div className="space-y-0.5">
            {node.children.map(child => (
              <FileTreeItem
                key={child.path}
                node={child}
                selectedPath={selectedPath}
                onSelectFile={onSelectFile}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const isSelected = selectedPath === node.path;
  const isCode = /\.(js|ts|tsx|jsx|json|html|css|md)$/i.test(node.name);

  return (
    <button
      onClick={() => onSelectFile(node.path)}
      className={`w-full flex items-center gap-1.5 px-2 py-1 rounded text-left text-xs font-mono transition ${
        isSelected
          ? 'bg-brand-gold/20 text-brand-gold font-semibold border-l-2 border-brand-gold'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
      }`}
      style={{ paddingLeft: `${level * 14 + 20}px` }}
    >
      {isCode ? (
        <FileCode className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
      ) : (
        <FileText className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
      )}
      <span className="truncate">{node.name}</span>
    </button>
  );
};

export const CodeEditorPage: React.FC = () => {
  const [tree, setTree] = useState<FileNode[]>([]);
  const [loadingTree, setLoadingTree] = useState(true);
  const [selectedPath, setSelectedPath] = useState<string>('data/videos.json');
  const [fileContent, setFileContent] = useState<string>('');
  const [originalContent, setOriginalContent] = useState<string>('');
  const [loadingFile, setLoadingFile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchTree = async () => {
    setLoadingTree(true);
    try {
      const data = await FileEditorService.getFileTree();
      setTree(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch directory tree');
    } finally {
      setLoadingTree(false);
    }
  };

  const loadFile = async (filePath: string) => {
    setSelectedPath(filePath);
    setLoadingFile(true);
    setErrorMsg(null);
    try {
      const res = await FileEditorService.readFile(filePath);
      setFileContent(res.content);
      setOriginalContent(res.content);
    } catch (err: any) {
      setErrorMsg(err.message || `Failed to read file ${filePath}`);
    } finally {
      setLoadingFile(false);
    }
  };

  useEffect(() => {
    fetchTree();
    loadFile('data/videos.json');
  }, []);

  const handleSave = async () => {
    if (!selectedPath) return;
    setSaving(true);
    setErrorMsg(null);
    try {
      await FileEditorService.writeFile(selectedPath, fileContent);
      setOriginalContent(fileContent);
      setSuccessMsg(`Saved ${selectedPath} successfully (backup .bak preserved).`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save file');
    } finally {
      setSaving(false);
    }
  };

  const isDirty = fileContent !== originalContent;
  const lineCount = fileContent.split('\n').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-brand-gold" />
            Core File & Code Editor
          </h1>
          <p className="text-xs text-slate-400">
            Inspect, edit, and apply changes directly to website templates, configurations, scripts, and media databases.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isDirty && (
            <span className="text-xs font-mono text-amber-400 flex items-center gap-1.5 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20">
              ● Unsaved Changes
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="px-4 py-2 rounded-lg bg-brand-gold hover:bg-yellow-500 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(201,168,76,0.3)] transition disabled:opacity-50 disabled:shadow-none"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save File'}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 flex-shrink-0">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 flex-shrink-0">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Editor Split View */}
      <div className="flex-1 flex gap-4 overflow-hidden rounded-xl border border-slate-800 bg-dark-900 shadow-2xl">
        {/* Left: File Explorer Sidebar */}
        <div className="w-72 border-r border-slate-800 bg-dark-800/40 flex flex-col">
          <div className="p-3 border-b border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-brand-gold" />
              Project Files
            </span>
            <button
              onClick={fetchTree}
              className="p-1 hover:text-brand-gold text-slate-400 rounded transition"
              title="Refresh tree"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {loadingTree ? (
              <div className="p-4 text-center text-xs text-slate-500 font-mono">
                Scanning tree...
              </div>
            ) : (
              tree.map(node => (
                <FileTreeItem
                  key={node.path}
                  node={node}
                  selectedPath={selectedPath}
                  onSelectFile={loadFile}
                />
              ))
            )}
          </div>
        </div>

        {/* Right: Code Editor & Buffer */}
        <div className="flex-1 flex flex-col" style={{ backgroundColor: '#070b14' }}>
          {/* File Tab Bar */}
          <div className="h-10 px-4 border-b border-slate-800 flex items-center justify-between" style={{ backgroundColor: '#0b1120' }}>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <FileCode className="w-4 h-4 text-brand-gold" />
              <span className="font-semibold text-slate-100">{selectedPath}</span>
              {isDirty && <span className="text-amber-400 font-bold">*</span>}
            </div>

            <div className="text-[11px] font-mono text-slate-400">
              {lineCount} lines · UTF-8
            </div>
          </div>

          {/* Textarea Code Buffer with Line Numbers */}
          <div className="flex-1 relative overflow-hidden flex" style={{ backgroundColor: '#050811' }}>
            {loadingFile ? (
              <div className="flex-1 flex items-center justify-center text-xs font-mono text-slate-400">
                <RefreshCw className="w-4 h-4 animate-spin mr-2 text-brand-gold" />
                Loading file buffer...
              </div>
            ) : (
              <div className="flex-1 flex h-full overflow-hidden">
                {/* Line numbers gutter */}
                <div
                  className="w-12 py-4 select-none text-right pr-3 font-mono text-xs border-r border-slate-800/80 text-slate-600 overflow-hidden"
                  style={{ backgroundColor: '#04060c' }}
                >
                  {Array.from({ length: Math.min(lineCount, 500) }).map((_, i) => (
                    <div key={i} className="leading-6">
                      {i + 1}
                    </div>
                  ))}
                </div>

                {/* Main Code Textarea */}
                <textarea
                  value={fileContent}
                  onChange={e => setFileContent(e.target.value)}
                  spellCheck={false}
                  className="flex-1 h-full p-4 font-mono text-xs leading-6 focus:outline-none resize-none selection:bg-brand-gold/30 selection:text-white"
                  style={{
                    backgroundColor: '#070b14',
                    color: '#e2e8f0',
                    caretColor: '#c9a84c',
                    tabSize: 2
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
