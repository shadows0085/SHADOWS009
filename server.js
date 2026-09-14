const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const config = require('./backend/config/config');
const headers = require('./backend/security/headers');
const sessionAuth = require('./backend/security/sessionAuth');
const mediaRegistry = require('./backend/storage/mediaRegistry');
const apiRouter = require('./backend/api/router');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'video/ogg',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8'
};

const FRONTEND_DIST = path.join(__dirname, 'platform', 'frontend', 'dist');
const BACKEND_DIR = path.join(__dirname, 'platform', 'backend');
const BACKEND_PORT = process.env.BACKEND_PORT || 4000;
let backendProcess = null;

// Initialize encrypted assets in the private storage vault
mediaRegistry.initializeVaultAssets();

/**
 * Automatically launch Platform Backend if not already responding
 */
function startBackendService() {
  const checkReq = http.get(`http://127.0.0.1:${BACKEND_PORT}/api/v1/health`, (res) => {
    if (res.statusCode === 200) {
      console.log(`[Platform Backend] API Gateway linked on internal port ${BACKEND_PORT}`);
    }
  });

  checkReq.on('error', () => {
    console.log(`[Platform Backend] Launching internal API service on port ${BACKEND_PORT}...`);
    const distPath = path.join(BACKEND_DIR, 'dist', 'server.js');
    const hasDist = fs.existsSync(distPath);

    const cmd = process.platform === 'win32' ? 'node.exe' : 'node';
    const args = hasDist ? [distPath] : ['-r', 'ts-node/register', 'src/server.ts'];

    backendProcess = spawn(cmd, args, {
      cwd: BACKEND_DIR,
      env: {
        ...process.env,
        PORT: String(BACKEND_PORT),
        PORT_GATEWAY: String(config.PORT),
        DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
        JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'b8f043900810c76f1187959872f0be1e02ceda119ca3625211f20d7e460b29f4',
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || '86b0d020b8175fa205423835c8e52cbc0672f7498e7055e6cba2c018be7d7c8d',
        COOKIE_SECRET: process.env.COOKIE_SECRET || 'd039f23c7d850a3070e1627cfd07accfa65cf5f8ec2c16ca457a1de922acc9b0',
        STREAM_SIGNING_SECRET: process.env.STREAM_SIGNING_SECRET || '4d36ef6fd6bd808c51a032f3cc209cdee3a3db94fb975e681257e678a5c3e214'
      },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    backendProcess.stdout.on('data', (data) => {
      const msg = data.toString().trim();
      if (msg.includes('running on') || msg.includes('Health Endpoint')) {
        console.log(`[Platform Backend] ${msg}`);
      }
    });

    backendProcess.stderr.on('data', (data) => {
      const err = data.toString().trim();
      if (err) console.error(`[Platform Backend Error]: ${err}`);
    });

    backendProcess.on('exit', (code) => {
      console.log(`[Platform Backend] Process stopped with code ${code}`);
    });
  });
}

/**
 * Reverse-proxy API v1 requests to internal backend
 */
function proxyToBackend(req, res) {
  const options = {
    hostname: '127.0.0.1',
    port: BACKEND_PORT,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: `localhost:${config.PORT}`,
      'x-forwarded-host': req.headers.host || `localhost:${config.PORT}`,
      'x-forwarded-proto': 'http',
      'x-forwarded-for': req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1'
    }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('[Proxy Error to Backend]:', err.message);
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: { code: 'BACKEND_STARTING', message: 'Platform backend engine starting. Please refresh in a moment.' }
      }));
    }
  });

  req.pipe(proxyReq);
}

/**
 * Helper to stream a static file with appropriate headers
 */
function serveStaticFile(filePath, reqPath, res) {
  fs.stat(filePath, (err, stats) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`404 Not Found: ${reqPath}`);
      return;
    }

    let targetFile = filePath;
    if (stats.isDirectory()) {
      targetFile = path.join(filePath, 'index.html');
    }

    // Re-stat the resolved file to get correct Content-Length
    const sendFile = (fileStats) => {
      const ext = path.extname(targetFile).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, {
        'Content-Length': fileStats.size,
        'Content-Type': contentType,
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600'
      });

      fs.createReadStream(targetFile).pipe(res);
    };

    if (targetFile !== filePath) {
      // Directory was resolved to index.html — need fresh stat
      fs.stat(targetFile, (err2, fileStats) => {
        if (err2) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end(`404 Not Found: ${reqPath}`);
          return;
        }
        sendFile(fileStats);
      });
    } else {
      sendFile(stats);
    }
  });
}

const server = http.createServer(async (req, res) => {
  let parsedPath;
  try {
    parsedPath = decodeURI(req.url.split('?')[0]);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('400 Bad Request: Malformed URI');
    return;
  }
  const isAdminRoute = 
    parsedPath === '/admin' ||
    parsedPath.startsWith('/admin/') ||
    parsedPath === '/admin.html' ||
    parsedPath === '/login' ||
    parsedPath === '/dashboard' ||
    parsedPath === '/portfolio' ||
    parsedPath === '/site-control' ||
    parsedPath === '/editor' ||
    parsedPath === '/videos' ||
    parsedPath === '/upload' ||
    parsedPath === '/audit-logs' ||
    parsedPath === '/security' ||
    parsedPath === '/admins';

  // 1. Attach or initialize client session for security telemetry
  sessionAuth.attachOrInitSession(req, res);

  // 2. Apply hardened security headers (strict CSP and frame-ancestors none for admin)
  const isMediaReq = req.url.startsWith('/api/media/stream');
  headers.applySecurityHeaders(res, isMediaReq, isAdminRoute);

  // 3. Route /api/v1 directly to the unified platform backend
  if (req.url.startsWith('/api/v1')) {
    return proxyToBackend(req, res);
  }

  // 4. Route other /api requests to portfolio media/telemetry router
  if (req.url.startsWith('/api/')) {
    try {
      const handled = await apiRouter.handleApiRoutes(req, res);
      if (handled !== false) return;
    } catch (err) {
      console.error('[Server] API Error:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal Security Gateway Fault' }));
      return;
    }
  }

  // 5. Handle React Admin Platform routes & assets
  // 5a. Admin Built Assets: /admin/assets/*, /assets/*, /admin/shield.svg, /shield.svg
  if (
    parsedPath.startsWith('/admin/assets/') ||
    parsedPath === '/admin/shield.svg' ||
    parsedPath === '/shield.svg' ||
    (parsedPath.startsWith('/assets/') && fs.existsSync(path.join(FRONTEND_DIST, parsedPath)))
  ) {
    const relPath = parsedPath.startsWith('/admin/') ? parsedPath.replace(/^\/admin\//, '') : parsedPath.replace(/^\//, '');
    const assetFilePath = path.join(FRONTEND_DIST, relPath);
    if (fs.existsSync(assetFilePath)) {
      return serveStaticFile(assetFilePath, parsedPath, res);
    }
  }

  // 5b. Standalone SOC Telemetry Console: /soc or /admin.html
  if (parsedPath === '/admin.html' || parsedPath === '/soc') {
    const socPath = path.join(config.PUBLIC_DIR, 'admin.html');
    if (fs.existsSync(socPath)) {
      return serveStaticFile(socPath, '/admin.html', res);
    }
  }

  // 5c. React Admin Platform SPA: /admin, /admin/*, /login, /dashboard, etc.
  if (isAdminRoute) {
    const adminIndex = path.join(FRONTEND_DIST, 'index.html');
    if (fs.existsSync(adminIndex)) {
      return serveStaticFile(adminIndex, '/admin', res);
    }
    // Resilient fallback: if React frontend dist was not built or omitted by gitignore,
    // serve the standalone SOC Admin Console so /admin and /admin/login NEVER return 404
    const socFallback = path.join(config.PUBLIC_DIR, 'admin.html');
    if (fs.existsSync(socFallback)) {
      console.warn(`[Admin Gateway] React build not found at ${adminIndex}; serving standalone SOC console`);
      return serveStaticFile(socFallback, '/admin', res);
    }
  }

  // 6. Root Portfolio Website & Static Files
  let reqPath = parsedPath;
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(config.PUBLIC_DIR, safePath);

  // STRICT ACCESS CONTROL & ALLOWLIST
  const normalizedLower = safePath.toLowerCase().replace(/\\/g, '/');

  // Hard deny all sensitive internal files, databases, logs, source directories, and secrets
  if (
    normalizedLower.includes('.env') ||
    normalizedLower.includes('.db') ||
    normalizedLower.includes('.sqlite') ||
    normalizedLower.includes('node_modules') ||
    normalizedLower.includes('.git') ||
    normalizedLower.includes('package.json') ||
    normalizedLower.includes('package-lock.json') ||
    normalizedLower.includes('tsconfig') ||
    normalizedLower.includes('security_audit.log') ||
    normalizedLower.includes('audit.log') ||
    normalizedLower.includes('.log') ||
    normalizedLower.includes('.bak') ||
    normalizedLower.startsWith('/backend') ||
    normalizedLower.startsWith('/platform') ||
    normalizedLower.startsWith('/vault') ||
    normalizedLower.startsWith('/uploaded-video') || // Enforce streaming route only
    normalizedLower.endsWith('.ts') ||
    normalizedLower.endsWith('.tsx') ||
    normalizedLower.endsWith('.sql') ||
    normalizedLower.endsWith('.prisma')
  ) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Access Denied: Protected System Resource');
    return;
  }

  // Allowed public resources check (cross-platform with forward slashes)
  const isAllowedPublicResource =
    normalizedLower === '/index.html' ||
    normalizedLower === '/admin.html' ||
    normalizedLower === '/soc' ||
    normalizedLower === '/favicon.ico' ||
    normalizedLower.startsWith('/css/') ||
    normalizedLower.startsWith('/js/') ||
    normalizedLower.startsWith('/assets/') ||
    normalizedLower === '/data/videos.json';

  if (!isAllowedPublicResource) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
    return;
  }

  if (!filePath.startsWith(config.PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  serveStaticFile(filePath, reqPath, res);
});

// Graceful cleanup on termination
const cleanup = () => {
  if (backendProcess) {
    try {
      backendProcess.kill();
    } catch (_) {}
  }
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', () => {
  if (backendProcess) {
    try {
      backendProcess.kill();
    } catch (_) {}
  }
});

server.listen(config.PORT, () => {
  const url = `http://localhost:${config.PORT}`;
  console.log(`\n================================================================`);
  console.log(`  SHADOW Studio — Unified Single-Port Localhost Server`);
  console.log(`================================================================`);
  console.log(`  ► Portfolio Website:        ${url}`);
  console.log(`  ► React Admin Platform:     ${url}/admin`);
  console.log(`  ► Direct Admin Login:       ${url}/admin/login`);
  console.log(`  ► Unified API Gateway:      ${url}/api/v1`);
  console.log(`----------------------------------------------------------------`);
  console.log(`  Access Control: Secure Administrative Mode Enabled`);
  console.log(`  Log in via ${url}/admin`);
  console.log(`================================================================\n`);

  // Start platform backend helper
  startBackendService();
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const nextPort = Number(config.PORT) + 1;
    console.log(`Port ${config.PORT} in use, trying ${nextPort}...`);
    config.PORT = nextPort;
    process.env.PORT = String(nextPort);
    server.listen(nextPort);
  } else {
    console.error('Server error:', err);
  }
});
