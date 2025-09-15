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

    console.log('🎉 Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

seedDatabase();