const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const { userSchema } = require("../helpers/validationHelper");
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const { createToken, setTokenCookie } = require("../utils/token");
const asyncHandler = require("../utils/asyncHandler");
const STATUS_CODES = require("../constants/statusCodes");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../utils/sendEmail");
const { validateResetPasswordInput } = require("../helpers/validationHelper");
const { findUserByResetCode, hashPassword, resetUserPassword } = require("../helpers/userHelper");
const MESSAGES = require("../constants/messages");
const { handleError } = require('../utils/errorHandler');

// Signup function
exports.signup = asyncHandler(async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ message: err.message });
    }

    const { firstname, lastname, email, password, address } = req.body;

    // Validate the request body against the schema
    const { error } = userSchema.validate({
      firstname,
      lastname,
      email,
      password,
      address,
    });
    if (error) {
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ message: error.details[0].message });
    }

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        if (!existingUser.verified) {
          // Check if the verification code has expired
          if (existingUser.verification.expiresAt < Date.now()) {
            // Generate a new verification code
            const verificationCode = Math.floor(
              1000 + Math.random() * 9000
            ).toString();
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
          return res
            .status(STATUS_CODES.CONFLICT)
            .json({ message: MESSAGES.USER_ALREADY_EXISTS });
        }
      }

      let avatarData = {};
      if (req.file) {
        const uploadResponse = await cloudinary.uploader.upload(req.file.path, {
          folder: "avatars",
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
    } catch (error) {
      handleError(res, error, STATUS_CODES.INTERNAL_SERVER_ERROR, MESSAGES.SIGNUP_ERROR);
    }
  });
});

// Login function
exports.login = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: MESSAGES.USER_NOT_FOUND });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(STATUS_CODES.UNAUTHORIZED)
        .json({ message: MESSAGES.INVALID_CREDENTIALS });
    }

    if (!user.verified) {
      return res
        .status(STATUS_CODES.UNAUTHORIZED)
        .json({ message: MESSAGES.EMAIL_NOT_VERIFIED });
    }

    const token = createToken(user);
    setTokenCookie(res, token);
    res.status(STATUS_CODES.OK).json({ user, token });
  } catch (error) {
    handleError(res, error, STATUS_CODES.INTERNAL_SERVER_ERROR, MESSAGES.LOGIN_ERROR);
  }
});

// Logout function
exports.logout = asyncHandler(async (req, res) => {
  try {
    // Clear the token cookie
    res.clearCookie("token");

    res
      .status(STATUS_CODES.OK)
      .json({ message: MESSAGES.LOGGED_OUT_SUCCESSFULLY });
  } catch (error) {
    handleError(res, error, STATUS_CODES.INTERNAL_SERVER_ERROR, MESSAGES.LOGOUT_ERROR);
  }
});

// Verify email function
exports.verifyEmail = asyncHandler(async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: MESSAGES.USER_NOT_FOUND });
    }

    if (user.verified) {
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ message: MESSAGES.EMAIL_ALREADY_VERIFIED });
    }

    if (user.verification.expiresAt < Date.now()) {
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ message: MESSAGES.VERIFICATION_CODE_EXPIRED });
    }

    if (user.verification.code !== code) {
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ message: MESSAGES.INCORRECT_VERIFICATION_CODE });
    }

    user.verified = true;
    user.verification.code = undefined;
    user.verification.expiresAt = undefined;
    await user.save();

    res
      .status(STATUS_CODES.OK)
      .json({ message: MESSAGES.EMAIL_ALREADY_VERIFIED });
  } catch (error) {
    handleError(res, error, STATUS_CODES.INTERNAL_SERVER_ERROR, MESSAGES.VERIFY_EMAIL_ERROR);
  }
});

// Resend verification code function
exports.resendVerificationCode = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: MESSAGES.USER_NOT_FOUND });
    }

    if (user.verified) {
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ message: MESSAGES.EMAIL_ALREADY_VERIFIED });
    }

    // Check if the last request was made within the cooldown period (e.g., 5 minutes)
    const cooldownPeriod = 5 * 60 * 1000; // 5 minutes in milliseconds
    if (Date.now() - user.verification.lastRequestedAt < cooldownPeriod) {
      return res
        .status(STATUS_CODES.TOO_MANY_REQUESTS)
        .json({ message: MESSAGES.TOO_MANY_REQUESTS });
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

    res
      .status(STATUS_CODES.OK)
      .json({ message: MESSAGES.VERIFICATION_CODE_SENT });
  } catch (error) {
    handleError(res, error, STATUS_CODES.INTERNAL_SERVER_ERROR, MESSAGES.RESEND_VERIFICATION_CODE_ERROR);
  }
});

// Request password reset function
exports.requestPasswordReset = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: MESSAGES.USER_NOT_FOUND });
    }

    // Generate 4-digit password reset code
    const resetCode = Math.floor(1000 + Math.random() * 9000).toString();
    const resetExpires = Date.now() + 3600000; // 1 hour

    user.passwordReset.token = resetCode;
    user.passwordReset.expiresAt = resetExpires;
    await user.save();

    // Send password reset email
    await sendPasswordResetEmail(user.email, resetCode);

    res
      .status(STATUS_CODES.OK)
      .json({ message: MESSAGES.PASSWORD_RESET_CODE_SENT });
  } catch (error) {
    handleError(res, error, STATUS_CODES.INTERNAL_SERVER_ERROR, MESSAGES.REQUEST_PASSWORD_RESET_ERROR);
  }
});

// Reset password function
exports.resetPassword = asyncHandler(async (req, res) => {
  try {
    const { email, code, password } = req.body;

    // Validate the input data
    const { error } = validateResetPasswordInput({ email, code, password });
    if (error) {
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ message: MESSAGES.INVALID_INPUT });
    }

    // Find the user with the provided email and reset code
    const user = await findUserByResetCode(email, code);
    if (!user) {
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ message: MESSAGES.INVALID_OR_EXPIRED_RESET_CODE });
    }

    // Hash the new password
    const hashedPassword = await hashPassword(password);

    // Reset the user's password
    await resetUserPassword(user, hashedPassword);

    // Send a success response
    res
      .status(STATUS_CODES.OK)
      .json({ message: MESSAGES.PASSWORD_RESET_SUCCESS });
  } catch (error) {
    handleError(res, error, STATUS_CODES.INTERNAL_SERVER_ERROR, MESSAGES.RESET_PASSWORD_ERROR);
  }
});