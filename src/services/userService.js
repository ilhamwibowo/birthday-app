const userRepository = require('../repositories/userRepository');
const { BadRequestError, ConflictError } = require('../utils/errors');
const logger = require('../config/logger');

/**
 * User Service - Business logic for user operations
 */
class UserService {
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  async createUser(userData) {
    try {
      // must be unique
      const existingUser = await userRepository.findByEmail(userData.email);
      if (existingUser) {
        throw new ConflictError(`User with email ${userData.email} already exists`);
      }
      
      const user = await userRepository.create(userData);
      logger.info(`User created: ${user.id}`);
      
      return user;
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new BadRequestError(error.message);
      }
      throw error;
    }
  }

  /**
   * Get user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object>} User object
   */
  async getUserById(id) {
    const user = await userRepository.findById(id);
    return user;
  }

  /**
   * Update user
   * @param {string} id - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user
   */
  async updateUser(id, updateData) {
    try {
      // unique email
      if (updateData.email) {
        const existingUser = await userRepository.findByEmail(updateData.email);
        if (existingUser && existingUser.id.toString() !== id) {
          throw new ConflictError(`User with email ${updateData.email} already exists`);
        }
      }
      
      const user = await userRepository.update(id, updateData);
      logger.info(`User updated: ${user.id}`);
      
      return user;
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new BadRequestError(error.message);
      }
      throw error;
    }
  }

  /**
   * Delete user
   * @param {string} id - User ID
   * @returns {Promise<boolean>} True if deleted
   */
  async deleteUser(id) {
    const deleted = await userRepository.delete(id);
    if (deleted) {
      logger.info(`User deleted: ${id}`);
    }
    return deleted;
  }

  /**
   * Get users eligible for birthday notification
   * Used by the notification service
   * @returns {Promise<Array>} Users eligible for birthday notification
   */
  async getUsersForBirthdayNotification() {
    return userRepository.findUsersForBirthdayNotification();
  }
}

module.exports = new UserService();