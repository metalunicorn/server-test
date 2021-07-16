const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  user: {
    type: String,
    required: 'User is required!',
  },
  message: {
    type: String,
    required: 'Message is required!',
  },
  time: {
    type: String,
    required: 'Time is required!',
  },
  color: {
    type: String,
    required: 'Color is required!',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Message', messageSchema);
