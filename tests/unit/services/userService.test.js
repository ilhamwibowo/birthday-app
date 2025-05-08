const moment = require('moment-timezone');
const userService = require('../../../src/services/userService');
const userRepository = require('../../../src/repositories/userRepository');
const { BadRequestError, ConflictError, NotFoundError } = require('../../../src/utils/errors');

jest.mock('../../../src/repositories/userRepository');
jest.mock('../../../src/config/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      birthday: new Date('1990-01-01'),
      timezone: 'America/New_York'
    };

    it('should create a user successfully', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue({ id: 'user123', ...userData });

      const result = await userService.createUser(userData);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(userRepository.create).toHaveBeenCalledWith(userData);
      expect(result).toHaveProperty('id', 'user123');
      expect(result).toHaveProperty('email', userData.email);
    });

    it('should throw ConflictError if email already exists', async () => {
      userRepository.findByEmail.mockResolvedValue({ id: 'existing123', email: userData.email });

      await expect(userService.createUser(userData))
        .rejects
        .toThrow(ConflictError);
      
      expect(userRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      const validationError = new Error('Validation failed');
      validationError.name = 'ValidationError';
      userRepository.create.mockRejectedValue(validationError);

      await expect(userService.createUser(userData))
        .rejects
        .toThrow(BadRequestError);
    });
  });

  describe('getUserById', () => {
    it('should return a user if found', async () => {
      const mockUser = { id: 'user123', name: 'Test User' };
      userRepository.findById.mockResolvedValue(mockUser);

      const result = await userService.getUserById('user123');

      expect(userRepository.findById).toHaveBeenCalledWith('user123');
      expect(result).toEqual(mockUser);
    });

    it('should propagate error if user not found', async () => {
      userRepository.findById.mockRejectedValue(new NotFoundError('User not found'));

      await expect(userService.getUserById('nonexistent'))
        .rejects
        .toThrow(NotFoundError);
    });
  });

  describe('updateUser', () => {
    const updateData = {
      name: 'Updated Name'
    };

    it('should update a user successfully', async () => {
      const mockUser = { 
        id: 'user123', 
        name: 'Old Name',
        email: 'test@example.com' 
      };
      userRepository.update.mockResolvedValue({ ...mockUser, ...updateData });

      const result = await userService.updateUser('user123', updateData);

      expect(userRepository.update).toHaveBeenCalledWith('user123', updateData);
      expect(result).toHaveProperty('name', 'Updated Name');
    });

    it('should throw ConflictError if updating email to existing one', async () => {
      const updateWithEmail = { email: 'existing@example.com' };
      userRepository.findByEmail.mockResolvedValue({ 
        id: 'different123', 
        email: 'existing@example.com' 
      });

      await expect(userService.updateUser('user123', updateWithEmail))
        .rejects
        .toThrow(ConflictError);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user successfully', async () => {
      userRepository.delete.mockResolvedValue(true);

      const result = await userService.deleteUser('user123');

      expect(userRepository.delete).toHaveBeenCalledWith('user123');
      expect(result).toBe(true);
    });
  });

  describe('getUsersForBirthdayNotification', () => {
    it('should return users with birthday today', async () => {
      const mockUsers = [{ id: 'user123', name: 'Birthday User' }];
      userRepository.findUsersForBirthdayNotification.mockResolvedValue(mockUsers);

      const result = await userService.getUsersForBirthdayNotification();

      expect(userRepository.findUsersForBirthdayNotification).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });
  });
});
