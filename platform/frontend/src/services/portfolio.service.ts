import { ApiClient } from './api';

export interface PortfolioProject {
  id: string;
  assetId?: string;
  file: string;
  title: string;
  category: string;
  cat_label: string;
  meta: string;
  size?: string;
  thumb_color?: string;
  thumb_glow?: Array<{
    w: number;
    h: number;
    color: string;
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
    delay?: string;
  }>;
}

export interface PortfolioHero {
  src: string;
  assetId: string;
  type: string;
  label: string;
  badge: string;
}

export interface NotificationItem {
  id: string;
  enabled: boolean;
  title: string;
  message: string;
  badge: string;
  type: 'gold' | 'alert' | 'info' | 'success';
  actionText?: string;
  actionLink?: string;
  updatedAt?: string;
}

export interface NotificationsData {
  activeId: string | null;
  globalEnabled: boolean;
  items: NotificationItem[];
}

export interface ShowcaseProject {
  title: string;
  plainTitle?: string;
  assetId?: string;
  file: string;
  category?: string;
  badge?: string;
  description: string;
  productionTime?: string;
  locations?: string;
  resolution?: string;
  duration?: string;
  progress?: string;
}

export interface PortfolioData {
  version: number;
  hero: PortfolioHero;
  showcase?: ShowcaseProject;
  portfolio: PortfolioProject[];
  notifications?: NotificationsData;
}

export class PortfolioService {
  private static version: number | null = null;

  private static withExpectedVersion<T extends object>(data: T): T & { expectedVersion: number } {
    if (this.version === null) {
      throw new Error('Portfolio data is out of date. Refresh the page and try again.');
    }
    return { ...data, expectedVersion: this.version };
  }

  private static captureVersion(response: { version?: number }) {
    if (typeof response.version === 'number') {
      this.version = response.version;
    }
  }

  static async getAll(): Promise<PortfolioData> {
    const res = await ApiClient.request<PortfolioData>('/api/v1/portfolio');
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to fetch portfolio data');
    }
    this.version = res.data.version;
    return res.data;
  }

  static async addProject(projectData: Partial<PortfolioProject>): Promise<PortfolioProject> {
    const res = await ApiClient.request<PortfolioProject>('/api/v1/portfolio/projects', {
      method: 'POST',
      body: JSON.stringify(this.withExpectedVersion(projectData))
    });
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to add project');
    }
    this.captureVersion(res);
    return res.data;
  }

  static async updateProject(id: string, updates: Partial<PortfolioProject>): Promise<PortfolioProject> {
    const res = await ApiClient.request<PortfolioProject>(`/api/v1/portfolio/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(this.withExpectedVersion(updates))
    });
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to update project');
    }
    this.captureVersion(res);
    return res.data;
  }

  static async deleteProject(id: string): Promise<void> {
    const res = await ApiClient.request(`/api/v1/portfolio/projects/${id}`, {
      method: 'DELETE',
      body: JSON.stringify(this.withExpectedVersion({}))
    });
    if (!res.success) {
      throw new Error(res.error?.message || 'Failed to delete project');
    }
    this.captureVersion(res);
  }

  static async updateHero(heroData: Partial<PortfolioHero>): Promise<PortfolioHero> {
    const res = await ApiClient.request<PortfolioHero>('/api/v1/portfolio/hero', {
      method: 'PUT',
      body: JSON.stringify(this.withExpectedVersion(heroData))
    });
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to update hero configuration');
    }
    this.captureVersion(res);
    return res.data;
  }

  static async updateShowcase(showcaseData: Partial<ShowcaseProject>): Promise<ShowcaseProject> {
    const res = await ApiClient.request<ShowcaseProject>('/api/v1/portfolio/showcase', {
      method: 'PUT',
      body: JSON.stringify(this.withExpectedVersion(showcaseData))
    });
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to update showcase configuration');
    }
    this.captureVersion(res);
    return res.data;
  }

  static async uploadVideo(file: File): Promise<{ filePath: string; originalName: string; size: number }> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await ApiClient.request<{ filePath: string; originalName: string; size: number }>('/api/v1/portfolio/upload', {
      method: 'POST',
      body: formData
    });

    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to upload video');
    }

    return res.data;
  }

  static async getAvailableVideos(): Promise<Array<{ label: string; path: string; filename: string }>> {
    const res = await ApiClient.request<Array<{ label: string; path: string; filename: string }>>('/api/v1/portfolio/videos');
    if (!res.success || !res.data) {
      return [
        { label: 'Video 1 — Showreel / Urban Mirage (4K HDR)', path: 'uploaded-video/no-1.mp4', filename: 'no-1.mp4' },
        { label: 'Video 2 — SUN ONLIGHT / Motorsport (4K HDR)', path: 'uploaded-video/no-2.mp4', filename: 'no-2.mp4' }
      ];
    }
    return res.data;
  }

  static async getNotifications(): Promise<NotificationsData> {
    const res = await ApiClient.request<NotificationsData>('/api/v1/portfolio/notifications');
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to fetch notifications');
    }
    return res.data;
  }

  static async updateNotifications(data: Partial<NotificationsData>): Promise<NotificationsData> {
    const res = await ApiClient.request<NotificationsData>('/api/v1/portfolio/notifications', {
      method: 'PUT',
      body: JSON.stringify(this.withExpectedVersion(data))
    });
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to update notifications');
    }
    this.captureVersion(res);
    return res.data;
  }
}
