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

  /**
   * Check if it's appropriate to send a birthday message (9 AM in user's timezone)
   * @param {Object} user - User object
   * @returns {boolean} True if it's time to send a message
   */
  isBirthdayMessageTime(user) {
    if (!user || !user.timezone) return false;
    

    const now = moment().tz(user.timezone);
    const hour = now.hour();
    
    return hour === 9;
  }
}

module.exports = new NotificationService();
