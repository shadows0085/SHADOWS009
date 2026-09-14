import { ApiClient } from './api';

export interface FileNode {
  name: string;
  path: string;
  isDir: boolean;
  size?: number;
  children?: FileNode[];
}

export interface FileContentData {
  path: string;
  size: number;
  lastModified: string;
  content: string;
}

export class FileEditorService {
  static async getFileTree(): Promise<FileNode[]> {
    const res = await ApiClient.request<FileNode[]>('/api/v1/files/tree');
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to load file tree');
    }
    return res.data;
  }

  static async readFile(filePath: string): Promise<FileContentData> {
    const res = await ApiClient.request<FileContentData>(`/api/v1/files/read?path=${encodeURIComponent(filePath)}`);
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to read file');
    }
    return res.data;
  }

  static async writeFile(filePath: string, content: string): Promise<void> {
    const res = await ApiClient.request('/api/v1/files/write', {
      method: 'PUT',
      body: JSON.stringify({ path: filePath, content })
    });
    if (!res.success) {
      throw new Error(res.error?.message || 'Failed to save file');
    }
  }
}
