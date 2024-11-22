const express = require('express');
const router = express.Router();
const { PATHS, METHODS } = require('../constants/path');
const reportController = require('../controllers/reportController');

const reportRoutes = [
    {
        method: METHODS.GET,
        path: PATHS.REPORT.READ_ALL.path,
        handler: reportController.getAllReports,
    },
    {
        method: METHODS.GET,
        path: PATHS.REPORT.READ_ONE.path,
        handler: reportController.getReportById,
    },
    {
        method: METHODS.POST,
        path: PATHS.REPORT.CREATE.path,
        handler: reportController.createReport,
    },
    {
        method: METHODS.PUT,
        path: PATHS.REPORT.UPDATE.path,
        handler: reportController.updateReportById,
    },
    {
        method: METHODS.DELETE,
        path: PATHS.REPORT.DELETE.path,
        handler: reportController.deleteReportById,
    },
    {
        method: METHODS.POST,
        path: PATHS.REPORT.POST_REPORT.path,
        handler: reportController.postReportToFacebook,
    },
    {
        method: METHODS.DELETE,
        path: PATHS.REPORT.DELETE_POST.path,
        handler: reportController.deleteReportFromFacebook,
    }
];

reportRoutes.forEach(route => {
    router[route.method.toLowerCase()](route.path, route.handler);
});

module.exports = router;
