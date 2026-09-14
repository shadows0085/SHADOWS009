# SHADOW — Production-Grade Secure Video Management Platform

A high-performance, enterprise-grade video management platform and administrative dashboard engineered with **defense-in-depth security**, clean architecture, and realistic anti-abuse controls.

---

## System Highlights & Defense-In-Depth Security

- **Authentication & Authorization**:
  - Passwords hashed with **bcrypt (work factor 12)**.
  - Short-lived JWT access tokens (15-minute expiration) with **issuer & audience verification**.
  - **Refresh-token rotation** with immediate reuse anomaly detection (compromised tokens trigger global session revocation).
  - Storage in **HttpOnly, SameSite=Lax, Secure cookies**.
  - **Account Lockout Protection**: 5 failed consecutive attempts triggers an automatic 15-minute account lock.
  - **Zero User Enumeration**: Constant-time comparison ensures identical timing regardless of whether an email exists.
  - **Server-Side RBAC**: Granular permissions across `SUPER_ADMIN`, `ADMIN`, and `EDITOR`.

- **Secure Storage & Media Pipeline**:
  - **Multi-Stage File Verification**: Inspects MIME types, filename extensions, and **binary magic bytes** (`ftyp` for MP4, `EBML` for WebM) to reject disguised executables and polyglots.
  - **Path Traversal & Injection Blocking**: Strict path resolution against isolated storage roots.
  - **Randomized Storage Keys**: Files are stored as `videos/YYYY/MM/<uuid>.mp4`; original filenames are never used on disk.
  - **Cryptographic Streaming Tickets**: Short-lived HMAC-SHA256 signed tokens bound to client IP & user agent hash.
  - **RFC-7233 Range Streaming**: Full support for HTTP 206 partial content streaming for fast, scrubbable playback.

- **Auditing & Governance**:
  - Append-only `audit_logs` table tracking authentication, video mutations, deletions, and administrative actions.
  - Sensitive parameters (passwords, JWTs, keys) automatically redacted from structured Pino logging.

---

## Technology Stack

- **Backend**: Node.js (v22+), TypeScript, Express, Prisma ORM, Helmet, CORS, Express-Rate-Limit, Zod, Bcrypt, Pino.
- **Database**: PostgreSQL (Production) / SQLite (Local Dev & Testing).
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, React Router 6.
- **DevOps**: Docker, Docker Compose, Nginx Alpine, Multi-Stage Builds.

---

## Directory Architecture

```text
platform/
├── backend/
│   ├── src/
│   │   ├── config/          # Environment variables & Zod fail-fast schema
│   │   ├── controllers/     # Auth, Video, Upload, Audit, Admin, Health controllers
│   │   ├── services/        # Business logic: Auth, Video, Upload, Storage, Audit
│   │   ├── repositories/    # Prisma database abstraction layer
│   │   ├── middleware/      # Auth, RBAC, Rate limiters, Validation, Error handler
│   │   ├── routes/          # Versioned REST endpoints (/api/v1)
│   │   ├── validators/      # Zod validation schemas
│   │   ├── models/          # Domain types, DTOs, and permission mappings
│   │   ├── utils/           # Structured logger & sanitizers
│   │   ├── security/        # Tokens, Bcrypt hasher, HMAC signer
│   │   ├── app.ts           # Express app setup with Helmet & CORS
│   │   └── server.ts        # Server entry with graceful shutdown
│   ├── prisma/              # Prisma relational schema, migrations & seed script
│   └── tests/               # Jest integration and security test suite
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Video player modal, controls, badges
│   │   ├── pages/           # Login, Dashboard, Videos, Upload, AuditLogs, Security, Admins
│   │   ├── layouts/         # Responsive AdminLayout with sidebar
│   │   ├── context/         # AuthContext with RBAC guards
│   │   └── services/        # ApiClient with automatic token rotation
│   └── index.html
│
├── docker/
│   ├── Dockerfile.backend   # Multi-stage non-root container
│   ├── Dockerfile.frontend  # Vite build + Nginx Alpine runner
│   └── nginx.conf           # Production reverse proxy with security headers
├── docs/
│   ├── API_SPEC.md          # Complete REST API documentation
│   ├── SECURITY_MODEL.md    # Threat model & OWASP Top 10 analysis
│   └── DISASTER_RECOVERY.md # Backups & emergency runbook
├── docker-compose.yml       # Production multi-service orchestration
└── README.md
```

---

## Getting Started

### 1. Local Development (Zero-Dependency SQLite)

```bash
# 1. Enter backend directory
cd platform/backend

# 2. Install dependencies & configure Prisma
npm install
npx prisma db push

# 3. Seed initial Super Admin account
npx ts-node prisma/seed.ts
# Credentials configured securely via environment or initialized via quantum vault.

# 4. Start backend server (Port 4000)
npm run dev

# 5. In a new terminal, launch frontend
cd ../frontend
npm install
npm run dev
# Dashboard opens on http://localhost:3000
```

### 2. Automated Test Suite

Run the comprehensive unit and integration security tests:
```bash
cd platform/backend
npm test
```
Tests verify:
- Valid login & token issuance.
- Account lockout after 5 consecutive bad attempts.
- Refresh-token rotation & reuse anomaly revocation.
- Binary magic-byte detection (MP4 / WebM).
- Rejection of disguised executables / scripts.
- Filename path traversal protection.
- Rejection of forged or expired streaming tickets.

### 3. Production Deployment with Docker Compose

```bash
cd platform
docker-compose up -d --build
```
This orchestrates:
- `postgres`: PostgreSQL 16 on private network with healthchecks.
- `redis`: Redis 7 Alpine with persistent append-only storage.
- `backend`: Hardened Node.js container running as non-root user `nodeuser`.
- `frontend`: High-performance Nginx Alpine proxying `/api/` to backend and serving the optimized React SPA.

Access the dashboard at `http://localhost:3000`.
