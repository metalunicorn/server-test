/* eslint-disable @typescript-eslint/no-var-requires */
const jwtReg = require('jsonwebtoken');
const sha256Reg = require('js-sha256');
const UserReg = require('../models/User');

const reg = async function Registration(
  name: string,
  admin: boolean,
  password: string
) {
  const color = [
    '#560c0d',
    '#330c56',
    '#1e2c96',
    '#000000',
    '#1c3652',
    '#3e5d62',
  ];

  const randomColor = color[Math.floor(Math.random() * color.length)];
  const newUser = new UserReg({
    name,
    admin,
    password: sha256Reg(password + process.env.SALT),
    color: randomColor,
    mute: false,
    ban: false,
  });

  await newUser.save();
  return jwtReg.sign({ admin, name }, process.env.SECRET);
};

const admin = function isAdmin() {
  let roleAdmin = false;
  UserReg.find().count((count: number) => {
    if (count < 1) {
      roleAdmin = true;
    }
  });

  return roleAdmin;
};

const findUser = async function findUser(name: string) {
  const userReg = await UserReg.findOne({
    name,
  });
  return userReg;
};

module.exports = { reg, admin, findUser };
