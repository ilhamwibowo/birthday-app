const Joi = require('joi');
const moment = require('moment-timezone');

/**
 * Validation schemas for API endpoints
 * Custom validators for timezone, dates, and ObjectIds
 */
const userSchemas = {
  // Schema for creating a user
  createUser: Joi.object({
    name: Joi.string()
      .trim()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.empty': 'Name is required',
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name cannot exceed 100 characters',
        'any.required': 'Name is required'
      }),

    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.empty': 'Email is required',
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),

    birthday: Joi.date()
      .iso()
      .less('now')
      .required()
      .messages({
        'date.base': 'Birthday must be a valid date',
        'date.format': 'Birthday must be in ISO 8601 format',
        'date.less': 'Birthday cannot be in the future',
        'any.required': 'Birthday is required'
      }),

    timezone: Joi.string()
      .custom((value, helpers) => {
        if (!moment.tz.zone(value)) {
          return helpers.error('timezone.invalid');
        }
        return value;
      })
      .required()
      .messages({
        'string.empty': 'Timezone is required',
        'timezone.invalid': 'Please provide a valid IANA timezone',
        'any.required': 'Timezone is required'
      })
  }),

  // Schema for updating a user
  updateUser: Joi.object({
    name: Joi.string()
      .trim()
      .min(2)
      .max(100)
      .messages({
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name cannot exceed 100 characters'
      }),

    email: Joi.string()
      .email()
      .messages({
        'string.email': 'Please provide a valid email address'
      }),

    birthday: Joi.date()
      .iso()
      .less('now')
      .messages({
        'date.base': 'Birthday must be a valid date',
        'date.format': 'Birthday must be in ISO 8601 format',
        'date.less': 'Birthday cannot be in the future'
      }),

    timezone: Joi.string()
      .custom((value, helpers) => {
        if (!moment.tz.zone(value)) {
          return helpers.error('timezone.invalid');
        }
        return value;
      })
      .messages({
        'string.empty': 'Timezone is required',
        'timezone.invalid': 'Please provide a valid IANA timezone'
      }),

  }),

  // Schema for user ID validation
  getUserParams: Joi.object({
    id: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'User ID must be a valid MongoDB ObjectId',
        'string.empty': 'User ID is required',
        'any.required': 'User ID is required'
      })
  })
};

module.exports = {
  userSchemas
};
