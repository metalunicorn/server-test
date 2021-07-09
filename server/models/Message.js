const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: "Chatroom is required!",
    ref: "User",
  },
  message: {
    type: String,
    required: "Message is required!",
  },
  time:{
    type: String,
    required: "Time is required!",
  },
},{
  timestamps: true,
}
);

module.exports = mongoose.model("Message", messageSchema);
