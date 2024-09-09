const express = require('express');
const router = express.Router();
const { PATHS, METHODS } = require('../constants/path');
const authController = require('../controllers/authController');

const authRoutes = [
  {
    method: METHODS.POST,
    path: PATHS.AUTH.CREATE.path,
    handler: authController.signup,
  },
  {
    method: METHODS.POST,
    path: PATHS.AUTH.LOGIN.path,
    handler: authController.login,
  },
  {
    method: METHODS.POST,
    path: PATHS.AUTH.LOGOUT.path,
    handler: authController.logout,
  },
  {
    method: METHODS.POST,
    path: PATHS.AUTH.VERIFY.path,
    handler: authController.verifyEmail,
  },
  {
    method: METHODS.POST,
    path: PATHS.AUTH.RESEND.path,
    handler: authController.resendVerificationCode,
  },
  {
    method: METHODS.POST,
    path: PATHS.AUTH.FORGOT_PASSWORD.path,
    handler: authController.requestPasswordReset,
  },
  {
    method: METHODS.POST,
    path: PATHS.AUTH.RESET_PASSWORD.path,
    handler: authController.resetPassword,
  },
];

authRoutes.forEach(route => {
  router[route.method.toLowerCase()](route.path, route.handler);
});

module.exports = router;