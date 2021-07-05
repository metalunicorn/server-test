const mongoose = require("mongoose");

const chatroomShema = new mongoose.Schema({
    name:  {
        type: String,
        required: "Name is required"
    }
})


module.exports = mongoose.model("Chatroom", chatroomShema);