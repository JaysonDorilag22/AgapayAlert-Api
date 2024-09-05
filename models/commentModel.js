const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  notificationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notification',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  description: {
    type: String,
    required: true,
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
}, {
  timestamps: true,
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;