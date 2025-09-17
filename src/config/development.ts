// Development configuration for SaaS Dashboard
// Contains dummy keys for development - NOT for production use

export const developmentConfig = {
  // API Configuration
  API_BASE_URL: 'http://localhost:8000/api',
  FRONTEND_URL: 'http://localhost:5000',
  
  // Stripe Configuration (Dummy Test Keys for Development)
  STRIPE_PUBLISHABLE_KEY: 'pk_test_51S8GRjFpdXOTnxbsjj29OQTCFFcfncVyCpvG3NwswkU1S3hv3WPtFNa74GI8MwoBULM97EkW6H8rgCoUSgt6mhnT00bWgSwpy3',
  
  // Application Settings
  APP_NAME: 'SaaS Dashboard',
  APP_VERSION: '1.0.0',
  ENVIRONMENT: 'development',
  
  // Feature Flags for Development
  FEATURES: {
    STRIPE_PAYMENTS: true,
    SOCIAL_LOGIN: true,
    TWO_FACTOR_AUTH: true,
    ANALYTICS_DASHBOARD: true,
    CONTENT_MANAGEMENT: true,
    MULTI_TENANT: true,
  },
  
  // Debug Settings
  DEBUG: true,
  LOG_LEVEL: 'debug',
  
  // Authentication Settings
  JWT_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  
  // Subscription Plans (IDR Currency)
  CURRENCY: 'IDR',
  CURRENCY_SYMBOL: 'Rp',
  
  // Email Settings
  SUPPORT_EMAIL: 'support@saas-dashboard.dev',
  NO_REPLY_EMAIL: 'noreply@saas-dashboard.dev',
};

// Export default for easier imports
export default developmentConfig;