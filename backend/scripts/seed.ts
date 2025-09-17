import { db } from '../models/database.js';
import { subscriptionPlans, modules } from '../models/schema.js';

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');

    // Create subscription plans
    const plans = [
      {
        name: 'Basic',
        description: 'Perfect for small businesses',
        price: '250000',
        currency: 'IDR',
        interval: 'monthly' as const,
        maxOutlets: 1,
        maxUsers: 3,
        features: ['Basic POS', 'Inventory Management', 'Sales Reports', 'Email Support'],
        isActive: true,
      },
      {
        name: 'Pro',
        description: 'Great for growing businesses',
        price: '500000',
        currency: 'IDR',
        interval: 'monthly' as const,
        maxOutlets: 5,
        maxUsers: 10,
        features: ['Advanced POS', 'Multi-outlet Management', 'Advanced Reports', 'Loyalty Program', 'Priority Support'],
        isActive: true,
      },
      {
        name: 'Enterprise',
        description: 'For large businesses',
        price: '1000000',
        currency: 'IDR',
        interval: 'monthly' as const,
        maxOutlets: 999,
        maxUsers: 999,
        features: ['Enterprise POS', 'Unlimited Outlets', 'Custom Reports', 'API Access', 'Dedicated Support'],
        isActive: true,
      },
    ];

    await db.insert(subscriptionPlans).values(plans);
    console.log('✅ Created subscription plans');

    // Create modules
    const moduleList = [
      {
        name: 'pos',
        displayName: 'Point of Sale',
        description: 'Core POS functionality for sales processing',
        isDefault: true,
      },
      {
        name: 'inventory',
        displayName: 'Inventory Management',
        description: 'Track and manage product inventory',
        isDefault: true,
      },
      {
        name: 'reports',
        displayName: 'Reports & Analytics',
        description: 'Sales reports and business analytics',
        isDefault: false,
      },
      {
        name: 'loyalty',
        displayName: 'Loyalty Program',
        description: 'Customer loyalty and rewards program',
        isDefault: false,
      },
    ];

    await db.insert(modules).values(moduleList);
    console.log('✅ Created modules');

    // Create superadmin user from backup
    const { users } = await import('../models/schema.js');
    
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
    console.log('✅ Created superadmin user (admin@system.com)');

    console.log('🎉 Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

seedDatabase();