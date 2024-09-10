// utils/errorHandler.js
function handleError(res, error, statusCode, message) {
    console.error(error); // Log the error for debugging purposes
    res.status(statusCode).json({ message });
  }
  
  module.exports = { handleError };