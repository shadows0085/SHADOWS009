// Netlify Serverless Function for SHADOW Vault API
// Provides complete mocked serverless API endpoints for Netlify deployments

const DEFAULT_PORTFOLIO = {
  version: 1,
  hero: {
    src: 'assets/hero.mp4',
    assetId: 'hero-vid-01',
    type: 'video/mp4',
    label: 'Cinematic Reel 2026',
    badge: '4K ULTRA-HD'
  },
  showcase: {
    title: 'CYBERPUNK NEON 2026',
    plainTitle: 'CYBERPUNK NEON 2026',
    assetId: 'showcase-01',
    file: 'assets/showcase.mp4',
    category: 'Commercial VFX',
    badge: 'HDR10 MASTER',
    description: 'High-octane commercial motion design with custom GPU particles and anamorphic optics.',
    productionTime: '3 Weeks',
    locations: 'Tokyo / Virtual Stage'
  },
  portfolio: [
    {
      id: 'proj-1',
      file: 'uploaded-video/project1.mp4',
      title: 'Neon Odyssey',
      category: 'commercial',
      cat_label: 'Commercial VFX',
      meta: '4K UHD • 60 FPS • Rec.709'
    },
    {
      id: 'proj-2',
      file: 'uploaded-video/project2.mp4',
      title: 'Quantum Drift',
      category: 'motion',
      cat_label: 'Motion Design',
      meta: 'Color Graded • Dolby Vision'
    },
    {
      id: 'proj-3',
      file: 'uploaded-video/project3.mp4',
      title: 'Chronos Engine',
      category: 'cinematic',
      cat_label: 'Cinematic Narrative',
      meta: 'Anamorphic 2.39:1 • ProRes 4444'
    }
  ],
  projects: [
    {
      id: 'proj-1',
      file: 'uploaded-video/project1.mp4',
      title: 'Neon Odyssey',
      category: 'commercial',
      cat_label: 'Commercial VFX',
      meta: '4K UHD • 60 FPS • Rec.709'
    },
    {
      id: 'proj-2',
      file: 'uploaded-video/project2.mp4',
      title: 'Quantum Drift',
      category: 'motion',
      cat_label: 'Motion Design',
      meta: 'Color Graded • Dolby Vision'
    },
    {
      id: 'proj-3',
      file: 'uploaded-video/project3.mp4',
      title: 'Chronos Engine',
      category: 'cinematic',
      cat_label: 'Cinematic Narrative',
      meta: 'Anamorphic 2.39:1 • ProRes 4444'
    }
  ],
  notifications: {
    activeId: 'notif-1',
    globalEnabled: true,
    items: [
      {
        id: 'notif-1',
        enabled: true,
        title: 'Q3 Commissions Open',
        message: 'Now accepting bookings for high-end motion design and video editing projects.',
        badge: 'STATUS',
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
        data: [
          { label: 'Video 1 — Showreel (4K HDR)', path: 'uploaded-video/project1.mp4' },
          { label: 'Video 2 — Quantum Drift (4K HDR)', path: 'uploaded-video/project2.mp4' }
        ]
      })
    };
  }

  // 10. File Editor
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
