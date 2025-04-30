
const logger = require('../../../src/config/logger');
const moment = require('moment-timezone');

jest.mock('../../../src/config/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

jest.mock('moment-timezone', () => {
  const mockHour = jest.fn();
  const mockFormat = jest.fn();

  const mockMomentTZ = {
    hour: mockHour,
    format: mockFormat,
  };

  const mockMoment = jest.fn(() => ({
    tz: jest.fn(() => mockMomentTZ),
  }));

  return mockMoment;
});

const notificationService = jest.requireActual('../../../src/services/notificationService');

describe('Notification Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendBirthdayMessage', () => {
    it('should send a birthday message successfully', async () => {
      const user = {
        id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        timezone: 'America/New_York'
      };
      
      const result = await notificationService.sendBirthdayMessage(user);

      expect(result).toBe(true);
      expect(logger.info).toHaveBeenCalledWith(`BIRTHDAY NOTIFICATION - To: ${user.email}`);
      expect(logger.info).toHaveBeenCalledWith(`Happy Birthday, ${user.name}! Have a fantastic day!`);
    });

  });

  describe('isBirthdayMessageTime', () => {
    it('should return true when it is 9 AM in user timezone', () => {
      const user = {
        timezone: 'America/New_York'
      };

      moment().tz().hour.mockReturnValue(9);

      const result = notificationService.isBirthdayMessageTime(user);

      expect(result).toBe(true);
    });

    it('should return false when it is not 9 AM in user timezone', () => {
      const user = {
        timezone: 'America/New_York'
      };

      moment().tz().hour.mockReturnValue(10);

      const result = notificationService.isBirthdayMessageTime(user);

      expect(result).toBe(false);
    });

    it('should return false for invalid input', () => {
      expect(notificationService.isBirthdayMessageTime(null)).toBe(false);
      expect(notificationService.isBirthdayMessageTime({})).toBe(false);
      expect(notificationService.isBirthdayMessageTime({ timezone: null })).toBe(false);
    });
  });

  describe('_generateBirthdayMessage', () => {
    it('should generate a personalized birthday message', () => {
      const user = {
        name: 'Test User',
        timezone: 'America/New_York'
      };

      moment().tz().format.mockReturnValue('9:00 AM');

      const message = notificationService._generateBirthdayMessage(user);

      expect(message).toBe('Happy Birthday, Test User! Have a fantastic day!');
    });
  });
});
