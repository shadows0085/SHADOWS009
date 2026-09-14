const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const config = require('../config/config');

// Structure of Encrypted File on Disk:
// [16 bytes IV] [16 bytes AuthTag] [Ciphertext ...]
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const HEADER_LENGTH = IV_LENGTH + TAG_LENGTH;

// Ensure private vault directory exists
if (!fs.existsSync(config.VAULT_DIR)) {
  fs.mkdirSync(config.VAULT_DIR, { recursive: true });
}

/**
 * Encrypt a buffer or file directly into the vault
 */
function encryptFileToVault(sourceFilePath, vaultFileName) {
  const fileData = fs.readFileSync(sourceFilePath);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, config.ENCRYPTION_MASTER_KEY, iv);

  const encrypted = Buffer.concat([cipher.update(fileData), cipher.final()]);
  const tag = cipher.getAuthTag();

  const targetPath = path.join(config.VAULT_DIR, vaultFileName + '.enc');
  // Combine IV + TAG + CIPHERTEXT
  const combined = Buffer.concat([iv, tag, encrypted]);
  fs.writeFileSync(targetPath, combined);

  // Invalidate any in-memory decrypted buffer cache for this vault file
  decryptedBufferCache.delete(vaultFileName);
  decryptedBufferCache.delete(vaultFileName + '.enc');

  return {
    vaultPath: targetPath,
    originalSize: fileData.length,
    encryptedSize: combined.length,
    checksum: crypto.createHash('sha256').update(fileData).digest('hex')
  };
}

/**
 * Decrypt the entire file into a buffer in-memory
 * (Never writes plain data to public disk)
 */
function decryptVaultFile(vaultFileName) {
  const filePath = path.join(config.VAULT_DIR, vaultFileName.endsWith('.enc') ? vaultFileName : vaultFileName + '.enc');
  if (!fs.existsSync(filePath)) {
    throw new Error(`Vault file not found: ${vaultFileName}`);
  }

  const raw = fs.readFileSync(filePath);
  if (raw.length < HEADER_LENGTH) {
    throw new Error(`Vault file corrupt or invalid length: ${vaultFileName}`);
  }

  const iv = raw.subarray(0, IV_LENGTH);
  const tag = raw.subarray(IV_LENGTH, HEADER_LENGTH);
  const ciphertext = raw.subarray(HEADER_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, config.ENCRYPTION_MASTER_KEY, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted;
}

/**
 * Get decrypted file info & cached memory buffer for streaming
 */
const decryptedBufferCache = new Map();
const CACHE_MAX_AGE = 5 * 60 * 1000; // 5 minutes in memory

function getDecryptedBuffer(vaultFileName) {
  const now = Date.now();
  if (decryptedBufferCache.has(vaultFileName)) {
    const entry = decryptedBufferCache.get(vaultFileName);
    if (now - entry.timestamp < CACHE_MAX_AGE) {
      entry.timestamp = now;
      return entry.buffer;
    }
  }

  const buf = decryptVaultFile(vaultFileName);
  decryptedBufferCache.set(vaultFileName, {
    buffer: buf,
    timestamp: now
  });
  return buf;
}

function clearCache(vaultFileName) {
  if (vaultFileName) {
    decryptedBufferCache.delete(vaultFileName);
    decryptedBufferCache.delete(vaultFileName + '.enc');
  } else {
    decryptedBufferCache.clear();
  }
}

module.exports = {
  encryptFileToVault,
  decryptVaultFile,
  getDecryptedBuffer,
  clearCache,
  VAULT_DIR: config.VAULT_DIR
};
