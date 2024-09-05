const express = require('express');
const router = express.Router();
const { PATHS } = require('../constants/path');
const userController = require('../controllers/userController');


router.post(PATHS.USER.CREATE.path, userController.signup);
router.post(PATHS.USER.LOGIN.path, userController.login);
router.post(PATHS.USER.LOGOUT.path, userController.logout);
router.post(PATHS.USER.VERIFY.path, userController.verifyEmail);
router.post(PATHS.USER.RESEND.path, userController.resendVerificationCode);
router.post(PATHS.USER.FORGOT_PASSWORD.path, userController.requestPasswordReset);
router.post(PATHS.USER.RESET_PASSWORD.path, userController.resetPassword);



module.exports = router;