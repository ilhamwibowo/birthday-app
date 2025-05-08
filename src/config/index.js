const database = require('./database');
const logger = require('./logger');

/**
 * Application configuration
 */
module.exports = {
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development',
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      max: 100,
    },
  },
  
  // Database configuration (from database.js)
  database,
  
  // Worker configuration
  worker: {
    enabled: process.env.WORKER_ENABLED === 'true' || true,
    checkInterval: process.env.WORKER_CHECK_INTERVAL || '*/15 * * * *',
  }
};