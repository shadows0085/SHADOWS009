const crypto = require('crypto');
const path = require('path');

// Cryptographic secret management: require explicit secrets in production or load from secure env
let SECRET_KEY = process.env.SECURITY_SECRET || process.env.STREAM_SIGNING_SECRET;

// Try loading from platform/backend/.env if available
if (!SECRET_KEY) {
  try {
    const fs = require('fs');
    const envPath = path.resolve(__dirname, '../../platform/backend/.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('#') || !trimmed.includes('=')) continue;
        const [k, ...v] = trimmed.split('=');
        const val = v.join('=').trim().replace(/^["']|["']$/g, '');
        if (k.trim() === 'STREAM_SIGNING_SECRET' && val) SECRET_KEY = val;
        if (!SECRET_KEY && k.trim() === 'JWT_ACCESS_SECRET' && val) SECRET_KEY = val;
      }
    }
  } catch (_) {}
}

if (!SECRET_KEY) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: SECURITY_SECRET environment variable is strictly required in production.');
  }
  // Generate a cryptographically strong 32-byte ephemeral secret rather than a predictable string
  SECRET_KEY = crypto.randomBytes(32).toString('hex');
}

const ENCRYPTION_MASTER_KEY = process.env.ENCRYPTION_KEY 
  ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex')
  : crypto.createHash('sha256').update(SECRET_KEY + ':shadow_media_vault').digest();

module.exports = {
  PORT: process.env.PORT || 3000,
  ROOT_DIR: path.resolve(__dirname, '../../'),
  PUBLIC_DIR: path.resolve(__dirname, '../../'),
  VAULT_DIR: path.resolve(__dirname, '../storage/private'),
  
  // Security Keys
  SECRET_KEY,
  ENCRYPTION_MASTER_KEY, // 32 bytes for AES-256-GCM
  
  // Token & Session Expirations
  MEDIA_TOKEN_TTL_MS: 90 * 1000, // 90 seconds short-lived ticket
  SESSION_TTL_MS: 24 * 60 * 60 * 1000, // 24 hours
  
  // Rate Limiter Rules
  RATE_LIMITS: {
    API_MAX_REQUESTS: 120,       // 120 req / minute
    API_WINDOW_MS: 60 * 1000,
    TICKET_MAX_REQUESTS: 25,     // max 25 media tickets / minute
    TICKET_WINDOW_MS: 60 * 1000,
    HONEYPOT_PENALTY_MS: 10 * 60 * 1000 // 10 minutes ban on honeypot hit
  },
  
  // Admin credentials are managed exclusively through the Post-Quantum Vault
  // and platform backend database — no hardcoded env credentials.
  
  // Dynamic Watermarking Config (Disabled for clean watermark-free viewing)
  WATERMARK: {
    ENABLED: false,
    TEXT_PREFIX: '',
    ENABLE_MICRO_JITTER: false
  }
};
