# Disaster Recovery, Backup & Incident Response Runbook

This runbook outlines operational procedures for backup, database restoration, storage integrity, and incident mitigation for the SHADOW Video Management Platform.

---

## 1. Database Backup & Restoration

### Automated Daily PostgreSQL Backups (pg_dump)
```bash
# Export encrypted compressed backup
pg_dump -h localhost -U postgres -d video_management -F c -b -v -f /backups/db_$(date +%Y%m%d_%H%M%S).dump

# Encrypt backup archive with GPG
gpg --symmetric --cipher-algo AES256 /backups/db_*.dump
```

### Database Restoration Procedure
```bash
# 1. Stop backend service to prevent write conflicts
docker-compose stop backend

# 2. Restore database from dump
pg_restore -h localhost -U postgres -d video_management -v -c /backups/db_selected.dump

# 3. Verify schema & data consistency
docker-compose run backend npx prisma migrate status

# 4. Restart services
docker-compose start backend
```

---

## 2. Media Storage Redundancy & Recovery

### S3 / Cloudflare R2 Sync
If using cloud storage, configure bucket versioning and multi-region replication:
```bash
# Sync local storage to off-site disaster recovery vault
aws s3 sync /app/uploads s3://dr-backup-vault/uploads --delete --sse aws:kms
```

### File Integrity Audit Runbook
To verify that all database `storageKey` entries have corresponding physical files:
```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const p = new PrismaClient();
p.video.findMany().then(videos => {
  let missing = 0;
  for (const v of videos) {
    const full = path.resolve('./uploads', v.storageKey);
    if (!fs.existsSync(full)) {
      console.error('MISSING ASSET:', v.id, v.storageKey);
      missing++;
    }
  }
  console.log('Integrity check finished. Missing assets:', missing);
  p.\$disconnect();
});
"
```

---

## 3. Incident Response: Credential or Key Compromise

### Emergency Killswitch: Revoke All Active Sessions
If an administrator account or secret key is suspected of being compromised:

1. **Rotate Secrets in `.env`**:
   - Change `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and `STREAM_SIGNING_SECRET`.
2. **Execute Database Global Session Invalidation**:
   ```sql
   UPDATE "RefreshToken" SET "revokedAt" = NOW() WHERE "revokedAt" IS NULL;
   ```
3. **Restart Backend Service**:
   ```bash
   docker-compose restart backend
   ```
   All existing JWT tokens will be immediately rejected on their next signature verification, forcing all users to re-authenticate.
