const express = require('express');
const router = express.Router();
const { PATHS, METHODS } = require('../constants/path');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware'); // Correct path
const adminMiddleware = require('../middlewares/adminMiddleware'); // Correct path

const userRoutes = [
  {
    method: METHODS.GET,
    path: PATHS.USER.READ_ALL_PAGINATION.path.split('?')[0],
    handler: userController.displayUsers,
    middleware: adminMiddleware, // Only admins can read all users with pagination
  },
  {
    method: METHODS.GET,
    path: PATHS.USER.READ_ONE.path,
    handler: userController.getUserProfile,
    middleware: authMiddleware, // Any authenticated user can read their profile
  },
  {
    method: METHODS.PUT,
    path: PATHS.USER.UPDATE.path,
    handler: userController.editUserInfo,
    middleware: authMiddleware, // Any authenticated user can update their info
  },
  {
    method: METHODS.DELETE,
    path: PATHS.USER.DELETE.path,
    handler: userController.deleteUserAccount,
    middleware: authMiddleware, // Any authenticated user can delete their account
  },
];

userRoutes.forEach(route => {
  if (route.middleware) {
    router[route.method.toLowerCase()](route.path, route.middleware, route.handler);
  } else {
    router[route.method.toLowerCase()](route.path, route.handler);
  }
});

module.exports = router;