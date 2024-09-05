module.exports = (verificationCode) => {
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Email Verification</h2>
        <p>Your verification code is: <strong>${verificationCode}</strong></p>
        <p>Please enter this code in the application to verify your email address.</p>
        <p>If you did not request this code, please ignore this email.</p>
      </div>
    `;
  };