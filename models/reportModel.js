const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['missing', 'abducted', 'wanted', 'kidnapped'],
    required: true,
  },
  last_seen_location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
  },
  images: [{
    public_id: {
      type: String,
      default: '',
    },
    url: {
      type: String,
      default: '',
    },
  }],
  video: {
    public_id: {
      type: String,
      default: '',
    },
    url: {
      type: String,
      default: '',
    },
  },
  description: {
    type: String,
    required: true,
  },
  reward: {
    type: Number,
    default: 0,
  },
  contact_information: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Verified', 'Closed', 'Pending'],
    default: 'Pending',
  },
}, {
  timestamps: true,
});

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;