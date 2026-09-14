const config = require('../config/config');

// Stores timestamps of requests per IP / key
const requestWindows = new Map();
const quarantinedIps = new Map();

/**
 * Check if IP is currently quarantined by honeypot or abuse
 */
function isQuarantined(ip) {
  if (!quarantinedIps.has(ip)) return false;
  const expiry = quarantinedIps.get(ip);
  if (Date.now() > expiry) {
    quarantinedIps.delete(ip);
    return false;
  }
  return true;
}

function quarantineIp(ip, durationMs = config.RATE_LIMITS.HONEYPOT_PENALTY_MS, reason = 'HONEYPOT_TRIGGERED') {
  quarantinedIps.set(ip, Date.now() + durationMs);
  return { ip, expiry: Date.now() + durationMs, reason };
}

/**
 * Sliding window rate check
 */
function checkRateLimit(key, maxLimit, windowMs) {
  const now = Date.now();
  if (!requestWindows.has(key)) {
    requestWindows.set(key, []);
  }

  const timestamps = requestWindows.get(key);
  // Filter out older timestamps outside the sliding window
  const validTimestamps = timestamps.filter(t => now - t < windowMs);
  requestWindows.set(key, validTimestamps);

  if (validTimestamps.length >= maxLimit) {
    const oldest = validTimestamps[0];
    const retryAfter = Math.ceil((windowMs - (now - oldest)) / 1000);
    return {
      allowed: false,
      current: validTimestamps.length,
      limit: maxLimit,
      retryAfter: Math.max(1, retryAfter)
    };
  }

  validTimestamps.push(now);
  return {
    allowed: true,
    current: validTimestamps.length,
    limit: maxLimit,
    remaining: maxLimit - validTimestamps.length
  };
}

/**
 * General API Limiter Middleware Helper
 */
function applyApiLimiter(req) {
  const ip = req.socket.remoteAddress || '127.0.0.1';
  if (isQuarantined(ip)) {
    return { allowed: false, quarantined: true, message: 'IP Quarantined for Automated Scanning' };
  }
  return checkRateLimit(`api:${ip}`, config.RATE_LIMITS.API_MAX_REQUESTS, config.RATE_LIMITS.API_WINDOW_MS);
}

/**
 * Stricter Ticket Issuance Limiter
 */
function applyTicketLimiter(req) {
  const ip = req.socket.remoteAddress || '127.0.0.1';
  if (isQuarantined(ip)) {
    return { allowed: false, quarantined: true };
  }
  return checkRateLimit(`ticket:${ip}`, config.RATE_LIMITS.TICKET_MAX_REQUESTS, config.RATE_LIMITS.TICKET_WINDOW_MS);
}

function getRateLimitStats() {
  return {
    trackedKeys: requestWindows.size,
    quarantinedCount: quarantinedIps.size,
    quarantinedList: Array.from(quarantinedIps.entries()).map(([ip, exp]) => ({
      ip,
      remainingSec: Math.max(0, Math.round((exp - Date.now()) / 1000))
    }))
  };
}

/**
 * Strict Login Brute-Force Rate Limiter (Max 5 attempts / 15 minutes per IP or account)
 */
function applyLoginLimiter(req, username = '') {
  const ip = req.socket.remoteAddress || '127.0.0.1';
  if (isQuarantined(ip)) {
    return { allowed: false, quarantined: true, message: 'IP Quarantined for Automated Scanning' };
  }
  const ipLimit = checkRateLimit(`login:ip:${ip}`, 5, 15 * 60 * 1000);
  if (!ipLimit.allowed) return ipLimit;

  if (username) {
    const userLimit = checkRateLimit(`login:user:${String(username).toLowerCase().trim()}`, 5, 15 * 60 * 1000);
    if (!userLimit.allowed) return userLimit;
  }
  return { allowed: true };
}

module.exports = {
  isQuarantined,
  quarantineIp,
  checkRateLimit,
  applyApiLimiter,
  applyTicketLimiter,
  applyLoginLimiter,
  getRateLimitStats
};
