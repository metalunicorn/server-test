const { Router } = require("express");
const router = Router();
const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.json({ message: "Forbidden!!!!" });
    }
    const token = req.headers.authorization.split(" ")[1];
    const payload = jwt.verify(
      token,
      process.env.SECRET,
      function (err, payload) {
        req.payload = payload;
      }
    );
    res.json({
      message: "OK",
    });
    next();
  } catch (err) {
    res.status(401).json({
      message: "Forbidden",
    });
  }
};
