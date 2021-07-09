const { Router } = require("express");
const router = Router();
const User = require("../models/Chatroom");
const sha256 = require("js-sha256");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const auth = require("../middlewares/auth");
const Chatroom = require("../models/Chatroom");

router.post(
  "/",
  async (req, res) => {
    try {
      if (!req.headers.authorization) {
        return res.json({ message: "Forbidden!!!!" });
      }
      const token = req.headers.authorization.split(" ")[1];
      const payload = jwt.verify(
        token,
        process.env.SECRET,
        function (err, payload) {}
      );
      req.payload = payload;
      const chatroom = new Chatroom({
        name: "1",
      });
      await chatroom.save();
      res.json({
        message: "Chat created",
        token,
      });
      
    } catch (err) {
      res.status(401).json({
        message: "Forbidden",
      });
    }
  }
);

module.exports = router;
