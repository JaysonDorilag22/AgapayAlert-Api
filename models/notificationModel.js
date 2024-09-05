const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    required: true,
  },
  tier: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true,
  },
  confirmation: {
    type: String,
    enum: ['verified', 'not verified'],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;