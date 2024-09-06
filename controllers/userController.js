const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/userModel');
const { userSchema } = require('../helpers/validationHelper');
const cloudinary = require('../config/cloudinaryConfig');
const upload = require('../config/multer');
const { createToken, setTokenCookie } = require('../helpers/tokenHelper');
const asyncHandler = require('../helpers/asyncHandler');
const STATUS_CODES = require('../constants/statusCodes');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../helpers/emailHelper');
const { validateResetPasswordInput } = require('../helpers/validationHelper');
const { findUserByResetCode, hashPassword, resetUserPassword } = require('../helpers/userHelper');
const MESSAGES = require('../constants/messages'); 

// Signup function
exports.signup = asyncHandler(async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: err.message });
    }

    const { firstname, lastname, email, password, address } = req.body;

    // Validate the request body against the schema
    const { error } = userSchema.validate({ firstname, lastname, email, password, address });
    if (error) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: error.details[0].message });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (!existingUser.verified) {
        // Check if the verification code has expired
        if (existingUser.verification.expiresAt < Date.now()) {
          // Generate a new verification code
          const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
          const verificationExpires = Date.now() + 3600000; // 1 hour

          existingUser.verification.code = verificationCode;
          existingUser.verification.expiresAt = verificationExpires;
          existingUser.verification.lastRequestedAt = Date.now();
          await existingUser.save();

          // Send verification email
          await sendVerificationEmail(existingUser.email, verificationCode);

          return res.status(STATUS_CODES.OK).json({
            message: MESSAGES.VERIFICATION_CODE_SENT,
          });
        } else {
          return res.status(STATUS_CODES.BAD_REQUEST).json({
            message: MESSAGES.VERIFICATION_CODE_SENT,
          });
        }
      } else {
        return res.status(STATUS_CODES.CONFLICT).json({ message: MESSAGES.USER_ALREADY_EXISTS });
      }
    }

    let avatarData = {};
    if (req.file) {
      const uploadResponse = await cloudinary.uploader.upload(req.file.path, {
        folder: 'avatars',
      });
      avatarData = {
        public_id: uploadResponse.public_id,
        url: uploadResponse.secure_url,
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate 4-digit verification code
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const verificationExpires = Date.now() + 3600000; // 1 hour

    const user = new User({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      avatar: avatarData,
      address,
      verification: {
        code: verificationCode,
        expiresAt: verificationExpires,
        lastRequestedAt: Date.now(),
      },
    });
    await user.save();

    // Send verification email
    await sendVerificationEmail(user.email, verificationCode);

    res.status(STATUS_CODES.CREATED).json({
      message: MESSAGES.VERIFICATION_CODE_SENT,
    });
  });
});

// Login function
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(STATUS_CODES.NOT_FOUND).json({ message: MESSAGES.USER_NOT_FOUND });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: MESSAGES.INVALID_CREDENTIALS });
  }

  if (!user.verified) {
    return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: MESSAGES.EMAIL_NOT_VERIFIED });
  }

  const token = createToken(user);
  setTokenCookie(res, token);
  res.status(STATUS_CODES.OK).json({ user, token });
});

// Logout function
exports.logout = asyncHandler(async (req, res) => {
  // Clear the token cookie
  res.clearCookie('token');

  res.status(STATUS_CODES.OK).json({ message: MESSAGES.LOGGED_OUT_SUCCESSFULLY });
});

// Verify email function
exports.verifyEmail = asyncHandler(async (req, res) => {
  const { email, code } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(STATUS_CODES.NOT_FOUND).json({ message: MESSAGES.USER_NOT_FOUND });
  }

  if (user.verified) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.EMAIL_ALREADY_VERIFIED });
  }

  if (user.verification.expiresAt < Date.now()) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.VERIFICATION_CODE_EXPIRED });
  }

  if (user.verification.code !== code) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.INCORRECT_VERIFICATION_CODE });
  }

  user.verified = true;
  user.verification.code = undefined;
  user.verification.expiresAt = undefined;
  await user.save();

  res.status(STATUS_CODES.OK).json({ message: MESSAGES.EMAIL_ALREADY_VERIFIED });
});

// Resend verification code function
exports.resendVerificationCode = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(STATUS_CODES.NOT_FOUND).json({ message: MESSAGES.USER_NOT_FOUND });
  }

  if (user.verified) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.EMAIL_ALREADY_VERIFIED });
  }

  // Check if the last request was made within the cooldown period (e.g., 5 minutes)
  const cooldownPeriod = 5 * 60 * 1000; // 5 minutes in milliseconds
  if (Date.now() - user.verification.lastRequestedAt < cooldownPeriod) {
    return res.status(STATUS_CODES.TOO_MANY_REQUESTS).json({ message: MESSAGES.TOO_MANY_REQUESTS });
  }

  // Generate new 4-digit verification code
  const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
  const verificationExpires = Date.now() + 3600000; // 1 hour

  user.verification.code = verificationCode;
  user.verification.expiresAt = verificationExpires;
  user.verification.lastRequestedAt = Date.now();
  await user.save();

  // Send verification email
  await sendVerificationEmail(user.email, verificationCode);

  res.status(STATUS_CODES.OK).json({ message: MESSAGES.VERIFICATION_CODE_SENT });
});

// Request password reset function
exports.requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(STATUS_CODES.NOT_FOUND).json({ message: MESSAGES.USER_NOT_FOUND });
  }

  // Generate 4-digit password reset code
  const resetCode = Math.floor(1000 + Math.random() * 9000).toString();
  const resetExpires = Date.now() + 3600000; // 1 hour

  user.passwordReset.token = resetCode;
  user.passwordReset.expiresAt = resetExpires;
  await user.save();

  // Send password reset email
  await sendPasswordResetEmail(user.email, resetCode);

  res.status(STATUS_CODES.OK).json({ message: MESSAGES.PASSWORD_RESET_CODE_SENT });
});

// Reset password function
exports.resetPassword = asyncHandler(async (req, res) => {
  const { email, code, password } = req.body;

  // Validate the input data
  const { error } = validateResetPasswordInput({ email, code, password });
  if (error) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.INVALID_INPUT });
  }

  // Find the user with the provided email and reset code
  const user = await findUserByResetCode(email, code);
  if (!user) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.INVALID_OR_EXPIRED_RESET_CODE });
  }

  // Hash the new password
  const hashedPassword = await hashPassword(password);

  // Reset the user's password
  await resetUserPassword(user, hashedPassword);

  // Send a success response
  res.status(STATUS_CODES.OK).json({ message: MESSAGES.PASSWORD_RESET_SUCCESS });
});

// Display users function
exports.displayUsers = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;

    if (isNaN(page) || isNaN(pageSize) || page <= 0 || pageSize <= 0) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.INVALID_PAGINATION_PARAMETERS});
    }

    const skip = (page - 1) * pageSize;
    const totalUsers = await User.countDocuments();
    const users = await User.find({}, 'firstname lastname email') 
      .skip(skip)
      .limit(pageSize)
      .lean();

    res.status(STATUS_CODES.OK).json({
      page,
      pageSize,
      totalUsers,
      totalPages: Math.ceil(totalUsers / pageSize),
      users,
    });
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.FETCHING_ERROR });
  }
});


exports.getUserProfile = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: 'User ID is required' });
    }

    const user = await User.findById(userId, 'firstname lastname email profilePicture').lean();

    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: 'User not found' });
    }

    res.status(STATUS_CODES.OK).json({ user });
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.FETCHING_ERROR });
  }
});