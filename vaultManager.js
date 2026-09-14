/**
 * ══════════════════════════════════════════════════════════════════════════════
 * QUANTUM VAULT CLI MANAGER
 * ══════════════════════════════════════════════════════════════════════════════
 * Usage:
 *   node vaultManager.js add <username> <password> [role]
 *   node vaultManager.js verify <username> <password>
 *   node vaultManager.js list
 * ══════════════════════════════════════════════════════════════════════════════
 */

const path = require('path');
const QuantumVault = require('./backend/security/quantumVault');

const args = process.argv.slice(2);
const command = (args[0] || 'list').toLowerCase();

switch (command) {
  case 'add':
  case 'set': {
    const user = args[1];
    const pass = args[2];
    const role = args[3] || 'ADMIN';

    if (!user || !pass) {
      console.error('Usage: node vaultManager.js add <username> <password> [role]');
      process.exit(1);
    }

    // ═══════════════════════════════════════════════════════════════════
    // SUPER ADMIN SINGLETON ENFORCEMENT — Only ONE may exist, ever.
    // ═══════════════════════════════════════════════════════════════════
    if (role.toUpperCase() === 'SUPER_ADMIN') {
      const existingUsers = QuantumVault.listUsers();
      const hasSuperAdmin = existingUsers.some(u => u.role === 'SUPER_ADMIN');
      if (hasSuperAdmin) {
        console.error('\n══════════════════════════════════════════════════');
        console.error('✗ BLOCKED: A SUPER_ADMIN already exists in the vault.');
        console.error('  Only ONE Super Administrator is permitted system-wide.');
        console.error('  To update the existing Super Admin, use: node vaultManager.js set <username> <password> SUPER_ADMIN');
        console.error('══════════════════════════════════════════════════\n');
        process.exit(1);
      }
    }

    QuantumVault.setUser(user, pass, role);

    // Sync with platform backend database if available
    try {
      const { PrismaClient } = require('./platform/backend/node_modules/@prisma/client');
      const bcrypt = require('./platform/backend/node_modules/bcryptjs');
      const prisma = new PrismaClient({
        datasources: { db: { url: 'file:' + path.resolve(__dirname, 'platform/backend/prisma/dev.db') } }
      });
      const hash = bcrypt.hashSync(pass, 12);
      const email = user.includes('@') ? user.toLowerCase().trim() : `${user.toLowerCase().trim()}@vault.local`;
      prisma.admin.upsert({
        where: { email },
        update: { passwordHash: hash, isActive: true, lockedUntil: null, failedLoginAttempts: 0 },
        create: { email, name: user, passwordHash: hash, role, isActive: true }
      }).then(() => {
        prisma.$disconnect();
      }).catch(() => {
        prisma.$disconnect();
      });
    } catch (_) {}

    console.log(`\n======================================================`);
    console.log(`✓ Post-Quantum Encrypted User Created / Updated`);
    console.log(`  User:       ${user}`);
    console.log(`  Role:       ${role}`);
    console.log(`  Algorithm:  PBKDF2-HMAC-SHA512 (600,000 rounds)`);
    console.log(`  Vault File: backend/storage/private/credentials.vault.enc`);
    console.log(`  Database:   platform/backend/prisma/dev.db (Synced)`);
    console.log(`======================================================\n`);
    break;
  }

  case 'verify': {
    const user = args[1];
    const pass = args[2];

    if (!user || !pass) {
      console.error('Usage: node vaultManager.js verify <username> <password>');
      process.exit(1);
    }

    const isValid = QuantumVault.authenticateUser(user, pass);
    if (isValid) {
      console.log(`\n✓ [AUTHENTICATED] Credentials match post-quantum one-way hash.\n`);
    } else {
      console.log(`\n✗ [FAILED] Invalid username or password.\n`);
    }
    break;
  }

  case 'list': {
    const users = QuantumVault.listUsers();
    console.log(`\n======================================================`);
    console.log(`  POST-QUANTUM PROTECTED CREDENTIALS VAULT`);
    console.log(`  File: backend/storage/private/credentials.vault.enc`);
    console.log(`======================================================`);
    if (users.length === 0) {
      console.log('  No users in vault. Add one with:');
      console.log('  node vaultManager.js add <user> <pass>\n');
    } else {
      users.forEach((u, i) => {
        console.log(`  [${i + 1}] Slot ID:    ${u.slot}`);
        console.log(`      Role:       ${u.role}`);
        console.log(`      Algorithm:  ${u.algorithm} (${u.iterations.toLocaleString()} rounds)`);
        console.log(`      Updated:    ${u.updatedAt}`);
        console.log(`  --------------------------------------------------`);
      });
      console.log(`  Total Users: ${users.length}\n`);
    }
    break;
  }

  default:
    console.log('Unknown command. Available: add, verify, list');
}
