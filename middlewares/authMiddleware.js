const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const STATUS_CODES = require("../constants/statusCodes");
const MESSAGES = require("../constants/messages");
const { SECRET_KEY } = require('../config/config');

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  console.log("Token:", token); // Debugging log

  if (!token) {
    return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: MESSAGES.UNAUTHORIZED });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    console.log("Decoded:", decoded); // Debugging log

    const user = await User.findById(decoded.id);
    console.log("User:", user); // Debugging log

    if (!user) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: MESSAGES.UNAUTHORIZED });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error:", error); // Debugging log
    return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: MESSAGES.UNAUTHORIZED });
  }
};

module.exports = authMiddleware;