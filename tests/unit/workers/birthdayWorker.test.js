
const birthdayWorker = require('../../../src/workers/birthdayWorker');
const userService = require('../../../src/services/userService');
const notificationService = require('../../../src/services/notificationService');
const logger = require('../../../src/config/logger');

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
    it('should process birthdays and send notifications to eligible users', async () => {
      birthdayWorker.processLock = false;
      
      const mockUsers = [
        { id: 'user1', email: 'user1@example.com', timezone: 'America/New_York' },
        { id: 'user2', email: 'user2@example.com', timezone: 'Europe/London' }
      ];
      
      userService.getUsersWithBirthdayToday.mockResolvedValue(mockUsers);
      
      notificationService.isBirthdayMessageTime.mockImplementation((user) => {
        return user.id === 'user1';
      });
      
      notificationService.sendBirthdayMessage.mockResolvedValue(true);

      await birthdayWorker.processBirthdays();

      expect(userService.getUsersWithBirthdayToday).toHaveBeenCalled();
      expect(notificationService.isBirthdayMessageTime).toHaveBeenCalledTimes(2);
      expect(notificationService.sendBirthdayMessage).toHaveBeenCalledTimes(1);
      expect(notificationService.sendBirthdayMessage).toHaveBeenCalledWith(mockUsers[0]);
      expect(birthdayWorker.processLock).toBe(false);
      expect(logger.info).toHaveBeenCalledWith('Birthday processing complete. Success: 1, Failed: 0');
    });

    it('should handle errors when sending notifications', async () => {
      birthdayWorker.processLock = false;
      
      const mockUsers = [
        { id: 'user1', email: 'user1@example.com', timezone: 'America/New_York' }
      ];
      
      userService.getUsersWithBirthdayToday.mockResolvedValue(mockUsers);
      notificationService.isBirthdayMessageTime.mockReturnValue(true);
      notificationService.sendBirthdayMessage.mockRejectedValue(new Error('Failed to send'));

      await birthdayWorker.processBirthdays();

      expect(logger.error).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('Birthday processing complete. Success: 0, Failed: 1');
      expect(birthdayWorker.processLock).toBe(false);
    });

    it('should skip processing if lock is active', async () => {
      birthdayWorker.processLock = true;

      await birthdayWorker.processBirthdays();

      expect(logger.warn).toHaveBeenCalledWith('Birthday processing already in progress, skipping');
      expect(userService.getUsersWithBirthdayToday).not.toHaveBeenCalled();
    });

    it('should handle errors in the main processing function', async () => {
      birthdayWorker.processLock = false;
      
      userService.getUsersWithBirthdayToday.mockRejectedValue(new Error('Database error'));

      await birthdayWorker.processBirthdays();

      expect(logger.error).toHaveBeenCalled();
      expect(birthdayWorker.processLock).toBe(false);
    });
  });
});
