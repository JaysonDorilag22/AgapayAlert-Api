module.exports = (resetCode) => {
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Password Reset</h2>
        <p>Your password reset code is: <strong>${resetCode}</strong></p>
        <p>Please enter this code in the application to reset your password.</p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `;
  };