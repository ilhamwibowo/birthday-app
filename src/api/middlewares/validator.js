const Joi = require('joi');
const { BadRequestError } = require('../../utils/errors');

/**
 * Validation middleware
 * @param {Object} schema - Joi validation schema
 * @param {string} property - Request property to validate (body, params, query)
 * @returns {Function} Express middleware
 */
const validator = (schema, property = 'body') => {
  return (req, res, next) => {
    if (!schema) return next();

    const { error } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      errors: {
        wrap: {
          label: false
        }
      }
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');
        
      return next(new BadRequestError(errorMessage));
    }

    // Replace request data with validated data
    req[property] = schema._inner.children
      ? schema.validate(req[property], { stripUnknown: true }).value
      : req[property];

    next();
  };
};

module.exports = validator;