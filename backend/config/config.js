const crypto = require('crypto');
const path = require('path');

// Cryptographic secret management: check all standard environment variable names
let SECRET_KEY = 
  process.env.SECURITY_SECRET || 
  process.env.STREAM_SIGNING_SECRET || 
  process.env.JWT_ACCESS_SECRET || 
  process.env.SECRET_KEY;

// Try loading from any .env file in root or platform/backend if available
if (!SECRET_KEY) {
  try {
    const fs = require('fs');
    const envPaths = [
      path.resolve(__dirname, '../../platform/backend/.env'),
      path.resolve(__dirname, '../../.env'),
      path.resolve(__dirname, '../.env')
    ];
    for (const envPath of envPaths) {
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        const lines = content.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('#') || !trimmed.includes('=')) continue;
          const [k, ...v] = trimmed.split('=');
          const val = v.join('=').trim().replace(/^["']|["']$/g, '');
          if ((k.trim() === 'STREAM_SIGNING_SECRET' || k.trim() === 'JWT_ACCESS_SECRET' || k.trim() === 'SECURITY_SECRET') && val) {
            SECRET_KEY = val;
            break;
          }
        }
        if (SECRET_KEY) break;
      }
    }
  } catch (_) {}
}

if (!SECRET_KEY) {
  // Generate a cryptographically strong 32-byte secret so production server starts seamlessly
  SECRET_KEY = crypto.randomBytes(32).toString('hex');
  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️  [SECURITY WARNING]: SECURITY_SECRET or JWT_ACCESS_SECRET was not set in Render environment variables.');
    console.warn('    Auto-generated secure 256-bit ephemeral key for this session.');
  }
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
