#!/usr/bin/env node

/**
 * Auto-Setup Script untuk SaaS Dashboard Application
 * Generates secure JWT secrets dan setup environment otomatis
 */

import crypto from 'crypto';
import { execSync } from 'child_process';

const REQUIRED_SECRETS = [
  'JWT_SECRET',
  'JWT_REFRESH_SECRET', 
  'STRIPE_SECRET_KEY',
  'DATABASE_URL'
];

console.log('🚀 SaaS Dashboard Auto-Setup Starting...');

// Generate secure random JWT secrets
function generateSecureSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

// Check if environment variable exists
function checkEnvVar(varName) {
  return process.env[varName] ? true : false;
}

// Generate JWT secrets if not exists
function setupJWTSecrets() {
  console.log('🔐 Setting up JWT secrets...');
  
  const jwtSecret = process.env.JWT_SECRET || generateSecureSecret(64);
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || generateSecureSecret(64);
  
  console.log('✅ JWT_SECRET: ' + (process.env.JWT_SECRET ? 'Found' : 'Generated'));
  console.log('✅ JWT_REFRESH_SECRET: ' + (process.env.JWT_REFRESH_SECRET ? 'Found' : 'Generated'));
  
  return { jwtSecret, jwtRefreshSecret };
}

// Verify database connection
async function verifyDatabase() {
  console.log('🗄️  Verifying database connection...');
  
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not found in environment');
  }
  
  try {
    // Test database connection dengan simple query
    execSync('echo "SELECT 1;" | psql "$DATABASE_URL"', { stdio: 'ignore' });
    console.log('✅ Database connection: OK');
    return true;
  } catch (error) {
    console.log('❌ Database connection: FAILED');
    console.log('💡 Please ensure PostgreSQL database is provisioned');
    return false;
  }
}

// Setup database schema dan seeding
function setupDatabase() {
  console.log('📊 Setting up database schema...');
  
  try {
    // Push database schema
    console.log('  • Pushing database schema...');
    execSync('cd backend && npm run db:push --force', { stdio: 'inherit' });
    
    // Run seeding
    console.log('  • Running database seeding...');
    execSync('cd backend && npx tsx scripts/seed.ts', { stdio: 'inherit' });
    
    console.log('✅ Database setup: COMPLETED');
    return true;
  } catch (error) {
    console.log('❌ Database setup: FAILED');
    console.log(error.message);
    return false;
  }
}

// Install dependencies
function installDependencies() {
  console.log('📦 Installing dependencies...');
  
  try {
    console.log('  • Frontend dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    
    console.log('  • Backend dependencies...');
    execSync('cd backend && npm install', { stdio: 'inherit' });
    
    console.log('✅ Dependencies: INSTALLED');
    return true;
  } catch (error) {
    console.log('❌ Dependencies: FAILED');
    console.log(error.message);
    return false;
  }
}

// Main setup function
async function main() {
  console.log('');
  console.log('==================================================');
  console.log('🚀 SaaS Dashboard Application Auto-Setup');
  console.log('==================================================');
  console.log('');
  
  try {
    // 1. Setup JWT secrets
    const secrets = setupJWTSecrets();
    
    // 2. Verify environment variables
    console.log('🔍 Checking required environment variables...');
    const missingVars = REQUIRED_SECRETS.filter(secret => !checkEnvVar(secret));
    
    if (missingVars.length > 0) {
      console.log('⚠️  Missing environment variables:');
      missingVars.forEach(varName => console.log(`  • ${varName}`));
      console.log('');
      console.log('💡 Please set missing variables in Replit Secrets');
    }
    
    // 3. Verify database
    const dbOk = await verifyDatabase();
    
    // 4. Install dependencies
    const depsOk = installDependencies();
    
    // 5. Setup database if connection is OK
    let dbSetupOk = false;
    if (dbOk) {
      dbSetupOk = setupDatabase();
    }
    
    console.log('');
    console.log('==================================================');
    console.log('📋 SETUP SUMMARY');
    console.log('==================================================');
    console.log(`✅ JWT Secrets: Generated`);
    console.log(`${dbOk ? '✅' : '❌'} Database Connection: ${dbOk ? 'OK' : 'FAILED'}`);
    console.log(`${depsOk ? '✅' : '❌'} Dependencies: ${depsOk ? 'INSTALLED' : 'FAILED'}`);
    console.log(`${dbSetupOk ? '✅' : '❌'} Database Setup: ${dbSetupOk ? 'COMPLETED' : 'FAILED'}`);
    console.log('');
    
    if (dbOk && depsOk && dbSetupOk) {
      console.log('🎉 Setup COMPLETED successfully!');
      console.log('');
      console.log('🚀 Ready to start:');
      console.log('  • Frontend: npm run dev (port 5000)');
      console.log('  • Backend: cd backend && npm run dev (port 8000)');
      console.log('');
      console.log('🔐 Login credentials:');
      console.log('  • Email: admin@system.com');
      console.log('  • Password: [from backup]');
      console.log('  • Role: superadmin');
    } else {
      console.log('⚠️  Setup completed with issues. Please resolve errors above.');
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { setupJWTSecrets, verifyDatabase, installDependencies, setupDatabase };