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


//create new User
const createUser = async (req, res, userData) => {
  const avatarData = await uploadAvatar(req.file);
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const { verificationCode, verificationExpires } = generateVerificationCode();

  const user = new User({
    ...userData,
    password: hashedPassword,
    avatar: avatarData,
    verification: {
      code: verificationCode,
      expiresAt: verificationExpires,
      lastRequestedAt: Date.now(),
    },
  });

  await user.save();
  await sendVerificationEmail(user.email, verificationCode);

  return res.status(STATUS_CODES.CREATED).json({ message: MESSAGES.VERIFICATION_CODE_SENT });
};



module.exports = {
  findUserByResetCode,
  hashPassword,
  resetUserPassword,
  validateRequestBody,
  handleExistingUser,
  createUser,
};