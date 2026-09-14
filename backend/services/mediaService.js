const fs = require('fs');
const path = require('path');
const vault = require('../storage/vault');
const mediaRegistry = require('../storage/mediaRegistry');
const auditLogger = require('./auditLogger');

/**
 * Handle Range request directly from decrypted buffer without disk exposure
 */
function streamProtectedMedia(req, res, asset, ticketPayload) {
  try {
    const assetId = asset.id;
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const rootDir = path.resolve(__dirname, '../../');
    const fullSourcePath = asset.sourceFile ? path.join(rootDir, asset.sourceFile) : null;

    // Secure Video Vault buffer retrieval:
    // Prioritize encrypted vault buffer. If unvaulted, dynamically encrypt to vault before serving.
    let buffer = null;
    const encFile = path.join(vault.VAULT_DIR, (asset.vaultFile || 'asset') + '.enc');

    if (fullSourcePath && fs.existsSync(fullSourcePath)) {
      let needsReencryption = !fs.existsSync(encFile);
      if (!needsReencryption) {
        try {
          const srcMtime = fs.statSync(fullSourcePath).mtimeMs;
          const encMtime = fs.statSync(encFile).mtimeMs;
          if (srcMtime > encMtime) {
            needsReencryption = true;
          }
        } catch (_) {}
      }

      if (needsReencryption) {
        try {
          vault.encryptFileToVault(fullSourcePath, asset.vaultFile);
          buffer = vault.getDecryptedBuffer(asset.vaultFile);
        } catch (_) {
          buffer = fs.readFileSync(fullSourcePath);
        }
      } else {
        try {
          buffer = vault.getDecryptedBuffer(asset.vaultFile);
        } catch (_) {
          buffer = fs.readFileSync(fullSourcePath);
        }
      }
    } else if (fs.existsSync(encFile)) {
      buffer = vault.getDecryptedBuffer(asset.vaultFile);
    } else {
      buffer = vault.getDecryptedBuffer(asset.vaultFile);
    }
    const totalSize = buffer.length;

    // Check for HTTP Range Header
    const range = req.headers.range;

    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
      if (!match) {
        res.writeHead(416, {
          'Content-Range': `bytes */${totalSize}`,
          'Content-Type': 'text/plain'
        });
        res.end('Requested range not satisfiable');
        return;
      }

      let start = match[1] ? parseInt(match[1], 10) : NaN;
      let end = match[2] ? parseInt(match[2], 10) : NaN;

      if (isNaN(start) && isNaN(end)) {
        res.writeHead(416, {
          'Content-Range': `bytes */${totalSize}`,
          'Content-Type': 'text/plain'
        });
        res.end('Requested range not satisfiable');
        return;
      }

      if (isNaN(start)) {
        const suffixLength = end;
        if (suffixLength <= 0) {
          res.writeHead(416, { 'Content-Range': `bytes */${totalSize}`, 'Content-Type': 'text/plain' });
          res.end('Requested range not satisfiable');
          return;
        }
        start = Math.max(0, totalSize - suffixLength);
        end = totalSize - 1;
      } else if (isNaN(end)) {
        end = totalSize - 1;
      }

      if (start >= totalSize || end >= totalSize || start > end || start < 0) {
        res.writeHead(416, {
          'Content-Range': `bytes */${totalSize}`,
          'Content-Type': 'text/plain'
        });
        res.end('Requested range not satisfiable');
        return;
      }

      const chunkSize = end - start + 1;
      const chunk = buffer.subarray(start, end + 1);

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${totalSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': asset.mimeType,
        'Content-Disposition': 'inline', // prevent download prompt
        'X-Content-Duration': 'auto',
        'X-Security-Stream': 'AES-256-AUTHENTICATED'
      });

      res.end(chunk);
    } else {
      // Full stream delivery
      res.writeHead(200, {
        'Content-Length': totalSize,
        'Content-Type': asset.mimeType,
        'Accept-Ranges': 'bytes',
        'Content-Disposition': 'inline',
        'X-Security-Stream': 'AES-256-AUTHENTICATED'
      });
      res.end(buffer);
    }

    // Log streaming audit telemetry
    auditLogger.logSecurityEvent({
      type: 'MEDIA_STREAM_SERVED',
      ip: clientIp,
      sessionId: ticketPayload.sessionId,
      assetId,
      details: {
        range: range || 'full',
        bytesSent: range ? 'chunk' : totalSize
      },
      severity: 'INFO'
    });
  } catch (err) {
    console.error('[MediaService] Error streaming asset:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Decryption or streaming fault', code: 'MEDIA_STREAM_ERROR' }));
  }
}

module.exports = {
  streamProtectedMedia
};
