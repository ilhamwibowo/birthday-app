const mongoose = require('mongoose');
const config = require('../config');
const logger = require('../config/logger');

/**
 * Initialize MongoDB connection
 */
module.exports = async () => {
  try {
    // Connect to MongoDB
    const connection = await mongoose.connect(
      config.database.mongoUri,
      config.database.mongoOptions
    );
    
    // Log successful connection
    logger.info(`MongoDB connected: ${connection.connection.host}`);
    
    // Handle MongoDB connection events
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err}`);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });
    
    // Handle process termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed due to app termination');
      process.exit(0);
    });
    
    return connection;
  } catch (err) {
    logger.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};