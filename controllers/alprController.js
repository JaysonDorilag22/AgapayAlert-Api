const ALPR = require('../models/alprModel');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const PLATE_RECOGNIZER_API_KEY = process.env.ALPR_TOKEN;
const PLATE_RECOGNIZER_API_URL = 'https://api.platerecognizer.com/v1/plate-reader/';

const createALPR = async (req, res) => {
  try {
    const { reportId, model, color, type, plateno } = req.body;

    const newALPR = new ALPR({
      reportId,
      model,
      color,
      type,
      plateno,
    });

    await newALPR.save();
    res.status(201).json(newALPR);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getALPR = async (req, res) => {
  try {
    const alpr = await ALPR.findById(req.params.id).populate('reportId');
    if (!alpr) {
      return res.status(404).json({ message: 'ALPR not found' });
    }
    res.json(alpr);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const recognizePlate = async (req, res) => {
  try {
    const image = req.file;

    if (!image) {
      return res.status(400).json({ message: 'Image file is required' });
    }

    const formData = new FormData();
    formData.append('upload', image.buffer, image.originalname);

    const response = await axios.post(
      PLATE_RECOGNIZER_API_URL,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Token ${PLATE_RECOGNIZER_API_KEY}`,
        },
      }
    );

    const plateData = response.data;
    res.json(plateData);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json({
        message: error.response.data,
        status: error.response.status,
      });
    } else if (error.request) {
      res.status(500).json({ message: 'No response received from Plate Recognizer API' });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = {
  createALPR,
  getALPR,
  recognizePlate,
};