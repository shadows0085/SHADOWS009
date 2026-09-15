import { handleStaticFallback } from './mockFallback';

export class ApiClient {
  private static accessToken: string | null = null;

  static setAccessToken(token: string | null) {
    this.accessToken = token;
    if (token) {
      sessionStorage.setItem('shd_access_token', token);
    } else {
      sessionStorage.removeItem('shd_access_token');
    }
  }

  static getAccessToken(): string | null {
    if (!this.accessToken) {
      this.accessToken = sessionStorage.getItem('shd_access_token');
    }
    return this.accessToken;
  }

  static async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; meta?: any; error?: any; version?: number }> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>)
    };

    const token = this.getAccessToken();
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      let response = await fetch(endpoint, {
        ...options,
        headers,
        credentials: 'include' // Always transmit HttpOnly SameSite cookies
      });

      // If token expired (401), attempt silent token refresh
      if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
        const refreshed = await this.silentRefresh();
        if (refreshed) {
          headers['Authorization'] = `Bearer ${this.getAccessToken()}`;
          response = await fetch(endpoint, {
            ...options,
            headers,
            credentials: 'include'
          });
        }
      }

      const json = await response.json().catch(() => ({}));

      if (!response.ok) {
        // Resilient fallback for static CDNs (Netlify, Vercel, Live Server) when no backend is deployed
        if (response.status === 404) {
          const fallback = await handleStaticFallback(endpoint, options);
          if (fallback) return fallback as any;
        }

        return {
          success: false,
          error: json.error || { code: 'HTTP_ERROR', message: `Request failed with status ${response.status}` }
        };
      }

      return json;
    } catch (err: any) {
      // Offline / Network fallback for static hosts
      const fallback = await handleStaticFallback(endpoint, options);
      if (fallback) return fallback as any;

      return {
        success: false,
        error: { code: 'NETWORK_ERROR', message: err.message || 'Network connection failure' }
      };
    }
  }

  private static async silentRefresh(): Promise<boolean> {
    try {
      const res = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!res.ok) {
        this.setAccessToken(null);
        return false;
      }

      const json = await res.json();
      if (json.success && json.data?.accessToken) {
        this.setAccessToken(json.data.accessToken);
        return true;
      }
      return false;
    } catch {
      this.setAccessToken(null);
      return false;
    }
  }
}
