const express = require('express');
const router = express.Router();
const { PATHS } = require('../constants/path');
const userController = require('../controllers/userController');

// Signup route
router.post(PATHS.USER.CREATE.path, userController.signup);

// Login route
router.post(PATHS.USER.LOGIN.path, userController.login);

module.exports = router;