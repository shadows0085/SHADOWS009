const { PrismaClient } = require('./platform/backend/node_modules/@prisma/client');
const bcrypt = require('./platform/backend/node_modules/bcryptjs');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:' + path.resolve(__dirname, 'platform/backend/prisma/dev.db')
    }
  }
});

async function resetPassword() {
  const email = (process.argv[2] || 'shadows0085@gmail.com').toLowerCase().trim();
  const newPassword = process.argv[3] || 'ShadowAdmin2026!';

  console.log(`\n🔑 Resetting password for: ${email}...`);

  const passwordHash = await bcrypt.hash(newPassword, 12);

  const updated = await prisma.admin.upsert({
    where: { email },
    update: {
      passwordHash,
      failedLoginAttempts: 0,
      lockedUntil: null,
      isActive: true
    },
    create: {
      email,
      passwordHash,
      name: 'Master Architect',
      role: 'SUPER_ADMIN',
      isActive: true,
      failedLoginAttempts: 0
    }
  });

  console.log('====================================================');
  console.log('✓ Administrator account updated successfully!');
  console.log(`  Email:    ${updated.email}`);
  console.log(`  Role:     ${updated.role}`);
  console.log(`  Password: ${newPassword}`);
  console.log('====================================================\n');
}

resetPassword()
  .catch(err => {
    console.error('Error resetting password:', err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
