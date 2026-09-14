import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { env } from '../src/config/env';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding initial Super Admin account...');

  const existing = await prisma.admin.findUnique({
    where: { email: env.SUPER_ADMIN_EMAIL.toLowerCase().trim() }
  });

  if (existing) {
    console.log(`ℹ️  Super Admin already exists (${existing.email}). Skipping.`);
    return;
  }

  if (!env.SUPER_ADMIN_PASSWORD) {
    throw new Error('FATAL: SUPER_ADMIN_PASSWORD environment variable is required to seed initial administrator.');
  }

  const passwordHash = await bcrypt.hash(env.SUPER_ADMIN_PASSWORD, 12);

  const superAdmin = await prisma.admin.create({
    data: {
      email: env.SUPER_ADMIN_EMAIL.toLowerCase().trim(),
      passwordHash,
      name: env.SUPER_ADMIN_NAME,
      role: 'SUPER_ADMIN',
      isActive: true
    }
  });

  await prisma.auditLog.create({
    data: {
      adminId: superAdmin.id,
      action: 'SYSTEM_BOOTSTRAP_SUPER_ADMIN_CREATED',
      resourceType: 'Admin',
      resourceId: superAdmin.id,
      metadata: JSON.stringify({ email: superAdmin.email, role: superAdmin.role })
    }
  });

  console.log('====================================================');
  console.log('✓ Initial Super Admin Created Successfully');
  console.log(`  Email:    ${superAdmin.email}`);
  console.log(`  Role:     ${superAdmin.role}`);
  console.log(`  Password: [Configured via env.SUPER_ADMIN_PASSWORD]`);
  console.log('====================================================');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
