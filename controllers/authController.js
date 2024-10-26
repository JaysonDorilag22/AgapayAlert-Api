const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const STATUS_CODES = require("../constants/statusCodes");
const MESSAGES = require("../constants/messages");
const upload = require("../utils/multer");
const asyncHandler = require("../utils/asyncHandler");
const { successHandler } = require("../utils/successHandler");
const { sendPasswordResetEmail } = require("../utils/sendEmail");
const { createToken, setTokenCookie } = require("../utils/token");
const { handleVerification, generateVerificationCode } = require("../utils/verification");
const { validateResetPasswordInput } = require("../helpers/validationHelper");
const { sendVerificationEmail } = require("../utils/sendEmail");
const { findUserByResetCode, hashPassword, resetUserPassword, validateRequestBody, handleExistingUser, createUser } = require("../helpers/userHelper");

// Signup function
exports.signup = asyncHandler(async (req, res) => {
  upload(req, res, async (err) => {
    if (err) throw { statusCode: STATUS_CODES.BAD_REQUEST, message: err.message };

    const { firstname, lastname, email, password, address, phoneNo } = req.body;
    const validationError = validateRequestBody({ firstname, lastname, email, password, address, phoneNo });

    if (validationError) throw { statusCode: STATUS_CODES.BAD_REQUEST, message: validationError.details[0].message };

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return handleExistingUser(res, existingUser);
    }

    await createUser(req, res, { firstname, lastname, email, password, address, phoneNo });

    successHandler(res, STATUS_CODES.CREATED, MESSAGES.USER_CREATED_SUCCESSFULLY);
  });
});

// Login function
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw { statusCode: STATUS_CODES.NOT_FOUND, message: MESSAGES.USER_NOT_FOUND };

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw { statusCode: STATUS_CODES.UNAUTHORIZED, message: MESSAGES.INVALID_CREDENTIALS };

  if (!user.verified) throw { statusCode: STATUS_CODES.UNAUTHORIZED, message: MESSAGES.EMAIL_NOT_VERIFIED };

  const token = createToken(user);
  setTokenCookie(res, token);
  successHandler(res, STATUS_CODES.OK, MESSAGES.LOGIN_SUCCESSFUL, { user, token });
});

// Logout function
exports.logout = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  successHandler(res, STATUS_CODES.OK, MESSAGES.LOGGED_OUT_SUCCESSFULLY);
});

// Verify email function
exports.verifyEmail = asyncHandler(async (req, res) => {
  const { email, code } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw { statusCode: STATUS_CODES.NOT_FOUND, message: MESSAGES.USER_NOT_FOUND };

  if (user.verified) throw { statusCode: STATUS_CODES.BAD_REQUEST, message: MESSAGES.EMAIL_ALREADY_VERIFIED };

  if (user.verification.expiresAt < Date.now()) throw { statusCode: STATUS_CODES.BAD_REQUEST, message: MESSAGES.VERIFICATION_CODE_EXPIRED };

  if (user.verification.code !== code) throw { statusCode: STATUS_CODES.BAD_REQUEST, message: MESSAGES.INCORRECT_VERIFICATION_CODE };

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
  if (!user) throw { statusCode: STATUS_CODES.NOT_FOUND, message: MESSAGES.USER_NOT_FOUND };

  if (user.verified) throw { statusCode: STATUS_CODES.BAD_REQUEST, message: MESSAGES.EMAIL_ALREADY_VERIFIED };

  // Check if the last request was made within the cooldown period (e.g., 5 minutes)
  const cooldownPeriod = 60 * 1000; // 5 minutes in milliseconds
  if (Date.now() - user.verification.lastRequestedAt < cooldownPeriod) throw { statusCode: STATUS_CODES.TOO_MANY_REQUESTS, message: MESSAGES.TOO_MANY_REQUESTS };

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
  if (!user) throw { statusCode: STATUS_CODES.NOT_FOUND, message: MESSAGES.USER_NOT_FOUND };

  const { verificationCode: resetCode, verificationExpires: resetExpires } = generateVerificationCode();

  user.passwordReset.token = resetCode;
  user.passwordReset.expiresAt = resetExpires;
  await user.save();

  await sendPasswordResetEmail(user.email, resetCode);

  successHandler(res, STATUS_CODES.OK, MESSAGES.PASSWORD_RESET_CODE_SENT);
});

// Reset password function
exports.resetPassword = asyncHandler(async (req, res) => {
  const { email, code, password } = req.body;

  const { error } = validateResetPasswordInput({ email, code, password });
  if (error) throw { statusCode: STATUS_CODES.BAD_REQUEST, message: MESSAGES.INVALID_INPUT };

  const user = await findUserByResetCode(email, code);
  if (!user) throw { statusCode: STATUS_CODES.BAD_REQUEST, message: MESSAGES.INVALID_OR_EXPIRED_RESET_CODE };

  const hashedPassword = await hashPassword(password);

  await resetUserPassword(user, hashedPassword);

  successHandler(res, STATUS_CODES.OK, MESSAGES.PASSWORD_RESET_SUCCESS);
});
