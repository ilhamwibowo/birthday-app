/**
 * Base Error class for consistent error handling
 */
class BaseError extends Error {
    constructor(message, statusCode = 500, errors = null) {
      super(message);
      this.statusCode = statusCode;
      this.errors = errors;
      this.name = this.constructor.name;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  /**
   * 400 Bad Request Error
   */
  class BadRequestError extends BaseError {
    constructor(message = 'Bad Request', errors = null) {
      super(message, 400, errors);
    }
  }
  
  /**
   * 401 Unauthorized Error
   */
  class UnauthorizedError extends BaseError {
    constructor(message = 'Unauthorized', errors = null) {
      super(message, 401, errors);
    }
  }
  
  /**
   * 403 Forbidden Error
   */
  class ForbiddenError extends BaseError {
    constructor(message = 'Forbidden', errors = null) {
      super(message, 403, errors);
    }
  }
  
  /**
   * 404 Not Found Error
   */
  class NotFoundError extends BaseError {
    constructor(message = 'Resource not found', errors = null) {
      super(message, 404, errors);
    }
  }
  
  /**
   * 409 Conflict Error
   */
  class ConflictError extends BaseError {
    constructor(message = 'Resource already exists', errors = null) {
      super(message, 409, errors);
    }
  }
  
  /**
   * 422 Unprocessable Entity Error
   */
  class UnprocessableEntityError extends BaseError {
    constructor(message = 'Unprocessable Entity', errors = null) {
      super(message, 422, errors);
    }
  }
  
  /**
   * 429 Too Many Requests Error
   */
  class TooManyRequestsError extends BaseError {
    constructor(message = 'Too many requests, please try again later', errors = null) {
      super(message, 429, errors);
    }
  }
  
  /**
   * 500 Internal Server Error
   */
  class InternalServerError extends BaseError {
    constructor(message = 'Internal Server Error', errors = null) {
      super(message, 500, errors);
    }
  }
  
  module.exports = {
    BaseError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    UnprocessableEntityError,
    TooManyRequestsError,
    InternalServerError
  };