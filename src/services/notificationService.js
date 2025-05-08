const logger = require('../config/logger');
const moment = require('moment-timezone');

/**
 * Notification Service - Handles sending birthday messages and other notifications
 */
class NotificationService {
  /**
   * Send birthday message to a user
   * @param {Object} user - User object
   * @returns {Promise<boolean>} Success status
   */
  async sendBirthdayMessage(user) {
    try {
      const message = this._generateBirthdayMessage(user);
      
      logger.info(`BIRTHDAY NOTIFICATION - To: ${user.email}`);
      logger.info(message);
      
      return true;
    } catch (error) {
      logger.error(`Failed to send birthday message to ${user.id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate personalized birthday message
   * @param {Object} user - User object
   * @returns {string} Birthday message
   * @private
   */
  _generateBirthdayMessage(user) {
    const userLocalTime = moment().tz(user.timezone).format('h:mm A');
    
    return `Happy Birthday, ${user.name}! Have a fantastic day!`;
  }
}

module.exports = new NotificationService();
