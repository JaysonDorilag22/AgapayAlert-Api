function successHandler(res, statusCode, message, data = {}) {
  if (res.headersSent) {
    console.error('Headers already sent');
    return;
  }
  res.status(statusCode).json({ message, ...data });
}

module.exports = { successHandler };