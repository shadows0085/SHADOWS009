// Netlify Serverless Function for SHADOW Vault API
// Handles /api/v1/* requests directly in Netlify without requiring an external server

exports.handler = async (event, context) => {
  const method = event.httpMethod;
  const path = event.path.replace(/\/\.netlify\/functions\/api/, '').replace(/^\/api\/v1/, '');

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  if (method === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  // Auth: Login
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

  // Auth: Me
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
            permissions: ['*']
          }
        }
      })
    };
  }

  // Health check
  if (path === '/health') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ status: 'ok', environment: 'netlify-serverless' })
    };
  }

  // Videos Metrics
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

  // Audit Logs
  if (path.startsWith('/audit-logs')) {
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

  // SOC Telemetry
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

  // Portfolio CMS
  if (path === '/portfolio') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: {
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
        }
      })
    };
  }

  // Default fallback for any other v1 endpoint
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ success: true, data: {} })
  };
};
