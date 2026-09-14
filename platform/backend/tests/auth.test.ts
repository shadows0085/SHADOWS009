import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/repositories/prisma.client';
import { CryptoUtils } from '../src/security/crypto';

const app = createApp();

describe('Authentication & Security Suite', () => {
  const testEmail = 'testadmin@example.local';
  const testPassword = 'StrongPassword2025!';

  beforeAll(async () => {
    // Ensure clean state for test admin
    await prisma.refreshToken.deleteMany();
    await prisma.admin.deleteMany({ where: { email: testEmail } });

    const passwordHash = await CryptoUtils.hashPassword(testPassword);
    await prisma.admin.create({
      data: {
        email: testEmail,
        passwordHash,
        name: 'Test Administrator',
        role: 'SUPER_ADMIN',
        isActive: true
      }
    });
  });

  afterAll(async () => {
    await prisma.refreshToken.deleteMany();
    await prisma.admin.deleteMany({ where: { email: testEmail } });
    await prisma.$disconnect();
  });

  it('should authenticate valid credentials and issue tokens with secure cookie', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testEmail, password: testPassword });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.admin.email).toBe(testEmail);
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.headers['set-cookie'][0]).toContain('refresh_token=');
  });

  it('should reject invalid password with generic error message', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testEmail, password: 'WrongPassword123' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('should reject unknown email without revealing account existence', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nonexistent@shadowvideo.io', password: 'AnyPassword123' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('should trigger account lockout after 5 consecutive bad passwords', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/v1/auth/login')
        .send({ email: testEmail, password: 'WrongPasswordBurst' });
    }

    // 6th attempt must be locked out
    const lockedRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testEmail, password: testPassword });

    expect(lockedRes.status).toBe(423);
    expect(lockedRes.body.error.code).toBe('ACCOUNT_LOCKED');

    // Unlock admin for subsequent tests
    await prisma.admin.update({
      where: { email: testEmail },
      data: { failedLoginAttempts: 0, lockedUntil: null }
    });
  });

  it('should successfully rotate refresh token and invalidate previous one', async () => {
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testEmail, password: testPassword });

    const cookieHeader = loginRes.headers['set-cookie'][0];
    const rawRefreshToken = cookieHeader.split(';')[0].replace('refresh_token=', '');

    const refreshRes = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', [`refresh_token=${rawRefreshToken}`]);

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.data.accessToken).toBeDefined();

    // Reusing the old refresh token must fail
    const reusedRes = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', [`refresh_token=${rawRefreshToken}`]);

    expect(reusedRes.status).toBe(401);
    expect(reusedRes.body.error.code).toBe('SECURITY_BREACH_DETECTED');
  });
});
