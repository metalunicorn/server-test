const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const sha256 = require('js-sha256');
const User = require('../models/User');

const userControllers = async function userAuthController(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: 'Invalid data',
      });
    }

    let admin = false;
    User.find().count((err, count) => {
      if (count < 1) {
        admin = true;
      }
    });

    const { name, password } = req.body;
    const user = await User.findOne({
      name,
    });

    if (user && (user.password !== sha256(password + process.env.SALT))) {
      return res.status(400).json({
        message: 'Invalid Password',
      });
    }

    if (user) {
      const token = jwt.sign(
        { id: user.id, admin: user.admin, name: user.name },
        process.env.SECRET,
      );

      return res.json({
        message: 'User logged in succsessul',
        token,
      });
    }

    const color = [
      '#560c0d',
      '#330c56',
      '#1e2c96',
      '#000000',
      '#1c3652',
      '#3e5d62',
    ];

    const randomColor = color[Math.floor(Math.random() * color.length)];
    const newUser = new User({
      name,
      admin,
      password: sha256(password + process.env.SALT),
      color: randomColor,
      mute: false,
      ban: false,
    });

    await newUser.save();
    const token = jwt.sign(
      { admin, name },
      process.env.SECRET,
    );

    res.json({
      token,
      message: `User ${name} register`,
    });
  } catch (error) {
    res.status(500).json({
      errors: error,
      message: 'Password invalid.',
    });
  }
  return null;
};
module.exports = userControllers;
