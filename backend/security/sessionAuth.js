const crypto = require('crypto');
const config = require('../config/config');

// In-memory active session store
const sessions = new Map();

function generateSessionId() {
  return 'SHD-' + crypto.randomBytes(18).toString('hex').toUpperCase();
}

/**
 * Creates or refreshes a client session
 */
function createSession(clientIp, userAgent, role = 'visitor') {
  const sessionId = generateSessionId();
  const now = Date.now();
  const sessionData = {
    id: sessionId,
    role,
    clientIp,
    userAgent,
    createdAt: now,
    lastSeen: now,
    expiresAt: now + config.SESSION_TTL_MS,
    ticketsIssued: 0,
    securityFlags: []
  };

  sessions.set(sessionId, sessionData);
  return sessionData;
}

function getSession(sessionId) {
  if (!sessionId || !sessions.has(sessionId)) return null;
  const s = sessions.get(sessionId);
  if (Date.now() > s.expiresAt) {
    sessions.delete(sessionId);
    return null;
  }
  s.lastSeen = Date.now();
  return s;
}

function revokeSession(sessionId) {
  return sessions.delete(sessionId);
}

function parseCookies(req) {
  const list = {};
  const rc = req.headers.cookie;
  if (!rc) return list;

  rc.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    const name = parts.shift().trim();
    const value = decodeURIComponent(parts.join('='));
    list[name] = value;
  });

  return list;
}

function serializeCookie(name, val, options = {}) {
  let opt = options || {};
  let enc = encodeURIComponent;
  let str = name + '=' + enc(val);

  if (opt.maxAge) {
    str += '; Max-Age=' + Math.floor(opt.maxAge);
  }
  if (opt.domain) {
    str += '; Domain=' + opt.domain;
  }
  if (opt.path) {
    str += '; Path=' + opt.path;
  } else {
    str += '; Path=/';
  }
  if (opt.expires) {
    str += '; Expires=' + opt.expires.toUTCString();
  }
  if (opt.httpOnly) {
    str += '; HttpOnly';
  }
  if (opt.secure) {
    str += '; Secure';
  }
  if (opt.sameSite) {
    str += '; SameSite=' + (opt.sameSite === true ? 'Strict' : opt.sameSite);
  } else {
    str += '; SameSite=Lax';
  }

  return str;
}

/**
 * Middleware helper to ensure request has a valid session cookie
 */
function attachOrInitSession(req, res) {
  const cookies = parseCookies(req);
  let sessionId = cookies['shd_sess'];
  let session = getSession(sessionId);

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const ua = req.headers['user-agent'] || 'unknown';

  if (!session) {
    session = createSession(ip, ua, 'visitor');
    sessionId = session.id;
    // Set HttpOnly, SameSite cookie
    const isHttps = req.connection.encrypted || req.headers['x-forwarded-proto'] === 'https';
    res.setHeader('Set-Cookie', serializeCookie('shd_sess', sessionId, {
      httpOnly: true,
      sameSite: 'Lax',
      secure: isHttps,
      maxAge: config.SESSION_TTL_MS / 1000
    }));
  }

  req.session = session;
  return session;
}

function getAllActiveSessions() {
  return Array.from(sessions.values()).map(s => ({
    id: s.id,
    role: s.role,
    clientIp: s.clientIp,
    ticketsIssued: s.ticketsIssued,
    createdAt: new Date(s.createdAt).toISOString(),
    lastSeen: new Date(s.lastSeen).toISOString(),
    securityFlags: s.securityFlags
  }));
}

function regenerateSession(req, res) {
  const oldSession = req.session;
  if (oldSession && oldSession.id) {
    sessions.delete(oldSession.id);
  }
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const ua = req.headers['user-agent'] || 'unknown';
  const newSession = createSession(ip, ua, oldSession ? oldSession.role : 'visitor');
  const isHttps = (req.connection && req.connection.encrypted) || req.headers['x-forwarded-proto'] === 'https';
  res.setHeader('Set-Cookie', serializeCookie('shd_sess', newSession.id, {
    httpOnly: true,
    sameSite: 'Lax',
    secure: isHttps,
    maxAge: config.SESSION_TTL_MS / 1000
  }));
  req.session = newSession;
  return newSession;
}

module.exports = {
  createSession,
  getSession,
  revokeSession,
  attachOrInitSession,
  regenerateSession,
  parseCookies,
  serializeCookie,
  getAllActiveSessions
};
