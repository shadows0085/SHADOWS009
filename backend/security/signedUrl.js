const crypto = require('crypto');
const config = require('../config/config');

// In-memory token tracking to allow revocation & replay detection
const activeTokens = new Map();
const revokedTokens = new Map(); // token -> expiresAt

/**
 * Generate a short-lived HMAC-SHA256 signed ticket
 */
function createMediaTicket({ assetId, sessionId, clientIp, userAgent }) {
  const nonce = crypto.randomBytes(12).toString('hex');
  const issuedAt = Date.now();
  const expiresAt = issuedAt + config.MEDIA_TOKEN_TTL_MS;

  // Hash client fingerprint (IP + UserAgent) to bind the token
  const clientHash = crypto.createHash('sha256')
    .update(`${clientIp || 'unknown'}::${userAgent || 'unknown'}::${sessionId}`)
    .digest('hex')
    .slice(0, 16);

  const payload = {
    assetId,
    sessionId,
    nonce,
    issuedAt,
    expiresAt,
    clientHash
  };

  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', config.SECRET_KEY)
    .update(payloadStr)
    .digest('base64url');

  const token = `${payloadStr}.${signature}`;

  // Store in active tokens cache
  activeTokens.set(token, {
    assetId,
    sessionId,
    expiresAt,
    issuedAt,
    clientIp,
    hitCount: 0
  });

  return {
    token,
    expiresAt,
    ttlSeconds: Math.floor(config.MEDIA_TOKEN_TTL_MS / 1000)
  };
}

/**
 * Verify a media ticket against signature, expiration, and client fingerprint
 */
function verifyMediaTicket(token, { clientIp, userAgent, sessionId }) {
  if (!token || typeof token !== 'string') {
    return { valid: false, reason: 'MISSING_TOKEN' };
  }

  if (revokedTokens.has(token)) {
    return { valid: false, reason: 'TOKEN_REVOKED' };
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return { valid: false, reason: 'INVALID_TOKEN_FORMAT' };
  }

  const [payloadStr, signature] = parts;

  // Constant-time HMAC comparison
  const expectedSignature = crypto.createHmac('sha256', config.SECRET_KEY)
    .update(payloadStr)
    .digest('base64url');

  const sigA = Buffer.from(signature);
  const sigB = Buffer.from(expectedSignature);

  if (sigA.length !== sigB.length || !crypto.timingSafeEqual(sigA, sigB)) {
    return { valid: false, reason: 'SIGNATURE_MISMATCH' };
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf8'));
  } catch {
    return { valid: false, reason: 'MALFORMED_PAYLOAD' };
  }

  const now = Date.now();
  if (now > payload.expiresAt) {
    return { valid: false, reason: 'TOKEN_EXPIRED', payload };
  }

  // Verify session binding if provided
  if (sessionId && payload.sessionId !== sessionId) {
    return { valid: false, reason: 'SESSION_MISMATCH', payload };
  }

  // Update telemetry on hit
  if (activeTokens.has(token)) {
    const entry = activeTokens.get(token);
    entry.hitCount++;
    entry.lastHit = now;
  }

  return {
    valid: true,
    payload
  };
}

/**
 * Revoke a specific token or all active tokens (emergency killswitch)
 */
function revokeToken(token) {
  const data = activeTokens.get(token);
  const expiresAt = data ? data.expiresAt : Date.now() + config.MEDIA_TOKEN_TTL_MS;
  revokedTokens.set(token, expiresAt);
  activeTokens.delete(token);
}

function revokeAllTokens() {
  const defaultExp = Date.now() + config.MEDIA_TOKEN_TTL_MS;
  for (const [token, data] of activeTokens.entries()) {
    revokedTokens.set(token, data.expiresAt || defaultExp);
  }
  activeTokens.clear();
}

/**
 * Prune expired tokens periodically (prune only tokens past expiresAt)
 */
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of activeTokens.entries()) {
    if (now > data.expiresAt) {
      activeTokens.delete(token);
    }
  }
  // Safely prune revoked tokens only once their TTL has passed
  for (const [token, expiresAt] of revokedTokens.entries()) {
    if (now > expiresAt) {
      revokedTokens.delete(token);
    }
  }
}, 30 * 1000);

function getActiveTokensCount() {
  return activeTokens.size;
}

function getActiveTokensList() {
  return Array.from(activeTokens.entries()).map(([tok, data]) => ({
    tokenPreview: tok.slice(0, 16) + '...',
    assetId: data.assetId,
    sessionId: data.sessionId,
    expiresIn: Math.max(0, Math.round((data.expiresAt - Date.now()) / 1000)),
    hitCount: data.hitCount
  }));
}

module.exports = {
  createMediaTicket,
  verifyMediaTicket,
  revokeToken,
  revokeAllTokens,
  getActiveTokensCount,
  getActiveTokensList
};
