const STATUS_CODES = require('../constants/statusCodes');

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
  });
};

module.exports = asyncHandler;