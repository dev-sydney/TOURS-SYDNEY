class AppError extends Error {
  /**
   * This is Class is responsible for setting which type of error occured based of the statusCode
   * It's Parent Class is the Error Class
   * @param {String} message - The error message to be sent back to the client
   * @param {Number} statusCode - The Status Code of the error
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
