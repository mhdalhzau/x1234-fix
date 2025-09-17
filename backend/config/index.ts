// Configuration Index
// Automatically loads the appropriate config based on NODE_ENV

import developmentConfig from './development.js';

const NODE_ENV = process.env.NODE_ENV || 'development';

let config;

switch (NODE_ENV) {
  case 'production':
    // For production, use environment variables directly
    config = {
      ...developmentConfig,
      DEBUG: false,
      LOG_LEVEL: 'info',
    };
    break;
  case 'test':
    config = {
      ...developmentConfig,
      DATABASE_URL: process.env.TEST_DATABASE_URL || developmentConfig.DATABASE_URL,
      DEBUG: false,
    };
    break;
  case 'development':
  default:
    config = developmentConfig;
    break;
}

export default config;

// Export commonly used config values
export const {
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  STRIPE_SECRET_KEY,
  STRIPE_PUBLISHABLE_KEY,
  DATABASE_URL,
  PORT,
  FRONTEND_URL,
  NODE_ENV: ENVIRONMENT,
} = config;