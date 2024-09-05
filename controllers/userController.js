const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/userModel');
const { userSchema } = require('../helpers/validationHelper');
const cloudinary = require('../config/cloudinaryConfig');
const upload = require('../config/multer');
const { createToken, setTokenCookie } = require('../helpers/tokenHelper');
const asyncHandler = require('../helpers/asyncHandler');
const STATUS_CODES = require('../constants/statusCodes');
const sendEmail = require('../helpers/emailHelper'); // Add email helper

// Signup function
exports.signup = asyncHandler(async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: err });
    }

    const { firstname, lastname, email, password, address } = req.body;

    // Validate the request body against the schema
    const { error } = userSchema.validate({ firstname, lastname, email, password, address });
    if (error) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: error.details[0].message });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(STATUS_CODES.CONFLICT).json({ message: 'User already exists' });
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
      },
    });
    await user.save();

    // Send verification email
    const message = `Your verification code is: ${verificationCode}`;
    await sendEmail({
      email: user.email,
      subject: 'Email Verification',
      message,
    });

    res.status(STATUS_CODES.CREATED).json({
      message: 'User registered. Please check your email for the verification code.',
    });
  });
});

// Login function
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(STATUS_CODES.NOT_FOUND).json({ message: 'User not found' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: 'Invalid credentials' });
  }

  if (!user.verified) {
    return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: 'Please verify your email to log in.' });
  }

  const token = createToken(user);
  setTokenCookie(res, token);
  res.status(STATUS_CODES.OK).json({ user, token });
});

// Logout function
exports.logout = asyncHandler(async (req, res) => {
  // Clear the token cookie
  res.clearCookie('token');

  res.status(STATUS_CODES.OK).json({ message: 'Logged out successfully' });
});

// Verify email function
// Verify email function
exports.verifyEmail = asyncHandler(async (req, res) => {
  const { email, code } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(STATUS_CODES.NOT_FOUND).json({ message: 'User not found' });
  }

  if (user.verified) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({ message: 'Email is already verified' });
  }

  if (user.verification.code !== code) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({ message: 'Incorrect verification code' });
  }

  if (user.verification.expiresAt < Date.now()) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({ message: 'Verification code has expired' });
  }

  user.verified = true;
  user.verification.code = undefined;
  user.verification.expiresAt = undefined;
  await user.save();

  res.status(STATUS_CODES.OK).json({ message: 'Email verified successfully' });
});

// Resend verification code function
exports.resendVerificationCode = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(STATUS_CODES.NOT_FOUND).json({ message: 'User not found' });
  }

  if (user.verified) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({ message: 'Email is already verified' });
  }

  // Generate new 4-digit verification code
  const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
  const verificationExpires = Date.now() + 3600000; // 1 hour

  user.verification.code = verificationCode;
  user.verification.expiresAt = verificationExpires;
  await user.save();

  // Send verification email
  const message = `Your new verification code is: ${verificationCode}`;
  await sendEmail({
    email: user.email,
    subject: 'Resend Email Verification',
    message,
  });

  res.status(STATUS_CODES.OK).json({ message: 'Verification code resent. Please check your email.' });
});