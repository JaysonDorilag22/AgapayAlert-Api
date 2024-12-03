const express = require('express');
const multer = require('multer');
const router = express.Router();
const { PATHS, METHODS } = require('../constants/path');
const alprController = require('../controllers/alprController');

const upload = multer();

const alprRoutes = [
    {
        method: METHODS.POST,
        path: PATHS.ALPR.CREATE.path,
        handler: alprController.createALPR,
    }, 
    {
        method: METHODS.GET,
        path: PATHS.ALPR.READ_ALL.path,
        handler: alprController.getALPR,
    },
    {
        method: METHODS.POST,
        path: PATHS.ALPR.RECOGNIZE.path,
        handler: [upload.single('image'), alprController.recognizePlate],
    },
];

alprRoutes.forEach(route => {
    router[route.method.toLowerCase()](route.path, route.handler);
});

module.exports = router;