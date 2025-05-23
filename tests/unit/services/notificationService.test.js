
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
    let mathRandomSpy;

    beforeEach(() => {
      mathRandomSpy = jest.spyOn(Math, 'random');
    });

    afterEach(() => {
      mathRandomSpy.mockRestore();
    });

    it('should send a birthday message successfully', async () => {
      mathRandomSpy.mockReturnValue(0.6); 

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

    it('should throw an error on simulated failure', async () => {
      mathRandomSpy.mockReturnValue(0.4); 

      const user = {
        id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        timezone: 'America/New_York'
      };
      
      await expect(notificationService.sendBirthdayMessage(user)).rejects.toThrow('Simulated send failure');
      expect(logger.error).toHaveBeenCalledWith(`Failed to send birthday message to ${user.id}: Simulated send failure`);
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
