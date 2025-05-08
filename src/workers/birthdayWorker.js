const cron = require('node-cron');
const userService = require('../services/userService');
const notificationService = require('../services/notificationService');
const logger = require('../config/logger');
const moment = require('moment-timezone');
const { promisify } = require('util');
const config = require('../config');

/**
 * Birthday Worker - Handles scheduling and sending birthday notifications
 */
class BirthdayWorker {
  constructor() {
    this.running = false;
    this.task = null;
    this.processLock = false;
  }

  /**
   * Start the birthday worker
   * Runs every hour to check for users with birthdays
   */
  start() {
    if (this.running) {
      logger.warn('Birthday worker is already running');
      return;
    }

    // Schedule task to run based on the configured interval
    this.task = cron.schedule(config.worker.checkInterval, async () => {
      await this.processBirthdays();
    });
    
    this.running = true;
    logger.info('Birthday worker started');
    
    // Run immediately on startup as well
    setImmediate(() => this.processBirthdays());
  }

  /**
   * Stop the birthday worker
   */
  stop() {
    if (!this.running) {
      logger.warn('Birthday worker is not running');
      return;
    }

    this.task.stop();
    this.running = false;
    logger.info('Birthday worker stopped');
  }

  /**
   * Process birthdays - main worker function
   */
  async processBirthdays() {
    if (this.processLock) {
      logger.warn('Birthday processing already in progress, skipping');
      return;
    }
    
    try {
      this.processLock = true;
      logger.info('Processing birthdays...');
      
      // Get users with birthdays today (in their local timezone)
      const users = await userService.getUsersForBirthdayNotification();
      logger.info(`Found ${users.length} users with birthdays today`);
      
      let successCount = 0;
      let failCount = 0;
      
      for (const user of users) {
        let attempt = 0;
        
        while (attempt < config.worker.maxAttempts) {
          try {
            await notificationService.sendBirthdayMessage(user);
            successCount++;
            logger.info(`Birthday message sent to ${user.email} (attempt ${attempt + 1})`);
            break;
          } catch (err) {
            attempt++;
            if (attempt >= config.worker.maxAttempts) {
              failCount++;
              logger.error(`Failed to send birthday message to ${user.email} after ${config.worker.maxAttempts} attempts: ${err.message}`);
            } else {
              const delay = config.worker.baseDelay * Math.pow(2, attempt - 1); // 2 ** x
              logger.warn(`Retrying to send birthday message to ${user.email} (attempt ${attempt}) after ${delay}ms`);
              await new Promise(res => setTimeout(res, delay));
            }
          }
        }
      }
      
      logger.info(`Birthday processing complete. Success: ${successCount}, Failed: ${failCount}`);
    } catch (err) {
      logger.error(`Error in birthday processing: ${err.message}`);
    } finally {
      this.processLock = false;
    }
  }

  // For testing purposes
  async forceProcessBirthdays() {
    await this.processBirthdays();
  }
}

module.exports = new BirthdayWorker();
