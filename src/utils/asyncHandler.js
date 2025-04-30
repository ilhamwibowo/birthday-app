/**
 * Async handler to wrap controller functions and handle errors
 * @param {Function} fn - Controller function
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  };

module.exports = asyncHandler;