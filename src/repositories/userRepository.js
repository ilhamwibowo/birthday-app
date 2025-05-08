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
 * Find users who should receive birthday notifications
 * @returns {Promise<Array>} Users to notify
 */
  async findUsersForBirthdayNotification() {
    const now = new Date(); // utc

    const usersToNotify = [];
    
    const timezonesResult = await User.distinct('timezone');
    
    for (const timezone of timezonesResult) {
      if (!timezone) continue;
      
      const options = { timeZone: timezone, hour12: false };
      const timeInTZ = new Date(now.toLocaleString('en-US', options));
      const hourInTZ = timeInTZ.getHours();
      const minuteInTZ = timeInTZ.getMinutes();
      
      if (hourInTZ === 9 && minuteInTZ >= 0 && minuteInTZ <= 14) {
        const monthInTZ = timeInTZ.getMonth();
        const dayInTZ = timeInTZ.getDate();
        
        const users = await User.find({
          timezone: timezone,
          $expr: {
            $and: [
              { $eq: [{ $month: "$birthday" }, monthInTZ + 1] },
              { $eq: [{ $dayOfMonth: "$birthday" }, dayInTZ] }
            ]
          }
        });
        
        usersToNotify.push(...users);
      }
    }
    
    return usersToNotify;
  }
}


module.exports = new UserRepository();
