const MESSAGES = require("../constants/messages");
const STATUS_CODES = require("../constants/statusCodes");

// errorMiddleware.js
const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || STATUS_CODES.INTERNAL_SERVER_ERROR;
  const message = err.message || MESSAGES.INTERNAL_SERVER_ERROR;

  res.status(statusCode).json({ message });
};

module.exports = errorMiddleware;