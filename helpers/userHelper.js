const bcrypt = require('bcryptjs');
const User = require('../models/userModel');

// Function to find user by email and reset code
const findUserByResetCode = async (email, code) => {
  return await User.findOne({
    email,
    "passwordReset.token": code,
    "passwordReset.expiresAt": { $gt: Date.now() },
  });
};

// Function to hash the new password
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

// Function to reset the user's password
const resetUserPassword = async (user, hashedPassword) => {
  user.password = hashedPassword;
  user.passwordReset.token = undefined;
  user.passwordReset.expiresAt = undefined;
  await user.save();
};

// Function to find user by email
const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

// Function to create a new user
// const createUser = async (userData) => {
//   const user = new User(userData);
//   await user.save();
//   return user;
// };

module.exports = {
  findUserByResetCode,
  hashPassword,
  resetUserPassword,
  findUserByEmail,
  // createUser,
};