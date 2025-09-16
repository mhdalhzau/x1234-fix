import { db } from '../models/database.js';
import { tenants, users } from '../models/schema.js';
import bcrypt from 'bcryptjs';

async function createTestUser() {
  try {
    console.log('👤 Creating test user...');

    // Create a test tenant first
    const [tenant] = await db.insert(tenants).values({
      businessName: 'Test Business',
      email: 'test@business.com',
      phone: '+62812345678',
      address: 'Test Address',
      status: 'trial',
      trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      maxOutlets: 1,
    }).returning();

    console.log('✅ Created test tenant:', tenant.businessName);

    // Hash password for test user
    const passwordHash = await bcrypt.hash('password123', 10);

    // Create a test user
    const [user] = await db.insert(users).values({
      tenantId: tenant.id,
      username: 'admin',
      email: 'admin@test.com',
      password: passwordHash,
      role: 'admin',
      isActive: true,
    }).returning();

    console.log('✅ Created test user:');
    console.log('   Email:', user.email);
    console.log('   Username:', user.username);
    console.log('   Password: password123');
    console.log('   Role:', user.role);

    console.log('🎉 Test user created successfully!');
    console.log('📧 You can now login with: admin@test.com / password123');
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  }
}

createTestUser();