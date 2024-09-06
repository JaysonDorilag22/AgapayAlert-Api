const express = require('express');
const router = express.Router();
const { PATHS, METHODS } = require('../constants/path');
const userController = require('../controllers/userController');

const userRoutes = [
  {
    method: METHODS.POST,
    path: PATHS.USER.CREATE.path,
    handler: userController.signup,
  },
  {
    method: METHODS.POST,
    path: PATHS.USER.LOGIN.path,
    handler: userController.login,
  },
  {
    method: METHODS.POST,
    path: PATHS.USER.LOGOUT.path,
    handler: userController.logout,
  },
  {
    method: METHODS.POST,
    path: PATHS.USER.VERIFY.path,
    handler: userController.verifyEmail,
  },
  {
    method: METHODS.POST,
    path: PATHS.USER.RESEND.path,
    handler: userController.resendVerificationCode,
  },
  {
    method: METHODS.POST,
    path: PATHS.USER.FORGOT_PASSWORD.path,
    handler: userController.requestPasswordReset,
  },
  {
    method: METHODS.POST,
    path: PATHS.USER.RESET_PASSWORD.path,
    handler: userController.resetPassword,
  },
  {
    method: METHODS.GET,
    path: PATHS.USER.READ_ALL_PAGINATION.path.split('?')[0],
    handler: userController.displayUsers,
  },
  {
    method: METHODS.GET,
    path: PATHS.USER.READ_ONE.path,
    handler: userController.getUserProfile,
  },
  {
    method: METHODS.PUT,
    path: PATHS.USER.UPDATE.path,
    handler: userController.editUserInfo,
  },
];

userRoutes.forEach(route => {
  router[route.method.toLowerCase()](route.path, route.handler);
});

module.exports = router;