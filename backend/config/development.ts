// Development Configuration for SaaS Backend
// Contains all dummy keys for development environment
// This file can be edited to update keys without changing workflow commands

export const developmentConfig = {
  // Database Configuration
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:password@helium/heliumdb?sslmode=disable',
  
  // JWT Authentication (Dummy Keys for Development)
  JWT_SECRET: process.env.JWT_SECRET || 'd033c6cd1c40612e521cefe0c6e22541',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || '2a9622040fcabb746cbe3bf60a9b2ec0',
  
  // Stripe Payment Integration (Dummy Test Keys for Development)
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || 'sk_test_51S8GRjFpdXOTnxbslFQlmh7M2g1igjHGrBYzz7f4fqgJ4NWhy0QMgccxWNw2gtIrfYFg8hZ6BQcQ4kuZ3CyCoGx200wgTzjDom',
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_51S8GRjFpdXOTnxbsjj29OQTCFFcfncVyCpvG3NwswkU1S3hv3WPtFNa74GI8MwoBULM97EkW6H8rgCoUSgt6mhnT00bWgSwpy3',
  
  // Server Configuration
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5000',
  
  // Email Configuration (Replit Mail Integration)
  MAIL_HOST: process.env.MAIL_HOST || 'smtp.replit.com',
  MAIL_PORT: process.env.MAIL_PORT || 587,
  MAIL_USER: process.env.MAIL_USER || 'noreply@replit.com',
  MAIL_PASS: process.env.MAIL_PASS || 'replit_mail_dummy',
  
  // Session Configuration
  SESSION_SECRET: process.env.SESSION_SECRET || 'dev_session_secret_12345',
  
  // CORS Configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || ['http://localhost:5000', 'http://0.0.0.0:5000'],
  
  // JWT Token Expiration
  JWT_EXPIRY: '15m',
  JWT_REFRESH_EXPIRY: '7d',
  
  // Application Metadata
  APP_NAME: 'SaaS Dashboard Backend',
  APP_VERSION: '1.0.0',
  
  // Feature Flags
  FEATURES: {
    STRIPE_PAYMENTS: true,
    EMAIL_NOTIFICATIONS: true,
    TWO_FACTOR_AUTH: true,
    SOCIAL_LOGIN: true,
    ANALYTICS: true,
    CONTENT_MANAGEMENT: true,
    MULTI_TENANT: true,
  },
  
  // Development Settings
  DEBUG: true,
  LOG_LEVEL: 'debug',
  
  // Rate Limiting
  RATE_LIMIT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
  
  // File Upload Settings
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  
  // Pagination Defaults
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};

// Export individual configs for easier access
export const {
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  STRIPE_SECRET_KEY,
  STRIPE_PUBLISHABLE_KEY,
  DATABASE_URL,
  PORT,
  NODE_ENV,
  FRONTEND_URL,
} = developmentConfig;

export default developmentConfig;