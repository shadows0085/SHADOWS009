// Resilient Offline & Static Hosting Fallback for SHADOW Vault
// Automatically activates when deployed on static CDNs (Netlify, Vercel, GitHub Pages) without an active Node.js backend

const STORAGE_PREFIX = 'shd_vault_';

function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch {}
}

const REAL_VIDEOS_FALLBACK = [
  { label: 'Video 1 — Showreel / Urban Mirage (4K HDR)', path: 'uploaded-video/no-1.mp4' },
  { label: 'Video 2 — Amber Hours / SUN ONLIGHT (4K HDR)', path: 'uploaded-video/no-2.mp4' },
  { label: 'Custom 1 — Sunset Ocean Showreel (4K HDR)', path: 'uploaded-video/custom_mtyi0ot5_Man_looking_at_ocean_sunset_20260911231855.mp4' },
  { label: 'Custom 2 — Urban Mirage Showcase (1080p)', path: 'uploaded-video/custom_mtykrpr1_betufull_places_showing_1080p_20260912120058.mp4' },
  { label: 'Custom 3 — Motion Designer Creating Shadow (VFX)', path: 'uploaded-video/custom_mtycguww_Motion_designer_creating_Shadow_____20260910152753.mp4' },
  { label: 'Custom 4 — Silent Waters Nordic Reel (1080p)', path: 'uploaded-video/custom_mtxz93i8_betufull_places_showing_1080p_20260912120058.mp4' },
  { label: 'Custom 5 — Velocity Launch Campaign (1080p)', path: 'uploaded-video/custom_mtydc5of_betufull_places_showing_1080p_20260912120058.mp4' },
  { label: 'Custom 6 — Neon Reverie Tokyo Reel (4K)', path: 'uploaded-video/custom_mtxxwlrt_Man_looking_at_ocean_sunset_20260911231855.mp4' }
];

const SAMPLE_PROJECTS = [
  {
    id: 'project-urban-mirage',
    assetId: 'asset-urban-mirage',
    file: 'uploaded-video/no-1.mp4',
    title: 'Urban Mirage',
    category: 'commercial',
    cat_label: 'Commercial · 4K HDR',
    meta: 'Real Estate Campaign — 2024',
    size: 'card-lg'
  },
  {
    id: 'project-sun-onlight',
    assetId: 'asset-sun-onlight',
    file: 'uploaded-video/custom_mtycguww_Motion_designer_creating_Shadow_____20260910152753.mp4',
    title: 'SUN ONLIGHT',
    category: 'commercial',
    cat_label: 'Commercial · 4K HDR',
    meta: 'Solar Energy Campaign — 2025',
    size: 'card-sm'
  },
  {
    id: 'project-silent-waters',
    assetId: 'asset-silent-waters',
    file: 'uploaded-video/custom_mtxz93i8_betufull_places_showing_1080p_20260912120058.mp4',
    title: 'Silent Waters',
    category: 'film',
    cat_label: 'Film · 4K DCI HDR',
    meta: 'Nordic Narrative Short — 2025',
    size: 'card-sm'
  },
  {
    id: 'project-amber-hours',
    assetId: 'asset-amber-hours',
    file: 'uploaded-video/no-2.mp4',
    title: 'Amber Hours',
    category: 'motion',
    cat_label: 'Motion · 4K 60FPS',
    meta: 'Luxury Horology Film — 2024',
    size: 'card-lg'
  },
  {
    id: 'project-velocity',
    assetId: 'asset-velocity',
    file: 'uploaded-video/custom_mtydc5of_betufull_places_showing_1080p_20260912120058.mp4',
    title: 'Velocity',
    category: 'vfx',
    cat_label: 'VFX · Super Slow-Mos',
    meta: 'Motorsport Launch — 2025',
    size: 'card-md'
  },
  {
    id: 'project-neon-reverie',
    assetId: 'asset-neon-reverie',
    file: 'uploaded-video/custom_mtxxwlrt_Man_looking_at_ocean_sunset_20260911231855.mp4',
    title: 'Neon Reverie',
    category: 'motion',
    cat_label: 'Motion · Cybernetic Flow',
    meta: 'Tokyo Nocturne Showcase — 2025',
    size: 'card-md'
  }
];

const DEFAULT_PORTFOLIO_DATA = {
  version: 8,
  hero: {
    src: 'uploaded-video/custom_mtyi0ot5_Man_looking_at_ocean_sunset_20260911231855.mp4',
    assetId: 'asset-hero-showreel',
    type: 'video',
    label: 'Showreel 2026',
    badge: '◆ 4K HDR'
  },
  showcase: {
    title: '<em>Urban</em><br>Mirage',
    plainTitle: 'Urban Mirage 2026',
    assetId: 'asset-showcase-featured',
    file: 'uploaded-video/custom_mtykrpr1_betufull_places_showing_1080p_20260912120058.mp4',
    category: 'Commercial · 4K HDR',
    badge: 'Featured',
    description: 'An architectural visual symphony — this commercial campaign captured the interplay of light, glass, and geometric symmetry through precision cinematography and master color grading.',
    productionTime: '4 wks',
    locations: '2 cities',
    resolution: '4K HDR',
    duration: '2:34 / 4:12',
    progress: '61%'
  },
  portfolio: SAMPLE_PROJECTS,
  projects: SAMPLE_PROJECTS,
  notifications: {
    activeId: 'notif-1',
    globalEnabled: true,
    items: [
      {
        id: 'notif-1',
        enabled: true,
        title: 'Open for Bookings',
        message: 'Now accepting commercial video editing & motion design projects for 2025/2026.',
        badge: 'AVAILABLE',
        type: 'gold'
      }
    ]
  }
};

export async function handleStaticFallback(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: any; error?: any; meta?: any } | null> {
  const method = (options.method || 'GET').toUpperCase();
  const url = endpoint.replace(/^\/api\/v1/, '').split('?')[0];

  // 1. Auth Login
  if (url === '/auth/login' && method === 'POST') {
    let email = 'shadows0085@gmail.com';
    try {
      if (options.body) {
        const parsed = JSON.parse(options.body as string);
        if (parsed.email) email = parsed.email;
      }
    } catch {}

    const admin = {
      id: '5711fdab-6785-4ca3-9a45-97d0554252aa',
      email: email.toLowerCase().trim(),
      name: 'Master Architect',
      role: 'SUPER_ADMIN',
      permissions: ['*'],
      isActive: true,
      lastLoginAt: new Date().toISOString()
    };

    setStored('current_admin', admin);

    return {
      success: true,
      data: {
        admin,
        accessToken: 'shd_vault_static_token_' + Date.now(),
        expiresInSeconds: 86400
      }
    };
  }

  // 2. Auth Me
  if (url === '/auth/me') {
    const admin = getStored('current_admin', {
      id: '5711fdab-6785-4ca3-9a45-97d0554252aa',
      email: 'shadows0085@gmail.com',
      name: 'Master Architect',
      role: 'SUPER_ADMIN',
      permissions: ['*']
    });
    return {
      success: true,
      data: { admin }
    };
  }

  // 3. Auth Logout
  if (url === '/auth/logout') {
    return { success: true };
  }

  // 4. Videos Metrics
  if (url === '/videos/metrics') {
    return {
      success: true,
      data: {
        totalVideos: 12,
        publishedVideos: 9,
        draftVideos: 3,
        archivedVideos: 0,
        totalStorageBytes: 4294967296
      }
    };
  }

  // 5. Video list
  if (url === '/videos') {
    return {
      success: true,
      data: [
        {
          id: 'vid-1',
          title: 'Cinematic Showreel 2026',
          slug: 'cinematic-showreel-2026',
          storageKey: 'vault_showreel_2026.mp4',
          mimeType: 'video/mp4',
          fileSize: 104857600,
          duration: 120,
          uploadedBy: '5711fdab-6785-4ca3-9a45-97d0554252aa',
          status: 'PUBLISHED',
          visibility: 'PUBLIC',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    };
  }

  // 6. Audit Logs
  if (url === '/audit-logs') {
    return {
      success: true,
      data: [
        {
          id: 'log-1',
          action: 'VAULT_ADMIN_AUTHENTICATED',
          resourceType: 'Admin',
          resourceId: '5711fdab-6785-4ca3-9a45-97d0554252aa',
          createdAt: new Date().toISOString(),
          admin: {
            id: '5711fdab-6785-4ca3-9a45-97d0554252aa',
            name: 'Master Architect',
            email: 'shadows0085@gmail.com',
            role: 'SUPER_ADMIN'
          }
        }
      ],
      meta: { page: 1, limit: 20, total: 1, totalPages: 1 }
    };
  }

  // 7. SOC Telemetry
  if (url === '/soc/telemetry') {
    return {
      success: true,
      data: {
        metrics: {
          totalStreams: 12,
          activeStreams: 3,
          blockedAttempts: 0,
          devtoolsTriggers: 0,
          rateLimitViolations: 0,
          honeypotHits: 0
        },
        activeSessions: [],
        activeTickets: [],
        systemTime: new Date().toISOString()
      }
    };
  }

  // 8. Portfolio CMS
  if (url === '/portfolio' && method === 'GET') {
    const data = getStored('portfolio_data', DEFAULT_PORTFOLIO_DATA);
    return { success: true, data };
  }

  if (url === '/portfolio/projects' && method === 'POST') {
    try {
      const newProj = JSON.parse(options.body as string);
      const data = getStored('portfolio_data', DEFAULT_PORTFOLIO_DATA);
      newProj.id = 'proj-' + Date.now();
      if (!data.portfolio) data.portfolio = [];
      data.portfolio.push(newProj);
      if (!data.projects) data.projects = [];
      data.projects.push(newProj);
      setStored('portfolio_data', data);
      return { success: true, data: newProj };
    } catch {
      return { success: true, data: options.body };
    }
  }

  if (url === '/portfolio/hero' && method === 'POST') {
    try {
      const hero = JSON.parse(options.body as string);
      const data = getStored('portfolio_data', DEFAULT_PORTFOLIO_DATA);
      data.hero = hero;
      setStored('portfolio_data', data);
      return { success: true, data: hero };
    } catch {
      return { success: true };
    }
  }

  if (url === '/portfolio/showcase' && method === 'POST') {
    try {
      const showcase = JSON.parse(options.body as string);
      const data = getStored('portfolio_data', DEFAULT_PORTFOLIO_DATA);
      data.showcase = showcase;
      setStored('portfolio_data', data);
      return { success: true, data: showcase };
    } catch {
      return { success: true };
    }
  }

  if (url === '/portfolio/notifications' && method === 'GET') {
    const data = getStored('portfolio_data', DEFAULT_PORTFOLIO_DATA);
    return { success: true, data: data.notifications };
  }

  if (url === '/portfolio/notifications' && method === 'PUT') {
    try {
      const notifs = JSON.parse(options.body as string);
      const data = getStored('portfolio_data', DEFAULT_PORTFOLIO_DATA);
      data.notifications = notifs;
      setStored('portfolio_data', data);
      return { success: true, data: notifs };
    } catch {
      return { success: true };
    }
  }

  // 9. Admin List
  if (url === '/admins') {
    return {
      success: true,
      data: [
        {
          id: '5711fdab-6785-4ca3-9a45-97d0554252aa',
          email: 'shadows0085@gmail.com',
          name: 'Master Architect',
          role: 'SUPER_ADMIN',
          permissions: ['*'],
          isActive: true
        }
      ]
    };
  }

  // 10. Sessions
  if (url === '/auth/sessions') {
    return {
      success: true,
      data: {
        sessions: [
          {
            id: 'sess-1',
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 86400000).toISOString(),
            userAgent: navigator.userAgent
          }
        ]
      }
    };
  }

  // 11. Portfolio Videos
  if (url === '/portfolio/videos') {
    return {
      success: true,
      data: REAL_VIDEOS_FALLBACK
    };
  }

  // 11b. Video Ticket
  if (url.match(/^\/videos\/[^/]+\/ticket$/)) {
    return {
      success: true,
      data: {
        streamUrl: '/uploaded-video/no-1.mp4',
        ttlSeconds: 300
      }
    };
  }

  // 12. File Editor Tree
  if (url === '/files/tree') {
    return {
      success: true,
      data: [
        { name: 'index.html', path: 'index.html', isDir: false },
        { name: 'css', path: 'css', isDir: true, children: [
          { name: 'style.css', path: 'css/style.css', isDir: false }
        ]},
        { name: 'js', path: 'js', isDir: true, children: [
          { name: 'main.js', path: 'js/main.js', isDir: false }
        ]}
      ]
    };
  }

  if (url === '/files/read') {
    return {
      success: true,
      data: {
        content: '<!-- SHADOW Studio Core Asset -->\n<!DOCTYPE html>\n<html>\n  <head><title>SHADOW</title></head>\n  <body></body>\n</html>',
        path: 'index.html'
      }
    };
  }

  return { success: true, data: [] };
}
