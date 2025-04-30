const express = require('express');
const userController = require('../controllers/userController');
const validator = require('../middlewares/validator');
const { userSchemas } = require('../../utils/validationSchemas');

const router = express.Router();

/**
 * @route   POST /api/users
 * @desc    Create a new user
 * @access  Public
 */
router.post(
  '/',
  validator(userSchemas.createUser),
  userController.createUser
);

/**
 * @route   GET /api/users/:id
 * @desc    Get a user by ID
 * @access  Public
 */
router.get(
  '/:id',
  validator(userSchemas.getUserParams, 'params'),
  userController.getUser
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update a user
 * @access  Public
 */
router.put(
  '/:id',
  validator(userSchemas.getUserParams, 'params'),
  validator(userSchemas.updateUser),
  userController.updateUser
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete a user
 * @access  Public
 */
router.delete(
  '/:id',
  validator(userSchemas.getUserParams, 'params'),
  userController.deleteUser
);

module.exports = router;