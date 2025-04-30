const userService = require('../../services/userService');
const asyncHandler = require('../../utils/asyncHandler');
const { BadRequestError } = require('../../utils/errors');

/**
 * User Controller - Handles HTTP requests related to users
 */
const userController = {
  /**
   * Create a new user
   * @route POST /api/users
   */
  createUser: asyncHandler(async (req, res) => {
    const user = await userService.createUser(req.body);
    res.status(201).json({
      success: true,
      data: user
    });
  }),

  /**
   * Get a user by ID
   * @route GET /api/users/:id
   */
  getUser: asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    res.status(200).json({
      success: true,
      data: user
    });
  }),

  /**
   * Update a user
   * @route PUT /api/users/:id
   */
  updateUser: asyncHandler(async (req, res) => {
    const user = await userService.updateUser(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: user
    });
  }),

  /**
   * Delete a user
   * @route DELETE /api/users/:id
   */
  deleteUser: asyncHandler(async (req, res) => {
    await userService.deleteUser(req.params.id);
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  })
};

module.exports = userController;