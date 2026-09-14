/**
 * Hardened Security Headers
 */
function applySecurityHeaders(res, isMedia = false, isAdmin = false) {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Clickjacking Protection (X-Frame-Options for older browser fallback)
  if (isAdmin) {
    res.setHeader('X-Frame-Options', 'DENY');
  } else {
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  }

  // Strict referrer policy prevents leakage of token parameters
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Modern Permissions Policy disabling unnecessary sensors
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

  // Strict Transport Security (for production HTTPS)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // Content Security Policy
  if (!isMedia) {
    if (isAdmin) {
      // Strict Admin CSP: frame-ancestors none to prevent clickjacking; no unsafe-eval
      res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com data:; " +
        "img-src 'self' data: blob:; " +
        "media-src 'self' blob:; " +
        "connect-src 'self' http://localhost:* http://127.0.0.1:*; " +
        "frame-ancestors 'none'; " +
        "object-src 'none';"
      );
    } else {
      // Public Site CSP: no unsafe-eval
      res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com data:; " +
        "img-src 'self' data: blob:; " +
        "media-src 'self' blob:; " +
        "connect-src 'self'; " +
        "frame-ancestors 'self';"
      );
    }
  } else {
    // Media streaming responses: strict caching and anti-download directives
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}

module.exports = {
  applySecurityHeaders
};
