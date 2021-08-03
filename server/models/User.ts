/* eslint-disable @typescript-eslint/no-var-requires */
const mongooseUser = require('mongoose');

const userSchema = new mongooseUser.Schema(
  {
    name: {
      type: String,
      required: 'Name is required',
    },
    password: {
      type: String,
      required: 'Password is required',
    },
    color: {
      type: String,
      equired: 'Color is required',
    },
    admin: {
      type: Boolean,
      equired: 'Role is required',
    },
    mute: {
      type: Boolean,
      equired: 'Role is required',
    },
    ban: {
      type: Boolean,
      equired: 'Role is required',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongooseUser.model('User', userSchema);
