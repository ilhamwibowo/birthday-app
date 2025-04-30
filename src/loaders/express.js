const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const config = require('../config');
const apiRoutes = require('../api');
const errorHandler = require('../api/middlewares/errorHandler');
const logger = require('../config/logger');
const { NotFoundError } = require('../utils/errors');

/**
 * Initialize Express application with middleware and routes
 * @param {express.Application} app - Express application
 */
module.exports = (app) => {
  // Security headers
  app.use(helmet());
  
  // CORS configuration
  app.use(cors(config.server.cors));
  
  // Body parsers
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  
  // Compression
  app.use(compression());
  
  // Request logging
  if (config.server.environment === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined', {
      skip: (req, res) => res.statusCode < 400,
      stream: { write: message => logger.http(message.trim()) }
    }));
  }
  
  // Rate limiting
  const limiter = rateLimit(config.server.rateLimit);
  app.use('/api', limiter);
  
  // Mount API routes
  app.use('/api', apiRoutes);
  
  // Handle 404 errors
  app.use((req, res, next) => {
    next(new NotFoundError(`Endpoint ${req.originalUrl} not found`));
  });
  
  // Global error handler
  app.use(errorHandler);
  
  // Return configured app
  return app;
};