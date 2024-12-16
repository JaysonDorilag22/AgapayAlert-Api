const { userSchema } = require('./validationHelper');
const { generateVerificationCode } = require('../utils/verification');
const { sendVerificationEmail } = require('../utils/sendEmail');
const { uploadAvatar } = require('../utils/avatarUpload');
const STATUS_CODES = require('../constants/statusCodes');
const MESSAGES = require("../constants/messages");
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


// Function to validate the request body
const validateRequestBody = (body) => {
  const { error } = userSchema.validate(body);
  return error;
};


// Function to handle existing user
const handleExistingUser = async (res, existingUser) => {
  if (!existingUser.verified) {
    if (existingUser.verification.expiresAt < Date.now()) {
      const { verificationCode, verificationExpires } = generateVerificationCode();
      existingUser.verification.code = verificationCode;
      existingUser.verification.expiresAt = verificationExpires;
      existingUser.verification.lastRequestedAt = Date.now();
      await existingUser.save();
      await sendVerificationEmail(existingUser.email, verificationCode);
      return res.status(STATUS_CODES.OK).json({ message: MESSAGES.VERIFICATION_CODE_SENT });
    }
    return res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.VERIFICATION_CODE_SENT });
  }
  return res.status(STATUS_CODES.CONFLICT).json({ message: MESSAGES.USER_ALREADY_EXISTS });
};

const updateUserFields = (user, fields) => {
  const { firstname, lastname, email, address, phoneNo, preferred_notifications } = fields;

  if (firstname !== undefined) user.firstname = firstname;
  if (lastname !== undefined) user.lastname = lastname;
  if (email !== undefined) user.email = email;
  if (address) {
    const { street, city, state, zipCode, country } = address;
    if (street !== undefined) user.address.street = street;
    if (city !== undefined) user.address.city = city;
    if (state !== undefined) user.address.state = state;
    if (zipCode !== undefined) user.address.zipCode = zipCode;
    if (country !== undefined) user.address.country = country;
  }
  if (phoneNo !== undefined) user.phoneNo = phoneNo;
  if (preferred_notifications !== undefined) user.preferred_notifications = preferred_notifications;
};


module.exports = {
  findUserByResetCode,
  hashPassword,
  resetUserPassword,
  validateRequestBody,
  handleExistingUser,
  updateUserFields,
};