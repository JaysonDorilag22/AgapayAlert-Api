const express = require('express');
const router = express.Router();
const { PATHS, METHODS } = require('../constants/path');
const notificationController = require('../controllers/notificationController');

const notificationRoutes = [
    {
        method: METHODS.POST,
        path: PATHS.NOTIFICATION.CREATE.path,
        handler: notificationController.createNotification,
    },
];

notificationRoutes.forEach(route => {
    router[route.method.toLowerCase()](route.path, route.handler);
});

module.exports = router;