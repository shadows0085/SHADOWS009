# SHADOW Video Platform — Threat Model & Defense-in-Depth Architecture

This document provides a realistic, professional security assessment and threat mitigation analysis for the video management platform.

---

## 1. Realistic Threat Model vs. False Security Claims

| Mythical / Impossible Claim | Realistic Engineering Solution |
| :--- | :--- |
| *"A website can be made impossible to screenshot or record"* | Operating system and hardware capture tools cannot be prevented by web JavaScript. Instead, the platform protects media assets at the **server, storage, and authorization layers** with short-lived HMAC signed URLs, user tracking identifiers, and zero direct storage bucket exposure. |
| *"Hiding the download button prevents media theft"* | Network inspectors and browser caches can capture any media rendered. Our defense restricts access exclusively to authenticated, permission-checked sessions with temporary expiring access tokens and audit logging. |
| *"Client-side role checks provide security"* | Client-side UI toggles are UX-only. The server independently verifies JWT signatures, database account status, and role-to-permission mappings on every API request. |

---

## 2. OWASP Top 10 Security Architecture Mapping

### A01: Broken Access Control
- **Mitigation**: Server-side RBAC middleware (`requireRole`, `requirePermission`). All video mutation endpoints require authorization. IDOR prevention through server-side ownership checks.

### A02: Cryptographic Failures
- **Mitigation**:
  - Passwords hashed using bcrypt with salt rounds of 12.
  - Refresh tokens are hashed using SHA-256 before storage; the database never stores plaintext refresh tokens.
  - Video streams are protected using HMAC-SHA256 tokens with timing-safe verification (`crypto.timingSafeEqual`).
  - No secret keys, database credentials, or JWT secrets stored in source code.

### A03: Injection (SQL / Command / Path Traversal)
- **Mitigation**:
  - Prisma ORM parameterized queries for 100% of database operations.
  - Strict path traversal defenses: relative paths stripped, resolved against isolated upload base path, verified with `.startsWith(baseDir)`.
  - Filename sanitization blocks null bytes and directory separators.

### A04: Insecure Design
- **Mitigation**:
  - Defense-in-depth: Brute-force lockout (5 attempts -> 15 min lock) + IP rate limiting.
  - Refresh token rotation with immediate reuse detection (revokes entire token family if token reuse is detected).

### A05: Security Misconfiguration
- **Mitigation**:
  - Helmet configured with strict Content-Security-Policy (CSP), HSTS, and X-Content-Type-Options: nosniff.
  - CORS strictly configured to whitelisted frontend origins only (wildcard `*` rejected).
  - Production Docker runs as non-root user (`nodeuser`).

### A06: Vulnerable and Outdated Components
- **Mitigation**: Dependency footprint audited with minimal third-party surface area and strict semantic versioning.

### A07: Identification and Authentication Failures
- **Mitigation**:
  - Short-lived JWT access tokens (15 minutes).
  - Long-lived refresh tokens stored in HttpOnly, SameSite=Lax, Secure cookies.
  - Constant-time verification on unknown emails to prevent username enumeration.

### A08: Software and Data Integrity Failures
- **Mitigation**:
  - Multi-stage upload validation: MIME check, extension whitelist, and **magic bytes / file signature inspection** (verifying `ftyp` box for MP4 and EBML headers for WebM) to prevent disguised executable uploads.
  - Files are saved under random UUID keys (`videos/2026/09/uuid.mp4`), never user-supplied names.

### A09: Security Logging and Monitoring Failures
- **Mitigation**:
  - Append-only `audit_logs` table recording all security events (login success/failure, account lockouts, video creation/deletion, token rotation).
  - Sensitive credentials (passwords, tokens, keys) automatically redacted from structured Pino logs.

### A10: Server-Side Request Forgery (SSRF)
- **Mitigation**: The platform does not fetch arbitrary external URLs on behalf of users; all storage and streaming operations are strictly localized or direct to authenticated S3 storage.
