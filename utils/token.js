const jwt = require('jsonwebtoken');
const { SECRET_KEY, TOKEN_EXPIRATION } = require('../config/config');

const createToken = (user) => {
  return jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: TOKEN_EXPIRATION });
};

const setTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 3600000,
  });
};

module.exports = {
  createToken,
  setTokenCookie,
};