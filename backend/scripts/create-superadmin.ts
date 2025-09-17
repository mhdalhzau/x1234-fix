import { db } from '../models/database.js';
import { users } from '../models/schema.js';

async function createSuperadmin() {
  try {
    console.log('👤 Creating superadmin from backup...');

    // Create superadmin user with exact data from backup
    const superadmin = {
      id: '9519bbe5-f835-4e5e-9848-fde5dbbdae71',
      tenantId: null,
      username: 'superadmin',
      email: 'admin@system.com',
      password: '$2a$10$BjGQFR/1b5xPSFaltA2sLeOmnoqh6DCMQczxb.4LMAYNd/b/Hmt0K',
      role: 'admin' as const,
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date('2025-09-17T05:02:43.769Z'),
      updatedAt: new Date('2025-09-17T05:02:43.769Z')
    };

    await db.insert(users).values(superadmin).onConflictDoNothing();
    console.log('✅ Created superadmin user');
    console.log('📧 Email: admin@system.com');
    console.log('👤 Username: superadmin');
    console.log('🔐 Password: [From backup - original hash preserved]');

    console.log('🎉 Superadmin created successfully!');
  } catch (error) {
    console.error('❌ Error creating superadmin:', error);
  }
}

createSuperadmin();