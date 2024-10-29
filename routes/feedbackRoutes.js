const express = require('express');
const router = express.Router();
const { PATHS, METHODS } = require('../constants/path');
const feedbackController = require('../controllers/feedbackController');

const feedbackRoutes = [
    {
        method: METHODS.POST,
        path: PATHS.FEEDBACK.CREATE.path,
        handler: feedbackController.addFeedback,
    },
    {
        method: METHODS.GET,
        path: PATHS.FEEDBACK.READ_ALL.path,
        handler: feedbackController.getFeedbacks,
    },
    {
        method: METHODS.GET,
        path: PATHS.FEEDBACK.READ_ONE.path,
        handler: feedbackController.getFeedback,
    },
    {
        method: METHODS.PUT,
        path: PATHS.FEEDBACK.UPDATE.path,
        handler: feedbackController.updateFeedback,
    },
    {
        method: METHODS.DELETE,
        path: PATHS.FEEDBACK.DELETE.path,
        handler: feedbackController.deleteFeedback,
    },
];

feedbackRoutes.forEach(route => {
    router[route.method.toLowerCase()](route.path, route.handler);
});

module.exports = router;
