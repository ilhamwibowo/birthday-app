require('dotenv').config();

const expressLoader = require('./express');
const mongooseLoader = require('./mongoose');
const logger = require('../config/logger');
const birthdayWorker = require('../workers/birthdayWorker');
const config = require('../config');

/**
 * Initialize all application loaders
 * @param {express.Application} app - Express application
 */
module.exports = async (app) => {
  // connect to MongoDB
  await mongooseLoader();
  logger.info('MongoDB initialized');
  
  // initialize Express
  expressLoader(app);
  logger.info('Express initialized');
  
  // start the worker
  if (config.worker.enabled) {
    birthdayWorker.start();
    logger.info('Birthday worker started');
  }
  
  return app;
};
