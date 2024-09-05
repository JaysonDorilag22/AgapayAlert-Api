const mongoose = require('mongoose');

const alprSchema = new mongoose.Schema({
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  plateno: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

const ALPR = mongoose.model('ALPR', alprSchema);

module.exports = ALPR;