const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
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

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;