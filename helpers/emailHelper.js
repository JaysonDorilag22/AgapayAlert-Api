const transporter = require('../config/emailConfig');
const verificationEmailTemplate = require('../views/verificationEmailTemplate');
const passwordResetEmailTemplate = require('../views/passwordResetEmailTemplate');

const sendEmail = async (options) => {
  const mailOptions = {
    from: 'Your App <no-reply@yourapp.com>',
    to: options.email,
    subject: options.subject,
    html: options.template,
  };

  await transporter.sendMail(mailOptions);
};

const sendVerificationEmail = async (email, verificationCode) => {
  const subject = 'Email Verification';
  const template = verificationEmailTemplate(verificationCode);

  await sendEmail({ email, subject, template });
};

const sendPasswordResetEmail = async (email, resetCode) => {
  const subject = 'Password Reset';
  const template = passwordResetEmailTemplate(resetCode);

  await sendEmail({ email, subject, template });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
};