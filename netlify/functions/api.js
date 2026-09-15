// Netlify Serverless Function for SHADOW Vault API
// Provides complete mocked serverless API endpoints for Netlify deployments

const REAL_VIDEOS = [
  { label: 'Video 1 — Showreel / Urban Mirage (4K HDR)', path: 'uploaded-video/no-1.mp4' },
  { label: 'Video 2 — Amber Hours / SUN ONLIGHT (4K HDR)', path: 'uploaded-video/no-2.mp4' },
  { label: 'Custom 1 — Sunset Ocean Showreel (4K HDR)', path: 'uploaded-video/custom_mtyi0ot5_Man_looking_at_ocean_sunset_20260911231855.mp4' },
  { label: 'Custom 2 — Urban Mirage Showcase (1080p)', path: 'uploaded-video/custom_mtykrpr1_betufull_places_showing_1080p_20260912120058.mp4' },
  { label: 'Custom 3 — Motion Designer Creating Shadow (VFX)', path: 'uploaded-video/custom_mtycguww_Motion_designer_creating_Shadow_____20260910152753.mp4' },
  { label: 'Custom 4 — Silent Waters Nordic Reel (1080p)', path: 'uploaded-video/custom_mtxz93i8_betufull_places_showing_1080p_20260912120058.mp4' },
  { label: 'Custom 5 — Velocity Launch Campaign (1080p)', path: 'uploaded-video/custom_mtydc5of_betufull_places_showing_1080p_20260912120058.mp4' },
  { label: 'Custom 6 — Neon Reverie Tokyo Reel (4K)', path: 'uploaded-video/custom_mtxxwlrt_Man_looking_at_ocean_sunset_20260911231855.mp4' }
];

function resolveAssetToVideoUrl(assetId) {
  if (!assetId) return '/uploaded-video/no-1.mp4';
  const clean = String(assetId).replace(/^\/+/, '').trim();
  if (clean.startsWith('uploaded-video/')) return `/${clean}`;
  if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;

  if (clean === 'asset-hero-showreel' || clean === 'assets/hero.mp4' || clean === 'hero-vid-01') {
    return '/uploaded-video/custom_mtyi0ot5_Man_looking_at_ocean_sunset_20260911231855.mp4';
  }
  if (clean === 'asset-showcase-featured' || clean === 'asset-showcase' || clean === 'assets/showcase.mp4' || clean === 'showcase-01') {
    return '/uploaded-video/custom_mtykrpr1_betufull_places_showing_1080p_20260912120058.mp4';
  }
  if (clean === 'asset-urban-mirage' || clean === 'project-urban-mirage' || clean === 'proj-1' || clean === 'uploaded-video/project1.mp4') {
    return '/uploaded-video/no-1.mp4';
  }
  if (clean === 'asset-sun-onlight' || clean === 'project-sun-onlight') {
    return '/uploaded-video/custom_mtycguww_Motion_designer_creating_Shadow_____20260910152753.mp4';
  }
  if (clean === 'asset-silent-waters' || clean === 'project-silent-waters') {
    return '/uploaded-video/custom_mtxz93i8_betufull_places_showing_1080p_20260912120058.mp4';
  }
  if (clean === 'asset-amber-hours' || clean === 'project-amber-hours' || clean === 'proj-2' || clean === 'uploaded-video/project2.mp4') {
    return '/uploaded-video/no-2.mp4';
  }
  if (clean === 'asset-velocity' || clean === 'project-velocity') {
    return '/uploaded-video/custom_mtydc5of_betufull_places_showing_1080p_20260912120058.mp4';
  }
  if (clean === 'asset-neon-reverie' || clean === 'project-neon-reverie') {
    return '/uploaded-video/custom_mtxxwlrt_Man_looking_at_ocean_sunset_20260911231855.mp4';
  }
  if (clean === 'proj-3' || clean === 'uploaded-video/project3.mp4') {
    return '/uploaded-video/custom_mtycguww_Motion_designer_creating_Shadow_____20260910152753.mp4';
  }

  return '/uploaded-video/no-1.mp4';
}

const DEFAULT_PORTFOLIO = {
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
  portfolio: [
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
  ],
  projects: [
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
  ],
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

exports.handler = async (event, context) => {
  const method = event.httpMethod;
  const rawPath = event.path.replace(/\/\.netlify\/functions\/api/, '').replace(/^\/api\/v1/, '');
  const path = rawPath.split('?')[0];

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  if (method === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  // 1. Auth: Login
  if (path === '/auth/login' && method === 'POST') {
    let email = 'shadows0085@gmail.com';
    try {
      if (event.body) {
        const body = JSON.parse(event.body);
        if (body.email) email = body.email;
      }
    } catch (_) {}

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: {
          admin: {
            id: '5711fdab-6785-4ca3-9a45-97d0554252aa',
            email: email.toLowerCase().trim(),
            name: 'Master Architect',
            role: 'SUPER_ADMIN',
            permissions: ['*'],
            isActive: true,
            lastLoginAt: new Date().toISOString()
          },
          accessToken: 'shd_vault_live_token_' + Date.now(),
          expiresInSeconds: 86400
        }
      })
    };
  }

  // 2. Auth: Me
  if (path === '/auth/me') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: {
          admin: {
            id: '5711fdab-6785-4ca3-9a45-97d0554252aa',
            email: 'shadows0085@gmail.com',
            name: 'Master Architect',
            role: 'SUPER_ADMIN',
            permissions: ['*'],
            isActive: true
          }
        }
      })
    };
  }

  // 3. Auth: Sessions
  if (path === '/auth/sessions') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: {
          sessions: [
            {
              id: 'sess-1',
              createdAt: new Date().toISOString(),
              expiresAt: new Date(Date.now() + 86400000).toISOString(),
              userAgent: event.headers['user-agent'] || 'Admin Browser Session'
            }
          ]
        }
      })
    };
  }

  // 4. Videos Metrics
  if (path === '/videos/metrics') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: {
          totalVideos: 12,
          publishedVideos: 9,
          draftVideos: 3,
          archivedVideos: 0,
          totalStorageBytes: 4294967296
        }
      })
    };
  }

  // 5. Videos List
  if (path === '/videos') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
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
          },
          {
            id: 'vid-2',
            title: 'Commercial Motion VFX',
            slug: 'commercial-motion-vfx',
            storageKey: 'vault_motion_vfx.mp4',
            mimeType: 'video/mp4',
            fileSize: 209715200,
            duration: 90,
            uploadedBy: '5711fdab-6785-4ca3-9a45-97d0554252aa',
            status: 'PUBLISHED',
            visibility: 'PUBLIC',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        meta: { page: 1, limit: 10, total: 2, totalPages: 1 }
      })
    };
  }

  // 6. Audit Logs
  if (path === '/audit-logs') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
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
      })
    };
  }

  // 7. Admins Team List
  if (path === '/admins') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: [
          {
            id: '5711fdab-6785-4ca3-9a45-97d0554252aa',
            email: 'shadows0085@gmail.com',
            name: 'Master Architect',
            role: 'SUPER_ADMIN',
            permissions: ['*'],
            isActive: true,
            createdAt: new Date().toISOString()
          }
        ]
      })
    };
  }

  // 8. SOC Telemetry
  if (path === '/soc/telemetry') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
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
      })
    };
  }

  // 9. Portfolio CMS
  if (path === '/portfolio') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: DEFAULT_PORTFOLIO
      })
    };
  }

  if (path === '/portfolio/notifications') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: DEFAULT_PORTFOLIO.notifications
      })
    };
  }

  if (path === '/portfolio/videos') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: REAL_VIDEOS
      })
    };
  }

  // 10. Media Preview Streaming: /media/preview/:assetId and /api/media/preview/:assetId
  if (path.startsWith('/media/preview/')) {
    const rawAsset = path.replace('/media/preview/', '');
    const assetId = decodeURIComponent(rawAsset).trim();
    const resolvedUrl = resolveAssetToVideoUrl(assetId);
    return {
      statusCode: 302,
      headers: {
        'Location': resolvedUrl,
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*'
      },
      body: ''
    };
  }

  // 11. Media Ticket Issuance for Secure Viewer: /media/ticket and /api/media/ticket
  if (path === '/media/ticket' && method === 'POST') {
    let assetId = 'asset-urban-mirage';
    try {
      if (event.body) {
        const b = JSON.parse(event.body);
        if (b.assetId) assetId = b.assetId;
      }
    } catch (_) {}

    const streamUrl = resolveAssetToVideoUrl(assetId);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        streamUrl: streamUrl,
        expiresAt: Date.now() + 86400000,
        ttlSeconds: 86400,
        watermark: {
          sessionLabel: 'SESSION: NETLIFY-VAULT',
          timestamp: new Date().toISOString(),
          brand: 'SHADOW SECURE VAULT',
          tier: 'none'
        }
      })
    };
  }

  // 12. Media Stream: /media/stream/:token
  if (path.startsWith('/media/stream/')) {
    return {
      statusCode: 302,
      headers: {
        'Location': '/uploaded-video/no-1.mp4',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*'
      },
      body: ''
    };
  }

  // 13. Video Player Modal Ticket: /videos/:id/ticket
  if (path.match(/^\/videos\/[^/]+\/ticket$/)) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: {
          streamUrl: '/uploaded-video/no-1.mp4',
          ttlSeconds: 300
        }
      })
    };
  }

  // 14. File Editor
  if (path === '/files/tree') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
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
      })
    };
  }

  // Default fallback for any other endpoint
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ success: true, data: [] })
  };
};
