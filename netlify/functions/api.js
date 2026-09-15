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
          activeStreams: 3,
          blockedAttempts: 0,
          devToolsTriggers: 0,
          recentEvents: [
            {
              timestamp: new Date().toLocaleTimeString(),
              type: 'AUTHENTICATION_SUCCESS',
              details: 'Netlify Vault Session active'
            }
          ]
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
