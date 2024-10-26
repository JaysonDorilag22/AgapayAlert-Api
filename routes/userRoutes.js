const express = require('express');
const router = express.Router();
const { PATHS, METHODS } = require('../constants/path');
const userController = require('../controllers/userController');

const userRoutes = [
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
  {
    method: METHODS.DELETE,
    path: PATHS.USER.DELETE.path,
    handler: userController.deleteUserAccount,
  },
];

userRoutes.forEach(route => {
  router[route.method.toLowerCase()](route.path, route.handler);
});

module.exports = router;