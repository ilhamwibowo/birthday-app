const User = require('../models/user');
const { NotFoundError } = require('../utils/errors');

/**
 * User Repository - Data access layer for user operations
 */
class UserRepository {
  /**
   * Create a new user
   * @param {Object} userData - User data to create
   * @returns {Promise<Object>} Created user
   */
  async create(userData) {
    const user = new User(userData);
    await user.save();
    return user;
  }

  /**
   * Find user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object>} Found user or null
   */
  async findById(id) {
    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError(`User with id ${id} not found`);
    }
    return user;
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object>} Found user or null
   */
  async findByEmail(email) {
    return User.findOne({ email });
  }

  /**
   * Update a user
   * @param {string} id - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user
   */
  async update(id, updateData) {
    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!user) {
      throw new NotFoundError(`User with id ${id} not found`);
    }
    
    return user;
  }

  /**
   * Delete a user
   * @param {string} id - User ID
   * @returns {Promise<boolean>} True if deleted
   */
  async delete(id) {
    const result = await User.findByIdAndDelete(id);
    
    if (!result) {
      throw new NotFoundError(`User with id ${id} not found`);
    }
    
    return true;
  }

  /**
   * Find users with birthday today in their timezone
   * @returns {Promise<Array>} Users with birthday today
   */
  async findUsersWithBirthdayToday() {
    const users = await User.find({});
    
    const usersWithBirthdayToday = users.filter(user => {
      // Get current date in user's timezone
      const now = new Date();
      const userBirthday = new Date(user.birthday);
      
      // Convert to user's timezone
      const moment = require('moment-timezone');
      const userNow = moment(now).tz(user.timezone);
      
      // Check if today is their birthday (ignore year)
      return userNow.month() === userBirthday.getMonth() && 
             userNow.date() === userBirthday.getDate();
    });


    return usersWithBirthdayToday;
  }
}

module.exports = new UserRepository();
