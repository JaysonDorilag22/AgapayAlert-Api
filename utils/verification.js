// utils/verification.js
const { sendVerificationEmail } = require('./sendEmail');

function generateVerificationCode() {
  const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
  const verificationExpires = Date.now() + 3600000; // 1 hour

  return { verificationCode, verificationExpires };
}

async function handleVerification(existingUser) {
  const { verificationCode, verificationExpires } = generateVerificationCode();

  existingUser.verification.code = verificationCode;
  existingUser.verification.expiresAt = verificationExpires;
  existingUser.verification.lastRequestedAt = Date.now();
  await existingUser.save();

  await sendVerificationEmail(existingUser.email, verificationCode);

  return { verificationCode, verificationExpires };
}

module.exports = { generateVerificationCode, handleVerification };