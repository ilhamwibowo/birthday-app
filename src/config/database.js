/**
 * Database configuration
 */
module.exports = {
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/birthday-reminder',
    
    mongoOptions: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: true,
      socketTimeoutMS: 30000,
      connectTimeoutMS: 30000,
    }
  };
