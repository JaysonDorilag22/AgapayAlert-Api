const express = require('express');
const router = express.Router();
const { PATHS, METHODS } = require('../constants/path');
const sightingController = require('../controllers/sightingController');
const authMiddleware = require('../middlewares/authMiddleware');

const sightingRoutes = [
  {
    method: METHODS.POST,
    path: PATHS.SIGHTING.CREATE.path,
    handler: sightingController.createSighting,
  },
  {
    method: METHODS.GET,
    path: PATHS.SIGHTING.READ_ALL.path,
    handler: sightingController.getAllSightings,
  },
  {
    method: METHODS.GET,
    path: PATHS.SIGHTING.READ_ONE.path,
    handler: sightingController.getSightingById,
  },
  {
    method: METHODS.PUT,
    path: PATHS.SIGHTING.UPDATE.path,
    handler: sightingController.updateSighting,
  },
  {
    method: METHODS.DELETE,
    path: PATHS.SIGHTING.DELETE.path,
    handler: sightingController.deleteSighting,
  },
  {
    method: METHODS.GET,
    path: PATHS.SIGHTING.READ_BY_USER.path,
    handler: [authMiddleware, sightingController.getSightingsByCurrentUser],
  },
];

sightingRoutes.forEach(route => {
  router[route.method.toLowerCase()](route.path, route.handler);
});

module.exports = router;