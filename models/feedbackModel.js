const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', 
      required: true,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    ratings: {
      type: Number,
      required: true,
      min: 1,
      max: 5, 
    },
  },
  {
    timestamps: true, 
  }
);

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
