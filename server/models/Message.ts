/* eslint-disable @typescript-eslint/no-var-requires */
const mongooseMessage = require('mongoose');

const messageSchema = new mongooseMessage.Schema(
  {
    id: {
      type: mongooseMessage.Schema.Types.ObjectId,
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongooseMessage.model('Message', messageSchema);
