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
    {
        method: METHODS.GET,
        path: PATHS.NOTIFICATION.READ_ALL.path,
        handler: notificationController.getAllNotifications,
    },
    {
        method: METHODS.POST,
        path: PATHS.NOTIFICATION.SMS.path,
        handler: notificationController.sendSmsNotification,
    },
    {
        method: METHODS.POST,
        path: PATHS.NOTIFICATION.EMAIL.path,
        handler: notificationController.sendEmailNotification,
    },
];

notificationRoutes.forEach(route => {
    router[route.method.toLowerCase()](route.path, route.handler);
});

module.exports = router;