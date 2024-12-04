const Sighting = require("../models/sightingModel");
const STATUS_CODES = require("../constants/statusCodes");
const MESSAGES = require("../constants/messages");
const asyncHandler = require("../utils/asyncHandler");
const { singleImageUpload } = require("../utils/multer");
const axios = require("axios");

// Create a new sighting
exports.createSighting = async (req, res) => {
    try {
      const { report, userId, locationSeen, dateSeen, description, identificationId, status } = req.body;
  
      const newSighting = new Sighting({
        report,
        userId,
        locationSeen,
        dateSeen,
        description,
        identificationId,
        status
      });
  
      const savedSighting = await newSighting.save();
      res.status(STATUS_CODES.CREATED).json(savedSighting);
    } catch (error) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: error.message });
    }
  };

// Get all sightings
exports.getAllSightings = async (req, res) => {
  try {
    const sightings = await Sighting.find().populate("report userId");
    res.status(STATUS_CODES.OK).json(sightings);
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// Get all sightings by the current user
exports.getSightingsByCurrentUser = async (req, res) => {
    try {
      const userId = req.user._id; // Assuming req.user contains the authenticated user's information
      const sightings = await Sighting.find({ userId }).populate("report userId");
      res.status(STATUS_CODES.OK).json(sightings);
    } catch (error) {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  };

// Get a single sighting by ID
exports.getSightingById = async (req, res) => {
  try {
    const sighting = await Sighting.findById(req.params.id).populate("report userId");
    if (!sighting) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: "Sighting not found" });
    }
    res.status(STATUS_CODES.OK).json(sighting);
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// Update a sighting by ID
exports.updateSighting = async (req, res) => {
  try {
    const updatedSighting = await Sighting.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedSighting) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: "Sighting not found" });
    }
    res.status(STATUS_CODES.OK).json(updatedSighting);
  } catch (error) {
    res.status(STATUS_CODES.BAD_REQUEST).json({ message: error.message });
  }
};

// Delete a sighting by ID
exports.deleteSighting = async (req, res) => {
  try {
    const deletedSighting = await Sighting.findByIdAndDelete(req.params.id);
    if (!deletedSighting) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: "Sighting not found" });
    }
    res.status(STATUS_CODES.OK).json({ message: "Sighting deleted successfully" });
  } catch (error) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};