# SHADOW Video Management Platform — REST API v1 Specification

Base URL: `/api/v1`

All authenticated administrative requests expect:
- Header: `Authorization: Bearer <accessToken>`
- Cookie: `refresh_token=<refreshToken>` (HttpOnly, SameSite=Lax, Secure)

---

## 1. Authentication Endpoints

### `POST /api/v1/auth/login`
- **Rate Limit**: 5 attempts per 15 minutes per IP
- **Brute-Force Lockout**: 5 failed attempts locks target account for 15 minutes
- **Body**:
  ```json
  {
    "email": "admin@example.com",
    "password": "StrongPassword2025!"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "admin": {
        "adminId": "uuid",
        "email": "admin@example.com",
        "role": "SUPER_ADMIN",
        "name": "Master Architect",
        "permissions": ["video:read", "video:create", "video:delete", ...]
      },
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresInSeconds": 900
    }
  }
  ```

### `POST /api/v1/auth/refresh`
- **Body / Cookie**: Transmits rotated `refresh_token`
- **Security Check**: Detects refresh-token reuse. If reused, all active user sessions are instantly revoked.
- **Response `200 OK`**: New token pair.

### `POST /api/v1/auth/logout`
- Invalidate current refresh token in database and clear cookies.

### `GET /api/v1/auth/me`
- Returns current authenticated administrator session profile and permissions.

### `POST /api/v1/auth/change-password`
- Updates password using bcrypt work factor 12 and invalidates all other active refresh sessions.

### `GET /api/v1/auth/sessions`
- Lists all active refresh tokens for the current admin.

### `POST /api/v1/auth/sessions/revoke-all`
- Terminates all active refresh tokens for the current admin.

---

## 2. Video Endpoints

### `GET /api/v1/videos`
- **Permission**: `video:read`
- **Query Parameters**:
  - `page`: default `1`
  - `limit`: default `20` (max 100)
  - `search`: string (matches title, slug, description)
  - `status`: `DRAFT` | `PUBLISHED` | `ARCHIVED`
  - `visibility`: `PUBLIC` | `PRIVATE` | `UNLISTED`
  - `sortBy`: `createdAt` | `updatedAt` | `title` | `fileSize` | `duration`
  - `sortOrder`: `asc` | `desc`

### `GET /api/v1/videos/:id`
- Returns full metadata for video.

### `POST /api/v1/videos`
- **Permission**: `video:create`
- **Body**:
  ```json
  {
    "title": "Urban Mirage Cut",
    "description": "Commercial color grading master",
    "storageKey": "videos/2026/09/random-uuid.mp4",
    "mimeType": "video/mp4",
    "fileSize": 104857600,
    "status": "DRAFT",
    "visibility": "PRIVATE"
  }
  ```

### `PUT /api/v1/videos/:id`
- **Permission**: `video:update`
- Modifies title, description, status, or visibility.

### `PATCH /api/v1/videos/:id/status`
- **Permission**: `video:publish`
- Transitions video status between `DRAFT`, `PUBLISHED`, `ARCHIVED`.

### `DELETE /api/v1/videos/:id`
- **Permission**: `video:delete`
- Transactionally deletes metadata from database and deletes underlying asset from storage.

### `GET /api/v1/videos/:id/ticket`
- **Permission**: `video:stream`
- Issues a short-lived HMAC-SHA256 signed streaming ticket (default TTL: 90s) bound to the client hash.

### `GET /api/v1/videos/stream/:ticket`
- Authenticated via cryptographic HMAC ticket in URL.
- Supports RFC-7233 HTTP Range requests (`bytes=start-end`) for smooth, scrubbable video playback.

---

## 3. Upload Endpoints

### `POST /api/v1/uploads/single`
- **Permission**: `video:create`
- **Multi-stage verification**:
  1. Filename sanitization & path traversal check.
  2. MIME type whitelist check.
  3. Magic bytes / file signature detection (`ftyp` for MP4, `EBML` for WebM).
  4. File size limit enforcement.
  5. Saved under random UUID storage key (never original user filename).

### `POST /api/v1/uploads/chunked/initiate`
- Initiates resumable chunk upload session.

### `PUT /api/v1/uploads/chunked/:sessionId?chunkIndex=0`
- Appends chunk part to session. First chunk validated for magic bytes.

### `POST /api/v1/uploads/chunked/:sessionId/complete`
- Assembles all chunks into final isolated storage asset.

---

## 4. Governance & Telemetry Endpoints

### `GET /api/v1/audit-logs`
- **Permission**: `audit:read`
- Returns paginated append-only security logs with actor, event, IP, and metadata.

### `GET /api/v1/admins`
- **Permission**: `admin:read` (Super Admin / Admin)
- Lists administrator registry.

### `POST /api/v1/admins`
- **Permission**: `admin:create` (Super Admin)
- Invites and creates new administrator account with specific role.

### `PATCH /api/v1/admins/:id/status`
- **Permission**: `admin:update` (Super Admin)
- Activates or deactivates an administrator account.

---

## 5. Health Endpoints

### `GET /api/v1/health/live`
- Returns HTTP 200 if Node process is responsive.

### `GET /api/v1/health/ready`
- Verifies database connectivity and storage directory write availability.
