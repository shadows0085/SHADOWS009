import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../src/app';
import { UploadService } from '../src/services/upload.service';
import { CryptoUtils } from '../src/security/crypto';
import { createProjectSchema } from '../src/validators/portfolio.validator';

const app = createApp();

describe('Defense-In-Depth Security Controls', () => {
  it('should detect valid MP4 magic bytes signature', () => {
    // Standard MP4 box header: size (4 bytes), 'ftyp' (4 bytes), brand (4 bytes)
    const validMp4Header = Buffer.from([
      0x00, 0x00, 0x00, 0x20, // size 32
      0x66, 0x74, 0x79, 0x70, // 'ftyp'
      0x69, 0x73, 0x6f, 0x6d, // 'isom'
      0x00, 0x00, 0x02, 0x00
    ]);

    const result = UploadService.verifyFileSignature(validMp4Header);
    expect(result.valid).toBe(true);
    expect(result.mimeType).toBe('video/mp4');
  });

  it('should detect valid WebM magic bytes signature', () => {
    // WebM EBML header: 0x1A 0x45 0xDF 0xA3
    const validWebmHeader = Buffer.from([
      0x1a, 0x45, 0xdf, 0xa3, 0x9f, 0x42, 0x86, 0x81, 0x01, 0x42, 0xf7, 0x81
    ]);

    const result = UploadService.verifyFileSignature(validWebmHeader);
    expect(result.valid).toBe(true);
    expect(result.mimeType).toBe('video/webm');
  });

  it('should REJECT disguised executable or text file renamed to .mp4', () => {
    // Disguised text or shell script: "#!/bin/bash" or "MZ" PE header
    const maliciousPayload = Buffer.from('MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xff\xff');

    const result = UploadService.verifyFileSignature(maliciousPayload);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('UNRECOGNIZED_OR_DISALLOWED_FILE_SIGNATURE');
  });

  it('should sanitize path traversal attempts in filenames', () => {
    expect(() => {
      UploadService.sanitizeFilename('../../../../etc/passwd');
    }).toThrow();

    expect(() => {
      UploadService.sanitizeFilename('evil.exe');
    }).toThrow();

    const clean = UploadService.sanitizeFilename('my-cinematic-film.mp4');
    expect(clean).toBe('my-cinematic-film.mp4');
  });

  it('should reject forged or tampered streaming tickets', async () => {
    const forgedTicket = 'eyJhbGciOiJIUzI1NiJ9.forged_payload.invalidsig';
    const res = await request(app).get(`/api/v1/videos/stream/${forgedTicket}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('ACCESS_DENIED');
  });

  it('should reject expired streaming tickets', async () => {
    // Generate validly signed ticket with past timestamp
    const expiredPayload = {
      videoId: 'vid-123',
      adminId: 'adm-123',
      issuedAt: Date.now() - 200000,
      expiresAt: Date.now() - 100000, // expired in past
      nonce: 'nonce-123',
      clientHash: 'hash-123'
    };
    const expiredTicket = CryptoUtils.signStreamTicket(expiredPayload);

    const res = await request(app).get(`/api/v1/videos/stream/${expiredTicket}`);
    expect(res.status).toBe(403);
    expect(res.body.error.message).toContain('expired');
  });

  it('should reject streaming ticket when client IP or User-Agent mismatches (replay defense)', async () => {
    // Generate valid ticket bound to a specific client hash
    const boundPayload = {
      videoId: 'vid-test-123',
      adminId: 'adm-test-123',
      role: 'SUPER_ADMIN',
      issuedAt: Date.now(),
      expiresAt: Date.now() + 60000,
      nonce: 'nonce-abc-123',
      clientHash: 'correcthash12345' // Doesn't match request IP/UA
    };
    const validTicket = CryptoUtils.signStreamTicket(boundPayload);

    const res = await request(app)
      .get(`/api/v1/videos/stream/${validTicket}`)
      .set('User-Agent', 'PirateDownloader/1.0');

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('ACCESS_DENIED');
  });

  it('should reject portfolio inputs containing malicious XSS tags or event handlers', () => {
    const maliciousPayload1 = {
      file: 'uploaded-video/no-1.mp4',
      category: 'commercial',
      title: 'Malicious Project <script>alert("XSS")</script>'
    };
    const result1 = createProjectSchema.safeParse(maliciousPayload1);
    expect(result1.success).toBe(false);

    const maliciousPayload2 = {
      file: 'uploaded-video/no-1.mp4',
      category: 'commercial',
      title: 'Malicious <img src=x onerror=alert(1)>'
    };
    const result2 = createProjectSchema.safeParse(maliciousPayload2);
    expect(result2.success).toBe(false);

    const validPayload = {
      file: 'uploaded-video/no-1.mp4',
      category: 'commercial',
      title: 'Urban Mirage — 4K HDR Campaign',
      expectedVersion: 1
    };
    const result3 = createProjectSchema.safeParse(validPayload);
    expect(result3.success).toBe(true);
  });
});
