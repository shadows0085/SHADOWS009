const url = require('url');
const crypto = require('crypto');
const config = require('../config/config');
const signedUrl = require('../security/signedUrl');
const sessionAuth = require('../security/sessionAuth');
const rateLimiter = require('../security/rateLimiter');
const mediaRegistry = require('../storage/mediaRegistry');
const auditLogger = require('../services/auditLogger');
const mediaService = require('../services/mediaService');

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate'
  });
  res.end(JSON.stringify(data));
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1e6) { // 1MB limit
        req.connection.destroy();
        reject(new Error('Body payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

/**
 * Main API request dispatcher
 */
async function handleApiRoutes(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;
  const ip = req.socket.remoteAddress || '127.0.0.1';
  const ua = req.headers['user-agent'] || 'unknown';

  // 1. Honeypots & Automated Scraper Trap
  if (
    pathname === '/api/v1/assets/download-all' ||
    pathname === '/.git/config' ||
    pathname === '/backup.zip' ||
    pathname === '/wp-login.php'
  ) {
    rateLimiter.quarantineIp(ip, config.RATE_LIMITS.HONEYPOT_PENALTY_MS, 'HONEYPOT_HIT');
    auditLogger.logSecurityEvent({
      type: 'HONEYPOT_TRIGGERED',
      ip,
      sessionId: req.session ? req.session.id : 'unknown',
      details: { path: pathname, method, ua },
      severity: 'CRITICAL'
    });
    return sendJson(res, 403, { error: 'Automated scraping activity flagged. Access denied.', code: 'IP_QUARANTINED' });
  }

  // 2. Global Rate Limiter check
  const rateCheck = rateLimiter.applyApiLimiter(req);
  if (!rateCheck.allowed) {
    auditLogger.logSecurityEvent({
      type: 'RATE_LIMIT_EXCEEDED',
      ip,
      sessionId: req.session ? req.session.id : 'unknown',
      details: { retryAfter: rateCheck.retryAfter },
      severity: 'WARN'
    });
    res.setHeader('Retry-After', rateCheck.retryAfter || 30);
    return sendJson(res, 429, {
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please throttle your queries.',
      retryAfter: rateCheck.retryAfter || 30
    });
  }

  // 3. Public Project Metadata List
  if (pathname === '/api/projects' && method === 'GET') {
    const assets = mediaRegistry.listPublicMetadata();
    return sendJson(res, 200, {
      projects: assets,
      session: {
        id: req.session.id,
        role: req.session.role,
        watermarkTag: `SES-${req.session.id.slice(4, 10)}`
      }
    });
  }

  // 4. Session Handshake & Challenge Info
  if (pathname === '/api/session/status' && method === 'GET') {
    return sendJson(res, 200, {
      sessionId: req.session.id,
      role: req.session.role,
      ipPrefix: ip.split('.').slice(0, 2).join('.') + '.***.***',
      activeUntil: new Date(req.session.expiresAt).toISOString(),
      watermarkConfig: config.WATERMARK
    });
  }

  // 5. Protected Media Ticket Issuance
  if (pathname === '/api/media/ticket' && method === 'POST') {
    const ticketRate = rateLimiter.applyTicketLimiter(req);
    if (!ticketRate.allowed) {
      auditLogger.logSecurityEvent({
        type: 'TICKET_RATE_EXCEEDED',
        ip,
        sessionId: req.session.id,
        severity: 'WARN'
      });
      return sendJson(res, 429, { error: 'Ticket request frequency limit reached. Retry in a few moments.' });
    }

    try {
      const body = await parseJsonBody(req);
      const assetId = body.assetId;
      const asset = mediaRegistry.getAssetById(assetId);

      if (!asset) {
        auditLogger.logSecurityEvent({
          type: 'INVALID_ASSET_REQUEST',
          ip,
          sessionId: req.session.id,
          details: { requestedAssetId: assetId },
          severity: 'WARN'
        });
        return sendJson(res, 404, { error: 'Asset not found or access unauthorized' });
      }

      // Generate HMAC-SHA256 signed ticket
      const ticket = signedUrl.createMediaTicket({
        assetId: asset.id,
        sessionId: req.session.id,
        clientIp: ip,
        userAgent: ua
      });

      req.session.ticketsIssued++;

      auditLogger.logSecurityEvent({
        type: 'MEDIA_TICKET_ISSUED',
        ip,
        sessionId: req.session.id,
        assetId: asset.id,
        details: { ttlSeconds: ticket.ttlSeconds },
        severity: 'INFO'
      });

      return sendJson(res, 200, {
        success: true,
        streamUrl: `/api/media/stream/${ticket.token}`,
        expiresAt: ticket.expiresAt,
        ttlSeconds: ticket.ttlSeconds,
        watermark: {
          sessionLabel: `SESSION: ${req.session.id.slice(0, 12)}`,
          timestamp: new Date().toISOString(),
          brand: config.WATERMARK.TEXT_PREFIX,
          tier: asset.watermarkTier
        }
      });
    } catch (err) {
      return sendJson(res, 400, { error: 'Invalid JSON payload' });
    }
  }

  // 6. Security Event Telemetry from Client (DevTools detections, blur events, screenshot attempts)
  if (pathname === '/api/security/event' && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const eventType = body.eventType || 'CLIENT_SECURITY_ALERT';
      auditLogger.logSecurityEvent({
        type: eventType,
        ip,
        sessionId: req.session.id,
        details: body.details || {},
        severity: body.severity || 'WARN'
      });
      return sendJson(res, 200, { status: 'acknowledged' });
    } catch (err) {
      return sendJson(res, 400, { error: 'Invalid telemetry' });
    }
  }

  // 7. Admin Telemetry & Incident Center
  // Human administration is handled exclusively by the React portal at
  // /api/v1/auth. These root-server controls are only for that portal's
  // authenticated backend-to-gateway SOC bridge.
  if (pathname.startsWith('/api/admin/')) {
    const isLoopback = (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1');
    // Constant-time comparison to prevent timing side-channel attacks on the internal token
    let isTokenMatch = false;
    const internalToken = req.headers['x-internal-token'];
    if (typeof internalToken === 'string' && typeof config.SECRET_KEY === 'string' && internalToken.length === config.SECRET_KEY.length) {
      try {
        isTokenMatch = crypto.timingSafeEqual(Buffer.from(internalToken), Buffer.from(config.SECRET_KEY));
      } catch (_) { isTokenMatch = false; }
    }
    const isInternalAuth = isTokenMatch || (isLoopback && req.headers['x-requested-by'] === 'platform-backend');

    // Login endpoint for standalone SOC dashboard
    if (pathname === '/api/admin/login' && method === 'POST') {
      try {
        const body = await parseJsonBody(req);
        const username = body.username ? String(body.username).trim() : '';
        const password = body.password ? String(body.password) : '';

        if (!username || !password) {
          return sendJson(res, 400, { error: 'Username and password are required.' });
        }

        const loginRate = rateLimiter.applyLoginLimiter(req, username);
        if (!loginRate.allowed) {
          auditLogger.logSecurityEvent({
            type: 'SOC_LOGIN_RATE_LIMITED',
            ip,
            sessionId: req.session.id,
            details: { attemptedUser: username.slice(0, 3) + '***' },
            severity: 'WARN'
          });
          return sendJson(res, 429, { error: 'Too many login attempts. Try again later.' });
        }

        const QuantumVault = require('../security/quantumVault');
        const authenticated = QuantumVault.authenticateUser(username, password);

        if (!authenticated) {
          auditLogger.logSecurityEvent({
            type: 'ADMIN_LOGIN_FAILED',
            ip,
            sessionId: req.session.id,
            details: { attemptedUser: username.slice(0, 3) + '***' },
            severity: 'WARN'
          });
          return sendJson(res, 401, { error: 'Invalid operator credentials' });
        }

        sessionAuth.regenerateSession(req, res);
        req.session.role = 'admin';

        auditLogger.logSecurityEvent({
          type: 'ADMIN_LOGIN_SUCCESS',
          ip,
          sessionId: req.session.id,
          details: { user: username.slice(0, 3) + '***' },
          severity: 'INFO'
        });

        return sendJson(res, 200, { success: true, message: 'Operator session authenticated.' });
      } catch (err) {
        return sendJson(res, 400, { error: 'Malformed authentication request' });
      }
    }

    if (pathname === '/api/admin/logout' && method === 'POST') {
      req.session.role = 'visitor';
      sessionAuth.regenerateSession(req, res);
      return sendJson(res, 200, { success: true });
    }

    if (req.session.role !== 'admin' && !isInternalAuth) {
      auditLogger.logSecurityEvent({
        type: 'UNAUTHORIZED_ADMIN_ACCESS',
        ip,
        sessionId: req.session.id,
        details: { path: pathname },
        severity: 'CRITICAL'
      });
      return sendJson(res, 403, { error: 'Forbidden. Admin privileges required.' });
    }

    if (pathname === '/api/admin/telemetry' && method === 'GET') {
      return sendJson(res, 200, {
        metrics: auditLogger.getSecurityMetrics(),
        rateLimits: rateLimiter.getRateLimitStats(),
        activeSessions: sessionAuth.getAllActiveSessions(),
        activeTickets: signedUrl.getActiveTokensList(),
        recentEvents: auditLogger.getRecentAuditEvents(50)
      });
    }

    if (pathname === '/api/admin/killswitch' && method === 'POST') {
      signedUrl.revokeAllTokens();
      auditLogger.logSecurityEvent({
        type: 'EMERGENCY_KILLSWITCH_TRIGGERED',
        ip,
        sessionId: req.session ? req.session.id : 'soc_killswitch',
        severity: 'CRITICAL'
      });
      return sendJson(res, 200, { success: true, message: 'All active media tokens revoked across live portfolio server.' });
    }

  }

  // 8. Protected In-Site Preview Streaming Endpoint: /api/media/preview/:assetId
  if (pathname.startsWith('/api/media/preview/')) {
    const rawAssetId = pathname.replace('/api/media/preview/', '');
    const cleanAssetId = decodeURIComponent(rawAssetId).trim();

    // Check hotlinking referer (must originate from this host or local session)
    const referer = req.headers.referer || req.headers.origin || '';
    const host = req.headers.host || '';
    if (referer && !referer.includes(host)) {
      auditLogger.logSecurityEvent({
        type: 'HOTLINK_DETECTED',
        ip,
        sessionId: req.session ? req.session.id : 'unknown',
        details: { referer, host, assetId: cleanAssetId },
        severity: 'BLOCKED'
      });
      return sendJson(res, 403, { error: 'Hotlinking unauthorized', code: 'HOTLINK_BLOCKED' });
    }

    const asset = mediaRegistry.getAssetById(cleanAssetId);
    if (!asset) {
      return sendJson(res, 404, { error: 'Preview asset not found' });
    }

    return mediaService.streamProtectedMedia(req, res, asset, {
      isPreview: true,
      sessionId: req.session ? req.session.id : 'preview'
    });
  }

  // 9. Media Streaming Endpoint: /api/media/stream/:token
  if (pathname.startsWith('/api/media/stream/')) {
    const token = pathname.replace('/api/media/stream/', '');
    const clientCookies = sessionAuth.parseCookies(req);
    const hasClientCookie = !!(clientCookies && clientCookies['shd_sess']);
    const verification = signedUrl.verifyMediaTicket(token, {
      clientIp: ip,
      userAgent: ua,
      sessionId: hasClientCookie ? req.session.id : null
    });

    if (!verification.valid) {
      auditLogger.logSecurityEvent({
        type: 'STREAM_ACCESS_BLOCKED',
        ip,
        sessionId: req.session.id,
        details: { reason: verification.reason, tokenPreview: token.slice(0, 12) },
        severity: 'BLOCKED'
      });

      const statusCode = verification.reason === 'TOKEN_EXPIRED' ? 410 : 403;
      return sendJson(res, statusCode, {
        error: 'Media access ticket rejected',
        code: verification.reason
      });
    }

    // Check hotlinking referer (must come from this origin)
    const referer = req.headers.referer || req.headers.origin || '';
    const host = req.headers.host || '';
    if (referer && !referer.includes(host)) {
      auditLogger.logSecurityEvent({
        type: 'HOTLINK_DETECTED',
        ip,
        sessionId: req.session.id,
        details: { referer, host },
        severity: 'BLOCKED'
      });
      return sendJson(res, 403, { error: 'Hotlinking unauthorized', code: 'HOTLINK_BLOCKED' });
    }

    const asset = mediaRegistry.getAssetById(verification.payload.assetId);
    if (!asset) {
      return sendJson(res, 404, { error: 'Asset vanished from registry' });
    }

    // Stream the decrypted chunks
    return mediaService.streamProtectedMedia(req, res, asset, verification.payload);
  }

  return false; // Not handled by API router, fall through to static
}

module.exports = {
  handleApiRoutes
};
