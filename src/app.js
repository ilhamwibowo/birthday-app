require('dotenv').config();
const express = require('express');
const config = require('./config');
const logger = require('./config/logger');
const loaders = require('./loaders');

/**
 * App entry point
 */
async function startServer() {
  const app = express();
  
  await loaders(app);
  
  app.listen(config.server.port, () => {
    logger.info(`
      ################################################
      🎂 Birthday Reminder Service Started 🎂
      Server listening on port: ${config.server.port}
      Environment: ${config.server.environment}
      ################################################
    `);
  });
  
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception', err);
    process.exit(1);
  });
  
  process.on('unhandledRejection', (err) => {
    logger.error('Unhandled rejection', err);
    process.exit(1);
  });
  
  return app;
}

// Start the server
startServer();

// Export for testing
module.exports = { startServer };
