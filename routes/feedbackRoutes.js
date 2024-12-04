const express = require('express');
const router = express.Router();
const { PATHS, METHODS } = require('../constants/path');
const feedbackController = require('../controllers/feedbackController');

// Define non-dynamic routes first to prevent conflicts
const feedbackRoutes = [
    {
        method: METHODS.GET,
        path: PATHS.FEEDBACK.READ_RATINGS.path, // Overall ratings path
        handler: feedbackController.getOverallRatings,
    },
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
        path: PATHS.FEEDBACK.READ_ONE.path, // Dynamic :id
        handler: feedbackController.getFeedback,
    },
    {
        method: METHODS.GET,
        path: PATHS.FEEDBACK.USER_FEEDBACKS.path,
        handler: feedbackController.getUserFeedbacks,
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

// Dynamically bind routes to the router
feedbackRoutes.forEach(route => {
    router[route.method.toLowerCase()](route.path, route.handler);
});

module.exports = router;
