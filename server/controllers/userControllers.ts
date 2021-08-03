/* eslint-disable @typescript-eslint/no-var-requires */
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const sha256 = require('js-sha256');
const service = require('./serviceLayer');

interface Req {
  body: { name: string; password: string };
}
interface Res {
  status: (arg0: number) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (): any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new (): any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    json: { (arg0: { errors?: string; message: string }): void; new (): any };
  };
  json: (arg0: { message: string; token: string }) => void;
}

const userControllers = async function userAuthController(req: Req, res: Res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: 'Invalid data',
      });
    }

    const admin = service.admin();

    const { name, password } = req.body;

    const user = await service.findUser(name);

    if (user) {
      if (user.password !== sha256(password + process.env.SALT)) {
        return res.status(400).json({
          message: 'Invalid Password',
        });
      }

      const token = jwt.sign(
        { id: user.id, admin: user.admin, name: user.name },
        process.env.SECRET
      );

      return res.json({
        message: 'User logged in succsessul',
        token,
      });
    }

    const token = await service.reg(name, admin, password);
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
