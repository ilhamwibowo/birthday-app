
const birthdayWorker = require('../../../src/workers/birthdayWorker');
const userService = require('../../../src/services/userService');
const notificationService = require('../../../src/services/notificationService');
const logger = require('../../../src/config/logger');
const config = require('../../../src/config'); // Import config

jest.mock('../../../src/services/userService');
jest.mock('../../../src/services/notificationService');
jest.mock('../../../src/config/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));
jest.mock('node-cron', () => ({
  schedule: jest.fn(() => ({
    stop: jest.fn()
  }))
}));

describe('Birthday Worker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    userService.findUsersForBirthdayNotification = jest.fn();
    jest.spyOn(global, 'setTimeout').mockImplementation((fn) => fn());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('start', () => {
    it('should start the worker if not already running', () => {
      birthdayWorker.running = false;

      birthdayWorker.start();

      expect(birthdayWorker.running).toBe(true);
      expect(logger.info).toHaveBeenCalledWith('Birthday worker started');
    });

    it('should not start the worker if already running', () => {
      birthdayWorker.running = true;

      birthdayWorker.start();

      expect(logger.warn).toHaveBeenCalledWith('Birthday worker is already running');
    });
  });

  describe('stop', () => {
    it('should stop the worker if running', () => {
      birthdayWorker.running = true;
      birthdayWorker.task = { stop: jest.fn() };

      birthdayWorker.stop();

      expect(birthdayWorker.running).toBe(false);
      expect(birthdayWorker.task.stop).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('Birthday worker stopped');
    });

    it('should not stop the worker if not running', () => {
      birthdayWorker.running = false;

      birthdayWorker.stop();

      expect(logger.warn).toHaveBeenCalledWith('Birthday worker is not running');
    });
  });

  describe('processBirthdays', () => {
    it('should process birthdays and send notifications to eligible users with retries', async () => {
      birthdayWorker.processLock = false;
      
      const mockUsers = [
        { id: 'user1', email: 'user1@example.com', timezone: 'America/New_York' },
        { id: 'user2', email: 'user2@example.com', timezone: 'Europe/London' }
      ];
      
      userService.getUsersForBirthdayNotification.mockResolvedValue(mockUsers);
      
      notificationService.sendBirthdayMessage
        .mockRejectedValueOnce(new Error('Simulated failure 1'))
        .mockRejectedValueOnce(new Error('Simulated failure 2'))
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);

      await birthdayWorker.processBirthdays();

      expect(userService.getUsersForBirthdayNotification).toHaveBeenCalled();
      // user1 (2 failures + 1 success) and user2 (1 success)
      expect(notificationService.sendBirthdayMessage).toHaveBeenCalledTimes(4); 
      expect(notificationService.sendBirthdayMessage).toHaveBeenCalledWith(mockUsers[0]);
      expect(notificationService.sendBirthdayMessage).toHaveBeenCalledWith(mockUsers[1]);
      expect(birthdayWorker.processLock).toBe(false);
      expect(logger.info).toHaveBeenCalledWith('Birthday processing complete. Success: 2, Failed: 0'); 
    });

    it('should handle errors when sending notifications after max attempts', async () => {
      birthdayWorker.processLock = false;
      
      const mockUsers = [
        { id: 'user1', email: 'user1@example.com', timezone: 'America/New_York' }
      ];
      
      userService.getUsersForBirthdayNotification.mockResolvedValue(mockUsers);
      
      for (let i = 0; i < config.worker.maxAttempts; i++) {
        notificationService.sendBirthdayMessage.mockRejectedValueOnce(new Error(`Simulated failure ${i + 1}`));
      }

      await birthdayWorker.processBirthdays();

      expect(userService.getUsersForBirthdayNotification).toHaveBeenCalled();
      expect(notificationService.sendBirthdayMessage).toHaveBeenCalledTimes(config.worker.maxAttempts); 
      expect(notificationService.sendBirthdayMessage).toHaveBeenCalledWith(mockUsers[0]);
      expect(logger.error).toHaveBeenCalledWith(`Failed to send birthday message to ${mockUsers[0].email} after ${config.worker.maxAttempts} attempts: Simulated failure ${config.worker.maxAttempts}`);
      expect(logger.info).toHaveBeenCalledWith('Birthday processing complete. Success: 0, Failed: 1');
      expect(birthdayWorker.processLock).toBe(false);
    });

    it('should skip processing if lock is active', async () => {
      birthdayWorker.processLock = true;

      await birthdayWorker.processBirthdays();

      expect(logger.warn).toHaveBeenCalledWith('Birthday processing already in progress, skipping');
      expect(userService.getUsersForBirthdayNotification).not.toHaveBeenCalled();
    });

    it('should handle errors in the main processing function', async () => {
      birthdayWorker.processLock = false;
      
      userService.getUsersForBirthdayNotification.mockRejectedValue(new Error('Database error'));

      await birthdayWorker.processBirthdays();

      expect(logger.error).toHaveBeenCalledWith('Error in birthday processing: Database error');
      expect(birthdayWorker.processLock).toBe(false);
    });
  });
});
