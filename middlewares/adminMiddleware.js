const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const STATUS_CODES = require("../constants/statusCodes");
const MESSAGES = require("../constants/messages");
const { SECRET_KEY } = require('../config/config');

const adminMiddleware = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    console.log("No token provided");
    return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: MESSAGES.UNAUTHORIZED });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await User.findById(decoded.id);

    if (!user) {
      console.log("User not found");
      return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: MESSAGES.UNAUTHORIZED });
    }

    if (user.role !== "admin") {
      console.log("User is not an admin");
      return res.status(STATUS_CODES.FORBIDDEN).json({ message: MESSAGES.FORBIDDEN });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error:", error);
    return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: MESSAGES.UNAUTHORIZED });
  }
};

module.exports = adminMiddleware;