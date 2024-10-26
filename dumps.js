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