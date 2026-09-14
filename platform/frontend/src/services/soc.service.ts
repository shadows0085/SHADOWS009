import { ApiClient } from './api';

export interface SocTelemetry {
  metrics: {
    totalStreams: number;
    activeStreams: number;
    blockedAttempts: number;
    devtoolsTriggers: number;
    rateLimitViolations: number;
    honeypotHits: number;
  };
  activeSessions: Array<{
    id: string;
    role: string;
    clientIp: string;
    lastSeen: string;
    ticketsIssued: number;
    expiresAt: string;
  }>;
  activeTickets: Array<{
    token: string;
    assetId: string;
    sessionId: string;
    clientIp: string;
    expiresAt: string;
  }>;
  systemTime: string;
}

export class SocService {
  static async getTelemetry(): Promise<SocTelemetry> {
    const res = await ApiClient.request<SocTelemetry>('/api/v1/soc/telemetry');
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to fetch SOC telemetry');
    }
    return res.data;
  }

  static async triggerKillswitch(): Promise<string> {
    const res = await ApiClient.request<{ message: string }>('/api/v1/soc/killswitch', {
      method: 'POST'
    });
    if (!res.success) {
      throw new Error(res.error?.message || 'Failed to execute killswitch');
    }
    return (res as any).message || 'Killswitch executed successfully.';
  }
}
